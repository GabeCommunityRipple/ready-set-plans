import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('user_id, role, created_at')
    .eq('role', 'drafter')

  if (profilesError) {
    console.log('Error fetching drafter profiles:', profilesError)
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

  if (usersError) {
    console.log('Error fetching auth users:', usersError)
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const emailMap: Record<string, string> = {}
  for (const user of users) {
    emailMap[user.id] = user.email || ''
  }

  const { data: jobCounts, error: jobCountsError } = await supabaseAdmin
    .from('jobs')
    .select('drafter_id')
    .not('drafter_id', 'is', null)

  if (jobCountsError) {
    console.log('Error fetching job counts:', jobCountsError)
    return NextResponse.json({ error: jobCountsError.message }, { status: 500 })
  }

  const countMap: Record<string, number> = {}
  for (const row of jobCounts || []) {
    countMap[row.drafter_id] = (countMap[row.drafter_id] || 0) + 1
  }

  const drafters = profiles.map((p) => ({
    id: p.user_id,
    email: emailMap[p.user_id] || p.user_id,
    role: p.role,
    created_at: p.created_at,
    jobCount: countMap[p.user_id] || 0,
  }))

  return NextResponse.json(drafters)
}
