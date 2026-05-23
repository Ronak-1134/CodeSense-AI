import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {{
 *   currentCode: string,
 *   currentLanguage: string,
 *   selectedFocusAreas: string[],
 *   reviewDepth: 'quick' | 'standard' | 'deep',
 *   activeReview: object | null,
 *   analyzeStatus: 'idle' | 'loading' | 'success' | 'error',
 *   analyzeError: string | null,
 *   issueFilter: 'all' | 'critical' | 'warning' | 'suggestion' | 'info',
 *   issueSort: 'severity' | 'line' | 'category',
 * }} ReviewState
 */

/** @type {ReviewState} */
const initialState = {
  currentCode: '',
  currentLanguage: 'javascript',
  selectedFocusAreas: ['bug', 'security'],
  reviewDepth: 'standard',
  activeReview: null,
  analyzeStatus: 'idle',
  analyzeError: null,
  issueFilter: 'all',
  issueSort: 'severity',
};

// Severity ordering used by the 'severity' sort — lower index = higher priority
const SEVERITY_ORDER = { critical: 0, warning: 1, suggestion: 2, info: 3 };

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    /**
     * Update the code in the editor.
     * @param {import('@reduxjs/toolkit').PayloadAction<string>} action
     */
    setCode(state, action) {
      state.currentCode = action.payload;
    },

    /**
     * Set the selected language.
     * @param {import('@reduxjs/toolkit').PayloadAction<string>} action
     */
    setLanguage(state, action) {
      state.currentLanguage = action.payload;
    },

    /**
     * Toggle a focus area on/off.
     * Adds the area if absent; removes it if already present.
     * Always keeps at least one area selected.
     * @param {import('@reduxjs/toolkit').PayloadAction<string>} action
     */
    toggleFocusArea(state, action) {
      const area = action.payload;
      const index = state.selectedFocusAreas.indexOf(area);
      if (index === -1) {
        state.selectedFocusAreas.push(area);
      } else {
        // Prevent deselecting the last remaining area
        if (state.selectedFocusAreas.length > 1) {
          state.selectedFocusAreas.splice(index, 1);
        }
      }
    },

    /**
     * Set the review depth.
     * @param {import('@reduxjs/toolkit').PayloadAction<'quick'|'standard'|'deep'>} action
     */
    setReviewDepth(state, action) {
      state.reviewDepth = action.payload;
    },

    /**
     * Set the review currently being viewed in ReviewDetail.
     * @param {import('@reduxjs/toolkit').PayloadAction<object>} action
     */
    setActiveReview(state, action) {
      state.activeReview = action.payload;
      // Reset UI filters when switching reviews
      state.issueFilter = 'all';
      state.issueSort = 'severity';
    },

    /**
     * Clear the active review and reset filter/sort state.
     */
    clearActiveReview(state) {
      state.activeReview = null;
      state.issueFilter = 'all';
      state.issueSort = 'severity';
    },

    /**
     * Set the issue severity filter.
     * @param {import('@reduxjs/toolkit').PayloadAction<'all'|'critical'|'warning'|'suggestion'|'info'>} action
     */
    setIssueFilter(state, action) {
      state.issueFilter = action.payload;
    },

    /**
     * Set the issue sort strategy.
     * @param {import('@reduxjs/toolkit').PayloadAction<'severity'|'line'|'category'>} action
     */
    setIssueSort(state, action) {
      state.issueSort = action.payload;
    },

    /**
     * Manually set the analyze status (used by components outside RTK Query flow).
     * @param {import('@reduxjs/toolkit').PayloadAction<'idle'|'loading'|'success'|'error'>} action
     */
    setAnalyzeStatus(state, action) {
      state.analyzeStatus = action.payload;
      if (action.payload !== 'error') {
        state.analyzeError = null;
      }
    },

    /**
     * Reset the editor and all review state back to defaults.
     */
    resetReviewForm(state) {
      state.currentCode = '';
      state.currentLanguage = 'javascript';
      state.selectedFocusAreas = ['bug', 'security'];
      state.reviewDepth = 'standard';
      state.analyzeStatus = 'idle';
      state.analyzeError = null;
    },
  },
});

export const {
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
} = reviewSlice.actions;

export { SEVERITY_ORDER };
export default reviewSlice.reducer;