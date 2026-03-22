import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { resend } from '@/lib/resend'
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
      const supabase = createClient()

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

      // Send confirmation email
      await resend.emails.send({
        from: 'noreply@readysetplans.com',
        to: metadata.email,
        subject: 'Order Confirmation - Ready Set Plans',
        html: `
          <h1>Thank you for your order!</h1>
          <p>Your ${metadata.planType} drafting job has been received and is being processed.</p>
          <p>Job: ${metadata.jobName}</p>
          <p>You'll receive updates as your plans are completed.</p>
        `,
      })

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