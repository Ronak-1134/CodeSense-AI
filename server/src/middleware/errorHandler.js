import mongoose from 'mongoose';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Express global error-handling middleware.
 * Must be registered LAST — after all routes.
 *
 * Normalizes Mongoose errors, validation errors, and generic errors
 * into a consistent { success, message, [stack] } response shape.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  // Log full stack in development only
  if (isDev) {
    console.error('❌ Error:', err.stack ?? err);
  } else {
    console.error(`❌ [${req.method} ${req.originalUrl}] ${err.message}`);
  }

  // ── Mongoose Validation Error (400) ──────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.length === 1 ? messages[0] : 'Validation failed.',
      errors: messages,
      ...(isDev && { stack: err.stack }),
    });
  }

  // ── Mongoose CastError — invalid ObjectId (404) ──────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({
      success: false,
      message: `Resource not found — invalid value for field '${err.path}'.`,
      ...(isDev && { stack: err.stack }),
    });
  }

  // ── MongoDB Duplicate Key Error (409) ────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    const value = err.keyValue?.[field];
    return res.status(409).json({
      success: false,
      message: `A record with ${field}${value ? ` '${value}'` : ''} already exists.`,
      code: 'DUPLICATE_KEY',
      ...(isDev && { stack: err.stack }),
    });
  }

  // ── JWT / Auth errors (401) ───────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      ...(isDev && { stack: err.stack }),
    });
  }

  // ── Custom app errors with a statusCode attached ─────────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message ?? 'An error occurred.',
      code: err.code ?? undefined,
      ...(isDev && { stack: err.stack }),
    });
  }

  // ── CORS error ────────────────────────────────────────────────────────────
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // ── Fallback: 500 Internal Server Error ───────────────────────────────────
  const status = err.status ?? err.statusCode ?? 500;
  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? 'Internal server error. Please try again later.'
        : (err.message ?? 'An unexpected error occurred.'),
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * Factory for creating app-level errors with a statusCode.
 * Use this in controllers/services instead of generic `new Error()`.
 *
 * @example throw createError(403, 'Review limit reached.', 'LIMIT_EXCEEDED');
 *
 * @param {number} statusCode
 * @param {string} message
 * @param {string} [code]
 * @returns {Error}
 */
export function createError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

export default errorHandler;