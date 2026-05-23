import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB } from './src/config/db.js';
import { initializeFirebaseAdmin } from './src/config/firebaseAdmin.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.js';
import reviewRoutes from './src/routes/review.js';
import githubRoutes from './src/routes/github.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect services
await connectDB();
initializeFirebaseAdmin();

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Health checks
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/ping', (_req, res) => {
  res.json({ pong: true });
});

// Debug — log every incoming request
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/github', githubRoutes);

console.log('✅ All routes mounted');

// 404
app.use((req, res) => {
  console.log(`404 → ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server on http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/ping\n`);
});

export default app;