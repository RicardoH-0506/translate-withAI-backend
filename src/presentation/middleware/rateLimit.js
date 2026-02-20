/**
 * Rate Limiting Middleware - Presentation Layer
 * Protects API endpoints from abuse and DDoS attacks
 * Follows clean architecture: middleware in presentation layer
 */
import { rateLimit } from 'express-rate-limit'

/**
 * Translation API rate limiter
 * Limits translation requests to prevent abuse and control costs
 */
export const translationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // 50 translations per 15 minutes per IP
  standardHeaders: 'draft-8', // IETF standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  ipv6Subnet: 56, // Apply /56 subnet mask to IPv6 addresses
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many translation requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  statusCode: 429,
  // Custom key generator to include user agent if available
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown'
  },
  // Skip successful requests from counting
  skipSuccessfulRequests: false,
  // Skip failed requests from counting
  skipFailedRequests: false
})

/**
 * General API rate limiter
 * Less restrictive for non-translation endpoints
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // 200 requests per 15 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  statusCode: 429
})

/**
 * Burst protection for translation endpoint
 * Very short window to prevent rapid-fire requests
 */
export const burstProtection = rateLimit({
  windowMs: 1000, // 1 second
  limit: 5, // 5 requests per second
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'BURST_LIMIT_EXCEEDED',
    message: 'Too many requests in quick succession. Please slow down.',
    retryAfter: '1 second'
  },
  statusCode: 429
})
