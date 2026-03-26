'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Job {
  id: string
  job_name: string
  status: string
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
      const res = await fetch(`/api/portal/orders/${params.id}`)
      if (!res.ok) {
        const text = await res.text()
        console.error('fetchJob failed:', res.status, text)
        throw new Error('Failed to load job')
      }
      const data = await res.json()

      if (data.job.status !== 'delivered') {
        router.push(`/portal/orders/${params.id}`)
        return
      }

      setJob(data.job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !requestText.trim()) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('jobId', job.id)
      formData.append('revisionNotes', requestText)
      for (const file of files) {
        formData.append('files', file)
      }

      const res = await fetch('/api/revisions', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Revision submit failed:', res.status, text)
        throw new Error('Failed to create revision request')
      }

      router.push(`/portal/orders/${job.id}`)
    } catch (err) {
      alert('Failed to submit revision request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.125rem' }}>Loading...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '1.125rem' }}>Error: {error || 'Job not found'}</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href={`/portal/orders/${job.id}`}
            style={{ color: '#2563eb', display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}
          >
            ← Back to Order
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', margin: 0 }}>Request Revision</h1>
          <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>for {job.job_name}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Revision Notes *
              </label>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                required
                rows={6}
                placeholder="Please describe the changes you'd like to see in your plans..."
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Upload Annotated Files (Optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem' }}>
                Upload marked-up PDFs or images showing the changes you want
              </p>
              {files.length > 0 && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={submitting || !requestText.trim()}
                style={{ flex: 1, padding: '0.75rem 1.5rem', background: submitting ? '#93c5fd' : '#2563eb', color: '#fff', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: (!requestText.trim()) ? 0.5 : 1 }}
              >
                {submitting ? 'Submitting...' : 'Submit Revision Request'}
              </button>
              <Link
                href={`/portal/orders/${job.id}`}
                style={{ padding: '0.75rem 1.5rem', background: '#d1d5db', color: '#374151', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
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
