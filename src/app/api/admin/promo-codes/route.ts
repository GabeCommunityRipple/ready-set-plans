import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, discount_type, discount_value, valid_until, is_active } = body

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert({ code, discount_type, discount_value, valid_until: valid_until || null, is_active })
      .select()
      .single()

    if (error) {
      console.error('Error creating promo code:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating promo code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
