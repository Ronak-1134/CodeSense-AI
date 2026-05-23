import User from '../models/User.js';
import Review from '../models/Review.js';
import { reviewCode } from '../services/claudeService.js';
import { createError } from '../middleware/errorHandler.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_MAX_LINES = 600;
const PRO_MAX_LINES = 2000;
const VALID_FOCUS_AREAS = ['bug', 'security', 'performance', 'style'];
const VALID_DEPTHS = ['quick', 'standard', 'deep'];

// ── Language auto-detection ───────────────────────────────────────────────────

/**
 * Simple regex heuristics to detect programming language from code content.
 * Returns a lowercase language string or 'unknown'.
 * @param {string} code
 * @param {string} [hint] - optional filename extension or user-provided language
 * @returns {string}
 */
function detectLanguage(code, hint = '') {
  if (hint && typeof hint === 'string' && hint.trim()) {
    return hint.trim().toLowerCase();
  }

  const c = code;

  // TypeScript — must check before JS (has TS-specific syntax)
  if (/:\s*(string|number|boolean|any|void|never|unknown)\b/.test(c) ||
      /interface\s+\w+\s*\{/.test(c) ||
      /type\s+\w+\s*=/.test(c) ||
      /<\w+>/.test(c)) {
    return 'typescript';
  }

  // JavaScript
  if (/\b(import|export)\s+(default\s+)?(function|class|const|let|var|\{)/.test(c) ||
      /\brequire\s*\(/.test(c) ||
      /\bconsole\.log\b/.test(c) ||
      /=>\s*\{/.test(c)) {
    return 'javascript';
  }

  // Python
  if (/^def\s+\w+\s*\(/m.test(c) ||
      /^import\s+\w+/m.test(c) ||
      /^from\s+\w+\s+import\b/m.test(c) ||
      /\bprint\s*\(/.test(c) ||
      /:\s*$/m.test(c)) {
    return 'python';
  }

  // Go
  if (/^package\s+\w+/m.test(c) ||
      /\bfmt\.\w+\(/.test(c) ||
      /^func\s+\w+/m.test(c) ||
      /:=/.test(c)) {
    return 'go';
  }

  // Rust
  if (/\bfn\s+\w+/.test(c) ||
      /\blet\s+mut\b/.test(c) ||
      /\bimpl\s+\w+/.test(c) ||
      /println!\(/.test(c)) {
    return 'rust';
  }

  // Java
  if (/\bpublic\s+(static\s+)?void\s+main\b/.test(c) ||
      /\bSystem\.out\.print/.test(c) ||
      /\bpublic\s+class\s+\w+/.test(c)) {
    return 'java';
  }

  // C#
  if (/\busing\s+System\b/.test(c) ||
      /\bConsole\.Write/.test(c) ||
      /\bnamespace\s+\w+/.test(c)) {
    return 'csharp';
  }

  // C / C++
  if (/#include\s*</.test(c) ||
      /\bprintf\s*\(/.test(c) ||
      /\bint\s+main\s*\(/.test(c)) {
    return /\bstd::\w+/.test(c) ? 'cpp' : 'c';
  }

  // PHP
  if (/^<\?php/m.test(c) || /\$\w+\s*=/.test(c)) {
    return 'php';
  }

  // Ruby
  if (/\bdef\s+\w+\b/.test(c) && /\bend\b/.test(c) ||
      /\bputs\s+/.test(c) ||
      /\.each\s+do\s*\|/.test(c)) {
    return 'ruby';
  }

  // Swift
  if (/\bfunc\s+\w+/.test(c) && /\bvar\s+\w+\s*:/.test(c) ||
      /\bprint\(/.test(c) && /\blet\s+\w+\s*=/.test(c)) {
    return 'swift';
  }

  // Kotlin
  if (/\bfun\s+\w+/.test(c) ||
      /\bprintln\(/.test(c) && /\bval\s+\w+/.test(c)) {
    return 'kotlin';
  }

  // SQL
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(c) &&
      /\b(FROM|WHERE|TABLE)\b/i.test(c)) {
    return 'sql';
  }

  // Shell / Bash
  if (/^#!/.test(c) || /\becho\s+/.test(c) || /\$\{/.test(c)) {
    return 'bash';
  }

  return 'unknown';
}

// ── Title generation ──────────────────────────────────────────────────────────

/**
 * Auto-generate a review title from the first meaningful line of code.
 * @param {string} code
 * @returns {string}
 */
function generateTitle(code) {
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip blank lines, pure comment lines, and shebangs
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') ||
        trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed === '#!/') {
      continue;
    }
    return trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '');
  }
  return 'Code Review';
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/review/analyze
 * Run an AI code review and persist the result.
 */
export async function analyzeCode(req, res, next) {
  try {
    const {
      code,
      language: rawLanguage,
      focusAreas: rawFocusAreas,
      depth: rawDepth,
      title: rawTitle,
    } = req.body ?? {};

    // ── Validate code ──────────────────────────────────────────────────────
    if (!code || typeof code !== 'string' || !code.trim()) {
      return next(createError(400, 'Request body must include a non-empty "code" field.'));
    }

    const lineCount = code.split('\n').length;

    // ── Fetch user from DB (auto-create if sync was never called) ────────
    let user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      // User logged in but /auth/sync never completed — create them now
      user = await User.create({
        uid: req.user.uid,
        email: req.user.email || '',
        displayName: req.user.name || '',
        photoURL: req.user.picture || null,
      });
    }

    // ── Plan-based line limit ──────────────────────────────────────────────
    const maxLines = user.plan === 'pro' ? PRO_MAX_LINES : FREE_MAX_LINES;
    if (lineCount > maxLines) {
      return next(
        createError(
          400,
          `Code exceeds the ${maxLines}-line limit for your ${user.plan} plan. ` +
            (user.plan === 'free'
              ? 'Upgrade to Pro for up to 2,000 lines.'
              : 'Please split your code into smaller chunks.'),
          'LINE_LIMIT_EXCEEDED',
        ),
      );
    }

    // ── Monthly review limit ───────────────────────────────────────────────
    if (!user.canReview()) {
      return next(
        createError(
          429,
          `You have reached your monthly review limit (15 reviews on the free plan). ` +
            'Your limit resets on ' +
            user.monthResetDate.toDateString() +
            '. Upgrade to Pro for unlimited reviews.',
          'MONTHLY_LIMIT_EXCEEDED',
        ),
      );
    }

    // ── Sanitize optional fields ───────────────────────────────────────────
    const language = detectLanguage(code, rawLanguage);

    const focusAreas = Array.isArray(rawFocusAreas)
      ? rawFocusAreas.filter((a) => VALID_FOCUS_AREAS.includes(a))
      : ['bug', 'security', 'performance', 'style'];

    const depth = VALID_DEPTHS.includes(rawDepth) ? rawDepth : 'standard';

    const title =
      rawTitle && typeof rawTitle === 'string' && rawTitle.trim()
        ? rawTitle.trim().slice(0, 120)
        : generateTitle(code);

    // ── Call Claude ────────────────────────────────────────────────────────
    const result = await reviewCode({ code, language, focusAreas, depth });

    // ── Persist review ─────────────────────────────────────────────────────
    const review = await Review.create({
      userId: user._id,
      title,
      language,
      originalCode: code,
      result,
      status: 'completed',
    });

    // ── Increment monthly counter ──────────────────────────────────────────
    await user.incrementReviewCount();

    return res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    // Surface Claude API errors with a friendly message
    if (error.message?.includes('malformed JSON')) {
      return next(createError(502, 'AI service returned an unexpected response. Please try again.', 'AI_PARSE_ERROR'));
    }
    next(error);
  }
}

/**
 * GET /api/review/history
 * Return paginated review history for the authenticated user.
 */
export async function getHistory(req, res, next) {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return next(createError(404, 'User account not found.'));

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // ── Build filter ───────────────────────────────────────────────────────
    const filter = { userId: user._id };

    if (req.query.language && typeof req.query.language === 'string') {
      filter.language = req.query.language.toLowerCase();
    }

    if (req.query.grade && typeof req.query.grade === 'string') {
      filter['result.grade'] = req.query.grade.toUpperCase();
    }

    // ── Query ──────────────────────────────────────────────────────────────
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-originalCode'), // Exclude raw code from list for performance
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/review/:id
 * Return a single review by ID — must be owned by the authenticated user.
 */
export async function getReview(req, res, next) {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return next(createError(404, 'User account not found.'));

    const review = await Review.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!review) {
      return next(createError(404, 'Review not found or you do not have permission to view it.'));
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    // Mongoose CastError (invalid ObjectId format) → handled by errorHandler as 404
    next(error);
  }
}

/**
 * DELETE /api/review/:id
 * Hard-delete a review owned by the authenticated user.
 */
export async function deleteReview(req, res, next) {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return next(createError(404, 'User account not found.'));

    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: user._id,
    });

    if (!review) {
      return next(createError(404, 'Review not found or you do not have permission to delete it.'));
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted.',
    });
  } catch (error) {
    next(error);
  }
}