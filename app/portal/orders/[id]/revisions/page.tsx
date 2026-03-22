'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Job {
  id: string
  job_name: string
  status: string
  customer_id: string
}

export default function RevisionsPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [requestText, setRequestText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchJob()
    }
  }, [params.id])

  const fetchJob = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_name, status, customer_id')
        .eq('id', params.id)
        .eq('customer_id', user.id)
        .single()

      if (error) throw error
      setJob(data)

      if (data.status !== 'delivered') {
        router.push(`/portal/orders/${params.id}`)
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !requestText.trim()) return

    setSubmitting(true)
    try {
      // Upload revision files if any
      const uploadedFiles: string[] = []
      for (const file of files) {
        const fileName = `revision-${Date.now()}-${file.name}`
        const { data, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(`jobs/${job.id}/revisions/${fileName}`, file)

        if (uploadError) throw uploadError
        uploadedFiles.push(`jobs/${job.id}/revisions/${fileName}`)
      }

      // Create revision request
      const { error: revisionError } = await supabase
        .from('revision_requests')
        .insert({
          job_id: job.id,
          request_text: requestText,
        })

      if (revisionError) throw revisionError

      // Update job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: 'revision_requested' })
        .eq('id', job.id)

      if (updateError) throw updateError

      // TODO: Send email notification to drafter
      // This would require additional setup for email templates and drafter assignment

      router.push(`/portal/orders/${job.id}`)
    } catch (err) {
      alert('Failed to submit revision request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={`/portal/orders/${job.id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Request Revision</h1>
          <p className="text-gray-600 mt-2">for {job.job_name}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revision Notes *
              </label>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the changes you'd like to see in your plans..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Annotated Files (Optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Upload marked-up PDFs or images showing the changes you want
              </p>
              {files.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {files.length} file(s) selected
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || !requestText.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Revision Request'}
              </button>
              <Link
                href={`/portal/orders/${job.id}`}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}