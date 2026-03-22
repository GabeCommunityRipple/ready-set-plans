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
      // In a real app, you might fetch order details from your API
      // For now, we'll just show a success message
      setOrderDetails({ paymentIntent })
    }
  }, [paymentIntent])

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order Successful!</h1>
      <p className="text-lg mb-8">
        Thank you for your order. We've received your payment and will begin working on your drafting plans.
      </p>

      {orderDetails && (
        <div className="bg-gray-50 p-6 rounded-lg text-left">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <p><strong>Payment ID:</strong> {orderDetails.paymentIntent}</p>
          <p className="mt-4">
            Check your email for a confirmation and a login link to track your order progress.
          </p>
        </div>
      )}

      <div className="mt-8">
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
        >
          Return Home
        </a>
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
```

Hit **Cmd+S** then run:
```