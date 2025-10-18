import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redis } from './redis'

let io: SocketIOServer | null = null

export function initializeSocketServer(server: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  io.use(async (socket, next) => {
    try {
      // In a real implementation, you'd validate the session from the socket handshake
      // For now, we'll allow all connections but track them
      console.log('Socket connection attempt from:', socket.handshake.address)
      next()
    } catch (error) {
      console.error('Socket auth error:', error)
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join job-specific rooms for real-time updates
    socket.on('join-job', (jobId: string) => {
      socket.join(`job:${jobId}`)
      console.log(`Client ${socket.id} joined job ${jobId}`)
    })

    socket.on('leave-job', (jobId: string) => {
      socket.leave(`job:${jobId}`)
      console.log(`Client ${socket.id} left job ${jobId}`)
    })

    // Join user-specific room for personal updates
    socket.on('join-user', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`Client ${socket.id} joined user ${userId}`)
    })

    socket.on('leave-user', (userId: string) => {
      socket.leave(`user:${userId}`)
      console.log(`Client ${socket.id} left user ${userId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export function getSocketServer() {
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

  // Emit to job-specific room
  io.to(`job:${jobId}`).emit('job-update', update)
  
  // Also emit to user room if we have user context
  // This would require storing job-to-user mapping in Redis
  const jobUser = await redis.get(`job:${jobId}:user`)
  if (jobUser) {
    io.to(`user:${jobUser}`).emit('job-update', update)
  }
  
  // Store in Redis for persistence
  await redis.setex(`job:${jobId}:update`, 300, JSON.stringify(update))
}

export async function emitUserNotification(userId: string, type: string, message: string, data?: any) {
  if (!io) return

  const notification = {
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  }

  io.to(`user:${userId}`).emit('notification', notification)
}

export async function getJobUpdates(jobId: string) {
  const update = await redis.get(`job:${jobId}:update`)
  return update ? JSON.parse(update) : null
}

// Job queue integration
export async function startJobQueueProcessor() {
  const { jobQueue } = await import('./job-queue')
  
  // Process jobs every 5 seconds
  setInterval(async () => {
    try {
      await jobQueue.processJobs()
    } catch (error) {
      console.error('Job queue processing error:', error)
    }
  }, 5000)
}
