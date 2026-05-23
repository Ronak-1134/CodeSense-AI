// ── Auth Selectors ────────────────────────────────────────────────────────────
// All selectors take RootState and return a slice of auth state.
// Memoization via createSelector is deferred to callsites that need derived
// computation; these are kept as simple field reads for zero-overhead access.

/**
 * @param {import('@app/store').RootState} state
 * @returns {import('./authSlice').AuthUser | null}
 */
export const selectUser = (state) => state.auth.user;

/**
 * @param {import('@app/store').RootState} state
 * @returns {string | null}
 */
export const selectToken = (state) => state.auth.token;

/**
 * True when a user object and token are both present.
 * @param {import('@app/store').RootState} state
 * @returns {boolean}
 */
export const selectIsAuthenticated = (state) =>
  state.auth.user !== null && state.auth.token !== null;

/**
 * @param {import('@app/store').RootState} state
 * @returns {boolean}
 */
export const selectAuthLoading = (state) => state.auth.loading;

/**
 * @param {import('@app/store').RootState} state
 * @returns {string | null}
 */
export const selectAuthError = (state) => state.auth.error;

/**
 * Whether the Firebase onAuthStateChanged listener has fired at least once.
 * Use this to gate rendering of protected routes.
 * @param {import('@app/store').RootState} state
 * @returns {boolean}
 */
export const selectAuthInitialized = (state) => state.auth.initialized;

/**
 * @param {import('@app/store').RootState} state
 * @returns {'free' | 'pro'}
 */
export const selectUserPlan = (state) => state.auth.user?.plan ?? 'free';

/**
 * @param {import('@app/store').RootState} state
 * @returns {boolean}
 */
export const selectGithubConnected = (state) =>
  state.auth.user?.githubConnected ?? false;

/**
 * Convenience — returns just the user's display name or a fallback.
 * @param {import('@app/store').RootState} state
 * @returns {string}
 */
export const selectDisplayName = (state) =>
  state.auth.user?.displayName || state.auth.user?.email || 'User';

/**
 * @param {import('@app/store').RootState} state
 * @returns {string | null}
 */
export const selectPhotoURL = (state) => state.auth.user?.photoURL ?? null;