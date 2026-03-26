import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showArchived = searchParams.get('showArchived') === 'true'

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('id, job_name, customer_email, business_name, plan_type, status, total_amount, created_at, drafter_id, archived')
      .eq('archived', showArchived)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin jobs fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Admin jobs unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
