'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    if (paymentIntent) {
      setOrderDetails({ paymentIntent })
    }
  }, [paymentIntent])

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order Successful!</h1>
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '2px solid #1B7FE8',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        margin: '0 0 2rem',
        textAlign: 'left',
      }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#1A2332' }}>
          📧 Check your email for your portal login link
        </p>
        <p style={{ margin: '0 0 0.75rem', fontSize: '1rem', lineHeight: 1.6, color: '#334155' }}>
          It gives you instant access to track your order and download your completed plans.
        </p>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#334155' }}>
          Can&apos;t find it? Visit{' '}
          <a href="/login" style={{ color: '#1B7FE8', fontWeight: 600 }}>readysetplans.com/login</a>
          {' '}to request a new one.
        </p>
      </div>
      <p className="text-lg mb-8">Thank you for your order. We will begin working on your plans within 48 hours.</p>
      {orderDetails && (
        <div className="bg-gray-50 p-6 rounded-lg text-left">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <p><strong>Payment ID:</strong> {orderDetails.paymentIntent}</p>
        </div>
      )}
      <div className="mt-8">
        <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">Return Home</a>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}