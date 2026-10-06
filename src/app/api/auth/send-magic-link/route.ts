import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (linkError) {
      console.error('[send-magic-link] Error generating magic link:', linkError)
      return NextResponse.json({ error: 'Could not send login link. Please try again.' }, { status: 500 })
    }

    const magicLinkUrl = linkData.properties.action_link

    const result = await sendEmail(normalizedEmail, 'Your Ready Set Plans Login Link', `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Ready Set Plans</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">Here's your login link</h2>
                  <p style="margin:0 0 32px;color:#444;font-size:15px;line-height:1.6;">
                    Click the button below to instantly access your Ready Set Plans portal. This link expires in 24 hours.
                  </p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#2563eb;border-radius:6px;">
                        <a href="${magicLinkUrl}" style="display:inline-block;padding:16px 40px;color:#ffffff;font-size:17px;font-weight:700;text-decoration:none;">
                          Access My Portal &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:32px 0 0;color:#888;font-size:13px;line-height:1.6;">
                    If you didn't request this link, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f4f4f5;padding:24px 40px;text-align:center;">
                  <p style="margin:0;color:#888;font-size:13px;">&copy; Ready Set Plans &mdash; Permit-ready plans, fast.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `)

    if (!result.success) {
      console.error('[send-magic-link] Error sending email:', result.error)
      return NextResponse.json({ error: 'Could not send login link. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[send-magic-link] Unexpected error:', error)
    return NextResponse.json({ error: 'Could not send login link. Please try again.' }, { status: 500 })
  }
}
