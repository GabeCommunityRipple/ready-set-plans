'use client'

import { useState } from 'react'

export default function OrderPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    jobName: '',
    jobSiteAddress: '',
    planType: 'deck',
    description: '',
  })

  const prices: Record<string, number> = { deck: 97, screen_porch: 147 }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount: prices[formData.planType] * 100,
          fileUrls: [],
        }),
      })
      const data = await response.json()
      if (data.client_secret) {
        window.location.href = '/order/success'
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
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
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Project Description *</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Describe your project..." />
            </div>
            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600', color: '#1A56DB' }}>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A56DB' }}>${prices[formData.planType]}</span>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#93C5FD' : '#1A56DB', color: '#ffffff', fontWeight: 'bold', fontSize: '1.125rem', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processing...' : `Pay $${prices[formData.planType]} & Submit Order`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}