'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Job {
  id: string
  job_name: string
  plan_type: string
  status: string
  created_at: string
  total_amount: number
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  revision_requested: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
}

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  revision_requested: 'Revision Requested',
  delivered: 'Delivered',
  approved: 'Approved',
}

export default function PortalPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_name, plan_type, status, created_at, total_amount')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your orders...</div>
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your drafting projects</p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Your drafting orders will appear here once you place them.</p>
            <Link
              href="/order"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/portal/orders/${job.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {job.job_name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[job.status as keyof typeof statusLabels] || job.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Plan:</span> {job.plan_type === 'deck' ? 'Deck' : 'Screen Porch'}</p>
                  <p><span className="font-medium">Ordered:</span> {new Date(job.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Amount:</span> ${(job.total_amount / 100).toFixed(2)}</p>
                </div>

                <div className="mt-4 text-blue-600 text-sm font-medium">
                  View Details →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}