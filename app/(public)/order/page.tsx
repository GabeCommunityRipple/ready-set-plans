'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const planPrices = {
  deck: 9700, // $97 in cents
  screen_porch: 14700, // $147 in cents
}

interface FormData {
  email: string
  businessName: string
  jobName: string
  jobSiteAddress: string
  planType: 'deck' | 'screen_porch'
  description: string
  promoCode: string
}

function OrderForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    businessName: '',
    jobName: '',
    jobSiteAddress: '',
    planType: 'deck',
    description: '',
    promoCode: '',
  })

  const [files, setFiles] = useState<File[]>([])
  const [fileUrls, setFileUrls] = useState<string[]>([])
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  const basePrice = planPrices[formData.planType]
  const discountAmount = promoDiscount
  const totalAmount = Math.max(0, basePrice - discountAmount)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)

    // Upload files to temp storage
    const urls: string[] = []
    for (const file of selectedFiles) {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`temp/${fileName}`, file)

      if (error) {
        console.error('Error uploading file:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path)
      urls.push(publicUrl)
    }
    setFileUrls(urls)
  }

  const validatePromo = async () => {
    if (!formData.promoCode) return

    try {
      const response = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.promoCode, planType: formData.planType }),
      })

      const data = await response.json()
      if (response.ok) {
        setPromoDiscount(data.discount)
        setPromoError('')
      } else {
        setPromoDiscount(0)
        setPromoError(data.error)
      }
    } catch (error) {
      setPromoError('Error validating promo code')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileUrls,
          totalAmount,
        }),
      })

      const { client_secret, error } = await response.json()
      if (error) throw new Error(error)

      setClientSecret(client_secret)

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success`,
        },
      })

      if (confirmError) throw confirmError
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (formData.promoCode) {
      const timeout = setTimeout(validatePromo, 500)
      return () => clearTimeout(timeout)
    } else {
      setPromoDiscount(0)
      setPromoError('')
    }
  }, [formData.promoCode, formData.planType])

  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        Order Drafting Service
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box'
            }}
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box'
            }}
            value={formData.businessName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Job Name
          </label>
          <input
            type="text"
            name="jobName"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box'
            }}
            value={formData.jobName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Job Site Address
          </label>
          <input
            type="text"
            name="jobSiteAddress"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box'
            }}
            value={formData.jobSiteAddress}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Plan Type
          </label>
          <select
            name="planType"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box'
            }}
            value={formData.planType}
            onChange={handleInputChange}
          >
            <option value="deck">Deck - $97</option>
            <option value="screen_porch">Screen Porch - $147</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Upload Files (Images/PDFs)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              boxSizing: 'border-box'
            }}
          />
          {fileUrls.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#6B7280'
            }}>
              {fileUrls.length} file(s) uploaded
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Promo Code
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              name="promoCode"
              style={{
                flex: '1',
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.25rem',
                boxSizing: 'border-box'
              }}
              value={formData.promoCode}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={validatePromo}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3B82F6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Apply
            </button>
          </div>
          {promoError && (
            <p style={{
              color: '#EF4444',
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}>
              {promoError}
            </p>
          )}
        </div>

        <div style={{
          backgroundColor: '#F9FAFB',
          padding: '1rem',
          borderRadius: '0.25rem'
        }}>
          <h3 style={{
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Order Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{formData.planType === 'deck' ? 'Deck Plan' : 'Screen Porch Plan'}</span>
              <span>${(basePrice / 100).toFixed(2)}</span>
            </div>
            {promoDiscount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#059669'
              }}>
                <span>Discount</span>
                <span>-${(promoDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: '600',
              borderTop: '1px solid #D1D5DB',
              paddingTop: '0.25rem'
            }}>
              <span>Total</span>
              <span>${(totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Payment Information
          </label>
          <PaymentElement />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading || !stripe ? '#D1D5DB' : '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.25rem',
            fontWeight: '600',
            cursor: loading || !stripe ? 'not-allowed' : 'pointer',
            opacity: loading || !stripe ? 0.5 : 1
          }}
        >
          {loading ? 'Processing...' : `Pay $${(totalAmount / 100).toFixed(2)} & Submit Order`}
        </button>
      </form>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Elements stripe={stripePromise}>
      <OrderForm />
    </Elements>
  )
}