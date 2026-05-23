import admin from 'firebase-admin';

let adminApp = null;

/**
 * Initialize Firebase Admin SDK using the service account JSON stored in env.
 * Idempotent — safe to call multiple times.
 */
export function initializeFirebaseAdmin() {
  // Already initialized
  if (admin.apps.length > 0) {
    adminApp = admin.apps[0];
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.error(
      '❌ FIREBASE_SERVICE_ACCOUNT_JSON is not defined in environment variables.',
    );
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    console.error(
      '❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON — ensure it is valid JSON.',
    );
    process.exit(1);
  }

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin initialized');
}

/**
 * Returns the Firebase Admin app instance.
 * @returns {import('firebase-admin').app.App}
 */
export function getAdminApp() {
  if (!adminApp) {
    throw new Error(
      'Firebase Admin is not initialized. Call initializeFirebaseAdmin() first.',
    );
  }
  return adminApp;
}

/**
 * Returns the Firebase Admin Auth instance.
 * @returns {import('firebase-admin').auth.Auth}
 */
export function getAdminAuth() {
  return admin.auth(getAdminApp());
}

export { admin };
export default admin;