import crypto from 'crypto';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { createError } from '../middleware/errorHandler.js';
import {
  getUserRepos,
  getOpenPRs,
  getPRDiff,
  parseDiff,
  postPRComments,
} from '../services/githubService.js';
import { reviewCode } from '../services/claudeService.js';

// ── Encryption helpers (AES-256-GCM) ─────────────────────────────────────────
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCODING = 'hex';

/**
 * Derive a 32-byte key from the env secret using SHA-256.
 */
function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw createError(500, 'ENCRYPTION_KEY is not configured.', 'CONFIG_ERROR');
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns a hex string: iv + authTag + ciphertext
 * @param {string} text
 * @returns {string}
 */
function encrypt(text) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString(ENCODING), authTag.toString(ENCODING), encrypted.toString(ENCODING)].join(':');
}

/**
 * Decrypt a hex string produced by `encrypt`.
 * @param {string} encryptedHex
 * @returns {string}
 */
function decrypt(encryptedHex) {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encryptedDataHex] = encryptedHex.split(':');

  if (!ivHex || !authTagHex || !encryptedDataHex) {
    throw createError(500, 'GitHub token is malformed — re-connect your GitHub account.', 'DECRYPT_ERROR');
  }

  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);
  const encryptedData = Buffer.from(encryptedDataHex, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encryptedData, undefined, 'utf8') + decipher.final('utf8');
}

// ── Shared helper: fetch + decrypt user GitHub token ─────────────────────────

/**
 * Load the user document and return the decrypted GitHub token.
 * Throws 404 if user not found, 401 if GitHub not connected.
 * @param {string} uid - Firebase UID from req.user
 * @returns {Promise<{ user: import('../models/User.js').default, token: string }>}
 */
