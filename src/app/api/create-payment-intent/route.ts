import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

const planNames: Record<string, string> = {
  deck: 'Deck Plans',
  screen_porch: 'Screen Porch Plans',
}

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

    if (!email || !jobName || !jobSiteAddress || !planType || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const origin = new URL(request.url).origin

    const metadata = {
      email,
      businessName: businessName ? businessName.substring(0, 490) : '',
      jobName: jobName ? jobName.substring(0, 490) : '',
      jobSiteAddress: jobSiteAddress ? jobSiteAddress.substring(0, 490) : '',
      planType,
      description: description ? description.substring(0, 490) : '',
      promoCode: promoCode || '',
      ...Object.fromEntries((fileUrls as string[]).map((url: string, i: number) => [`fileUrl${i}`, url])),
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: totalAmount,
            product_data: {
              name: planNames[planType] || 'Plans',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata,
      success_url: `${origin}/order/success`,
      cancel_url: `${origin}/order`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error creating checkout session:', {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        raw: error.raw,
      })
    } else if (error instanceof Error) {
      console.error('Error creating checkout session:', error.message, error.stack)
    } else {
      console.error('Unknown error creating checkout session:', error)
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
