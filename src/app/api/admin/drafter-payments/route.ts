import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('user_id, created_at')
    .eq('role', 'drafter')

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const emailMap: Record<string, string> = {}
  for (const u of users) {
    emailMap[u.id] = u.email || ''
  }

  const drafterIds = profiles.map((p) => p.user_id)

  const { data: jobs, error: jobsError } = await supabaseAdmin
    .from('jobs')
    .select('id, job_name, plan_type, status, drafter_id, drafter_paid, drafter_paid_at, updated_at, created_at')
    .in('drafter_id', drafterIds)
    .in('status', ['delivered', 'approved'])
    .order('updated_at', { ascending: false })

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 })
  }

  const { data: revisions, error: revisionsError } = await supabaseAdmin
    .from('revision_requests')
    .select('id, job_id, status, resolved_at, drafter_paid, drafter_paid_at, created_at, jobs!inner(id, job_name, drafter_id)')
    .eq('status', 'resolved')
    .order('resolved_at', { ascending: false })

  if (revisionsError) {
    return NextResponse.json({ error: revisionsError.message }, { status: 500 })
  }

  const PAY = { deck: 20, screen_porch: 30, revision: 10 }

  const drafters = profiles.map((p) => {
    const drafterJobs = (jobs || [])
      .filter((j) => j.drafter_id === p.user_id)
      .map((j) => ({
        id: j.id,
        job_name: j.job_name,
        plan_type: j.plan_type,
        status: j.status,
        pay_amount: PAY[j.plan_type as 'deck' | 'screen_porch'] || 0,
        drafter_paid: j.drafter_paid,
        drafter_paid_at: j.drafter_paid_at,
        completed_at: j.updated_at,
      }))

    const drafterRevisions = (revisions || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => r.jobs?.drafter_id === p.user_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        id: r.id,
        job_id: r.job_id,
        job_name: r.jobs?.job_name,
        pay_amount: PAY.revision,
        drafter_paid: r.drafter_paid,
        drafter_paid_at: r.drafter_paid_at,
        resolved_at: r.resolved_at,
      }))

    let totalOwed = 0
    let totalPaid = 0
    for (const j of drafterJobs) {
      if (j.drafter_paid) totalPaid += j.pay_amount
      else totalOwed += j.pay_amount
    }
    for (const r of drafterRevisions) {
      if (r.drafter_paid) totalPaid += r.pay_amount
      else totalOwed += r.pay_amount
    }

    return {
      id: p.user_id,
      email: emailMap[p.user_id] || p.user_id,
      created_at: p.created_at,
      jobs: drafterJobs,
      revisions: drafterRevisions,
      total_owed: totalOwed,
      total_paid: totalPaid,
    }
  })

  return NextResponse.json(drafters)
}
