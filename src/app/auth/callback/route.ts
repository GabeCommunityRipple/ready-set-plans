import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const isExpiredError = (message: string) =>
  /expired|otp_expired/i.test(message)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      console.error('Error verifying OTP:', error)
      const dest = isExpiredError(error.message) ? '/login?error=expired' : '/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      const dest = isExpiredError(error.message) ? '/login?error=expired' : '/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = profile?.role ?? 'customer'
  let redirectTo = '/portal'
  if (role === 'admin') {
    redirectTo = '/admin'
  } else if (role === 'drafter') {
    redirectTo = '/drafter'
  }

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
