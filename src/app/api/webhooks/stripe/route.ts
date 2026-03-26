import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import { analyzeJobCompleteness } from '@/lib/ai-job-check'
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
      const supabase = await createClient()
      console.log('[stripe-webhook] Supabase client created')

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

      // Run AI completeness check
      let aiStatus: 'pending' | 'needs_info' = 'pending'
      try {
        console.log('[stripe-webhook] Running AI completeness check...')
        const aiResult = await analyzeJobCompleteness({
          job_name: metadata.jobName,
          plan_type: metadata.planType,
          description: metadata.description,
          job_site_address: metadata.jobSiteAddress,
        })
        console.log('[stripe-webhook] AI check result:', JSON.stringify(aiResult))

        if (!aiResult.complete) {
          aiStatus = 'needs_info'
          await supabase
            .from('jobs')
            .update({
              status: 'needs_info',
              missing_items: aiResult.missing_items,
              ai_message: aiResult.message,
            })
            .eq('id', job.id)
          console.log('[stripe-webhook] Job updated to needs_info')
        }
      } catch (aiError) {
        // Non-fatal: log and continue — job stays 'pending' if AI check fails
        console.error('[stripe-webhook] AI job check failed, defaulting to pending:', aiError)
      }

      // Handle file uploads
      const fileUrls = JSON.parse(metadata.fileUrls || '[]')
      console.log('[stripe-webhook] File URLs to process:', fileUrls.length)
      for (const url of fileUrls) {
        try {
          const response = await fetch(url)
          const blob = await response.blob()
          const fileName = url.split('/').pop()!

          const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(`jobs/${job.id}/uploads/${fileName}`, blob)

          if (uploadError) {
            console.error('[stripe-webhook] Error uploading file:', fileName, uploadError)
            continue
          }

          await supabase
            .from('job_files')
            .insert({
              job_id: job.id,
              file_name: fileName,
              file_path: `jobs/${job.id}/uploads/${fileName}`,
            })

          console.log('[stripe-webhook] File uploaded:', fileName)
        } catch (fileError) {
          console.error('[stripe-webhook] Error processing file:', url, fileError)
        }
      }

      if (aiStatus === 'needs_info') {
        const { data: jobWithAI } = await supabase
          .from('jobs')
          .select('missing_items, ai_message')
          .eq('id', job.id)
          .single()

        const missingList = (jobWithAI?.missing_items ?? [])
          .map((item: string) => `<li>${item}</li>`)
          .join('')

        await sendEmail(metadata.email, 'Action Required: Additional Info Needed - Ready Set Plans', `
          <h1>We Need a Bit More Info</h1>
          <p>Thank you for your order for <strong>${metadata.jobName}</strong>! Payment received: $${((session.amount_total ?? 0) / 100).toFixed(2)}.</p>
          <p>To create your permit-ready plans we need a few more details:</p>
          <ul>${missingList}</ul>
          <p>${jobWithAI?.ai_message ?? ''}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/orders/${job.id}">Log in to provide the missing information &rarr;</a></p>
        `)
        console.log('[stripe-webhook] needs_info email sent to:', metadata.email)
      } else {
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
      }

      // Send magic link for account access
      console.log('[stripe-webhook] Sending magic link to:', metadata.email)
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: metadata.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (authError) {
        console.error('[stripe-webhook] Error sending magic link:', authError)
      } else {
        console.log('[stripe-webhook] Magic link sent successfully')
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
