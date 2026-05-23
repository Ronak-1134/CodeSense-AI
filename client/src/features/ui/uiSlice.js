import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {{
 *   sidebarCollapsed: boolean,
 *   activeModal: string | null,
 *   modalProps: Record<string, unknown>,
 *   theme: 'dark',
 * }} UiState
 */

/** @type {UiState} */
const initialState = {
  sidebarCollapsed: false,
  activeModal: null,
  modalProps: {},
  theme: 'dark', // Only dark theme is supported — kept here for future extensibility
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Toggle the sidebar between collapsed and expanded.
     */
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    /**
     * Explicitly set sidebar collapsed state.
     * @param {import('@reduxjs/toolkit').PayloadAction<boolean>} action
     */
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },

    /**
     * Open a named modal, optionally passing props to it.
     * @param {import('@reduxjs/toolkit').PayloadAction<{ id: string, props?: Record<string, unknown> }>} action
     */
    openModal(state, action) {
      state.activeModal = action.payload.id;
      state.modalProps = action.payload.props ?? {};
    },

    /**
     * Close the currently active modal and clear its props.
     */
    closeModal(state) {
      state.activeModal = null;
      state.modalProps = {};
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
} = uiSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
/** @param {import('@app/store').RootState} state */
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;

/** @param {import('@app/store').RootState} state */
export const selectActiveModal = (state) => state.ui.activeModal;

/** @param {import('@app/store').RootState} state */
export const selectModalProps = (state) => state.ui.modalProps;

/** @param {import('@app/store').RootState} state */
export const selectTheme = (state) => state.ui.theme;

export default uiSlice.reducer;