async function getUserWithToken(uid) {
  const user = await User.findOne({ uid }).select('+githubToken');
  if (!user) throw createError(404, 'User account not found.');
  if (!user.githubToken) {
    throw createError(401, 'GitHub account not connected. Please link your GitHub account first.', 'GITHUB_NOT_CONNECTED');
  }

  let token;
  try {
    token = decrypt(user.githubToken);
  } catch {
    throw createError(500, 'Failed to read GitHub credentials. Please reconnect your GitHub account.', 'DECRYPT_FAIL');
  }

  return { user, token };
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/github/repos
 * Return the authenticated user's GitHub repositories.
 */
export async function getRepos(req, res, next) {
  try {
    const { token } = await getUserWithToken(req.user.uid);
    const repos = await getUserRepos(token);
    return res.status(200).json({ success: true, repos });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/github/repos/:owner/:repo/pulls
 * Return open pull requests for a repository.
 */
export async function getPRs(req, res, next) {
  try {
    const { owner, repo } = req.params;
    const { token } = await getUserWithToken(req.user.uid);
    const prs = await getOpenPRs(token, owner, repo);
    return res.status(200).json({ success: true, prs });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/github/repos/:owner/:repo/pulls/:number/review
 * Run an AI review on a PR diff and optionally post inline comments to GitHub.
 */
export async function reviewPR(req, res, next) {
  try {
    const { owner, repo, number: prNumberStr } = req.params;
    const prNumber = parseInt(prNumberStr, 10);

    if (isNaN(prNumber)) return next(createError(400, 'PR number must be a valid integer.'));

    const {
      focusAreas = ['bug', 'security', 'performance', 'style'],
      depth = 'standard',
      postToGithub = false,
    } = req.body ?? {};

    const { user, token } = await getUserWithToken(req.user.uid);

    // ── Check review quota ───────────────────────────────────────────────────
    if (!user.canReview()) {
      return next(
        createError(
          429,
          `Monthly review limit reached. Resets on ${user.monthResetDate.toDateString()}.`,
          'MONTHLY_LIMIT_EXCEEDED',
        ),
      );
    }

    // ── Fetch and parse the PR diff ──────────────────────────────────────────
    const rawDiff = await getPRDiff(token, owner, repo, prNumber);
    const parsedFiles = parseDiff(rawDiff);

    if (parsedFiles.length === 0) {
      return next(createError(422, 'No reviewable changes found in this pull request.'));
    }

    // ── Review each file (max 5 files, max 300 lines per file) ───────────────
    const MAX_FILES = 5;
    const MAX_LINES_PER_FILE = 300;

    const filesToReview = parsedFiles
      .filter((f) => f.additions > 0) // Only files with new/changed code
      .slice(0, MAX_FILES);

    const fileReviews = await Promise.allSettled(
      filesToReview.map(async (file) => {
        const lines = file.fullContent.split('\n');
        const truncatedCode = lines.slice(0, MAX_LINES_PER_FILE).join('\n');

        const result = await reviewCode({
          code: truncatedCode,
          language: file.language,
          focusAreas,
          depth,
        });

        return { file, result };
      }),
    );

    // ── Merge results across all files ───────────────────────────────────────
    const allIssues = [];
    const allPositives = new Set();
    const allImprovements = new Set();
    let totalScore = 0;
    let scoredFiles = 0;
    const summaries = [];

    for (const settled of fileReviews) {
      if (settled.status === 'rejected') {
        console.warn('[reviewPR] File review failed:', settled.reason?.message);
        continue;
      }

      const { file, result } = settled.value;
      summaries.push(`**${file.filename}**: ${result.summary}`);

      totalScore += result.score;
      scoredFiles++;

      // Tag each issue with its source filename
      for (const issue of result.issues ?? []) {
        allIssues.push({ ...issue, codeSnippet: issue.codeSnippet ?? null, _filename: file.filename });
      }

      for (const p of result.positives ?? []) allPositives.add(p);
      for (const i of result.improvements ?? []) allImprovements.add(i);
    }

    if (scoredFiles === 0) {
      return next(createError(502, 'All file reviews failed. Please try again.', 'ALL_REVIEWS_FAILED'));
    }

    const avgScore = Math.round(totalScore / scoredFiles);
    const grade = scoreToGrade(avgScore);

    const combinedResult = {
      summary: summaries.slice(0, 3).join('\n\n') || 'Review complete.',
      score: avgScore,
      grade,
      issues: allIssues,
      positives: [...allPositives].slice(0, 3),
      improvements: [...allImprovements].slice(0, 3),
      estimatedFixTime: estimateFixTime(allIssues),
    };

    // ── Post inline comments to GitHub if requested ──────────────────────────
    if (postToGithub) {
      const ghComments = allIssues
        .filter((i) => i._filename && (i.lineNumber || i.lineNumber === 0))
        .map((issue) => ({
          path: issue._filename,
          line: issue.lineNumber ?? 1,
          body: formatGHComment(issue),
        }));

      if (ghComments.length > 0) {
        await postPRComments(token, owner, repo, prNumber, ghComments).catch((err) => {
          // Log but don't fail the request if GitHub posting fails
          console.error('[reviewPR] Failed to post GitHub comments:', err.message);
        });
      }
    }

    // ── Save combined review to MongoDB ──────────────────────────────────────
    const review = await Review.create({
      userId: user._id,
      title: `PR #${prNumber} — ${owner}/${repo}`,
      language: filesToReview[0]?.language ?? 'unknown',
      originalCode: filesToReview.map((f) => `// ${f.filename}\n${f.fullContent}`).join('\n\n---\n\n'),
      result: combinedResult,
      githubRepo: `${owner}/${repo}`,
      githubPR: prNumber,
      status: 'completed',
    });

    await user.incrementReviewCount();

    return res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/github/token
 * Encrypt and store the user's GitHub access token.
 */
export async function storeGithubToken(req, res, next) {
  try {
    const { token: rawToken } = req.body ?? {};

    if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
      return next(createError(400, 'Request body must include a non-empty "token" field.'));
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return next(createError(404, 'User account not found.'));

    user.githubToken = encrypt(rawToken.trim());
    await user.save();

    return res.status(200).json({ success: true, message: 'GitHub token stored securely.' });
  } catch (error) {
    next(error);
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function scoreToGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function estimateFixTime(issues) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const suggestions = issues.filter((i) => i.severity === 'suggestion').length;

  const minutes = critical * 20 + warnings * 10 + suggestions * 5;
  if (minutes === 0) return '~5 minutes';
  if (minutes < 60) return `~${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return `~${hours} hour${hours > 1 ? 's' : ''}`;
}

function formatGHComment(issue) {
  const severityEmoji = {
    critical: '🔴',
    warning: '🟡',
    suggestion: '🔵',
    info: '⚪',
  };

  const emoji = severityEmoji[issue.severity] ?? '⚪';
  let body = `${emoji} **[${issue.severity.toUpperCase()}] ${issue.title}**\n\n${issue.description}`;

  if (issue.suggestedFix) {
    body += `\n\n**Suggested fix:**\n\`\`\`\n${issue.suggestedFix}\n\`\`\``;
  }

  body += `\n\n<sub>Generated by AI Code Reviewer • category: ${issue.category}</sub>`;
  return body;
}