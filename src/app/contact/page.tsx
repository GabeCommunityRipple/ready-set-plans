'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1.5px solid #CBD5E1',
    fontSize: '1rem',
    color: '#1A2332',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.4rem',
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1A2332' }}>

      {/* Navigation */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/">
          <Image src="/logo.png" alt="Ready Set Plans" height={60} width={180} style={{ objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>About</Link>
          <Link href="/contact" style={{ color: '#1B7FE8', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>Contact</Link>
          <Link href="/order" style={{
            backgroundColor: '#1B7FE8',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
          }}>
            Order Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        backgroundColor: '#1A2332',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(27,127,232,0.08) 39px, rgba(27,127,232,0.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(27,127,232,0.08) 39px, rgba(27,127,232,0.08) 40px)',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
            Get in Touch
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
            Have a question or ready to start? We're here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>

          {/* Contact Form */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '700', marginBottom: '1.75rem' }}>Send Us a Message</h2>

            {status === 'success' ? (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '0.5rem', padding: '1.25rem', color: '#166534' }}>
                <strong>Message sent!</strong> We'll get back to you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Phone <span style={{ fontWeight: '400', color: '#94A3B8' }}>(optional)</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="555-555-5555"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your project..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                {status === 'error' && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#991B1B', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    width: '100%',
                    backgroundColor: status === 'sending' ? '#93C5FD' : '#1B7FE8',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '1rem',
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '700', marginBottom: '1.75rem' }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                  📞
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Phone</div>
                  <a href="tel:5014047526" style={{ color: '#1B7FE8', textDecoration: 'none' }}>501-404-7526</a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                  ✉️
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Email</div>
                  <a href="mailto:info@readysetplans.com" style={{ color: '#1B7FE8', textDecoration: 'none' }}>info@readysetplans.com</a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                  📍
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Location</div>
                  <span style={{ color: '#475569' }}>Charlottesville, VA</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '3rem', backgroundColor: '#F1F5F9', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Ready to order?</div>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                Skip the wait—place your order now and get permit-ready plans in 48 hours.
              </p>
              <Link href="/order" style={{
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontWeight: '600',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: '0.9rem',
              }}>Order Now</Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1A2332',
        color: '#94A3B8',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <Image src="/logo.png" alt="Ready Set Plans" height={50} width={150} style={{ objectFit: 'contain', marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <a href="tel:5014047526" style={{ color: '#94A3B8', textDecoration: 'none' }}>501-404-7526</a>
          <a href="mailto:info@readysetplans.com" style={{ color: '#94A3B8', textDecoration: 'none' }}>info@readysetplans.com</a>
          <span>Charlottesville, VA</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
          &copy; {new Date().getFullYear()} Ready Set Plans. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
