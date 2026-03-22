'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Job {
  id: string
  job_name: string
  plan_type: string
  description: string
  status: string
  created_at: string
  customer_email: string
  business_name: string
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

export default function DrafterPage() {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch available jobs (paid but no drafter assigned)
      const { data: availableData, error: availableError } = await supabase
        .from('jobs')
        .select('id, job_name, plan_type, description, status, created_at, customer_email, business_name')
        .eq('status', 'pending')
        .is('drafter_id', null)
        .order('created_at', { ascending: false })

      if (availableError) throw availableError
      setAvailableJobs(availableData || [])

      // Fetch my jobs
      const { data: myData, error: myError } = await supabase
        .from('jobs')
        .select('id, job_name, plan_type, description, status, created_at, customer_email, business_name')
        .eq('drafter_id', user.id)
        .order('created_at', { ascending: false })

      if (myError) throw myError
      setMyJobs(myData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const claimJob = async (jobId: string) => {
    setClaiming(jobId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('jobs')
        .update({
          drafter_id: user.id,
          status: 'in_progress'
        })
        .eq('id', jobId)

      if (error) throw error

      // Refresh jobs
      await fetchJobs()
    } catch (err) {
      alert('Failed to claim job. Please try again.')
    } finally {
      setClaiming(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Drafter Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your drafting projects</p>
        </div>

        {/* Available Jobs */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Available Jobs</h2>

          {availableJobs.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No available jobs</h3>
              <p className="text-gray-600">New jobs will appear here when customers place orders.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {availableJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{job.job_name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Available
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Plan:</span> {job.plan_type === 'deck' ? 'Deck' : 'Screen Porch'}</p>
                    <p><span className="font-medium">Customer:</span> {job.business_name || job.customer_email}</p>
                    <p><span className="font-medium">Ordered:</span> {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {job.description}
                    </p>
                  )}

                  <button
                    onClick={() => claimJob(job.id)}
                    disabled={claiming === job.id}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {claiming === job.id ? 'Claiming...' : 'Claim Job'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Jobs */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">My Jobs</h2>

          {myJobs.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-gray-400 text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned jobs</h3>
              <p className="text-gray-600">Claim a job above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/drafter/jobs/${job.id}`}
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
                    <p><span className="font-medium">Customer:</span> {job.business_name || job.customer_email}</p>
                    <p><span className="font-medium">Status:</span> {statusLabels[job.status as keyof typeof statusLabels] || job.status}</p>
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
    </div>
  )
}