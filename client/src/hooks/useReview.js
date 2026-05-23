import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  selectCurrentCode,
  selectCurrentLanguage,
  selectFocusAreas,
  selectReviewDepth,
  selectActiveReview,
  selectAnalyzeStatus,
  selectAnalyzeError,
  selectFilteredIssues,
  selectIssueCounts,
  selectIssueFilter,
  selectIssueSort,
  selectIsAnalyzing,
} from '@features/review/reviewSelectors';

import {
  setCode,
  setLanguage,
  toggleFocusArea,
  setReviewDepth,
  setActiveReview,
  clearActiveReview,
  setIssueFilter,
  setIssueSort,
  setAnalyzeStatus,
  resetReviewForm,
} from '@features/review/reviewSlice';

import { useAnalyzeCodeMutation } from '@features/review/reviewApiSlice';

/**
 * Custom hook that encapsulates all review feature state and actions.
 *
 * Provides:
 * - Editor state (code, language, focusAreas, depth) + setters
 * - Active review + filtered issues
 * - runReview() → calls analyzeCode, stores result, navigates to /review/:id
 * - Issue filter/sort controls
 */
export function useReview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const code          = useSelector(selectCurrentCode);
  const language      = useSelector(selectCurrentLanguage);
  const focusAreas    = useSelector(selectFocusAreas);
  const depth         = useSelector(selectReviewDepth);
  const activeReview  = useSelector(selectActiveReview);
  const analyzeStatus = useSelector(selectAnalyzeStatus);
  const analyzeError  = useSelector(selectAnalyzeError);
  const isAnalyzing   = useSelector(selectIsAnalyzing);
  const filteredIssues = useSelector(selectFilteredIssues);
  const issueCounts   = useSelector(selectIssueCounts);
  const issueFilter   = useSelector(selectIssueFilter);
  const issueSort     = useSelector(selectIssueSort);

  // ── RTK Query mutation ─────────────────────────────────────────────────────
  const [analyzeCodeMutation] = useAnalyzeCodeMutation();

  // ── Main action: run a review ──────────────────────────────────────────────
  /**
   * Submit code for review, store the result, and navigate to the detail page.
   * @param {{ title?: string }} options
   */
  const runReview = useCallback(
    async ({ title } = {}) => {
      if (!code.trim()) {
        toast.error('Please enter some code to review.');
        return;
      }

      dispatch(setAnalyzeStatus('loading'));

      try {
        const review = await analyzeCodeMutation({
          code,
          language,
          focusAreas,
          depth,
          title,
        }).unwrap();

        dispatch(setActiveReview(review));
        dispatch(setAnalyzeStatus('success'));
        navigate(`/review/${review._id}`);
      } catch (error) {
        dispatch(setAnalyzeStatus('error'));
        const message = error?.message ?? 'Review failed. Please try again.';
        toast.error(message);
      }
    },
    [code, language, focusAreas, depth, analyzeCodeMutation, dispatch, navigate],
  );

  // ── Editor setters ─────────────────────────────────────────────────────────
  const updateCode         = useCallback((v) => dispatch(setCode(v)), [dispatch]);
  const updateLanguage     = useCallback((v) => dispatch(setLanguage(v)), [dispatch]);
  const updateDepth        = useCallback((v) => dispatch(setReviewDepth(v)), [dispatch]);
  const handleToggleFocus  = useCallback((area) => dispatch(toggleFocusArea(area)), [dispatch]);
  const loadReview         = useCallback((review) => dispatch(setActiveReview(review)), [dispatch]);
  const unloadReview       = useCallback(() => dispatch(clearActiveReview()), [dispatch]);
  const resetForm          = useCallback(() => dispatch(resetReviewForm()), [dispatch]);

  // ── Issue controls ─────────────────────────────────────────────────────────
  const updateIssueFilter  = useCallback((f) => dispatch(setIssueFilter(f)), [dispatch]);
  const updateIssueSort    = useCallback((s) => dispatch(setIssueSort(s)), [dispatch]);

  return {
    // State
    code,
    language,
    focusAreas,
    depth,
    activeReview,
    analyzeStatus,
    analyzeError,
    isAnalyzing,
    filteredIssues,
    issueCounts,
    issueFilter,
    issueSort,

    // Actions
    runReview,
    updateCode,
    updateLanguage,
    updateDepth,
    toggleFocusArea: handleToggleFocus,
    loadReview,
    unloadReview,
    resetForm,
    updateIssueFilter,
    updateIssueSort,
  };
}

export default useReview;