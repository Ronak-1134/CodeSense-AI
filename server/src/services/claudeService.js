import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Client ────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-1.5-flash — free tier, fast, capable
const MODEL_NAME = 'gemini-1.5-flash';

// ── Depth config ──────────────────────────────────────────────────────────────
const DEPTH_CONFIG = {
  quick: {
    maxTokens: 800,
    depthNote: 'Focus ONLY on critical bugs and security vulnerabilities. Skip style and minor suggestions.',
  },
  standard: {
    maxTokens: 1500,
    depthNote: 'Cover all issue types. Balance thoroughness with conciseness.',
  },
  deep: {
    maxTokens: 2500,
    depthNote: 'Perform a thorough review. Include detailed suggestions and edge cases.',
  },
};

const VALID_SEVERITIES = ['critical', 'warning', 'suggestion', 'info'];
const VALID_CATEGORIES = ['bug', 'security', 'performance', 'style', 'logic'];

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(code, language, focusAreas, depth) {
  const areas = Array.isArray(focusAreas) && focusAreas.length > 0
    ? focusAreas
    : ['bug', 'security', 'performance', 'style'];

  const { depthNote } = DEPTH_CONFIG[depth] ?? DEPTH_CONFIG.standard;

  const coverageLines = [
    '- Bugs and logic errors (always check)',
    '- Security vulnerabilities (always check)',
    ...(areas.includes('performance') ? ['- Performance issues'] : []),
    ...(areas.includes('style') ? ['- Code style and readability'] : []),
  ].join('\n');

  return `You are a senior software engineer doing a code review. Be precise, constructive, and practical.

Language: ${language || 'unknown'}

Review coverage:
${coverageLines}

Depth: ${depthNote}

Rules:
- Reference exact line numbers when possible
- Always provide a concrete fix, not just a problem description
- Score honestly: most code scores 50-80, reserve 90+ for exceptional code
- Grade: A+(95-100), A(88-94), B(75-87), C(60-74), D(45-59), F(0-44)

Code to review:
\`\`\`
${code}
\`\`\`

You MUST respond with ONLY valid JSON — no markdown fences, no explanation, nothing else before or after.
Use exactly this structure:
{
  "summary": "2-3 sentence overview of the code quality",
  "score": <number 0-100>,
  "grade": "<A+|A|B|C|D|F>",
  "issues": [
    {
      "lineNumber": <number or null>,
      "severity": "<critical|warning|suggestion|info>",
      "category": "<bug|security|performance|style|logic>",
      "title": "<5 words max>",
      "description": "<1-2 sentences>",
      "suggestedFix": "<actual code or clear instruction>",
      "codeSnippet": "<problematic code or null>"
    }
  ],
  "positives": ["<what the code does well, max 3 items>"],
  "improvements": ["<top priority next steps, max 3 items>"],
  "estimatedFixTime": "<e.g. ~15 minutes>"
}`;
}

// ── JSON extraction ───────────────────────────────────────────────────────────
function extractJSON(text) {
  let cleaned = text.trim();
  // Strip markdown fences if Gemini adds them
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  // Find the first { and last } in case there's any preamble
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned);
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateReview(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Response is not a JSON object.');

  const required = ['summary', 'score', 'grade', 'issues', 'positives', 'improvements', 'estimatedFixTime'];
  for (const field of required) {
    if (!(field in obj)) throw new Error(`Missing field: "${field}"`);
  }

  if (typeof obj.score !== 'number' || obj.score < 0 || obj.score > 100) {
    obj.score = Math.max(0, Math.min(100, Number(obj.score) || 50));
  }

  const validGrades = ['A+', 'A', 'B', 'C', 'D', 'F'];
  if (!validGrades.includes(obj.grade)) obj.grade = coerceGrade(obj.score);

  if (!Array.isArray(obj.issues)) obj.issues = [];
  obj.issues = obj.issues.map((issue, i) => {
    if (!VALID_SEVERITIES.includes(issue.severity)) issue.severity = 'info';
    if (!VALID_CATEGORIES.includes(issue.category)) issue.category = 'style';
    issue.lineNumber = typeof issue.lineNumber === 'number' ? issue.lineNumber : null;
    issue.title = String(issue.title || 'Untitled').slice(0, 60);
    issue.description = String(issue.description || '');
    issue.suggestedFix = String(issue.suggestedFix || '');
    issue.codeSnippet = issue.codeSnippet ? String(issue.codeSnippet) : null;
    return issue;
  });

  if (!Array.isArray(obj.positives)) obj.positives = [];
  if (!Array.isArray(obj.improvements)) obj.improvements = [];
  obj.positives = obj.positives.slice(0, 3);
  obj.improvements = obj.improvements.slice(0, 3);
  if (typeof obj.estimatedFixTime !== 'string') obj.estimatedFixTime = '~unknown';

  return obj;
}

function coerceGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Run an AI code review using the Gemini API.
 * Drop-in replacement for the Claude version — same interface.
 *
 * @param {{
 *   code: string,
 *   language?: string,
 *   focusAreas?: string[],
 *   depth?: 'quick' | 'standard' | 'deep'
 * }} options
 * @returns {Promise<object>} validated review object
 */
export async function reviewCode({ code, language = '', focusAreas = [], depth = 'standard' }) {
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new Error('reviewCode requires a non-empty code string.');
  }

  const normalizedDepth = DEPTH_CONFIG[depth] ? depth : 'standard';
  const { maxTokens } = DEPTH_CONFIG[normalizedDepth];
  const prompt = buildPrompt(code, language, focusAreas, normalizedDepth);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.2, // Low temperature = more consistent JSON output
    },
  });

  let lastError = null;

  // Retry once on JSON parse failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text) throw new Error('Gemini returned empty response.');

      const parsed = extractJSON(text);
      const validated = validateReview(parsed);
      return validated;
    } catch (err) {
      lastError = err;
      if (err instanceof SyntaxError || err.message?.includes('JSON') || err.message?.includes('Missing field')) {
        console.warn(`[geminiService] Attempt ${attempt} failed: ${err.message}`);
        if (attempt === 1) continue; // retry
      }
      // Non-JSON error — rethrow immediately
      throw err;
    }
  }

  throw new Error(`Gemini returned invalid JSON after 2 attempts: ${lastError?.message}`);
}

export default { reviewCode };