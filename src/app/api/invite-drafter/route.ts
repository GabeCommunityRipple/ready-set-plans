import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Send invite using Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        role: 'drafter', // This will be used in the trigger to set the profile role
      },
    })

    if (error) {
      console.error('Error inviting user:', error)
      return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Invitation sent successfully' })
  } catch (error) {
    console.error('Error in invite-drafter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}