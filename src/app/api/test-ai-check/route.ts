import { supabaseAdmin } from '@/lib/supabase/admin'
import { analyzeJobCompleteness } from '@/lib/ai-job-check'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { job_id } = await request.json()

  if (!job_id) {
    return NextResponse.json({ error: 'job_id is required' }, { status: 400 })
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from('jobs')
    .select('job_name, plan_type, description, job_site_address')
    .eq('id', job_id)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: jobError?.message ?? 'Job not found' }, { status: 404 })
  }

  const result = await analyzeJobCompleteness(job)

  await supabaseAdmin
    .from('jobs')
    .update({
      status: result.complete ? 'pending' : 'needs_info',
      missing_items: result.missing_items,
      ai_message: result.message,
    })
    .eq('id', job_id)

  return NextResponse.json({ job_id, ...result })
}
