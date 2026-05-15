'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface JobItem {
  id: string
  job_name: string
  plan_type: string
  status: string
  pay_amount: number
  drafter_paid: boolean
  drafter_paid_at: string | null
  completed_at: string
}

interface RevisionItem {
  id: string
  job_id: string
  job_name: string
  pay_amount: number
  drafter_paid: boolean
  drafter_paid_at: string | null
  resolved_at: string
}

interface Drafter {
  id: string
  email: string
  created_at: string
  jobs: JobItem[]
  revisions: RevisionItem[]
  total_owed: number
  total_paid: number
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '32px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as const,
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  } as const,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  } as const,
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  } as const,
  backLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
  } as const,
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  } as const,
  drafterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px',
    marginBottom: '16px',
  } as const,
  drafterEmail: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  } as const,
  totals: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
  } as const,
  totalOwed: {
    color: '#b45309',
    fontWeight: 600,
  } as const,
  totalPaid: {
    color: '#047857',
    fontWeight: 600,
  } as const,
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '16px 0 8px',
  } as const,
  emptyText: {
    color: '#6b7280',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '4px 0 12px',
  } as const,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  } as const,
  th: {
    textAlign: 'left' as const,
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb',
  } as const,
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle' as const,
  } as const,
  rowUnpaid: {
    backgroundColor: '#fffbeb',
  } as const,
  rowPaid: {
    backgroundColor: '#ffffff',
    color: '#9ca3af',
  } as const,
  payButton: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  } as const,
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  } as const,
  paidBadge: {
    color: '#6b7280',
    fontSize: '13px',
    fontStyle: 'italic',
  } as const,
  loading: {
    textAlign: 'center' as const,
    padding: '48px',
    color: '#6b7280',
  } as const,
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '16px',
  } as const,
}

export default function DrafterPaymentsPage() {
  const [drafters, setDrafters] = useState<Drafter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/drafter-payments')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setDrafters(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const markPaid = async (type: 'job' | 'revision', id: string) => {
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/drafter-payments/${id}/mark-paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to mark as paid')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as paid')
    } finally {
      setPendingId(null)
    }
  }

  const fmtDate = (iso: string | null) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString()
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading drafter payments...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Drafter Payments</h1>
          <Link href="/admin" style={styles.backLink}>← Back to admin</Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {drafters.length === 0 ? (
          <div style={styles.card}>
            <p style={{ margin: 0, color: '#6b7280' }}>No drafters found.</p>
          </div>
        ) : (
          drafters.map((d) => (
            <div key={d.id} style={styles.card}>
              <div style={styles.drafterHeader}>
                <h2 style={styles.drafterEmail}>{d.email}</h2>
                <div style={styles.totals}>
                  <span style={styles.totalOwed}>Owed: ${d.total_owed}</span>
                  <span style={styles.totalPaid}>Paid to date: ${d.total_paid}</span>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Completed Jobs</h3>
              {d.jobs.length === 0 ? (
                <p style={styles.emptyText}>No completed jobs.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Job</th>
                      <th style={styles.th}>Plan Type</th>
                      <th style={styles.th}>Completed</th>
                      <th style={styles.th}>Pay</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.jobs.map((j) => (
                      <tr key={j.id} style={j.drafter_paid ? styles.rowPaid : styles.rowUnpaid}>
                        <td style={styles.td}>{j.job_name}</td>
                        <td style={styles.td}>
                          {j.plan_type === 'deck' ? 'Deck' : 'Screen Porch'}
                        </td>
                        <td style={styles.td}>{fmtDate(j.completed_at)}</td>
                        <td style={styles.td}>${j.pay_amount}</td>
                        <td style={styles.td}>
                          {j.drafter_paid ? (
                            <span style={styles.paidBadge}>
                              Paid {fmtDate(j.drafter_paid_at)}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markPaid('job', j.id)}
                              disabled={pendingId === j.id}
                              style={{
                                ...styles.payButton,
                                ...(pendingId === j.id ? styles.payButtonDisabled : {}),
                              }}
                            >
                              {pendingId === j.id ? 'Marking...' : 'Mark as Paid'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h3 style={styles.sectionTitle}>Resolved Revisions</h3>
              {d.revisions.length === 0 ? (
                <p style={styles.emptyText}>No resolved revisions.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Job</th>
                      <th style={styles.th}>Resolved</th>
                      <th style={styles.th}>Pay</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.revisions.map((r) => (
                      <tr key={r.id} style={r.drafter_paid ? styles.rowPaid : styles.rowUnpaid}>
                        <td style={styles.td}>{r.job_name}</td>
                        <td style={styles.td}>{fmtDate(r.resolved_at)}</td>
                        <td style={styles.td}>${r.pay_amount}</td>
                        <td style={styles.td}>
                          {r.drafter_paid ? (
                            <span style={styles.paidBadge}>
                              Paid {fmtDate(r.drafter_paid_at)}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markPaid('revision', r.id)}
                              disabled={pendingId === r.id}
                              style={{
                                ...styles.payButton,
                                ...(pendingId === r.id ? styles.payButtonDisabled : {}),
                              }}
                            >
                              {pendingId === r.id ? 'Marking...' : 'Mark as Paid'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
