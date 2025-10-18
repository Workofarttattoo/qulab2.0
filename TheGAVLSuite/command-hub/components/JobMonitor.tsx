'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'

interface JobUpdate {
  jobId: string
  status: string
  output?: any
  error?: string
  timestamp: string
}

interface JobMonitorProps {
  jobId: string
  onUpdate?: (update: JobUpdate) => void
}

export default function JobMonitor({ jobId, onUpdate }: JobMonitorProps) {
  const [status, setStatus] = useState<string>('pending')
  const [output, setOutput] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      
      // Join job room for real-time updates
      socket.emit('join-job', jobId)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })

    socket.on('job-update', (update: JobUpdate) => {
      if (update.jobId === jobId) {
        setStatus(update.status)
        setOutput(update.output)
        setError(update.error || null)
        
        if (onUpdate) {
          onUpdate(update)
        }
      }
    })

    // Cleanup on unmount
    return () => {
      socket.emit('leave-job', jobId)
      socket.disconnect()
    }
  }, [jobId, onUpdate])

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'running':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Job Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{status}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job ID</label>
          <p className="mt-1 text-sm text-gray-900 font-mono">{jobId}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {output && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Output</h3>
                <div className="mt-2 text-sm text-green-700">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(output, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <Clock className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Connection Lost</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  Real-time updates are not available. The job may still be processing.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
