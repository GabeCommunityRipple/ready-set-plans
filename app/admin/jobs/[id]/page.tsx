'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Job {
  id: string
  job_name: string
  business_name: string
  job_site_address: string
  plan_type: string
  description: string
  status: string
  total_amount: number
  created_at: string
  customer_email: string
  drafter_id: string | null
  promo_code: string | null
}

interface JobFile {
  id: string
  file_name: string
  file_path: string
  file_type: string
  uploaded_at: string
}

interface RevisionRequest {
  id: string
  request_text: string
  created_at: string
}

interface Drafter {
  id: string
  email: string
}

export default function AdminJobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [files, setFiles] = useState<JobFile[]>([])
  const [revisions, setRevisions] = useState<RevisionRequest[]>([])
  const [drafters, setDrafters] = useState<Drafter[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchJobDetails()
      fetchDrafters()
    }
  }, [params.id])

  const fetchJobDetails = async () => {
    try {
      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()

      if (jobError) throw jobError
      setJob(jobData)

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from('job_files')
        .select('*')
        .eq('job_id', params.id)
        .order('uploaded_at', { ascending: true })

      if (filesError) throw filesError
      setFiles(filesData || [])

      // Fetch revisions
      const { data: revisionsData, error: revisionsError } = await supabase
        .from('revision_requests')
        .select('*')
        .eq('job_id', params.id)
        .order('created_at', { ascending: true })

      if (revisionsError) throw revisionsError
      setRevisions(revisionsData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafters = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'drafter')

      if (error) throw error
      setDrafters(data || [])
    } catch (err) {
      console.error('Failed to load drafters:', err)
    }
  }

  const updateJob = async (updates: Partial<Job>) => {
    if (!job) return

    setSaving(true)
    try {
      // Handle status updates via API to trigger emails
      if (updates.status && updates.status !== job.status) {
        const response = await fetch(`/api/jobs/${job.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: updates.status }),
        })

        if (!response.ok) {
          throw new Error('Failed to update job status')
        }
      } else {
        // Handle other updates directly
        const { error } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', job.id)

        if (error) throw error
      }

      setJob({ ...job, ...updates })
    } catch (err) {
      alert('Failed to update job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download file')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading job details...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error || 'Job not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/jobs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job: {job.job_name}</h1>
          <p className="text-gray-600 mt-2">Admin controls for job management</p>
        </div>

        {/* Job Details Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Job Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
              <input
                type="text"
                value={job.job_name}
                onChange={(e) => setJob({ ...job, job_name: e.target.value })}
                onBlur={(e) => updateJob({ job_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={job.business_name || ''}
                onChange={(e) => setJob({ ...job, business_name: e.target.value })}
                onBlur={(e) => updateJob({ business_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
              <input
                type="email"
                value={job.customer_email}
                onChange={(e) => setJob({ ...job, customer_email: e.target.value })}
                onBlur={(e) => updateJob({ customer_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
              <select
                value={job.plan_type}
                onChange={(e) => updateJob({ plan_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="deck">Deck</option>
                <option value="screen_porch">Screen Porch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={job.status}
                onChange={(e) => updateJob({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="delivered">Delivered</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Drafter</label>
              <select
                value={job.drafter_id || ''}
                onChange={(e) => updateJob({ drafter_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Unassigned</option>
                {drafters.map((drafter) => (
                  <option key={drafter.id} value={drafter.id}>
                    {drafter.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Site Address</label>
              <input
                type="text"
                value={job.job_site_address}
                onChange={(e) => setJob({ ...job, job_site_address: e.target.value })}
                onBlur={(e) => updateJob({ job_site_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={job.description || ''}
                onChange={(e) => setJob({ ...job, description: e.target.value })}
                onBlur={(e) => updateJob({ description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-600">No files uploaded.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      Type: {file.file_type.replace('_', ' ')} • Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile(file.file_path, file.file_name)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revisions */}
        {revisions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Revision Requests</h2>
            <div className="space-y-4">
              {revisions.map((revision) => (
                <div key={revision.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(revision.created_at).toLocaleDateString()}
                  </p>
                  <p>{revision.request_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}