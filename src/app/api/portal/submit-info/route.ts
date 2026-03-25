import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { analyzeJobCompleteness } from '@/lib/ai-job-check'
import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, additionalInfo } = await request.json()

    if (!jobId || !additionalInfo?.trim()) {
      return NextResponse.json({ error: 'jobId and additionalInfo are required' }, { status: 400 })
    }

    // Verify the user owns this job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, job_name, plan_type, description, job_site_address, customer_email, status')
      .eq('id', jobId)
      .eq('customer_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'needs_info') {
      return NextResponse.json({ error: 'Job is not awaiting additional information' }, { status: 400 })
    }

    // Append the additional info to the description
    const updatedDescription = [job.description, `--- Additional information provided by customer ---\n${additionalInfo.trim()}`]
      .filter(Boolean)
      .join('\n\n')

    // Re-run AI check with the enriched description
    let aiResult
    try {
      aiResult = await analyzeJobCompleteness({
        job_name: job.job_name,
        plan_type: job.plan_type,
        description: updatedDescription,
        job_site_address: job.job_site_address,
      })
    } catch (aiError) {
      console.error('AI re-check failed:', aiError)
      // Fail open: if AI check errors, treat as complete so the job moves forward
      aiResult = { complete: true, missing_items: [], message: 'AI check unavailable — job moved to pending for manual review.' }
    }

    if (aiResult.complete) {
      await supabaseAdmin
        .from('jobs')
        .update({
          description: updatedDescription,
          status: 'pending',
          missing_items: [],
          ai_message: null,
        })
        .eq('id', jobId)

      // Notify admin that the job is now ready
      await sendEmail('hello@readysetplans.com', 'Job Ready: Additional Info Received', `
        <h1>Job Ready for Drafting</h1>
        <p>A customer has provided the missing information and the job is now ready.</p>
        <p>Job: ${job.job_name}</p>
        <p>Customer: ${job.customer_email}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/jobs/${jobId}">View Job Details</a>
      `)

      return NextResponse.json({ status: 'pending', message: 'Thank you! Your order is now in the queue.' })
    } else {
      await supabaseAdmin
        .from('jobs')
        .update({
          description: updatedDescription,
          missing_items: aiResult.missing_items,
          ai_message: aiResult.message,
        })
        .eq('id', jobId)

      return NextResponse.json({
        status: 'needs_info',
        missing_items: aiResult.missing_items,
        message: aiResult.message,
      })
    }
  } catch (error) {
    console.error('Unexpected error in submit-info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
