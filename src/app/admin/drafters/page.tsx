'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Drafter {
  id: string
  email: string
  jobCount: number
  created_at: string
}

export default function AdminDraftersPage() {
  const [drafters, setDrafters] = useState<Drafter[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDrafters()
  }, [])

  const fetchDrafters = async () => {
    try {
      const { data: draftersData, error: draftersError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .eq('role', 'drafter')

      if (draftersError) throw draftersError

      const { data: jobCounts } = await supabase
        .from('jobs')
        .select('drafter_id')
        .not('drafter_id', 'is', null)

      const countMap: Record<string, number> = {}
      for (const row of jobCounts || []) {
        countMap[row.drafter_id] = (countMap[row.drafter_id] || 0) + 1
      }

      const draftersWithCounts = draftersData?.map((drafter: any) => ({
        id: drafter.id,
        email: drafter.email,
        created_at: drafter.created_at,
        jobCount: countMap[drafter.id] || 0,
      })) || []

      setDrafters(draftersWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafters')
    } finally {
      setLoading(false)
    }
  }

  const inviteDrafter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setInviting(true)
    try {
      const response = await fetch('/api/invite-drafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const data = await response.json()
      if (response.ok) {
        alert('Invitation sent successfully!')
        setInviteEmail('')
        fetchDrafters() // Refresh the list
      } else {
        alert(data.error || 'Failed to send invitation')
      }
    } catch (err) {
      alert('Failed to send invitation. Please try again.')
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading drafters...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Drafters</h1>
          <p className="text-gray-600 mt-2">Invite and monitor your drafting team</p>
        </div>

        {/* Invite Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Invite New Drafter</h2>
          <form onSubmit={inviteDrafter} className="flex gap-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={inviting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>

        {/* Drafters List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Current Drafters ({drafters.length})</h2>
          </div>
          {drafters.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No drafters yet. Invite your first drafter above.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {drafters.map((drafter) => (
                <div key={drafter.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{drafter.email}</h3>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(drafter.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{drafter.jobCount}</div>
                      <div className="text-sm text-gray-600">Jobs Assigned</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}