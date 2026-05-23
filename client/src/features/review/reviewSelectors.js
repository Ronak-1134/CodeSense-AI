import { createSelector } from '@reduxjs/toolkit';
import { SEVERITY_ORDER } from './reviewSlice';

// ── Primitive selectors ───────────────────────────────────────────────────────

/** @param {import('@app/store').RootState} state */
export const selectCurrentCode = (state) => state.review.currentCode;

/** @param {import('@app/store').RootState} state */
export const selectCurrentLanguage = (state) => state.review.currentLanguage;

/** @param {import('@app/store').RootState} state */
export const selectFocusAreas = (state) => state.review.selectedFocusAreas;

/** @param {import('@app/store').RootState} state */
export const selectReviewDepth = (state) => state.review.reviewDepth;

/** @param {import('@app/store').RootState} state */
export const selectActiveReview = (state) => state.review.activeReview;

/** @param {import('@app/store').RootState} state */
export const selectAnalyzeStatus = (state) => state.review.analyzeStatus;

/** @param {import('@app/store').RootState} state */
export const selectAnalyzeError = (state) => state.review.analyzeError;

/** @param {import('@app/store').RootState} state */
export const selectIssueFilter = (state) => state.review.issueFilter;

/** @param {import('@app/store').RootState} state */
export const selectIssueSort = (state) => state.review.issueSort;

// ── Raw issues (un-filtered) ──────────────────────────────────────────────────

const selectRawIssues = (state) =>
  state.review.activeReview?.result?.issues ?? [];

// ── Derived: filtered + sorted issues ────────────────────────────────────────

/**
 * Returns the issues from the active review filtered by `issueFilter`
 * and sorted by `issueSort`. Memoized — only recomputes when inputs change.
 *
 * @type {import('@reduxjs/toolkit').OutputSelector<
 *   import('@app/store').RootState,
 *   object[],
 *   (issues: object[], filter: string, sort: string) => object[]
 * >}
 */
export const selectFilteredIssues = createSelector(
  [selectRawIssues, selectIssueFilter, selectIssueSort],
  (issues, filter, sort) => {
    // ── Filter ───────────────────────────────────────────────────────────────
    const filtered =
      filter === 'all'
        ? [...issues]
        : issues.filter((issue) => issue.severity === filter);

    // ── Sort ─────────────────────────────────────────────────────────────────
    return filtered.sort((a, b) => {
      switch (sort) {
        case 'severity': {
          const aDiff = SEVERITY_ORDER[a.severity] ?? 99;
          const bDiff = SEVERITY_ORDER[b.severity] ?? 99;
          if (aDiff !== bDiff) return aDiff - bDiff;
          // Secondary: line number ascending
          return (a.lineNumber ?? Infinity) - (b.lineNumber ?? Infinity);
        }

        case 'line': {
          // Null line numbers sort to the end
          const aLine = a.lineNumber ?? Infinity;
          const bLine = b.lineNumber ?? Infinity;
          if (aLine !== bLine) return aLine - bLine;
          // Secondary: severity
          return (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
        }

        case 'category': {
          const catCmp = (a.category ?? '').localeCompare(b.category ?? '');
          if (catCmp !== 0) return catCmp;
          // Secondary: severity
          return (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
        }

        default:
          return 0;
      }
    });
  },
);

// ── Derived: issue counts by severity ────────────────────────────────────────

/**
 * Returns a count breakdown of issues by severity for the active review.
 * Used by the filter tabs and score display.
 *
 * @returns {{ critical: number, warning: number, suggestion: number, info: number, total: number }}
 */
export const selectIssueCounts = createSelector([selectRawIssues], (issues) => {
  const counts = { critical: 0, warning: 0, suggestion: 0, info: 0, total: issues.length };
  for (const issue of issues) {
    if (issue.severity in counts) {
      counts[issue.severity]++;
    }
  }
  return counts;
});

// ── Derived: review score + grade ─────────────────────────────────────────────

/** @returns {{ score: number|null, grade: string|null }} */
export const selectReviewScore = createSelector([selectActiveReview], (review) => ({
  score: review?.result?.score ?? null,
  grade: review?.result?.grade ?? null,
}));

// ── Derived: analyze loading state ────────────────────────────────────────────

/** True while an analysis is in flight. */
export const selectIsAnalyzing = (state) => state.review.analyzeStatus === 'loading';

/** True when the last analysis completed successfully. */
export const selectAnalyzeSuccess = (state) => state.review.analyzeStatus === 'success';