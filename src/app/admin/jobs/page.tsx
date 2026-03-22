'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
  drafter_email?: string
}

interface Drafter {
  id: string
  email: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [drafters, setDrafters] = useState<Drafter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [drafterFilter, setDrafterFilter] = useState('')

  useEffect(() => {
    fetchJobs()
    fetchDrafters()
  }, [])

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          id, job_name, customer_email, business_name, plan_type, status, total_amount, created_at, drafter_id,
          profiles!jobs_drafter_id_fkey(email)
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      const jobsWithDrafters = data?.map((job: Job & { profiles: { email: string }[] }) => ({
        ...job,
        drafter_email: (job.profiles as any)?.email || null,
      })) || []

      setJobs(jobsWithDrafters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
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

  const filteredJobs = jobs.filter(job => {
    if (statusFilter && job.status !== statusFilter) return false
    if (drafterFilter && job.drafter_id !== drafterFilter) return false
    return true
  })

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    revision_requested: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading jobs...</div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">All Jobs</h1>
          <p className="text-gray-600 mt-2">Manage and track all drafting projects</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="delivered">Delivered</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Drafter
              </label>
              <select
                value={drafterFilter}
                onChange={(e) => setDrafterFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Drafters</option>
                {drafters.map((drafter) => (
                  <option key={drafter.id} value={drafter.id}>
                    {drafter.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredJobs.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No jobs found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drafter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/admin/jobs/${job.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.job_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.business_name || job.customer_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.plan_type === 'deck' ? 'Deck' : 'Screen Porch'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.drafter_email || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(job.total_amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}