import Stripe from 'stripe'
import { prisma } from './prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      osintSearches: 10,
      hellfireScans: 5,
      legalQueries: 3,
      ceioAnalyses: 5,
      sophiarchForecasts: 3,
    }
  },
  pro: {
    name: 'Professional',
    price: 99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      osintSearches: 1000,
      hellfireScans: 100,
      legalQueries: 50,
      ceioAnalyses: 100,
      sophiarchForecasts: 50,
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: {
      osintSearches: -1, // unlimited
      hellfireScans: -1,
      legalQueries: -1,
      ceioAnalyses: -1,
      sophiarchForecasts: -1,
    }
  }
}

export async function createCheckoutSession(userId: string, priceId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createPortalSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId || undefined,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  })

  return session
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: 'pro',
            stripeCustomerId: session.customer as string,
          }
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      
      if (customer && 'email' in customer) {
        await prisma.user.update({
          where: { email: customer.email! },
          data: {
            subscription: subscription.status === 'active' ? 'pro' : 'free',
          }
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      
      if (customer && 'email' in customer) {
        await prisma.user.update({
          where: { email: customer.email! },
          data: {
            subscription: 'free',
          }
        })
      }
      break
    }
  }
}
