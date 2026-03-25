import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Try email invite first
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { role: 'drafter' },
    })

    if (!inviteError) {
      return NextResponse.json({ message: 'Invitation email sent successfully' })
    }

    console.error('Email invite failed (SMTP may not be configured), falling back to direct createUser:', inviteError.message)

    // Fallback: create user directly with email already confirmed
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { role: 'drafter' },
    })

    if (createError) {
      console.error('createUser failed:', createError)
      return NextResponse.json(
        { error: `Could not create drafter account: ${createError.message}` },
        { status: 500 }
      )
    }

    const userId = createData.user.id

    // The on_auth_user_created trigger should have already created the profile,
    // but upsert here as a safety net to ensure the role is set correctly.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ user_id: userId, role: 'drafter' }, { onConflict: 'user_id' })

    if (profileError) {
      console.error('Profile upsert failed:', profileError)
    }

    return NextResponse.json({
      message: 'Drafter account created (no invite email — share login credentials directly)',
    })
  } catch (error) {
    console.error('Unexpected error in invite-drafter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
