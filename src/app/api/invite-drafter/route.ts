import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const TEMP_PASSWORD = 'ChangeMe123!'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: TEMP_PASSWORD,
      email_confirm: true,
    })

    if (createError) {
      console.error('createUser failed:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    const userId = createData.user.id

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ user_id: userId, role: 'drafter' }, { onConflict: 'user_id' })

    if (profileError) {
      console.error('Profile upsert failed:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Drafter account created', tempPassword: TEMP_PASSWORD })
  } catch (error) {
    console.error('Unexpected error in invite-drafter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
