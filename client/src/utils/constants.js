// ── Plans ─────────────────────────────────────────────────────────────────────
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

export const PLAN_LIMITS = {
  free: {
    reviewsPerMonth: 15,
    maxLinesPerReview: 600,
  },
  pro: {
    reviewsPerMonth: Infinity,
    maxLinesPerReview: 2000,
  },
};

// ── Review depths ─────────────────────────────────────────────────────────────
export const REVIEW_DEPTHS = [
  {
    id: 'quick',
    label: 'Quick',
    description: 'Critical issues only. ~5s.',
    maxTokens: 800,
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'All issues. ~10s.',
    maxTokens: 1500,
  },
  {
    id: 'deep',
    label: 'Deep',
    description: 'Thorough + suggestions. ~20s.',
    maxTokens: 2500,
  },
];

// ── Focus areas ───────────────────────────────────────────────────────────────
export const FOCUS_AREAS = [
  { id: 'bug',         label: 'Bug Detection',  description: 'Logic errors and runtime bugs'      },
  { id: 'security',    label: 'Security',        description: 'Injection, auth, and exposure risks' },
  { id: 'performance', label: 'Performance',     description: 'Complexity and efficiency issues'    },
  { id: 'style',       label: 'Code Style',      description: 'Readability and conventions'         },
];

// ── Issue severities ──────────────────────────────────────────────────────────
export const SEVERITIES = ['critical', 'warning', 'suggestion', 'info'];

export const SEVERITY_LABELS = {
  critical:   'Critical',
  warning:    'Warning',
  suggestion: 'Suggestion',
  info:       'Info',
};

export const SEVERITY_COLORS = {
  critical:   '#EF4444',
  warning:    '#F59E0B',
  suggestion: '#E91E8C',
  info:       '#3B82F6',
};

export const SEVERITY_ORDER = {
  critical: 0, warning: 1, suggestion: 2, info: 3,
};

// ── Issue categories ──────────────────────────────────────────────────────────
export const CATEGORIES = ['bug', 'security', 'performance', 'style', 'logic'];

// ── Grades ────────────────────────────────────────────────────────────────────
export const GRADES = ['A+', 'A', 'B', 'C', 'D', 'F'];

export const GRADE_THRESHOLDS = {
  'A+': 95, A: 88, B: 75, C: 60, D: 45, F: 0,
};

export const GRADE_COLORS = {
  'A+': '#22C55E', A: '#22C55E', B: '#86EFAC',
  C: '#F59E0B', D: '#F97316', F: '#EF4444',
};

// ── Score bands ───────────────────────────────────────────────────────────────
export const SCORE_COLOR_BANDS = [
  { min: 80,  color: '#22C55E' }, // green
  { min: 60,  color: '#F59E0B' }, // amber
  { min: 40,  color: '#F97316' }, // orange
  { min: 0,   color: '#EF4444' }, // red
];

export function scoreToColor(score) {
  for (const band of SCORE_COLOR_BANDS) {
    if (score >= band.min) return band.color;
  }
  return '#EF4444';
}

// ── Supported languages ───────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'go', 'rust',
  'java', 'csharp', 'cpp', 'c', 'php',
  'ruby', 'swift', 'kotlin', 'sql', 'bash',
];

// ── API paths ─────────────────────────────────────────────────────────────────
export const API_PATHS = {
  auth: {
    sync: '/auth/sync',
  },
  review: {
    analyze: '/review/analyze',
    history: '/review/history',
    byId:    (id) => `/review/${id}`,
  },
  github: {
    repos:     '/github/repos',
    pulls:     (owner, repo) => `/github/repos/${owner}/${repo}/pulls`,
    reviewPR:  (owner, repo, num) => `/github/repos/${owner}/${repo}/pulls/${num}/review`,
    token:     '/github/token',
  },
};

// ── Local storage keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  authToken:  'auth_token',
  theme:      'theme',
};

// ── App meta ──────────────────────────────────────────────────────────────────
export const APP_NAME    = 'CodeSense AI';
export const APP_VERSION = '1.0.0';

// ── Pagination defaults ───────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE     = 50;