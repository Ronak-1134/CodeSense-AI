import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@components/auth/ProtectedRoute.jsx';

// ── Lazy page imports (code splitting per route) ───────────────────────────────
const Landing      = lazy(() => import('@pages/Landing.jsx'));
const Login        = lazy(() => import('@pages/Login.jsx'));
const Dashboard    = lazy(() => import('@pages/Dashboard.jsx'));
const NewReview    = lazy(() => import('@pages/NewReview.jsx'));
const ReviewDetail = lazy(() => import('@pages/ReviewDetail.jsx'));
const History      = lazy(() => import('@pages/History.jsx'));
const Settings     = lazy(() => import('@pages/Settings.jsx'));
const GitHub       = lazy(() => import('@pages/GitHub.jsx'));

// ── Route-level suspense fallback ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2.5px solid rgba(233,30,140,0.2)',
          borderTopColor: '#E91E8C',
          animation: 'spin 0.7s linear infinite',
          display: 'block',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      {/* ── Toast notifications ─────────────────────────────────────────── */}
      <Toaster
        position="bottom-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #2A2A2A',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '10px 14px',
            maxWidth: '380px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#0A0A0A' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#0A0A0A' },
          },
          loading: {
            iconTheme: { primary: '#E91E8C', secondary: 'rgba(233,30,140,0.2)' },
          },
        }}
      />

      {/* ── Routes ──────────────────────────────────────────────────────── */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"      element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review/new"
            element={
              <ProtectedRoute>
                <NewReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review/:id"
            element={
              <ProtectedRoute>
                <ReviewDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path='/github'
            element={
              <ProtectedRoute>
                <GitHub />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}