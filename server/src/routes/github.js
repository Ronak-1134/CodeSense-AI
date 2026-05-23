import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';
import {
  getRepos,
  getPRs,
  reviewPR,
  storeGithubToken,
} from '../controllers/githubController.js';

const router = Router();

// All GitHub routes require authentication
router.use(protect);

/**
 * GET /api/github/repos
 * List the authenticated user's GitHub repositories.
 */
router.get('/repos', getRepos);

/**
 * GET /api/github/repos/:owner/:repo/pulls
 * List open pull requests for a specific repository.
 */
router.get('/repos/:owner/:repo/pulls', getPRs);

/**
 * POST /api/github/repos/:owner/:repo/pulls/:number/review
 * Run an AI review on a PR diff.
 * Body: { focusAreas?, depth?, postToGithub? }
 */
router.post('/repos/:owner/:repo/pulls/:number/review', reviewLimiter, reviewPR);

/**
 * POST /api/github/token
 * Encrypt and store the user's GitHub OAuth access token.
 * Body: { token }
 */
router.post('/token', storeGithubToken);

export default router;