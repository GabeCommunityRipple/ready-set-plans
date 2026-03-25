import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import { analyzeJobCompleteness } from '@/lib/ai-job-check'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const metadata = paymentIntent.metadata

    try {
      const supabase = await createClient()

      // Create job record
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          customer_email: metadata.email,
          business_name: metadata.businessName,
          job_name: metadata.jobName,
          job_site_address: metadata.jobSiteAddress,
          plan_type: metadata.planType,
          description: metadata.description,
          total_amount: paymentIntent.amount,
          promo_code: metadata.promoCode || null,
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Run AI completeness check
      let aiStatus: 'pending' | 'needs_info' = 'pending'
      try {
        const aiResult = await analyzeJobCompleteness({
          job_name: metadata.jobName,
          plan_type: metadata.planType,
          description: metadata.description,
          job_site_address: metadata.jobSiteAddress,
        })

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
        }
      } catch (aiError) {
        // Non-fatal: log and continue — job stays 'pending' if AI check fails
        console.error('AI job check failed, defaulting to pending:', aiError)
      }

      // Handle file uploads
      const fileUrls = JSON.parse(metadata.fileUrls || '[]')
      for (const url of fileUrls) {
        // Download file from temp location and upload to job folder
        const response = await fetch(url)
        const blob = await response.blob()
        const fileName = url.split('/').pop()!

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(`jobs/${job.id}/uploads/${fileName}`, blob)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          continue
        }

        // Record file in database
        await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: fileName,
            file_path: `jobs/${job.id}/uploads/${fileName}`,
          })
      }

      if (aiStatus === 'needs_info') {
        // AI flagged missing info — email customer with what's needed
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
          <p>Thank you for your order for <strong>${metadata.jobName}</strong>! Payment received: $${(paymentIntent.amount / 100).toFixed(2)}.</p>
          <p>To create your permit-ready plans we need a few more details:</p>
          <ul>${missingList}</ul>
          <p>${jobWithAI?.ai_message ?? ''}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/orders/${job.id}">Log in to provide the missing information &rarr;</a></p>
        `)
      } else {
        // Complete — send confirmation and notify admin
        await sendEmail(metadata.email, 'Order Confirmed - Ready Set Plans', `
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order! Your plans for <strong>${metadata.jobName}</strong> are now being processed.</p>
          <p>Plan Type: ${metadata.planType}</p>
          <p>Amount Paid: $${(paymentIntent.amount / 100).toFixed(2)}</p>
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
      }

      // Send magic link for account access
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: metadata.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (authError) {
        console.error('Error sending magic link:', authError)
      }

    } catch (error) {
      console.error('Error processing payment success:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}