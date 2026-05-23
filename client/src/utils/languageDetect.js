/**
 * Client-side language detection via regex heuristics.
 *
 * Used in the editor to auto-select the language dropdown when the user
 * pastes code before manually choosing a language.
 *
 * Mirrors the server-side detectLanguage() in reviewController.js but
 * lives here for instant client-side feedback with no round-trip.
 */

// ── Detection rules (order matters — more specific first) ─────────────────────
const RULES = [
  // TypeScript — must precede JS (type annotations, interfaces, generics)
  {
    id: 'typescript',
    tests: [
      /:\s*(string|number|boolean|any|void|never|unknown|null)\b/,
      /\binterface\s+\w+\s*(\{|extends)/,
      /\btype\s+\w+\s*=/,
      /\benum\s+\w+\s*\{/,
      /<\w+(\[\]|,\s*\w+)*>/,
      /as\s+\w+/,
      /\bReadonly<|Partial<|Required<|Record</,
    ],
    minMatches: 2,
  },

  // JavaScript
  {
    id: 'javascript',
    tests: [
      /\b(import|export)\s+(default\s+)?(function|class|const|let|var|\{)/,
      /\brequire\s*\(\s*['"]/,
      /\bconsole\.(log|warn|error|info)\s*\(/,
      /=>\s*[\{\(]/,
      /\bPromise\s*\.|async\s+function|\bawait\s+/,
      /\bdocument\.|window\.|localStorage\./,
      /\.jsx?\b/,
    ],
    minMatches: 1,
  },

  // Python
  {
    id: 'python',
    tests: [
      /^def\s+\w+\s*\(/m,
      /^class\s+\w+(\s*\(|:)/m,
      /^import\s+\w+/m,
      /^from\s+\w[\w.]*\s+import\b/m,
      /\bprint\s*\(/,
      /\bself\s*[,)]/,
      /"""[\s\S]*?"""/,
      /^\s*@\w+\s*$/m,
    ],
    minMatches: 1,
  },

  // Go
  {
    id: 'go',
    tests: [
      /^package\s+\w+/m,
      /\bfmt\.\w+\s*\(/,
      /^func\s+\w+/m,
      /:=\s*/,
      /\bgoroutine\b/,
      /^import\s+\(/m,
      /\bchan\s+\w+/,
    ],
    minMatches: 1,
  },

  // Rust
  {
    id: 'rust',
    tests: [
      /\bfn\s+\w+\s*\(/,
      /\blet\s+mut\b/,
      /\bimpl\s+\w+/,
      /\bprintln!\s*\(/,
      /\buse\s+\w+::/,
      /->\s*\w+\s*\{/,
      /\b(Vec|HashMap|Option|Result)<\w+>/,
    ],
    minMatches: 2,
  },

  // Java
  {
    id: 'java',
    tests: [
      /\bpublic\s+(static\s+)?(void|class|interface|enum)\b/,
      /\bSystem\.out\.print(ln)?\s*\(/,
      /\bpublic\s+class\s+\w+/,
      /\bnew\s+\w+\s*\(/,
      /\b(String|Integer|Boolean|List|Map|ArrayList)\b/,
      /@Override\b/,
    ],
    minMatches: 2,
  },

  // C#
  {
    id: 'csharp',
    tests: [
      /\busing\s+(System|Microsoft)\b/,
      /\bConsole\.(Write|WriteLine)\s*\(/,
      /\bnamespace\s+\w+/,
      /\bvar\s+\w+\s*=/,
      /\b(IEnumerable|IList|Dictionary|List)<\w+>/,
      /\b(public|private|protected)\s+(override|virtual|static|readonly)\b/,
    ],
    minMatches: 2,
  },

  // C / C++
  {
    id: 'cpp',
    tests: [
      /#include\s*<(iostream|vector|string|map|algorithm)>/,
      /\bstd::\w+/,
      /\bcout\s*<</,
      /\btemplate\s*<\w+>/,
      /\bclass\s+\w+\s*(\{|:)/,
    ],
    minMatches: 1,
  },
  {
    id: 'c',
    tests: [
      /#include\s*<(stdio|stdlib|string|math|time)\.h>/,
      /\bprintf\s*\(/,
      /\bmalloc\s*\(|free\s*\(/,
      /\bint\s+main\s*\(\s*(void|int)/,
      /\b(struct|typedef)\s+\w+/,
    ],
    minMatches: 1,
  },

  // PHP
  {
    id: 'php',
    tests: [
      /^<\?php/m,
      /\$\w+\s*=/,
      /\becho\s+/,
      /\barray\s*\(/,
      /->\w+\s*\(/,
    ],
    minMatches: 2,
  },

  // Ruby
  {
    id: 'ruby',
    tests: [
      /^def\s+\w+/m,
      /\bend\s*$/m,
      /\bputs\s+/,
      /\b\.each\s+do\s*\|/,
      /\battr_(reader|writer|accessor)\s+/,
      /^require\s+['"]/m,
    ],
    minMatches: 2,
  },

  // Swift
  {
    id: 'swift',
    tests: [
      /\bfunc\s+\w+\s*\(/,
      /\bvar\s+\w+\s*:\s*\w+/,
      /\blet\s+\w+\s*:\s*\w+/,
      /\bprint\s*\(/,
      /\bguard\s+let\b/,
      /\boptional\b|if\s+let\b|\?\./,
    ],
    minMatches: 2,
  },

  // Kotlin
  {
    id: 'kotlin',
    tests: [
      /\bfun\s+\w+\s*\(/,
      /\bprintln\s*\(/,
      /\bval\s+\w+\s*(=|:)/,
      /\bdata\s+class\b/,
      /\bwhen\s*\(/,
      /\bnullable\b|\?\s*:/,
    ],
    minMatches: 2,
  },

  // SQL
  {
    id: 'sql',
    tests: [
      /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/i,
      /\b(FROM|WHERE|JOIN|ON|GROUP\s+BY|ORDER\s+BY|HAVING)\b/i,
      /\bTABLE\b/i,
    ],
    minMatches: 2,
  },

  // Bash / Shell
  {
    id: 'bash',
    tests: [
      /^#!\s*\/bin\/(bash|sh|zsh)/m,
      /\becho\s+/,
      /\$\{?\w+\}?/,
      /\bif\s+\[/,
      /\bfi\s*$/m,
      /\bfor\s+\w+\s+in\b/,
    ],
    minMatches: 2,
  },
];

/**
 * Detect the programming language of a code snippet.
 *
 * Returns the language ID string (matching the LANGUAGES array in CodeEditor.jsx)
 * or 'unknown' if detection confidence is insufficient.
 *
 * @param {string} code
 * @returns {string} language id
 */
export function detectLanguage(code) {
  if (!code || typeof code !== 'string' || code.trim().length < 20) {
    return 'unknown';
  }

  let bestMatch = { id: 'unknown', score: 0 };

  for (const rule of RULES) {
    const matches = rule.tests.filter((re) => re.test(code)).length;
    if (matches >= (rule.minMatches ?? 1) && matches > bestMatch.score) {
      bestMatch = { id: rule.id, score: matches };
    }
  }

  return bestMatch.id;
}

/**
 * Detect language and return confidence level.
 * @param {string} code
 * @returns {{ language: string, confidence: 'high'|'medium'|'low' }}
 */
export function detectLanguageWithConfidence(code) {
  if (!code || code.trim().length < 20) {
    return { language: 'unknown', confidence: 'low' };
  }

  let bestMatch = { id: 'unknown', score: 0, totalTests: 1 };

  for (const rule of RULES) {
    const matches = rule.tests.filter((re) => re.test(code)).length;
    if (matches >= (rule.minMatches ?? 1) && matches > bestMatch.score) {
      bestMatch = { id: rule.id, score: matches, totalTests: rule.tests.length };
    }
  }

  const ratio = bestMatch.score / bestMatch.totalTests;
  const confidence = ratio >= 0.5 ? 'high' : ratio >= 0.25 ? 'medium' : 'low';

  return { language: bestMatch.id, confidence };
}

export default detectLanguage;