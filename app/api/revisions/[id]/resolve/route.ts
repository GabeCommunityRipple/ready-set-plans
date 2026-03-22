import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendRevisionResolved } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
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
      .eq('id', params.id)
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
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to resolve revision' }, { status: 500 })
    }

    // Send email to customer
    const customerEmail = revision.jobs.customer_email
    const customerName = revision.jobs.business_name || 'Valued Customer'

    await sendRevisionResolved(customerEmail, {
      customerName,
      jobName: revision.jobs.job_name,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resolving revision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}