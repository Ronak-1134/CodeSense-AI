import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthInitialized } from '@features/auth/authSelectors';

// ── Full-screen spinner shown during Firebase auth initialization ──────────────
function AuthLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Pink rotating ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '2.5px solid rgba(233,30,140,0.15)',
            borderTopColor: '#E91E8C',
            animation: 'authSpin 0.75s linear infinite',
            display: 'block',
          }}
          aria-label="Authenticating…"
          role="status"
        />
        <span style={{ fontSize: 12, color: '#444', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Loading…
        </span>
      </div>
      <style>{`@keyframes authSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Wraps protected pages.
 *
 * Behavior:
 * - Firebase not yet resolved (initialized=false) → full-screen spinner
 * - Resolved + not authenticated → redirect to /login
 * - Resolved + authenticated → render children
 */
export default function ProtectedRoute({ children }) {
  const initialized     = useSelector(selectAuthInitialized);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!initialized) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}