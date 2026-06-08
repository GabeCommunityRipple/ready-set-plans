'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [otpEmail, setOtpEmail] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else if (profile?.role === 'drafter') {
      router.push('/drafter')
    } else {
      router.push('/portal')
    }
  }

  const handleSendLoginLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)
    setOtpError('')
    setOtpSent(false)

    const { error } = await supabase.auth.signInWithOtp({ email: otpEmail })

    if (error) {
      setOtpError(error.message)
      setOtpLoading(false)
      return
    }

    setOtpSent(true)
    setOtpLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', color: '#111' }}>
          Sign in to Ready Set Plans
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: '#374151' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: '#374151' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          {error && (
            <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.625rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#111' }}>
            Need a new login link?
          </h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
            Enter your email and we&apos;ll send a one-click link to get you back into your portal.
          </p>
          <form onSubmit={handleSendLoginLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label htmlFor="otp-email" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: '#374151' }}>
                Email
              </label>
              <input
                id="otp-email"
                type="email"
                autoComplete="email"
                required
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
            {otpError && (
              <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{otpError}</p>
            )}
            {otpSent && (
              <p style={{ fontSize: '0.875rem', color: '#047857', margin: 0 }}>
                Check your email for a login link.
              </p>
            )}
            <button
              type="submit"
              disabled={otpLoading}
              style={{ padding: '0.625rem', background: '#ffffff', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, cursor: otpLoading ? 'not-allowed' : 'pointer', opacity: otpLoading ? 0.6 : 1 }}
            >
              {otpLoading ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
