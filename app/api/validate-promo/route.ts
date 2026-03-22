import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, planType } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gt('valid_until', new Date().toISOString())
      .single()

    if (error || !promo) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })
    }

    let discount = 0
    if (promo.discount_type === 'fixed') {
      discount = promo.discount_value
    } else if (promo.discount_type === 'percent') {
      const basePrice = planType === 'deck' ? 9700 : 14700
      discount = Math.round((basePrice * promo.discount_value) / 100)
    }

    return NextResponse.json({ discount })
  } catch (error) {
    console.error('Error validating promo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}