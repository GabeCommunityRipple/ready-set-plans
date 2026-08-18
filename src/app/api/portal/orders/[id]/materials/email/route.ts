import { sendEmail } from '@/lib/email'
import { verifyOrderOwnership } from '@/lib/portal-auth'
import { NextRequest, NextResponse } from 'next/server'

const RECIPIENTS = ['info@dakconstruction.com', 'info@readysetplans.com']

// The materials text is edited by hand in a textarea before being sent, so it
// has to be escaped before going into the email body.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const access = await verifyOrderOwnership(id)
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const { materialsText } = await request.json()

    if (typeof materialsText !== 'string' || !materialsText.trim()) {
      return NextResponse.json({ error: 'materialsText is required' }, { status: 400 })
    }

    const { job } = access

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827;">
        <h1 style="font-size: 20px; margin-bottom: 4px;">Materials List</h1>
        <p style="margin: 0 0 2px 0;"><strong>Job:</strong> ${escapeHtml(job.job_name)}</p>
        <p style="margin: 0 0 16px 0;"><strong>Address:</strong> ${escapeHtml(job.job_site_address || 'N/A')}</p>
        <pre style="font-family: 'Courier New', Courier, monospace; font-size: 13px; line-height: 1.5; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; white-space: pre-wrap;">${escapeHtml(materialsText)}</pre>
        <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">Generated from the approved plans in Ready Set Plans.</p>
      </div>
    `.trim()

    const result = await sendEmail(RECIPIENTS, `Materials List — ${job.job_name}`, html)

    if (!result.success) {
      console.error('Materials list email failed', { jobId: id, error: result.error })
      return NextResponse.json(
        { error: result.error || 'Failed to send materials list' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Materials list email: unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
