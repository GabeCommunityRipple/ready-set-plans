'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Job {
  id: string
  job_name: string
  customer_email: string
  business_name: string
  plan_type: string
  status: string
  total_amount: number
  created_at: string
  drafter_id: string | null
  archived: boolean
}

interface Drafter {
  id: string
  email: string
}

const statusColors: Record<string, { background: string; color: string }> = {
  pending:            { background: '#f3f4f6', color: '#1f2937' },
  in_progress:        { background: '#dbeafe', color: '#1e40af' },
  revision_requested: { background: '#fef9c3', color: '#854d0e' },
  needs_info:         { background: '#fef3c7', color: '#92400e' },
  delivered:          { background: '#dcfce7', color: '#166534' },
  approved:           { background: '#dcfce7', color: '#166534' },
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [drafters, setDrafters] = useState<Drafter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [drafterFilter, setDrafterFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [archiving, setArchiving] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [showArchived])

  useEffect(() => {
    fetchDrafters()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs?showArchived=${showArchived}`)
      if (!res.ok) throw new Error('Failed to load jobs')
      setJobs(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafters = async () => {
    try {
      const res = await fetch('/api/admin/drafters')
      if (!res.ok) return
      const data = await res.json()
      setDrafters(data.map((d: any) => ({ id: d.id, email: d.email })))
    } catch {
      console.error('Failed to load drafters')
    }
  }

  const handleArchive = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation()
    setArchiving(jobId)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/archive`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to archive job')
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch {
      alert('Failed to archive job. Please try again.')
    } finally {
      setArchiving(null)
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (statusFilter && job.status !== statusFilter) return false
    if (drafterFilter && job.drafter_id !== drafterFilter) return false
    return true
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.125rem' }}>Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '1.125rem' }}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin" style={{ color: '#2563eb', display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', margin: 0 }}>All Jobs</h1>
          <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>Manage and track all drafting projects</p>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="needs_info">Needs Info</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="delivered">Delivered</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Filter by Drafter
              </label>
              <select
                value={drafterFilter}
                onChange={(e) => setDrafterFilter(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              >
                <option value="">All Drafters</option>
                {drafters.map((drafter) => (
                  <option key={drafter.id} value={drafter.id}>{drafter.email}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="showArchived"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
              />
              <label htmlFor="showArchived" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
                Show archived jobs
              </label>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div style={{ background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {filteredJobs.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4b5563' }}>
              No jobs found matching the current filters.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Job', 'Customer', 'Plan Type', 'Drafter', 'Status', 'Amount', 'Date', ''].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => {
                    const isArchived = job.archived
                    const rowStyle: React.CSSProperties = {
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      opacity: isArchived ? 0.5 : 1,
                      background: isArchived ? '#f3f4f6' : '#fff',
                    }
                    const cellStyle: React.CSSProperties = {
                      padding: '1rem 1.5rem',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                      color: isArchived ? '#6b7280' : '#111827',
                    }
                    const badge = statusColors[job.status] ?? { background: '#f3f4f6', color: '#1f2937' }

                    return (
                      <tr
                        key={job.id}
                        style={rowStyle}
                        onClick={() => window.location.href = `/admin/jobs/${job.id}`}
                      >
                        <td style={cellStyle}>
                          <span style={{ fontWeight: '500' }}>{job.job_name}</span>
                        </td>
                        <td style={cellStyle}>{job.business_name || job.customer_email}</td>
                        <td style={cellStyle}>{job.plan_type === 'deck' ? 'Deck' : 'Screen Porch'}</td>
                        <td style={cellStyle}>{drafters.find(d => d.id === job.drafter_id)?.email || 'Unassigned'}</td>
                        <td style={{ ...cellStyle }}>
                          <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', background: badge.background, color: badge.color }}>
                            {job.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={cellStyle}>${(job.total_amount / 100).toFixed(2)}</td>
                        <td style={{ ...cellStyle, color: isArchived ? '#9ca3af' : '#6b7280' }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ ...cellStyle }} onClick={(e) => e.stopPropagation()}>
                          {!isArchived && (
                            <button
                              onClick={(e) => handleArchive(e, job.id)}
                              disabled={archiving === job.id}
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: archiving === job.id ? '#e5e7eb' : '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: archiving === job.id ? 'not-allowed' : 'pointer' }}
                            >
                              {archiving === job.id ? 'Archiving...' : 'Archive'}
                            </button>
                          )}
                          {isArchived && (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Archived</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
