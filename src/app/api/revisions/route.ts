import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { jobId, revisionNotes } = await request.json()

    if (!jobId || !revisionNotes) {
      return NextResponse.json({ error: 'Job ID and revision notes are required' }, { status: 400 })
    }

    // Get job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, job_name, customer_email, drafter_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Create revision request
    const { data: revision, error: revisionError } = await supabaseAdmin
      .from('revision_requests')
      .insert({
        job_id: jobId,
        request_text: revisionNotes,
      })
      .select()
      .single()

    if (revisionError) {
      console.error('Failed to create revision request:', revisionError)
      return NextResponse.json({ error: 'Failed to create revision request' }, { status: 500 })
    }

    // Send email to drafter
    if (job.drafter_id) {
      const { data: drafterUser } = await supabaseAdmin.auth.admin.getUserById(job.drafter_id)

      if (drafterUser.user?.email) {
        await sendEmail(drafterUser.user.email, 'Revision Requested', `
          <h1>Revision Requested</h1>
          <p>A customer has requested revisions for the job ${job.job_name}.</p>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <strong>Revision Notes:</strong><br>
            ${revisionNotes.replace(/\n/g, '<br>')}
          </div>
          <p>Please review the feedback and update the plans accordingly.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/drafter/jobs/${jobId}">View Job & Revisions</a>
        `)
      }
    }

    return NextResponse.json({ success: true, revision })
  } catch (error) {
    console.error('Error creating revision request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
