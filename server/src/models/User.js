import mongoose from 'mongoose';

const FREE_PLAN_MONTHLY_LIMIT = 15;

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'Firebase UID is required.'],
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    photoURL: {
      type: String,
      default: null,
    },
    // Encrypted GitHub OAuth access token (encrypted at rest in the service layer)
    githubToken: {
      type: String,
      default: null,
      select: false, // Never returned in queries unless explicitly requested
    },
    plan: {
      type: String,
      enum: {
        values: ['free', 'pro'],
        message: 'Plan must be either "free" or "pro".',
      },
      default: 'free',
    },
    reviewsThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Date of the next monthly reset; initialized on first review
    monthResetDate: {
      type: Date,
      default: () => getNextMonthReset(),
    },
  },
  {
    timestamps: true,
    // Prevent adding arbitrary fields
    strict: true,
    // Lean-friendly virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ plan: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
userSchema.virtual('reviewsRemaining').get(function () {
  if (this.plan === 'pro') return Infinity;
  return Math.max(0, FREE_PLAN_MONTHLY_LIMIT - this.reviewsThisMonth);
});

// ── Methods ───────────────────────────────────────────────────────────────────

/**
 * Determine whether this user is allowed to run another review.
 * - Pro: always true
 * - Free: true if reviewsThisMonth < FREE_PLAN_MONTHLY_LIMIT
 *
 * @returns {boolean}
 */
userSchema.methods.canReview = function () {
  if (this.plan === 'pro') return true;
  return this.reviewsThisMonth < FREE_PLAN_MONTHLY_LIMIT;
};

/**
 * Increment the monthly review counter.
 * Should be called inside the same transaction / operation that creates a Review.
 *
 * @returns {Promise<void>}
 */
userSchema.methods.incrementReviewCount = async function () {
  this.reviewsThisMonth += 1;
  await this.save();
};

/**
 * Reset the monthly counter if monthResetDate has passed.
 * Call this during auth sync so the counter stays current.
 *
 * @returns {Promise<boolean>} true if a reset occurred
 */
userSchema.methods.maybeResetMonthlyCount = async function () {
  const now = new Date();
  if (now >= this.monthResetDate) {
    this.reviewsThisMonth = 0;
    this.monthResetDate = getNextMonthReset();
    await this.save();
    return true;
  }
  return false;
};

// ── Statics ───────────────────────────────────────────────────────────────────

/**
 * Find a user by Firebase UID, excluding sensitive fields.
 * @param {string} uid
 */
userSchema.statics.findByUID = function (uid) {
  return this.findOne({ uid });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the first day of next month at midnight UTC. */
function getNextMonthReset() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

const User = mongoose.model('User', userSchema);

export default User;