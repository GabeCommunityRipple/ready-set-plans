import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the caller is a drafter
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'drafter') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Use supabaseAdmin to bypass RLS — the existing "Drafters can update assigned jobs"
    // policy requires drafter_id = auth.uid(), which is never true on an unclaimed job.
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update({ drafter_id: user.id, status: 'in_progress' })
      .eq('id', jobId)
      .is('drafter_id', null) // prevent claiming an already-claimed job
      .select()
      .single()

    if (error) {
      console.error('claim-job update failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Job not found or already claimed' }, { status: 409 })
    }

    return NextResponse.json({ job: data })
  } catch (error) {
    console.error('Unexpected error in claim-job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
