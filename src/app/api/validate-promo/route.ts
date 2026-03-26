import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, planType } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }

    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gt('valid_until', new Date().toISOString())
      .single()

    if (error || !promo) {
      console.error('Promo lookup failed:', error)
      return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' }, { status: 400 })
    }

    let discountAmount = 0
    if (promo.discount_type === 'fixed') {
      discountAmount = promo.discount_value
    } else if (promo.discount_type === 'percent') {
      const basePrice = planType === 'deck' ? 97 : 147
      discountAmount = Math.round((basePrice * promo.discount_value) / 100)
    }

    return NextResponse.json({
      valid: true,
      discountAmount,
      message: `Promo applied! -$${discountAmount}`,
    })
  } catch (error) {
    console.error('Error validating promo:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}