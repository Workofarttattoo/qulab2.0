'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Tag, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface EvidenceRecord {
  id: string
  evidence_type: string
  target: string
  source: string
  classification: string
  confidence: number
  verified: boolean
  created_at: string
  updated_at: string
  tags: string[]
  metadata: Record<string, any>
  data_summary: {
    keys: string[]
    key_count: number
    has_nested_data: boolean
  }
}

interface EvidenceViewerProps {
  caseId?: string
  onExport?: (format: string) => void
}

export default function OSINTEvidenceViewer({ caseId, onExport }: EvidenceViewerProps) {
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([])
  const [filteredEvidence, setFilteredEvidence] = useState<EvidenceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    evidence_type: '',
    classification: '',
    verified: '',
    date_range: { start: '', end: '' }
  })
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])

  useEffect(() => {
    fetchEvidence()
  }, [caseId])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [evidence, searchQuery, filters, sortBy, sortOrder])

  const fetchEvidence = async () => {
    try {
      const response = await fetch('/api/osint/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_evidence',
          case_id: caseId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEvidence(data.evidence || [])
      }
    } catch (error) {
      console.error('Failed to fetch evidence:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...evidence]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(record =>
        record.target.toLowerCase().includes(query) ||
        record.evidence_type.toLowerCase().includes(query) ||
        record.source.toLowerCase().includes(query) ||
        record.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply filters
    if (filters.evidence_type) {
      filtered = filtered.filter(record => record.evidence_type === filters.evidence_type)
    }
    if (filters.classification) {
      filtered = filtered.filter(record => record.classification === filters.classification)
    }
    if (filters.verified !== '') {
      const verified = filters.verified === 'true'
      filtered = filtered.filter(record => record.verified === verified)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof EvidenceRecord]
      let bValue = b[sortBy as keyof EvidenceRecord]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredEvidence(filtered)
  }

  const handleExport = async (format: string) => {
    try {
      const response = await fetch('/api/osint/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          evidence_ids: selectedEvidence.length > 0 ? selectedEvidence : undefined,
          format,
          include_metadata: true,
          include_data: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        // In a real implementation, this would trigger a download
        console.log('Export created:', data)
        if (onExport) {
          onExport(format)
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'public':
        return 'bg-green-100 text-green-800'
      case 'sensitive':
        return 'bg-yellow-100 text-yellow-800'
      case 'highly_sensitive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'breach_check':
        return <Shield className="h-4 w-4" />
      case 'social_profile':
        return <Eye className="h-4 w-4" />
      case 'corporate_data':
        return <Tag className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evidence Viewer</h2>
          <p className="text-sm text-gray-500">
            {filteredEvidence.length} of {evidence.length} records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('json')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Search evidence..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.evidence_type}
              onChange={(e) => setFilters({ ...filters, evidence_type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="breach_check">Breach Check</option>
              <option value="social_profile">Social Profile</option>
              <option value="corporate_data">Corporate Data</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
            <select
              value={filters.classification}
              onChange={(e) => setFilters({ ...filters, classification: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Classifications</option>
              <option value="public">Public</option>
              <option value="sensitive">Sensitive</option>
              <option value="highly_sensitive">Highly Sensitive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {filteredEvidence.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No evidence found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            filteredEvidence.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedEvidence.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvidence([...selectedEvidence, record.id])
                        } else {
                          setSelectedEvidence(selectedEvidence.filter(id => id !== record.id))
                        }
                      }}
                      className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    
                    <div className="flex-shrink-0">
                      {getEvidenceTypeIcon(record.evidence_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {record.target}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(record.classification)}`}>
                          {record.classification}
                        </span>
                        {record.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {record.evidence_type.replace('_', ' ')}
                        </span>
                        <span>Source: {record.source}</span>
                        <span>Confidence: {Math.round(record.confidence * 100)}%</span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {record.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {record.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600">
                        <p>Data contains {record.data_summary.key_count} fields</p>
                        {record.data_summary.has_nested_data && (
                          <p className="text-yellow-600">Contains nested data structures</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
