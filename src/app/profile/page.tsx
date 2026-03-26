'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('customer')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      setRole(profile?.role || 'customer')
    }
    load()
  }, [router])

  const dashboardHref = role === 'admin' ? '/admin' : role === 'drafter' ? '/drafter' : '/portal'
  const dashboardLabel = role === 'admin' ? 'Admin Dashboard' : role === 'drafter' ? 'Drafter Dashboard' : 'My Orders'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.')
      return
    }

    setStatus('saving')

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (signInError) {
      setErrorMsg('Current password is incorrect.')
      setStatus('error')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      setErrorMsg(updateError.message)
      setStatus('error')
      return
    }

    setStatus('success')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const inputClass: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1.5px solid #CBD5E1',
    borderRadius: '0.375rem',
    fontSize: '0.95rem',
    color: '#1A2332',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const labelClass: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.375rem',
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1A2332', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <DashboardNav email={email} />

      <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href={dashboardHref} style={{ fontSize: '0.875rem', color: '#1B7FE8', textDecoration: 'none' }}>
            ← Back to {dashboardLabel}
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>My Profile</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2rem' }}>Update your account password below.</p>

          <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#F1F5F9', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Email</div>
            <div style={{ fontSize: '0.95rem', color: '#1A2332' }}>{email}</div>
          </div>

          {status === 'success' ? (
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '0.5rem', padding: '1rem', color: '#166534', marginBottom: '1rem' }}>
              Password updated successfully.
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelClass}>Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputClass}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelClass}>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputClass}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelClass}>Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputClass}
              />
            </div>

            {errorMsg ? (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#991B1B', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === 'saving'}
              style={{
                width: '100%',
                backgroundColor: status === 'saving' ? '#93C5FD' : '#1B7FE8',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: status === 'saving' ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {status === 'saving' ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
