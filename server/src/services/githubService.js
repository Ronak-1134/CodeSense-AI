import { Octokit } from '@octokit/rest';

// ── Language map from file extension ─────────────────────────────────────────
const EXT_LANGUAGE_MAP = {
  js: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python',
  go: 'go',
  rs: 'rust',
  java: 'java',
  cs: 'csharp',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
  c: 'c', h: 'c',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin', kts: 'kotlin',
  sh: 'bash', bash: 'bash',
  sql: 'sql',
  html: 'html', htm: 'html',
  css: 'css', scss: 'scss', sass: 'sass',
  json: 'json',
  yaml: 'yaml', yml: 'yaml',
  md: 'markdown',
};

/**
 * Create an authenticated Octokit instance for a given token.
 * @param {string} token
 */
function makeOctokit(token) {
  return new Octokit({ auth: token });
}

/**
 * Get language from a filename by extension.
 * @param {string} filename
 * @returns {string}
 */
function languageFromFilename(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_LANGUAGE_MAP[ext] ?? 'unknown';
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's repositories, sorted by last update.
 * @param {string} token - GitHub OAuth access token
 * @returns {Promise<Array<{
 *   name: string, owner: string, fullName: string,
 *   language: string|null, stars: number,
 *   isPrivate: boolean, updatedAt: string
 * }>>}
 */
export async function getUserRepos(token) {
  const octokit = makeOctokit(token);

  // Fetch up to 100 repos across the first page; then sort and trim client-side
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    direction: 'desc',
    per_page: 100,
    type: 'all',
  });

  return data
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 30)
    .map((repo) => ({
      name: repo.name,
      owner: repo.owner.login,
      fullName: repo.full_name,
      language: repo.language ?? null,
      stars: repo.stargazers_count ?? 0,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
    }));
}

/**
 * Fetch open pull requests for a repository.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<Array<{
 *   number: number, title: string, author: string,
 *   branch: string, createdAt: string, changedFiles: number
 * }>>}
 */
export async function getOpenPRs(token, owner, repo) {
  const octokit = makeOctokit(token);

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 30,
    sort: 'updated',
    direction: 'desc',
  });

  // Fetch changed_files count in parallel (not included in list response)
  const prsWithFiles = await Promise.all(
    data.map(async (pr) => {
      let changedFiles = pr.changed_files ?? null;
      if (changedFiles === null) {
        try {
          const detail = await octokit.pulls.get({ owner, repo, pull_number: pr.number });
          changedFiles = detail.data.changed_files ?? 0;
        } catch {
          changedFiles = 0;
        }
      }
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user?.login ?? 'unknown',
        branch: pr.head.ref,
        createdAt: pr.created_at,
        changedFiles,
      };
    }),
  );

  return prsWithFiles;
}

/**
 * Fetch the raw unified diff for a pull request.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {number} prNumber
 * @returns {Promise<string>} raw diff text
 */
export async function getPRDiff(token, owner, repo, prNumber) {
  const octokit = makeOctokit(token);

  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: { format: 'diff' },
    headers: {
      Accept: 'application/vnd.github.v3.diff',
    },
  });

  // Octokit returns the diff as a string when the diff media type is requested
  return typeof data === 'string' ? data : String(data);
}

/**
 * Parse a unified diff string into structured file-level objects.
 * Extracts only added/modified lines suitable for AI review.
 *
 * @param {string} diffText
 * @returns {Array<{
 *   filename: string,
 *   language: string,
 *   additions: number,
 *   deletions: number,
 *   chunks: Array<{ header: string, lines: string[] }>,
 *   fullContent: string
 * }>}
 */
export function parseDiff(diffText) {
  if (!diffText || typeof diffText !== 'string') return [];

  const files = [];
  // Split on the "diff --git" boundary
  const fileSections = diffText.split(/^diff --git /m).filter(Boolean);

  for (const section of fileSections) {
    const lines = section.split('\n');

    // Extract filename from "a/... b/..." header
    const fileHeaderMatch = lines[0]?.match(/^a\/(.+?) b\/(.+)$/);
    const filename = fileHeaderMatch ? fileHeaderMatch[2] : (lines[0] ?? 'unknown');

    // Skip binary files and deleted files
    if (section.includes('Binary files') || section.includes('deleted file mode')) {
      continue;
    }

    let additions = 0;
    let deletions = 0;
    const chunks = [];
    let currentChunk = null;
    const addedLines = []; // Only added/context lines for review

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Start of a new hunk: @@ -old +new @@ context
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = { header: line, lines: [] };
        continue;
      }

      if (!currentChunk) continue;

      if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++;
        currentChunk.lines.push(line);
        addedLines.push(line.slice(1)); // Strip the '+' prefix
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;
        // Don't include deleted lines in review content
      } else if (!line.startsWith('\\') && !line.startsWith('---') && !line.startsWith('+++')) {
        // Context lines (unchanged) — include for coherence
        currentChunk.lines.push(line);
        addedLines.push(line.slice(1) || line);
      }
    }

    if (currentChunk) chunks.push(currentChunk);
    if (chunks.length === 0) continue;

    files.push({
      filename,
      language: languageFromFilename(filename),
      additions,
      deletions,
      chunks,
      fullContent: addedLines.join('\n'),
    });
  }

  return files;
}

/**
 * Post inline review comments to a GitHub pull request.
 * Creates a single PR review with all comments attached.
 *
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {number} prNumber
 * @param {Array<{ path: string, line: number, body: string }>} comments
 * @returns {Promise<void>}
 */
export async function postPRComments(token, owner, repo, prNumber, comments) {
  const octokit = makeOctokit(token);

  if (!comments || comments.length === 0) return;

  // Get the latest commit SHA for the PR (required by the review endpoint)
  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  const commitId = pr.head.sha;

  const reviewComments = comments
    .filter((c) => c.path && c.body)
    .map((c) => ({
      path: c.path,
      line: typeof c.line === 'number' ? c.line : 1,
      side: 'RIGHT', // Comment on the new version of the file
      body: c.body,
    }));

  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: commitId,
    event: 'COMMENT',
    comments: reviewComments,
    body: `🤖 **AI Code Review** — ${reviewComments.length} inline comment${reviewComments.length !== 1 ? 's' : ''} generated by AI Code Reviewer.`,
  });
}

export default {
  getUserRepos,
  getOpenPRs,
  getPRDiff,
  parseDiff,
  postPRComments,
};