import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
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

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`
    await sendEmail(
      email,
      "You've been invited to Ready Set Plans",
      `<p>You've been invited to Ready Set Plans as a drafter.</p>
<p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
<p><strong>Temporary password:</strong> ${TEMP_PASSWORD}</p>
<p>Please change your password after your first login.</p>`
    )

    return NextResponse.json({ message: 'Drafter account created', tempPassword: TEMP_PASSWORD })
  } catch (error) {
    console.error('Unexpected error in invite-drafter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
