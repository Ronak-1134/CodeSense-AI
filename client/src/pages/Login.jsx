import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/useAuth';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

function Spinner() {
  return (
    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" aria-hidden="true" />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGithub, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleGoogle() {
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed.');
    }
  }

  async function handleGithub() {
    try {
      await loginWithGithub();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'GitHub sign-in failed.');
    }
  }

  return (
    <div className="min-h-dvh bg-dark-page flex items-center justify-center p-4">
      {/* Hero radial glow */}
      <div className="hero-glow" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-sm bg-dark-surface border border-dark-border rounded-xl p-8 z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink" aria-hidden="true" />
            <span className="text-xl font-semibold text-white tracking-tight">CodeSense AI</span>
          </div>
          <p className="text-sm text-[#666] text-center leading-snug">
            AI-powered code reviews in seconds.<br />Write better code, faster.
          </p>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogle}
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="flex items-center justify-center gap-3 w-full h-10 px-4 rounded
                       bg-white text-[#111] text-sm font-medium
                       hover:bg-[#f5f5f5] active:bg-[#ebebeb]
                       transition-colors duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface"
          >
            {loading ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          <button
            onClick={handleGithub}
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="flex items-center justify-center gap-3 w-full h-10 px-4 rounded
                       bg-[#161b22] text-white text-sm font-medium border border-[#30363d]
                       hover:bg-[#21262d] active:bg-[#161b22]
                       transition-colors duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface"
          >
            {loading ? <Spinner /> : <GitHubIcon />}
            Continue with GitHub
          </button>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-[11px] text-[#444] leading-relaxed">
          By signing in you agree to our{' '}
          <a href="#" className="text-[#666] underline underline-offset-2 hover:text-white transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#666] underline underline-offset-2 hover:text-white transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}