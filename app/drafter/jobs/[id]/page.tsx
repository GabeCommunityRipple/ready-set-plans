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
  drafter_id: string
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

export default function DrafterJobPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [customerFiles, setCustomerFiles] = useState<JobFile[]>([])
  const [drafterFiles, setDrafterFiles] = useState<JobFile[]>([])
  const [revisions, setRevisions] = useState<RevisionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [delivering, setDelivering] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchJobDetails()
    }
  }, [params.id])

  const fetchJobDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('drafter_id', user.id)
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

      const customerUploads = filesData?.filter(f => f.file_type === 'customer_upload') || []
      const drafterUploads = filesData?.filter(f => ['draft', 'revision', 'final'].includes(f.file_type)) || []

      setCustomerFiles(customerUploads)
      setDrafterFiles(drafterUploads)

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

  const uploadFile = async (file: File, fileType: string) => {
    if (!job) return

    setUploading(true)
    try {
      const fileName = `${fileType}-${Date.now()}-${file.name}`
      const filePath = `jobs/${job.id}/uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Record file in database
      const { error: dbError } = await supabase
        .from('job_files')
        .insert({
          job_id: job.id,
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
        })

      if (dbError) throw dbError

      // Update job status based on file type
      let newStatus = job.status
      if (fileType === 'revision') {
        newStatus = 'delivered'
      } else if (fileType === 'final') {
        newStatus = 'delivered'
      }
      // draft upload keeps status as is

      if (newStatus !== job.status) {
        const { error: statusError } = await supabase
          .from('jobs')
          .update({ status: newStatus })
          .eq('id', job.id)

        if (statusError) throw statusError
        setJob({ ...job, status: newStatus })
      }

      // Refresh files
      await fetchJobDetails()

      // TODO: Send email notification to customer
      alert(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`)
    } catch (err) {
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const markAsDelivered = async () => {
    if (!job) return

    setDelivering(true)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'delivered' })
        .eq('id', job.id)

      if (error) throw error

      setJob({ ...job, status: 'delivered' })
      alert('Job marked as delivered!')
    } catch (err) {
      alert('Failed to mark as delivered. Please try again.')
    } finally {
      setDelivering(false)
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
          <Link href="/drafter" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{job.job_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              job.status === 'revision_requested' ? 'bg-yellow-100 text-yellow-800' :
              job.status === 'delivered' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {job.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-gray-600">
              Customer: {job.business_name || job.customer_email}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Job Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">{job.business_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan Type</p>
              <p className="font-medium">{job.plan_type === 'deck' ? 'Deck Plan' : 'Screen Porch Plan'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Job Site Address</p>
              <p className="font-medium">{job.job_site_address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium">${(job.total_amount / 100).toFixed(2)}</p>
            </div>
          </div>
          {job.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="mt-1">{job.description}</p>
            </div>
          )}
        </div>

        {/* Customer Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Customer Files</h2>
          {customerFiles.length === 0 ? (
            <p className="text-gray-600">No customer files uploaded.</p>
          ) : (
            <div className="space-y-2">
              {customerFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
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

        {/* Revision Requests */}
        {revisions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>

          {job.status === 'revision_requested' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Revision
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, 'revision')
                  }}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Draft PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, 'draft')
                  }}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Final Plans
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, 'final')
                  }}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {uploading && (
            <p className="text-blue-600 mt-2">Uploading...</p>
          )}
        </div>

        {/* Actions */}
        {drafterFiles.some(f => f.file_type === 'final') && job.status !== 'delivered' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <button
              onClick={markAsDelivered}
              disabled={delivering}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {delivering ? 'Marking as Delivered...' : 'Mark as Delivered'}
            </button>
          </div>
        )}

        {/* Drafter Files */}
        {drafterFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">My Uploads</h2>
            <div className="space-y-2">
              {drafterFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      Type: {file.file_type} • Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
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
          </div>
        )}
      </div>
    </div>
  )
}