import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { drafterNotes } = await request.json()

    // Get revision details
    const { data: revision, error: revisionError } = await supabase
      .from('revision_requests')
      .select(`
        *,
        jobs (
          job_name,
          customer_email,
          business_name
        )
      `)
      .eq('id', id)
      .single()

    if (revisionError || !revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
    }

    // Update revision status
    const { error: updateError } = await supabase
      .from('revision_requests')
      .update({
        status: 'resolved',
        drafter_notes: drafterNotes || null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to resolve revision' }, { status: 500 })
    }

    // Send email to customer
    const customerEmail = revision.jobs.customer_email
    const customerName = revision.jobs.business_name || 'Valued Customer'

    await sendEmail(customerEmail, 'Your Revised Plans Are Ready', `
      <h1>Your Revised Plans Are Ready</h1>
      <p>Hi ${customerName},</p>
      <p>Your drafter has addressed the revision requests for <strong>${revision.jobs.job_name}</strong>. The updated plans are now ready for your review.</p>
      <p>Please log in to your customer portal to view the revised plans. You can provide additional feedback, request further revisions, or approve the plans if they now meet your requirements.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Review Revised Plans</a>
      <p>Questions? Reply to this email or contact us at support@ready-set-plans.com</p>
    `)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resolving revision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}