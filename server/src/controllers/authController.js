import User from '../models/User.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * POST /api/auth/sync
 *
 * Called immediately after a successful Firebase sign-in on the client.
 * Finds or creates a User document in MongoDB, resets the monthly review
 * counter if needed, and returns the user data.
 *
 * req.user is populated by the `protect` middleware:
 *   { uid, email, name, picture }
 *
 * req.body may contain:
 *   { githubAccessToken? }  — forwarded from the GitHub OAuth flow
 */
export async function syncUser(req, res, next) {
  try {
    const { uid, email, name, picture } = req.user;
    const { githubAccessToken } = req.body ?? {};

    if (!uid || !email) {
      return next(createError(400, 'Missing uid or email from token.'));
    }

    // ── Find or create ───────────────────────────────────────────────────────
    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        email,
        displayName: name ?? '',
        photoURL: picture ?? null,
        // githubToken stored encrypted — placeholder; encryption layer added in githubService
        ...(githubAccessToken ? { githubToken: githubAccessToken } : {}),
        githubConnected: Boolean(githubAccessToken),
      });
    } else {
      // Update profile fields that may have changed in Firebase
      user.email = email;
      user.displayName = name ?? user.displayName;
      user.photoURL = picture ?? user.photoURL;

      // Store GitHub token if provided (first-time GitHub link after Google login)
      if (githubAccessToken) {
        user.githubToken = githubAccessToken;
      }

      // Reset monthly review counter if the reset date has passed
      await user.maybeResetMonthlyCount();

      await user.save();
    }

    return res.status(200).json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strip sensitive / internal fields before sending user data to the client.
 * @param {import('../models/User.js').default} user
 */
function serializeUser(user) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    plan: user.plan,
    reviewsThisMonth: user.reviewsThisMonth,
    reviewsRemaining: user.reviewsRemaining,
    monthResetDate: user.monthResetDate,
    githubConnected: Boolean(user.githubToken),
    createdAt: user.createdAt,
  };
}