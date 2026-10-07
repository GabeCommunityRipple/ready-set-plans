import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Access Your Portal — Ready Set Plans',
  robots: { index: false, follow: false },
}

// Buffer page for magic links. Email security scanners fetch links but don't
// submit forms, so the single-use token is only consumed when the user clicks.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const tokenHash = typeof params.token_hash === 'string' ? params.token_hash : null
  const type = typeof params.type === 'string' ? params.type : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '2.5rem 2rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Ready Set Plans" style={{ height: 60, width: 'auto', objectFit: 'contain', marginBottom: '1.5rem' }} />

        {tokenHash && type ? (
          <>
            <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.75rem', fontWeight: 700, color: '#1A2332' }}>
              You&apos;re almost in!
            </h1>
            <p style={{ margin: '0 0 2rem', fontSize: '1rem', lineHeight: 1.6, color: '#4b5563' }}>
              Click the button below to sign in to your Ready Set Plans portal.
            </p>
            <form method="get" action="/auth/callback">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="type" value={type} />
              <button
                type="submit"
                style={{ width: '100%', padding: '0.875rem 1.5rem', background: '#1B7FE8', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 2px 8px rgba(27,127,232,0.3)', cursor: 'pointer' }}
              >
                Access My Portal →
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 700, color: '#1A2332' }}>
              This link is incomplete
            </h1>
            <p style={{ margin: '0 0 2rem', fontSize: '1rem', lineHeight: 1.6, color: '#4b5563' }}>
              Request a new login link and we&apos;ll email it to you right away.
            </p>
            <Link
              href="/login"
              style={{ display: 'block', padding: '0.875rem 1.5rem', background: '#1B7FE8', color: '#ffffff', borderRadius: '0.5rem', fontSize: '1.0625rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Get a New Login Link
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
