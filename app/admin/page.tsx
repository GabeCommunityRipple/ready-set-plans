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
}

interface Stats {
  totalJobs: number
  totalRevenue: number
  openRevisions: number
  unassignedJobs: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    totalRevenue: 0,
    openRevisions: 0,
    unassignedJobs: 0,
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('status, total_amount, drafter_id')

      if (jobsError) throw jobsError

      const jobs = jobsData || []
      const totalJobs = jobs.length
      const totalRevenue = jobs.reduce((sum, job) => sum + job.total_amount, 0)
      const openRevisions = jobs.filter(job => job.status === 'revision_requested').length
      const unassignedJobs = jobs.filter(job => !job.drafter_id && job.status === 'pending').length

      setStats({
        totalJobs,
        totalRevenue,
        openRevisions,
        unassignedJobs,
      })

      // Fetch recent jobs
      const { data: recentData, error: recentError } = await supabase
        .from('jobs')
        .select('id, job_name, customer_email, business_name, plan_type, status, total_amount, created_at, drafter_id')
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) throw recentError
      setRecentJobs(recentData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your drafting service</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Jobs</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">${(stats.totalRevenue / 100).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600">Open Revisions</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.openRevisions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600">Unassigned Jobs</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.unassignedJobs}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/jobs"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <h3 className="font-semibold text-gray-900">Manage Jobs</h3>
              <p className="text-sm text-gray-600">View and edit all jobs</p>
            </Link>
            <Link
              href="/admin/drafters"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <h3 className="font-semibold text-gray-900">Manage Drafters</h3>
              <p className="text-sm text-gray-600">Invite and monitor drafters</p>
            </Link>
            <Link
              href="/admin/promo-codes"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <h3 className="font-semibold text-gray-900">Promo Codes</h3>
              <p className="text-sm text-gray-600">Create and manage discounts</p>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-gray-600">No jobs yet.</p>
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
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.job_name}</div>
                          <div className="text-sm text-gray-500">{job.plan_type === 'deck' ? 'Deck' : 'Screen Porch'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.business_name || job.customer_email}
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