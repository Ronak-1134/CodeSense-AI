import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const issueSchema = new mongoose.Schema(
  {
    lineNumber: {
      type: Number,
      default: null,
    },
    severity: {
      type: String,
      enum: {
        values: ['critical', 'warning', 'suggestion', 'info'],
        message: 'Severity must be critical, warning, suggestion, or info.',
      },
      required: true,
    },
    category: {
      type: String,
      enum: {
        values: ['bug', 'security', 'performance', 'style', 'logic'],
        message: 'Category must be bug, security, performance, style, or logic.',
      },
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    suggestedFix: {
      type: String,
      default: null,
    },
    codeSnippet: {
      type: String,
      default: null,
    },
  },
  { _id: true },
);

const resultSchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      default: '',
    },
    // Numeric quality score 0–100
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // Letter grade derived from score: A+ / A / B / C / D / F
    grade: {
      type: String,
      default: null,
    },
    issues: {
      type: [issueSchema],
      default: [],
    },
    // Things the code does well
    positives: {
      type: [String],
      default: [],
    },
    // High-level improvement suggestions (not tied to a specific line)
    improvements: {
      type: [String],
      default: [],
    },
    // Human-readable estimate: e.g. "~20 minutes"
    estimatedFixTime: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

// ── Main Schema ───────────────────────────────────────────────────────────────

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required.'],
      index: true,
    },
    // Auto-generated from filename or first meaningful line of code
    title: {
      type: String,
      trim: true,
      default: 'Untitled Review',
      maxlength: [120, 'Title must be 120 characters or fewer.'],
    },
    language: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'unknown',
    },
    originalCode: {
      type: String,
      required: [true, 'originalCode is required.'],
      maxlength: [50_000, 'Code must be 50,000 characters or fewer.'],
    },
    result: {
      type: resultSchema,
      default: () => ({}),
    },
    // Optional: linked GitHub repo full name, e.g. "owner/repo"
    githubRepo: {
      type: String,
      default: null,
      trim: true,
    },
    // Optional: linked Pull Request number
    githubPR: {
      type: Number,
      default: null,
    },
    // Review status lifecycle
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
reviewSchema.index({ userId: 1, createdAt: -1 }); // List reviews for a user, newest first
reviewSchema.index({ userId: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Total issue count broken down by severity. */
reviewSchema.virtual('issueSummary').get(function () {
  const issues = this.result?.issues ?? [];
  return {
    total: issues.length,
    critical: issues.filter((i) => i.severity === 'critical').length,
    warning: issues.filter((i) => i.severity === 'warning').length,
    suggestion: issues.filter((i) => i.severity === 'suggestion').length,
    info: issues.filter((i) => i.severity === 'info').length,
  };
});

// ── Statics ───────────────────────────────────────────────────────────────────

/**
 * Retrieve paginated reviews for a user.
 * @param {mongoose.Types.ObjectId} userId
 * @param {{ page?: number, limit?: number }} options
 */
reviewSchema.statics.findByUser = function (userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-originalCode'); // Exclude raw code from list queries for performance
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;