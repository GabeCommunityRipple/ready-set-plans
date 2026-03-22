import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Get current job details
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Update job status
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 })
    }

    // Send appropriate email based on new status
    const customerEmail = job.customer_email

    if (status === 'in_progress') {
      // Get drafter info
      const { data: drafterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', job.drafter_id)
        .single()

      if (drafterProfile) {
        await sendEmail(customerEmail, 'Your Plans Are Being Drafted', `
          <h1>Your Plans Are Being Drafted</h1>
          <p>Great news! We've assigned ${drafterProfile.full_name || 'a drafter'} to work on your plans for ${job.job_name}.</p>
          <p>Your drafter will start working on your plans within 48 hours.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">View Your Order</a>
        `)
      }
    } else if (status === 'delivered') {
      await sendEmail(customerEmail, 'Your Plans Are Ready to Review', `
        <h1>Your Plans Are Ready to Review</h1>
        <p>Great news! Your draft plans for ${job.job_name} are now ready for your review.</p>
        <p>Please log in to your customer portal to view the draft, provide feedback, or request revisions.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">Review Your Plans</a>
      `)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}