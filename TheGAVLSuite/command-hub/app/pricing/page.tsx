'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '10 OSINT searches per hour',
      '5 HELLFIRE scans per hour',
      '3 Legal queries per hour',
      '5 CEIO analyses per hour',
      '3 Sophiarch forecasts per hour',
      'Basic support',
    ],
    limitations: [
      'Limited to basic features',
      'No priority support',
      'No advanced analytics',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'For serious investigators',
    features: [
      '1,000 OSINT searches per hour',
      '100 HELLFIRE scans per hour',
      '50 Legal queries per hour',
      '100 CEIO analyses per hour',
      '50 Sophiarch forecasts per hour',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Custom integrations',
    ],
    limitations: [],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 499,
    description: 'For organizations',
    features: [
      'Unlimited OSINT searches',
      'Unlimited HELLFIRE scans',
      'Unlimited Legal queries',
      'Unlimited CEIO analyses',
      'Unlimited Sophiarch forecasts',
      '24/7 dedicated support',
      'Advanced analytics & reporting',
      'Full API access',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantees',
    ],
    limitations: [],
    buttonText: 'Contact Sales',
    buttonVariant: 'primary' as const,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleUpgrade = async (planName: string) => {
    if (!session) {
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(planName)

    try {
      if (planName === 'Professional') {
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
          }),
        })

        const { url } = await response.json()
        window.location.href = url
      } else if (planName === 'Enterprise') {
        // Contact sales
        window.location.href = 'mailto:sales@gavl.com?subject=Enterprise Plan Inquiry'
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your needs
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start free and scale as you grow. All plans include access to our full suite of intelligence tools.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ${
                plan.popular
                  ? 'ring-indigo-600 bg-indigo-50'
                  : 'ring-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mt-8 flex items-center justify-between gap-x-4">
                <h3 className={`text-lg font-semibold leading-8 ${
                  plan.popular ? 'text-indigo-600' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
              </div>
              
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {plan.description}
              </p>
              
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  /month
                </span>
              </p>
              
              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={isLoading === plan.name}
                className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600'
                    : 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-indigo-600'
                } disabled:opacity-50`}
              >
                {isLoading === plan.name ? 'Processing...' : plan.buttonText}
              </button>
              
              <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-indigo-600" />
                    {feature}
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex gap-x-3">
                    <X className="h-6 w-5 flex-none text-gray-400" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
