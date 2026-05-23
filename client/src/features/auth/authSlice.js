import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithGoogle,
  signInWithGithub,
  signOut,
  onAuthStateChange,
  getCurrentUserToken,
} from '@services/firebase';
import api from '@services/api';

// ── State shape ───────────────────────────────────────────────────────────────
/**
 * @typedef {{
 *   uid: string,
 *   email: string,
 *   displayName: string,
 *   photoURL: string | null,
 *   plan: 'free' | 'pro',
 *   githubConnected: boolean,
 * }} AuthUser
 *
 * @typedef {{
 *   user: AuthUser | null,
 *   token: string | null,
 *   loading: boolean,
 *   error: string | null,
 *   initialized: boolean,
 * }} AuthState
 */

/** @type {AuthState} */
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract a plain serializable user object from a Firebase UserCredential.
 * @param {import('firebase/auth').UserCredential} credential
 * @returns {AuthUser}
 */
function serializeUser(firebaseUser) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    photoURL: firebaseUser.photoURL ?? null,
    plan: 'free',
    githubConnected: false,
  };
}

/**
 * Shared post-login flow: get token → sync with backend → merge server user.
 * @param {import('firebase/auth').UserCredential} credential
 * @param {object} [extra] - extra fields to send to /api/auth/sync (e.g. githubAccessToken)
 */
async function syncWithBackend(credential, extra = {}) {
  const token = await credential.user.getIdToken();

  // Temporarily attach token to axios default so the interceptor picks it up
  // for this first request (store isn't populated yet)
  const { data } = await api.post(
    '/auth/sync',
    {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName,
      photoURL: credential.user.photoURL,
      ...extra,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return { token, serverUser: data.user };
}

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const credential = await signInWithGoogle();
      const { token, serverUser } = await syncWithBackend(credential);

      return {
        user: {
          ...serializeUser(credential.user),
          // Merge plan / githubConnected from DB
          ...(serverUser ?? {}),
        },
        token,
      };
    } catch (error) {
      return rejectWithValue(error.message ?? 'Google sign-in failed.');
    }
  },
);

export const loginWithGithub = createAsyncThunk(
  'auth/loginWithGithub',
  async (_, { rejectWithValue }) => {
    try {
      const credential = await signInWithGithub();
      const { token, serverUser } = await syncWithBackend(credential, {
        githubAccessToken: credential.githubAccessToken,
      });

      return {
        user: {
          ...serializeUser(credential.user),
          githubConnected: true,
          ...(serverUser ?? {}),
        },
        token,
      };
    } catch (error) {
      return rejectWithValue(error.message ?? 'GitHub sign-in failed.');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
    } catch (error) {
      return rejectWithValue(error.message ?? 'Sign-out failed.');
    }
  },
);

// Store Firebase unsubscribe outside Redux — functions are not serializable
let _authUnsubscribe = null;

export function cleanupAuthListener() {
  if (_authUnsubscribe) {
    _authUnsubscribe();
    _authUnsubscribe = null;
  }
}

/**
 * Sets up the Firebase onAuthStateChanged listener.
 * Does NOT return the unsubscribe fn as payload (not Redux-serializable).
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    cleanupAuthListener();
    return new Promise((resolve) => {
      _authUnsubscribe = onAuthStateChange(async (firebaseUser) => {
        if (firebaseUser) {
          const token = await getCurrentUserToken();
          dispatch(setToken(token));
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName ?? '',
              photoURL: firebaseUser.photoURL ?? null,
              plan: 'free',
              githubConnected: false,
            }),
          );
        } else {
          dispatch(setUser(null));
          dispatch(setToken(null));
        }
        dispatch(setInitialized(true));
        resolve(); // resolve with nothing — no function in payload
      });
    });
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setInitialized(state, action) {
      state.initialized = action.payload;
    },
    updatePlan(state, action) {
      if (state.user) {
        state.user.plan = action.payload;
      }
    },
    setGithubConnected(state, action) {
      if (state.user) {
        state.user.githubConnected = action.payload;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── loginWithGoogle ──────────────────────────────────────────────────────
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Google sign-in failed.';
      });

    // ── loginWithGithub ──────────────────────────────────────────────────────
    builder
      .addCase(loginWithGithub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGithub.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginWithGithub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'GitHub sign-in failed.';
      });

    // ── logoutUser ───────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Still clear local state even if Firebase signOut fails
        state.user = null;
        state.token = null;
        state.error = action.payload ?? 'Sign-out failed.';
      });

    // ── initializeAuth ───────────────────────────────────────────────────────
    builder
      .addCase(initializeAuth.pending, (state) => {
        // Don't set loading true here — would flash loading state on every refresh
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.initialized = true; // Fail open so the app doesn't hang
      });
  },
});

export const {
  setUser,
  setToken,
  setLoading,
  setError,
  setInitialized,
  updatePlan,
  setGithubConnected,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;