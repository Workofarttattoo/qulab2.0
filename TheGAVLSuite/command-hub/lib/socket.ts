import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redis } from './redis'

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.use(async (socket, next) => {
    try {
      // In a real implementation, you'd validate the session here
      // For now, we'll allow all connections
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-job', (jobId: string) => {
      socket.join(`job:${jobId}`)
      console.log(`Client ${socket.id} joined job ${jobId}`)
    })

    socket.on('leave-job', (jobId: string) => {
      socket.leave(`job:${jobId}`)
      console.log(`Client ${socket.id} left job ${jobId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export function getSocketIO() {
  return io
}

export async function emitJobUpdate(jobId: string, status: string, output?: any, error?: string) {
  if (!io) return

  const update = {
    jobId,
    status,
    output,
    error,
    timestamp: new Date().toISOString()
  }

  io.to(`job:${jobId}`).emit('job-update', update)
  
  // Also store in Redis for persistence
  await redis.setex(`job:${jobId}:update`, 300, JSON.stringify(update))
}

export async function getJobUpdates(jobId: string) {
  const update = await redis.get(`job:${jobId}:update`)
  return update ? JSON.parse(update) : null
}
