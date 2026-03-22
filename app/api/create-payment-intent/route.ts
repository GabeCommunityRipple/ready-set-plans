import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      businessName,
      jobName,
      jobSiteAddress,
      planType,
      description,
      promoCode,
      fileUrls,
      totalAmount,
    } = await request.json()

    // Validate required fields
    if (!email || !jobName || !jobSiteAddress || !planType || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store order data temporarily (you might want to use a temp table or Redis)
    // For now, we'll pass metadata to Stripe
    const metadata = {
      email,
      businessName,
      jobName,
      jobSiteAddress,
      planType,
      description,
      promoCode: promoCode || '',
      fileUrls: JSON.stringify(fileUrls),
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ client_secret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}