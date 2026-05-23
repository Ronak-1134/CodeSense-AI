import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connect to MongoDB with exponential-ish retry logic.
 * Retries up to MAX_RETRIES times with a fixed RETRY_DELAY_MS delay.
 *
 * @param {number} attempt - current attempt number (1-indexed)
 * @returns {Promise<void>}
 */
export async function connectDB(attempt = 1) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // Recommended options for production
      serverSelectionTimeoutMS: 5000,  // Fail fast if no server found
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log('✅ MongoDB connected');

    // Surface connection events after initial connection
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect…');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });
  } catch (error) {
    console.error(
      `❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`,
    );

    if (attempt >= MAX_RETRIES) {
      console.error('❌ Max retries reached. Exiting process.');
      process.exit(1);
    }

    console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s…`);
    await delay(RETRY_DELAY_MS);
    return connectDB(attempt + 1);
  }
}

/** Simple promise-based sleep. */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default connectDB;