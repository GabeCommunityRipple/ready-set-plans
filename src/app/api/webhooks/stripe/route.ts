import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  console.log('[stripe-webhook] Received webhook call')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    console.log('[stripe-webhook] Signature verified, event type:', event.type)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata ?? {}

    console.log('[stripe-webhook] checkout.session.completed received')
    console.log('[stripe-webhook] Session ID:', session.id)
    console.log('[stripe-webhook] Payment status:', session.payment_status)
    console.log('[stripe-webhook] Amount total (cents):', session.amount_total)
    console.log('[stripe-webhook] Metadata:', JSON.stringify(metadata))

    if (session.payment_status !== 'paid') {
      console.warn('[stripe-webhook] Payment not yet paid, skipping. Status:', session.payment_status)
      return NextResponse.json({ received: true })
    }

    try {
      const supabase = supabaseAdmin
      console.log('[stripe-webhook] Supabase admin client ready')

      // Create job record
      const insertPayload = {
        customer_email: metadata.email,
        business_name: metadata.businessName,
        job_name: metadata.jobName,
        job_site_address: metadata.jobSiteAddress,
        plan_type: metadata.planType,
        description: metadata.description,
        status: 'pending',
        total_amount: session.amount_total,
        promo_code: metadata.promoCode || null,
      }
      console.log('[stripe-webhook] Inserting job with payload:', JSON.stringify(insertPayload))

      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert(insertPayload)
        .select()
        .single()

      if (jobError) {
        console.error('[stripe-webhook] Job insert FAILED:', JSON.stringify(jobError))
        throw jobError
      }

      console.log('[stripe-webhook] Job created successfully. ID:', job.id)

      // Handle file uploads — list temp folder and move each file server-side
      const tempPrefix = metadata.tempPrefix
      if (tempPrefix) {
        const { data: tempFiles, error: listError } = await supabaseAdmin.storage
          .from('uploads')
          .list(`temp/${tempPrefix}`)

        if (listError) {
          console.error('[stripe-webhook] Error listing temp files:', listError)
        } else {
          console.log('[stripe-webhook] Temp files to move:', tempFiles?.length ?? 0)
          for (const file of (tempFiles ?? [])) {
            const fromPath = `temp/${tempPrefix}/${file.name}`
            const toPath = `jobs/${job.id}/uploads/${file.name}`

            const { error: moveError } = await supabaseAdmin.storage
              .from('uploads')
              .move(fromPath, toPath)

            if (moveError) {
              console.error('[stripe-webhook] Error moving file:', fromPath, moveError)
              continue
            }

            const { error: dbError } = await supabaseAdmin
              .from('job_files')
              .insert({
                job_id: job.id,
                file_name: file.name,
                file_path: toPath,
                file_type: 'customer_upload',
              })

            if (dbError) {
              console.error('[stripe-webhook] Error inserting job_files record:', file.name, dbError)
            } else {
              console.log('[stripe-webhook] File moved and recorded:', file.name)
            }
          }
        }
      } else {
        console.log('[stripe-webhook] No tempPrefix in metadata, no files to move')
      }

      await sendEmail(metadata.email, 'Order Confirmed - Ready Set Plans', `
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order! Your plans for <strong>${metadata.jobName}</strong> are now being processed.</p>
          <p>Plan Type: ${metadata.planType}</p>
          <p>Amount Paid: $${((session.amount_total ?? 0) / 100).toFixed(2)}</p>
          <p>We'll start working on your plans within 48 hours.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">View Your Order</a>
        `)

      await sendEmail('hello@readysetplans.com', 'New Job Order Received', `
          <h1>New Job Order Received</h1>
          <p>A new job has been placed!</p>
          <p>Job: ${metadata.jobName}</p>
          <p>Customer: ${metadata.businessName || 'Customer'} (${metadata.email})</p>
          <p>Plan Type: ${metadata.planType}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/jobs/${job.id}">View Job Details</a>
        `)

      console.log('[stripe-webhook] Confirmation emails sent')

      // Generate magic link and create customer profile
      console.log('[stripe-webhook] Generating magic link for:', metadata.email)
      const { data: linkData, error: authError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: metadata.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (authError) {
        console.error('[stripe-webhook] Error generating magic link:', authError)
      } else {
        const magicLinkUrl = linkData.properties.action_link
        console.log('[stripe-webhook] Magic link generated successfully')

        // Upsert customer profile so auth callback always routes to /portal
        if (linkData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ user_id: linkData.user.id, role: 'customer' }, { onConflict: 'user_id' })
          if (profileError) {
            console.error('[stripe-webhook] Error upserting customer profile:', profileError)
          } else {
            console.log('[stripe-webhook] Customer profile upserted for user:', linkData.user.id)
          }
        }

        // Send branded magic link email
        await sendEmail(metadata.email, 'Your Order Has Been Received - Ready Set Plans', `
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
                      <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">Your order has been received!</h2>
                      <p style="margin:0 0 8px;color:#444;font-size:15px;line-height:1.6;">
                        <strong>Job:</strong> ${metadata.jobName}
                      </p>
                      <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.6;">
                        <strong>Plan Type:</strong> ${metadata.planType}
                      </p>
                      <p style="margin:0 0 32px;color:#444;font-size:15px;line-height:1.6;">
                        Click below to access your order portal and track your plans. This link is valid for 24 hours.
                      </p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#2563eb;border-radius:6px;">
                            <a href="${magicLinkUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                              Access Your Order Portal &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:32px 0 0;color:#888;font-size:13px;line-height:1.6;">
                        If you didn't place this order, you can safely ignore this email.
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
        console.log('[stripe-webhook] Branded magic link email sent to:', metadata.email)
      }

      console.log('[stripe-webhook] Webhook processing complete for job:', job.id)

    } catch (error) {
      console.error('[stripe-webhook] FATAL error processing checkout.session.completed:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  } else {
    console.log('[stripe-webhook] Ignoring unhandled event type:', event.type)
  }

  return NextResponse.json({ received: true })
}
