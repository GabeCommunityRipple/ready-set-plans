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
  missing_items: string[] | null
  ai_message: string | null
}

interface JobFile {
  id: string
  file_name: string
  file_path: string
  uploaded_at: string
}

interface RevisionRequest {
  id: string
  request_text: string
  created_at: string
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', color: 'bg-gray-200' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { key: 'approved', label: 'Approved', color: 'bg-green-600' },
]

const statusColors = {
  needs_info: 'bg-amber-100 text-amber-800',
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  revision_requested: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [files, setFiles] = useState<JobFile[]>([])
  const [revisions, setRevisions] = useState<RevisionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approving, setApproving] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [submittingInfo, setSubmittingInfo] = useState(false)
  const [infoSubmitResult, setInfoSubmitResult] = useState<{ message: string; stillMissing?: string[] } | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails()
    }
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('customer_email', user.email)
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
      setError(err instanceof Error ? err.message : 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !additionalInfo.trim()) return

    setSubmittingInfo(true)
    setInfoSubmitResult(null)
    try {
      const res = await fetch('/api/portal/submit-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, additionalInfo }),
      })
      const data = await res.json()

      if (data.status === 'pending') {
        setJob({ ...job, status: 'pending', missing_items: [], ai_message: null })
        setInfoSubmitResult({ message: data.message })
        setAdditionalInfo('')
      } else {
        // Still needs info
        setJob({ ...job, missing_items: data.missing_items, ai_message: data.message })
        setInfoSubmitResult({ message: data.message, stillMissing: data.missing_items })
        setAdditionalInfo('')
      }
    } catch {
      setInfoSubmitResult({ message: 'Failed to submit. Please try again.' })
    } finally {
      setSubmittingInfo(false)
    }
  }

  const handleApprove = async () => {
    if (!job) return

    setApproving(true)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'approved' })
        .eq('id', job.id)

      if (error) throw error

      setJob({ ...job, status: 'approved' })
    } catch (err) {
      alert('Failed to approve plans. Please try again.')
    } finally {
      setApproving(false)
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
        <div className="text-lg">Loading order details...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error || 'Order not found'}</div>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === job.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{job.job_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status as keyof typeof statusColors]}`}>
              {job.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-gray-600">
              Ordered {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Needs Info Banner */}
        {job.status === 'needs_info' && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h2 className="text-xl font-bold text-amber-900">Additional Information Required</h2>
                <p className="text-amber-800 mt-1">
                  {job.ai_message ?? 'We need more details before we can begin drafting your plans.'}
                </p>
              </div>
            </div>

            {job.missing_items && job.missing_items.length > 0 && (
              <div className="mb-5">
                <p className="font-semibold text-amber-900 mb-2">Missing information:</p>
                <ul className="list-disc list-inside space-y-1">
                  {job.missing_items.map((item, i) => (
                    <li key={i} className="text-amber-800">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {infoSubmitResult && (
              <div className={`mb-4 p-3 rounded text-sm font-medium ${infoSubmitResult.stillMissing ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800'}`}>
                {infoSubmitResult.message}
              </div>
            )}

            <form onSubmit={handleSubmitInfo} className="space-y-3">
              <label className="block font-semibold text-amber-900">
                Provide the missing details:
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={5}
                placeholder="e.g. Deck dimensions: 16x20 ft, height off ground: 3 ft, 6x6 posts, attached to house via ledger board, composite decking..."
                className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
              <button
                type="submit"
                disabled={submittingInfo || !additionalInfo.trim()}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50"
              >
                {submittingInfo ? 'Checking...' : 'Submit Additional Information'}
              </button>
            </form>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Progress</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${index <= currentStepIndex ? step.color : 'bg-gray-200'}`} />
                <span className={`ml-2 text-sm ${index <= currentStepIndex ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {index < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
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

        {/* Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-600">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
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

        {/* Revisions */}
        {revisions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Revision Requests</h2>
            <div className="space-y-4">
              {revisions.map((revision) => (
                <div key={revision.id} className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(revision.created_at).toLocaleDateString()}
                  </p>
                  <p>{revision.request_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {job.status === 'delivered' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex gap-4">
              <Link
                href={`/portal/orders/${job.id}/revisions`}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700"
              >
                Request Revision
              </Link>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {approving ? 'Approving...' : 'Approve Plans'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}