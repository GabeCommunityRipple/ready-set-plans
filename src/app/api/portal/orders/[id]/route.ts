import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (jobError || !job) {
      console.error('Portal order fetch: job not found', { jobId: id, jobError })
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.customer_email.toLowerCase() !== user.email.toLowerCase()) {
      console.error('Portal order fetch: email mismatch', { jobEmail: job.customer_email, userEmail: user.email })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: files, error: filesError } = await supabaseAdmin
      .from('job_files')
      .select('*')
      .eq('job_id', id)
      .order('uploaded_at', { ascending: true })

    if (filesError) {
      console.error('Portal order fetch: files error', filesError)
    }

    const { data: revisions, error: revisionsError } = await supabaseAdmin
      .from('revision_requests')
      .select('*')
      .eq('job_id', id)
      .order('created_at', { ascending: true })

    if (revisionsError) {
      console.error('Portal order fetch: revisions error', revisionsError)
    }

    return NextResponse.json({ job, files: files ?? [], revisions: revisions ?? [] })
  } catch (error) {
    console.error('Portal order fetch: unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    const { data: job, error: fetchError } = await supabaseAdmin
      .from('jobs')
      .select('customer_email')
      .eq('id', id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.customer_email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('jobs')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      console.error('Portal order PATCH: update failed', updateError)
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Portal order PATCH: unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
