import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { syncUser } from '../controllers/authController.js';

const router = Router();

// Apply auth-specific rate limiting to all routes in this file
router.use(authLimiter);

/**
 * POST /api/auth/sync
 * Sync Firebase-authenticated user with MongoDB.
 * Requires a valid Firebase ID token in the Authorization header.
 */
router.post('/sync', protect, syncUser);

export default router;