import { SCORE_COLOR_BANDS, GRADE_THRESHOLDS } from './constants.js';

// ── Date / time ───────────────────────────────────────────────────────────────

/**
 * Format a date as "Jan 15, 2025".
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Format a date as "Jan 15" (no year).
 * @param {string|Date} date
 * @returns {string}
 */
export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

/**
 * Human-readable relative time: "3 minutes ago", "2 days ago", etc.
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;

  return formatShortDate(date);
}

/**
 * Format a full datetime: "Jan 15, 2025 at 3:42 PM".
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// ── Score / grade ─────────────────────────────────────────────────────────────

/**
 * Convert a numeric score (0–100) to a letter grade.
 * @param {number} score
 * @returns {string}
 */
export function scoreToGrade(score) {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS).sort((a, b) => b[1] - a[1])) {
    if (score >= threshold) return grade;
  }
  return 'F';
}

/**
 * Get the display color for a score.
 * @param {number} score
 * @returns {string} hex color
 */
export function scoreColor(score) {
  for (const band of SCORE_COLOR_BANDS) {
    if (score >= band.min) return band.color;
  }
  return '#EF4444';
}

/**
 * Format a score as a percentage string: "82%".
 * @param {number} score
 * @returns {string}
 */
export function formatScore(score) {
  return `${Math.round(score)}`;
}

// ── Numbers ───────────────────────────────────────────────────────────────────

/**
 * Format large numbers with commas: 1200 → "1,200".
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return n?.toLocaleString('en-US') ?? '0';
}

/**
 * Format a byte count in human-readable form.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── Text ──────────────────────────────────────────────────────────────────────

/**
 * Truncate a string to maxLen characters with an ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 50) {
  if (!str) return '';
  return str.length <= maxLen ? str : `${str.slice(0, maxLen)}…`;
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a severity or category string to a display label.
 * @param {string} str
 * @returns {string}
 */
export function formatLabel(str) {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Pluralize a word based on count.
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 * @returns {string}
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

// ── Language ──────────────────────────────────────────────────────────────────

/**
 * Map a language ID to its display name.
 * @param {string} lang
 * @returns {string}
 */
export function formatLanguage(lang) {
  const MAP = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python:     'Python',
    go:         'Go',
    rust:       'Rust',
    java:       'Java',
    csharp:     'C#',
    cpp:        'C++',
    c:          'C',
    php:        'PHP',
    ruby:       'Ruby',
    swift:      'Swift',
    kotlin:     'Kotlin',
    sql:        'SQL',
    bash:       'Bash',
    unknown:    'Unknown',
  };
  return MAP[lang?.toLowerCase()] ?? capitalize(lang ?? '');
}

// ── Fix time ──────────────────────────────────────────────────────────────────

/**
 * Derive a human-readable fix-time estimate from an issue list.
 * @param {Array<{ severity: string }>} issues
 * @returns {string}
 */
export function estimateFixTime(issues = []) {
  const critical   = issues.filter((i) => i.severity === 'critical').length;
  const warnings   = issues.filter((i) => i.severity === 'warning').length;
  const suggestions = issues.filter((i) => i.severity === 'suggestion').length;

  const minutes = critical * 20 + warnings * 10 + suggestions * 5;
  if (minutes === 0) return '< 5 minutes';
  if (minutes < 60)  return `~${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return `~${hours} ${pluralize(hours, 'hour')}`;
}