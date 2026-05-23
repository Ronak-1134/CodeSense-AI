import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';
import {
  analyzeCode,
  getHistory,
  getReview,
  deleteReview,
} from '../controllers/reviewController.js';

const router = Router();

// All review routes require authentication
router.use(protect);

/**
 * POST /api/review/analyze
 * Submit code for AI review.
 * Also subject to the per-user-per-hour rate limiter.
 */
router.post('/analyze', reviewLimiter, analyzeCode);

/**
 * GET /api/review/history
 * Paginated list of the authenticated user's past reviews.
 * Query params: page, limit, language, grade
 */
router.get('/history', getHistory);

/**
 * GET /api/review/:id
 * Fetch a single review by ID (must be owned by the requesting user).
 */
router.get('/:id', getReview);

/**
 * DELETE /api/review/:id
 * Hard-delete a review (must be owned by the requesting user).
 */
router.delete('/:id', deleteReview);

export default router;