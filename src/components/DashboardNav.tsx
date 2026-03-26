'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface DashboardNavProps {
  email: string
}

export default function DashboardNav({ email }: DashboardNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Ready Set Plans" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#475569' }}>{email}</span>
        <Link
          href="/profile"
          style={{ fontSize: '0.875rem', color: '#1B7FE8', fontWeight: '500', textDecoration: 'none' }}
        >
          My Profile
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: '#1A2332',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.4rem 1rem',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
