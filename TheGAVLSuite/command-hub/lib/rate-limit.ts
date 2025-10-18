import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { PRICING_PLANS } from './stripe'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  osint: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },
  hellfire: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  },
  legal: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  ceio: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  },
  sophiarch: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
}

// Simple in-memory store for rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(
  req: NextRequest,
  module: string
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user
  const plan = PRICING_PLANS[user.subscription as keyof typeof PRICING_PLANS] || PRICING_PLANS.free
  
  const config = rateLimitConfigs[module]
  if (!config) {
    return null // No rate limiting for this module
  }

  const key = `${user.id}:${module}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean up expired entries
  for (const [k, v] of requestCounts.entries()) {
    if (v.resetTime < now) {
      requestCounts.delete(k)
    }
  }

  const current = requestCounts.get(key)
  
  if (!current || current.resetTime < now) {
    // New window
    requestCounts.set(key, { count: 1, resetTime: now + config.windowMs })
    return null
  }

  // Check limits based on subscription
  const maxRequests = plan.limits[module as keyof typeof plan.limits] as number
  const effectiveLimit = maxRequests === -1 ? Infinity : Math.min(maxRequests, config.maxRequests)

  if (current.count >= effectiveLimit) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        limit: effectiveLimit,
        resetTime: current.resetTime,
        upgrade: user.subscription === 'free' ? true : false
      },
      { status: 429 }
    )
  }

  current.count++
  return null
}

export function getUsageStats(userId: string, module: string) {
  const key = `${userId}:${module}`
  const current = requestCounts.get(key)
  
  if (!current || current.resetTime < Date.now()) {
    return { count: 0, limit: 0, resetTime: Date.now() + rateLimitConfigs[module]?.windowMs || 0 }
  }

  return {
    count: current.count,
    limit: rateLimitConfigs[module]?.maxRequests || 0,
    resetTime: current.resetTime
  }
}
