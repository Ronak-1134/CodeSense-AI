import { getAdminAuth } from '../config/firebaseAdmin.js';

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log(`[auth] ${req.method} ${req.path} | header: ${authHeader ? 'present' : 'MISSING'}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[auth] No Bearer token');
    return res.status(401).json({
      success: false,
      message: 'Authorization token missing.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    console.log('[auth] Token is empty/null/undefined');
    return res.status(401).json({
      success: false,
      message: 'Authorization token is empty.',
    });
  }

  try {
    console.log(`[auth] Verifying token (first 20 chars): ${token.substring(0, 20)}...`);

    // Remove checkRevoked (true) — it causes extra network call that can timeout
    const decoded = await getAdminAuth().verifyIdToken(token);

    console.log(`[auth] Token valid for uid: ${decoded.uid}`);

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? '',
      name: decoded.name ?? decoded.email ?? '',
      picture: decoded.picture ?? null,
    };

    next();
  } catch (error) {
    console.log(`[auth] Token verification failed: ${error.code} — ${error.message}`);

    const codeMap = {
      'auth/id-token-expired':  'Session expired. Please sign in again.',
      'auth/id-token-revoked':  'Session revoked. Please sign in again.',
      'auth/invalid-id-token':  'Invalid token.',
      'auth/argument-error':    'Malformed token.',
      'auth/user-disabled':     'Account disabled.',
    };

    return res.status(401).json({
      success: false,
      message: codeMap[error.code] ?? `Auth failed: ${error.message}`,
      code: error.code ?? 'auth/unknown',
    });
  }
}

export default protect;