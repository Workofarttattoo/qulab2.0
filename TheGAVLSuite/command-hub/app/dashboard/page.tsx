'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Shield, 
  Scale, 
  Settings, 
  Brain, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Job {
  id: string
  module: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: any
  output?: any
  error?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

const moduleIcons = {
  osint: Search,
  hellfire: Shield,
  legal: Scale,
  ceio: Settings,
  sophiarch: Brain,
}

const statusIcons = {
  pending: Clock,
  running: Activity,
  completed: CheckCircle,
  failed: XCircle,
}

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-100',
  running: 'text-blue-600 bg-blue-100',
  completed: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchJobs()
    }
  }, [status, router])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const recentJobs = jobs.slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user?.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your intelligence operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {session.user?.subscription || 'Free'} Plan
              </span>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <button
            onClick={() => router.push('/modules/osint')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Search className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">OSINT</h3>
            <p className="text-sm text-gray-500">Open source intelligence</p>
          </button>
          
          <button
            onClick={() => router.push('/modules/hellfire')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Shield className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">HELLFIRE</h3>
            <p className="text-sm text-gray-500">Reconnaissance</p>
          </button>
          
          <button
            onClick={() => router.push('/modules/legal')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Scale className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Legal</h3>
            <p className="text-sm text-gray-500">Legal research</p>
          </button>
          
          <button
            onClick={() => router.push('/modules/ceio')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Settings className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">CEIO</h3>
            <p className="text-sm text-gray-500">Enhancements</p>
          </button>
          
          <button
            onClick={() => router.push('/modules/sophiarch')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Brain className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Sophiarch</h3>
            <p className="text-sm text-gray-500">Forecasting</p>
          </button>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Jobs</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentJobs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by running a module to see your jobs here.
                </p>
              </div>
            ) : (
              recentJobs.map((job) => {
                const Icon = moduleIcons[job.module as keyof typeof moduleIcons] || Activity
                const StatusIcon = statusIcons[job.status]
                const statusColor = statusColors[job.status]

                return (
                  <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Icon className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {job.module} Job
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {job.status}
                        </span>
                        {job.completedAt && (
                          <span className="text-sm text-gray-500">
                            {new Date(job.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {job.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
