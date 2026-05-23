import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import {
  selectRepos,
  selectPRs,
  selectSelectedRepo,
  selectGithubLoading,
  selectGithubError,
  selectPRReviewResult,
} from '@features/github/githubSlice';

import {
  fetchRepos,
  fetchPRs,
  submitPRReview,
  setSelectedRepo,
  clearGithub,
  clearPRReviewResult,
} from '@features/github/githubSlice';

import {
  useGetReposQuery,
  useGetPRsQuery,
  useReviewPRMutation,
} from '@features/github/githubApiSlice';

import { post } from '@services/api';
import { selectGithubConnected } from '@features/auth/authSelectors';

/**
 * Custom hook that exposes all GitHub integration state and actions.
 *
 * Provides both:
 * - Thunk-based actions (fetchRepos, fetchPRs, submitPRReview) via Redux
 * - RTK Query hooks (useGetReposQuery, etc.) for components that prefer them
 *
 * The thunk-based approach is used for imperative flows (e.g. "Connect GitHub"
 * button), while RTK Query hooks are exposed for declarative data fetching
 * in components that use them directly.
 */
export function useGithub() {
  const dispatch = useDispatch();
  const githubConnected = useSelector(selectGithubConnected);

  // ── Selectors ──────────────────────────────────────────────────────────────
  const repos          = useSelector(selectRepos);
  const prs            = useSelector(selectPRs);
  const selectedRepo   = useSelector(selectSelectedRepo);
  const loading        = useSelector(selectGithubLoading);
  const error          = useSelector(selectGithubError);
  const prReviewResult = useSelector(selectPRReviewResult);

  // ── RTK Query: repos (declarative) ────────────────────────────────────────
  const {
    data: reposData,
    isLoading: reposLoading,
    isError: reposError,
    refetch: refetchRepos,
  } = useGetReposQuery(undefined, { skip: !githubConnected });

  // ── RTK Query: PRs (declarative, only when a repo is selected) ────────────
  const {
    data: prsData,
    isLoading: prsLoading,
    refetch: refetchPRs,
  } = useGetPRsQuery(
    selectedRepo
      ? { owner: selectedRepo.owner, repo: selectedRepo.name }
      : undefined,
    { skip: !selectedRepo },
  );

  // ── RTK Query: PR review mutation ─────────────────────────────────────────
  const [reviewPRMutation, { isLoading: prReviewLoading }] = useReviewPRMutation();

  // ── Imperative actions ─────────────────────────────────────────────────────

  /** Load repos into Redux state (thunk path). */
  const loadRepos = useCallback(async () => {
    try {
      await dispatch(fetchRepos()).unwrap();
    } catch (err) {
      toast.error(err.message ?? 'Failed to load repositories.');
    }
  }, [dispatch]);

  /** Load PRs for a specific repo (thunk path). */
  const loadPRs = useCallback(
    async (owner, repo) => {
      try {
        await dispatch(fetchPRs({ owner, repo })).unwrap();
      } catch (err) {
        toast.error(err.message ?? 'Failed to load pull requests.');
      }
    },
    [dispatch],
  );

  /** Select a repo, update Redux, and load its PRs. */
  const selectRepo = useCallback(
    (owner, name) => {
      dispatch(setSelectedRepo({ owner, name }));
      dispatch(fetchPRs({ owner, repo: name }));
    },
    [dispatch],
  );

  /**
   * Submit a PR review via RTK Query mutation.
   * @param {{ owner, repo, prNumber, focusAreas, depth, postToGithub }} options
   */
  const runPRReview = useCallback(
    async ({ owner, repo, prNumber, focusAreas, depth, postToGithub = false }) => {
      try {
        const review = await reviewPRMutation({
          owner, repo, prNumber, focusAreas, depth, postToGithub,
        }).unwrap();
        toast.success('PR review completed.');
        return review;
      } catch (err) {
        toast.error(err.message ?? 'PR review failed.');
        throw err;
      }
    },
    [reviewPRMutation],
  );

  /**
   * Store the user's GitHub access token on the backend (encrypted).
   * @param {string} token - raw GitHub OAuth token
   */
  const storeToken = useCallback(async (token) => {
    try {
      await post('/github/token', { token });
      toast.success('GitHub connected successfully.');
    } catch (err) {
      toast.error(err.message ?? 'Failed to save GitHub token.');
      throw err;
    }
  }, []);

  const clearState = useCallback(() => dispatch(clearGithub()), [dispatch]);
  const clearResult = useCallback(() => dispatch(clearPRReviewResult()), [dispatch]);

  return {
    // Redux state
    repos,
    prs,
    selectedRepo,
    loading,
    error,
    prReviewResult,

    // RTK Query data (declarative)
    reposRTK: reposData ?? [],
    prsRTK: prsData ?? [],
    reposLoading,
    reposError,
    prsLoading,
    prReviewLoading,

    // Actions
    loadRepos,
    loadPRs,
    selectRepo,
    runPRReview,
    storeToken,
    refetchRepos,
    refetchPRs,
    clearState,
    clearResult,
  };
}

export default useGithub;