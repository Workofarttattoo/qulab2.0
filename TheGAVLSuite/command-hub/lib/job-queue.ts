import { redis } from './redis'
import { prisma } from './prisma'
import { spawn } from 'child_process'
import { join } from 'path'
import { z } from 'zod'

export interface JobData {
  id: string
  userId: string
  module: string
  input: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: any
  error?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const jobSchema = z.object({
  module: z.enum(['osint', 'hellfire', 'legal', 'ceio', 'sophiarch']),
  input: z.any(),
})

export class JobQueue {
  private static instance: JobQueue
  private isProcessing = false

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue()
    }
    return JobQueue.instance
  }

  async addJob(userId: string, module: string, input: any): Promise<string> {
    const jobData = jobSchema.parse({ module, input })
    
    const job = await prisma.job.create({
      data: {
        userId,
        module: jobData.module,
        input: jobData.input,
        status: 'pending',
      }
    })

    // Add to Redis queue
    await redis.lPush(`queue:${module}`, job.id)
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processJobs()
    }

    return job.id
  }

  async getJob(jobId: string): Promise<JobData | null> {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) return null

    return {
      id: job.id,
      userId: job.userId,
      module: job.module,
      input: job.input as any,
      status: job.status as any,
      output: job.output as any,
      error: job.error || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt || undefined,
    }
  }

  async getUserJobs(userId: string, limit = 50): Promise<JobData[]> {
    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return jobs.map(job => ({
      id: job.id,
      userId: job.userId,
      module: job.module,
      input: job.input as any,
      status: job.status as any,
      output: job.output as any,
      error: job.error || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt || undefined,
    }))
  }

  private async processJobs() {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      while (true) {
        const modules = ['osint', 'hellfire', 'legal', 'ceio', 'sophiarch']
        let hasWork = false

        for (const module of modules) {
          const jobId = await redis.rPop(`queue:${module}`)
          if (jobId) {
            hasWork = true
            await this.executeJob(jobId, module)
          }
        }

        if (!hasWork) {
          break
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async executeJob(jobId: string, module: string) {
    try {
      // Update job status to running
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'running' }
      })

      // Get job details
      const job = await this.getJob(jobId)
      if (!job) return

      // Execute the Python runner
      const result = await this.runPythonModule(module, job.input)
      
      // Update job with results
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          output: result,
          completedAt: new Date(),
        }
      })

      // Emit WebSocket update
      await this.emitJobUpdate(jobId, 'completed', result)

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error)
      
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
        }
      })

      await this.emitJobUpdate(jobId, 'failed', null, error instanceof Error ? error.message : String(error))
    }
  }

  private async runPythonModule(module: string, input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const modulePath = join(process.cwd(), '..', 'modules', module, 'runner.py')
      const python = spawn('python3', [modulePath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      python.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      python.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout)
            resolve(result)
          } catch (error) {
            reject(new Error(`Failed to parse output: ${stdout}`))
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${stderr}`))
        }
      })

      python.on('error', (error) => {
        reject(error)
      })

      // Send input to Python process
      python.stdin.write(JSON.stringify(input))
      python.stdin.end()
    })
  }

  private async emitJobUpdate(jobId: string, status: string, output?: any, error?: string) {
    // This would integrate with Socket.io to emit real-time updates
    // For now, we'll store the update in Redis for polling
    await redis.setex(`job:${jobId}:update`, 300, JSON.stringify({
      jobId,
      status,
      output,
      error,
      timestamp: new Date().toISOString()
    }))
  }
}

export const jobQueue = JobQueue.getInstance()
