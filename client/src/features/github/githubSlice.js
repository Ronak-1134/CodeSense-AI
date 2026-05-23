import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '@services/api';

// ── State shape ───────────────────────────────────────────────────────────────
/**
 * @typedef {{
 *   repos: Array<{
 *     name: string, owner: string, fullName: string,
 *     language: string|null, stars: number,
 *     isPrivate: boolean, updatedAt: string
 *   }>,
 *   prs: Array<{
 *     number: number, title: string, author: string,
 *     branch: string, createdAt: string, changedFiles: number
 *   }>,
 *   selectedRepo: { owner: string, name: string } | null,
 *   loading: boolean,
 *   error: string | null,
 *   prReviewResult: object | null,
 * }} GithubState
 */

/** @type {GithubState} */
const initialState = {
  repos: [],
  prs: [],
  selectedRepo: null,
  loading: false,
  error: null,
  prReviewResult: null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's GitHub repos from the backend.
 */
export const fetchRepos = createAsyncThunk(
  'github/fetchRepos',
  async (_, { rejectWithValue }) => {
    try {
      const data = await get('/github/repos');
      return data.repos;
    } catch (error) {
      return rejectWithValue(error.message ?? 'Failed to fetch repositories.');
    }
  },
);

/**
 * Fetch open PRs for a specific repo.
 * @param {{ owner: string, repo: string }} args
 */
export const fetchPRs = createAsyncThunk(
  'github/fetchPRs',
  async ({ owner, repo }, { rejectWithValue }) => {
    try {
      const data = await get(`/github/repos/${owner}/${repo}/pulls`);
      return data.prs;
    } catch (error) {
      return rejectWithValue(error.message ?? 'Failed to fetch pull requests.');
    }
  },
);

/**
 * Submit an AI review for a GitHub PR.
 * @param {{
 *   owner: string,
 *   repo: string,
 *   prNumber: number,
 *   options: { focusAreas?: string[], depth?: string, postToGithub?: boolean }
 * }} args
 */
export const submitPRReview = createAsyncThunk(
  'github/submitPRReview',
  async ({ owner, repo, prNumber, options = {} }, { rejectWithValue }) => {
    try {
      const data = await post(
        `/github/repos/${owner}/${repo}/pulls/${prNumber}/review`,
        options,
      );
      return data.review;
    } catch (error) {
      return rejectWithValue(error.message ?? 'PR review failed.');
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    /**
     * Set the currently selected repo for PR browsing.
     * @param {{ owner: string, name: string }} payload
     */
    setSelectedRepo(state, action) {
      state.selectedRepo = action.payload;
      // Clear stale PR list when repo changes
      state.prs = [];
      state.error = null;
    },

    /**
     * Reset github slice to initial state (e.g. on logout).
     */
    clearGithub() {
      return initialState;
    },

    /**
     * Clear the last PR review result.
     */
    clearPRReviewResult(state) {
      state.prReviewResult = null;
    },

    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchRepos ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchRepos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.loading = false;
        state.repos = action.payload;
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load repositories.';
      });

    // ── fetchPRs ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchPRs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPRs.fulfilled, (state, action) => {
        state.loading = false;
        state.prs = action.payload;
      })
      .addCase(fetchPRs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load pull requests.';
      });

    // ── submitPRReview ───────────────────────────────────────────────────────
    builder
      .addCase(submitPRReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.prReviewResult = null;
      })
      .addCase(submitPRReview.fulfilled, (state, action) => {
        state.loading = false;
        state.prReviewResult = action.payload;
      })
      .addCase(submitPRReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'PR review failed.';
      });
  },
});

export const { setSelectedRepo, clearGithub, clearPRReviewResult, clearError } =
  githubSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
/** @param {import('@app/store').RootState} state */
export const selectRepos = (state) => state.github.repos;

/** @param {import('@app/store').RootState} state */
export const selectPRs = (state) => state.github.prs;

/** @param {import('@app/store').RootState} state */
export const selectSelectedRepo = (state) => state.github.selectedRepo;

/** @param {import('@app/store').RootState} state */
export const selectGithubLoading = (state) => state.github.loading;

/** @param {import('@app/store').RootState} state */
export const selectGithubError = (state) => state.github.error;

/** @param {import('@app/store').RootState} state */
export const selectPRReviewResult = (state) => state.github.prReviewResult;

export default githubSlice.reducer;