'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function OrderPage() {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [promoApplying, setPromoApplying] = useState(false)
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discountAmount: number; message: string } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    jobName: '',
    jobSiteAddress: '',
    planType: 'deck',
    description: '',
  })

  const prices: Record<string, number> = { deck: 97, screen_porch: 147 }

  const basePrice = prices[formData.planType]
  const discount = promoResult?.valid ? promoResult.discountAmount : 0
  const finalPrice = Math.max(0, basePrice - discount)

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoApplying(true)
    setPromoResult(null)
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), planType: formData.planType }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoResult({ valid: true, discountAmount: data.discountAmount, message: data.message || `Promo applied! -$${data.discountAmount}` })
      } else {
        setPromoResult({ valid: false, discountAmount: 0, message: data.error || 'Invalid promo code.' })
      }
    } catch {
      setPromoResult({ valid: false, discountAmount: 0, message: 'Could not validate promo code.' })
    } finally {
      setPromoApplying(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'planType') {
      setPromoResult(null)
      setPromoCode('')
    }
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const uploadFiles = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const path = `temp/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('uploads').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('uploads').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fileUrls = await uploadFiles()
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          promoCode: promoResult?.valid ? promoCode.trim() : '',
          totalAmount: finalPrice * 100,
          fileUrls,
        }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Order API error response:', { status: response.status, data })
        alert('Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Order submit exception:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Place Your Order</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Fill out the details below and we'll get your plans started within 48 hours.</p>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Email Address *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="you@company.com" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Business Name *</label>
              <input type="text" name="businessName" required value={formData.businessName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Your Company Name" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Job Name *</label>
              <input type="text" name="jobName" required value={formData.jobName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="e.g. Smith Backyard Deck" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Job Site Address *</label>
              <input type="text" name="jobSiteAddress" required value={formData.jobSiteAddress} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="123 Main St, City, State" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Plan Type *</label>
              <select name="planType" value={formData.planType} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}>
                <option value="deck">Deck Plans — $97</option>
                <option value="screen_porch">Screen Porch Plans — $147</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Project Description *</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Describe your project..." />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Reference Files</label>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Upload any sketches, photos, or site plans (images or PDFs)</p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.dwg,.dxf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: '#F9FAFB', cursor: 'pointer' }}
              />
              {files.length > 0 && (
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#374151', listStyle: 'none', padding: 0 }}>
                  {files.map((f, i) => (
                    <li key={i} style={{ padding: '0.25rem 0', borderBottom: '1px solid #F3F4F6' }}>📎 {f.name}</li>
                  ))}
                </ul>
              )}
            </div>
            {/* Promo Code */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Promo Code <span style={{ fontWeight: '400', color: '#9CA3AF' }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null) }}
                  placeholder="Enter code"
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoApplying || !promoCode.trim()}
                  style={{ padding: '0.75rem 1.25rem', backgroundColor: promoApplying || !promoCode.trim() ? '#E5E7EB' : '#1A2332', color: promoApplying || !promoCode.trim() ? '#9CA3AF' : '#ffffff', fontWeight: '600', fontSize: '0.95rem', borderRadius: '0.5rem', border: 'none', cursor: promoApplying || !promoCode.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  {promoApplying ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {promoResult && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: promoResult.valid ? '#16A34A' : '#DC2626', fontWeight: '500' }}>
                  {promoResult.message}
                </p>
              )}
            </div>

            {/* Total */}
            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
              {promoResult?.valid && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#6B7280' }}>
                  <span>Subtotal:</span>
                  <span>${basePrice}</span>
                </div>
              )}
              {promoResult?.valid && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#16A34A', fontWeight: '500' }}>
                  <span>Discount:</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#1A56DB' }}>Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A56DB' }}>${finalPrice}</span>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#93C5FD' : '#1A56DB', color: '#ffffff', fontWeight: 'bold', fontSize: '1.125rem', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processing...' : `Pay $${finalPrice} & Submit Order`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
