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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Order Drafting Service</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            name="businessName"
            className="w-full p-2 border rounded"
            value={formData.businessName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Name</label>
          <input
            type="text"
            name="jobName"
            required
            className="w-full p-2 border rounded"
            value={formData.jobName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Site Address</label>
          <input
            type="text"
            name="jobSiteAddress"
            required
            className="w-full p-2 border rounded"
            value={formData.jobSiteAddress}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Plan Type</label>
          <select
            name="planType"
            className="w-full p-2 border rounded"
            value={formData.planType}
            onChange={handleInputChange}
          >
            <option value="deck">Deck - $97</option>
            <option value="screen_porch">Screen Porch - $147</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            rows={4}
            className="w-full p-2 border rounded"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Files (Images/PDFs)</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          {fileUrls.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {fileUrls.length} file(s) uploaded
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Promo Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="promoCode"
              className="flex-1 p-2 border rounded"
              value={formData.promoCode}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={validatePromo}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Apply
            </button>
          </div>
          {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>{formData.planType === 'deck' ? 'Deck Plan' : 'Screen Porch Plan'}</span>
              <span>${(basePrice / 100).toFixed(2)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${(promoDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total</span>
              <span>${(totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Information</label>
          <PaymentElement />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full py-3 bg-green-600 text-white rounded font-semibold disabled:opacity-50"
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