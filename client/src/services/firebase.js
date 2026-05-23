import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

// ── Firebase Config from environment ──────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in HMR / SSR environments
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Providers ─────────────────────────────────────────────────────────────────

// Google — request email + profile (default) + github scope as additional
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Optionally request GitHub identity linkage scope via Google's OIDC
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// GitHub — request repo access + user read
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true',
});

// ── Auth Methods ──────────────────────────────────────────────────────────────

/**
 * Open Google sign-in popup.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential;
  } catch (error) {
    // Rethrow with normalized shape so callers handle uniformly
    throw normalizeFirebaseError(error);
  }
}

/**
 * Open GitHub sign-in popup, requesting repo + read:user scopes.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithGithub() {
  try {
    const credential = await signInWithPopup(auth, githubProvider);
    // Attach the GitHub OAuth access token to the credential object
    // so callers can forward it to the backend for GitHub API calls
    const githubCredential = GithubAuthProvider.credentialFromResult(credential);
    credential.githubAccessToken = githubCredential?.accessToken ?? null;
    return credential;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

/**
 * Sign out the current user from Firebase.
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

/**
 * Subscribe to Firebase auth state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe} unsubscribe function
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user's Firebase ID token (JWT).
 * Forces refresh if the token is near expiry.
 * @param {boolean} forceRefresh
 * @returns {Promise<string | null>}
 */
export async function getCurrentUserToken(forceRefresh = false) {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    return await currentUser.getIdToken(forceRefresh);
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Map Firebase auth error codes to human-readable messages.
 * @param {import('firebase/auth').AuthError} error
 */
function normalizeFirebaseError(error) {
  const codeMap = {
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by the browser. Please allow popups and retry.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/unauthorized-domain':
      'This domain is not authorized for OAuth. Add it in the Firebase console.',
  };

  const message = codeMap[error.code] ?? error.message ?? 'Authentication failed.';

  const normalized = new Error(message);
  normalized.code = error.code;
  normalized.original = error;
  return normalized;
}

export { auth };
export default app;