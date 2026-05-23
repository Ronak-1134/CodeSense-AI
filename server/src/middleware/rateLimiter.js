import rateLimit from 'express-rate-limit';

/**
 * Review endpoint limiter for free-plan users.
 * 10 requests per hour per IP.
 *
 * Note: Plan-level enforcement (free: 15/month) is handled in the
 * reviewController via User.canReview(). This IP-based limiter is a
 * secondary defense against abuse.
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Prefer authenticated user UID so multiple devices don't share quota
    return req.user?.uid ?? req.ip;
  },
  message: {
    success: false,
    message:
      'Review limit reached. Free plan allows 10 reviews per hour. Please try again later or upgrade to Pro.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: (req) => {
    // Skip rate limiting for pro users — their limit is enforced
    // at the DB level in canReview()
    return req.user?.plan === 'pro';
  },
});

/**
 * Strict limiter for auth endpoints to prevent brute-force / spam.
 * 20 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests. Please wait 15 minutes and try again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

export default reviewLimiter;