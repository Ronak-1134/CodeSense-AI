import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconBug, IconShieldLock, IconBrandGithub, IconCode,
  IconMessageDots, IconHistory, IconCheck, IconX,
} from '@tabler/icons-react';

// ── Fade-up hook (IntersectionObserver) ──────────────────────────────────────
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Stagger children hook ─────────────────────────────────────────────────────
function useStagger(count, threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56,
        backgroundColor: scrolled ? 'rgba(17,17,17,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #1F1F1F' : '1px solid transparent',
        transition: 'background-color 200ms, border-color 200ms, backdrop-filter 200ms',
        display: 'flex', alignItems: 'center', padding: '0 32px',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E91E8C', flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
          CodeSense
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            height: 32, padding: '0 14px', borderRadius: 8,
            border: '1px solid #2A2A2A', background: 'transparent',
            color: '#888', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'color 150ms, border-color 150ms',
          }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#3A3A3A'; }}
          onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#2A2A2A'; }}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/login')}
          style={{
            height: 32, padding: '0 14px', borderRadius: 8,
            border: '1px solid transparent', background: '#E91E8C',
            color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'background 150ms',
          }}
          onMouseEnter={e => e.target.style.background = '#C2185B'}
          onMouseLeave={e => e.target.style.background = '#E91E8C'}
        >
          Get Started
        </button>
      </div>
    </header>
  );
}

// ── Browser Mockup ────────────────────────────────────────────────────────────
function BrowserMockup() {
  return (
    <div style={{
      width: '100%', maxWidth: 760, margin: '0 auto',
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid #2A2A2A',
      background: '#0D0D0D',
      boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #1F1F1F',
      position: 'relative',
    }}>
      {/* Browser chrome */}
      <div style={{
        height: 40, background: '#111', borderBottom: '1px solid #1F1F1F',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', opacity: 0.7 }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', opacity: 0.7 }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', opacity: 0.7 }} />
        <div style={{
          flex: 1, maxWidth: 280, margin: '0 auto', height: 22,
          background: '#161616', borderRadius: 6, border: '1px solid #1F1F1F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>
            app.codesense.ai/review/a1b2
          </span>
        </div>
      </div>

      {/* Mock review UI */}
      <div style={{ display: 'flex', height: 320 }}>
        {/* Left: Code pane */}
        <div style={{
          width: '45%', borderRight: '1px solid #1F1F1F',
          padding: '16px', overflow: 'hidden',
          background: '#0A0A0A',
        }}>
          <div style={{ fontSize: 10, color: '#444', marginBottom: 10, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            user.js
          </div>
          {[
            { n: 1, t: 'async function getUser(id) {', c: '#ccc' },
            { n: 2, t: '  const query = `SELECT *', c: '#ccc' },
            { n: 3, t: '    FROM users WHERE', c: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
            { n: 4, t: '    id = ${id}`;', c: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
            { n: 5, t: '  const result = await db', c: '#ccc' },
            { n: 6, t: '    .query(query);', c: '#ccc' },
            { n: 7, t: '  return result[0]', c: '#F59E0B', bg: 'rgba(245,158,11,0.05)' },
            { n: 8, t: '}', c: '#ccc' },
          ].map((line) => (
            <div key={line.n} style={{
              display: 'flex', gap: 12, padding: '1px 4px',
              background: line.bg || 'transparent', borderRadius: 2,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: '20px',
            }}>
              <span style={{ color: '#333', width: 14, textAlign: 'right', flexShrink: 0 }}>{line.n}</span>
              <span style={{ color: line.c }}>{line.t}</span>
            </div>
          ))}
        </div>

        {/* Right: Review pane */}
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'Inter, sans-serif', marginBottom: 3 }}>Overall Score</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                82 <span style={{ fontSize: 13, color: '#444' }}>/ 100</span>
              </div>
            </div>
            <div style={{
              padding: '3px 10px', borderRadius: 20,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: 12, fontWeight: 600, color: '#F59E0B', fontFamily: 'Inter, sans-serif',
            }}>Grade B</div>
          </div>

          {/* Issues */}
          {[
            {
              sev: 'critical', sevLabel: 'Critical', sevColor: '#EF4444', sevBg: 'rgba(239,68,68,0.08)',
              cat: 'Security', title: 'SQL Injection vulnerability',
              desc: 'User input is directly interpolated into SQL query.',
            },
            {
              sev: 'warning', sevLabel: 'Warning', sevColor: '#F59E0B', sevBg: 'rgba(245,158,11,0.06)',
              cat: 'Bug', title: 'Missing null check on result',
              desc: 'result[0] may be undefined if no user found.',
            },
            {
              sev: 'suggestion', sevLabel: 'Suggestion', sevColor: '#E91E8C', sevBg: 'rgba(233,30,140,0.06)',
              cat: 'Style', title: 'Missing return type annotation',
              desc: 'Add explicit return type for better type safety.',
            },
          ].map((issue) => (
            <div key={issue.title} style={{
              borderRadius: 8, border: `1px solid ${issue.sevColor}22`,
              borderLeft: `2px solid ${issue.sevColor}`,
              background: issue.sevBg, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: issue.sevColor, background: `${issue.sevColor}18`,
                  padding: '2px 6px', borderRadius: 20, fontFamily: 'Inter, sans-serif',
                }}>
                  {issue.sevLabel}
                </span>
                <span style={{ fontSize: 9, color: '#444', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {issue.cat}
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#ddd', fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>{issue.title}</div>
              <div style={{ fontSize: 10, color: '#666', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{issue.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pink glow at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to top, rgba(233,30,140,0.07) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Features grid ─────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: IconBug,           title: 'AI Bug Detection',        desc: 'Catches logic errors, off-by-ones, and edge cases your tests miss.' },
  { Icon: IconShieldLock,    title: 'Security Scanning',       desc: 'Flags injection risks, auth issues, and insecure data handling.' },
  { Icon: IconBrandGithub,   title: 'GitHub PR Integration',   desc: 'Post inline review comments directly to your pull requests.' },
  { Icon: IconCode,          title: '15+ Languages',           desc: 'JavaScript, Python, Go, Rust, Java, C#, and more out of the box.' },
  { Icon: IconMessageDots,   title: 'Inline Suggestions',      desc: 'Every issue comes with a concrete fix, not just a vague warning.' },
  { Icon: IconHistory,       title: 'Review History',          desc: 'Track code quality over time with scores, grades, and trends.' },
];

// ── Demo section ──────────────────────────────────────────────────────────────
const DEMO_CODE = `async function getUser(id) {
  // ⚠️ SQL injection risk + missing null check
  const query = \`SELECT * FROM users WHERE id = \${id}\`;
  const result = await db.query(query);
  return result[0];
}`;

const DEMO_RESULT = {
  score: 42,
  grade: 'D',
  summary: 'This function has a critical SQL injection vulnerability on line 3 and a missing null-check that will throw on missing users.',
  issues: [
    { severity: 'critical', cat: 'Security', title: 'SQL injection on line 3', desc: 'Never interpolate user input into SQL. Use parameterized queries.' },
    { severity: 'warning',  cat: 'Bug',      title: 'Unhandled undefined return', desc: 'result[0] is undefined if no matching user is found.' },
    { severity: 'suggestion', cat: 'Style',  title: 'Missing JSDoc / return type', desc: 'Document the expected id type and return value.' },
  ],
};

function DemoSection() {
  const [code, setCode] = useState(DEMO_CODE);
  const [showResult, setShowResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ref, visible] = useFadeIn(0.1);

  function handleAnalyze() {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setShowResult(true); }, 1100);
  }

  function handleReset() { setCode(''); setShowResult(false); }

  const scoreColor = DEMO_RESULT.score >= 80 ? '#22C55E' : DEMO_RESULT.score >= 60 ? '#F59E0B' : DEMO_RESULT.score >= 40 ? '#F97316' : '#EF4444';
  const SEV_COLOR = { critical: '#EF4444', warning: '#F59E0B', suggestion: '#E91E8C' };

  return (
    <section ref={ref} style={{
      background: '#111', borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F',
      padding: '96px 32px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 300ms, transform 300ms',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#E91E8C', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>
            Live Demo
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
            See it in action
          </h2>
          <p style={{ fontSize: 15, color: '#666', fontFamily: 'Inter, sans-serif' }}>
            The code below has real issues. Hit Analyze.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Left: input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#444', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Code
              </span>
              <button
                onClick={handleReset}
                style={{ fontSize: 11, color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#555'}
              >
                Clear
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); setShowResult(false); }}
              spellCheck={false}
              style={{
                width: '100%', minHeight: 240, padding: 16,
                background: '#0A0A0A', border: '1px solid #1F1F1F', borderRadius: 10,
                color: '#ccc', fontSize: 12, lineHeight: 1.7,
                fontFamily: 'JetBrains Mono, monospace',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 150ms',
              }}
              onFocus={e => e.target.style.borderColor = '#E91E8C'}
              onBlur={e => e.target.style.borderColor = '#1F1F1F'}
            />
            <button
              onClick={handleAnalyze}
              disabled={!code.trim() || analyzing}
              style={{
                height: 40, borderRadius: 8, border: 'none',
                background: analyzing || !code.trim() ? '#5a0d33' : '#E91E8C',
                color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: code.trim() && !analyzing ? 'pointer' : 'not-allowed',
                opacity: !code.trim() ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 150ms',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (!analyzing && code.trim()) e.currentTarget.style.background = '#C2185B'; }}
              onMouseLeave={e => { if (!analyzing && code.trim()) e.currentTarget.style.background = '#E91E8C'; }}
            >
              {analyzing
                ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Analyzing…</>
                : 'Analyze →'}
            </button>
          </div>

          {/* Right: result */}
          <div style={{
            background: '#0A0A0A', border: '1px solid #1F1F1F', borderRadius: 10,
            minHeight: 290, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
            transition: 'opacity 200ms',
            opacity: showResult ? 1 : 0.35,
          }}>
            {showResult ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#555', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Score</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                      {DEMO_RESULT.score} <span style={{ fontSize: 13, color: '#444', fontWeight: 400 }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 20, fontFamily: 'Inter, sans-serif',
                    background: `${scoreColor}18`, border: `1px solid ${scoreColor}33`,
                    fontSize: 13, fontWeight: 600, color: scoreColor,
                  }}>Grade {DEMO_RESULT.grade}</div>
                </div>

                <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                  {DEMO_RESULT.summary}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {DEMO_RESULT.issues.map((iss) => (
                    <div key={iss.title} style={{
                      padding: '8px 10px', borderRadius: 7,
                      border: `1px solid ${SEV_COLOR[iss.severity]}22`,
                      borderLeft: `2px solid ${SEV_COLOR[iss.severity]}`,
                      background: `${SEV_COLOR[iss.severity]}08`,
                    }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SEV_COLOR[iss.severity], fontFamily: 'Inter, sans-serif' }}>{iss.severity}</span>
                        <span style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}>{iss.cat}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#ccc', marginBottom: 2, fontFamily: 'Inter, sans-serif' }}>{iss.title}</div>
                      <div style={{ fontSize: 10, color: '#555', fontFamily: 'Inter, sans-serif' }}>{iss.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16 }}>→</span>
                </div>
                <p style={{ fontSize: 12, color: '#444', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                  {analyzing ? 'Reviewing your code…' : 'Hit Analyze to see results'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [ref, visible] = useFadeIn(0.1);

  const plans = [
    {
      name: 'Free', price: 0, yearlyPrice: 0, period: 'forever', popular: false,
      features: ['15 reviews / month', '10 languages', 'Bug & security checks', 'Review history (30 days)', 'Standard depth only'],
      missing: ['GitHub PR integration', 'Deep review mode', 'Priority processing'],
      cta: 'Start free',
    },
    {
      name: 'Pro', price: 9, yearlyPrice: 7, period: 'per month', popular: true,
      features: ['Unlimited reviews', '15+ languages', 'Bug, security & performance', 'Full review history', 'Quick / Standard / Deep modes', 'GitHub PR integration', 'Inline PR comments', 'Priority processing'],
      missing: [],
      cta: 'Get Pro',
    },
  ];

  return (
    <section ref={ref} style={{
      padding: '96px 32px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 300ms, transform 300ms',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#E91E8C', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>
            Pricing
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>
            Simple, honest pricing
          </h2>
          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 6px', background: '#111', borderRadius: 10, border: '1px solid #1F1F1F' }}>
            {['Monthly', 'Yearly'].map((label) => {
              const active = (label === 'Yearly') === yearly;
              return (
                <button
                  key={label}
                  onClick={() => setYearly(label === 'Yearly')}
                  style={{
                    padding: '5px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: active ? '#1A1A1A' : 'transparent',
                    color: active ? '#fff' : '#666',
                    fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif',
                    transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {label}
                  {label === 'Yearly' && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, background: 'rgba(233,30,140,0.15)', color: '#E91E8C',
                      padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>−20%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.popular ? '#111' : '#0D0D0D',
                border: plan.popular ? '2px solid #E91E8C' : '1px solid #1F1F1F',
                borderRadius: 14, padding: '28px 28px 24px',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#E91E8C', color: '#fff', fontSize: 10, fontWeight: 600,
                  padding: '3px 12px', borderRadius: 20, letterSpacing: '0.06em',
                  textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
                    ${yearly && plan.yearlyPrice > 0 ? plan.yearlyPrice : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 13, color: '#555', fontFamily: 'Inter, sans-serif' }}>/ mo{yearly ? ', billed yearly' : ''}</span>
                  )}
                  {plan.price === 0 && (
                    <span style={{ fontSize: 13, color: '#555', fontFamily: 'Inter, sans-serif' }}>forever</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <IconCheck size={13} strokeWidth={2.5} style={{ color: '#22C55E', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#888', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <IconX size={13} strokeWidth={2} style={{ color: '#333', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#333', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: '100%', height: 38, borderRadius: 8, border: 'none',
                  background: plan.popular ? '#E91E8C' : 'transparent',
                  border: plan.popular ? 'none' : '1px solid #2A2A2A',
                  color: plan.popular ? '#fff' : '#888',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', transition: 'all 150ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = plan.popular ? '#C2185B' : '#1A1A1A';
                  if (!plan.popular) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = plan.popular ? '#E91E8C' : 'transparent';
                  if (!plan.popular) e.currentTarget.style.color = '#888';
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [featRef, featVisible] = useStagger(6, 0.1);

  const AVATARS = [
    { initials: 'JK', bg: '#1D4ED8' },
    { initials: 'AS', bg: '#7C3AED' },
    { initials: 'ML', bg: '#059669' },
    { initials: 'RB', bg: '#D97706' },
    { initials: 'PP', bg: '#DC2626' },
  ];

  const STEPS = [
    { n: '01', title: 'Paste your code', desc: 'Drop any function, file, or snippet into the editor.' },
    { n: '02', title: 'Choose focus areas', desc: 'Select bugs, security, performance, or style — or all four.' },
    { n: '03', title: 'Get AI review', desc: 'Receive a scored, graded review with specific, actionable fixes.' },
  ];

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stagger0 { 0%,20%  { opacity:0; transform:translateY(10px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes stagger1 { 0%,30%  { opacity:0; transform:translateY(10px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes stagger2 { 0%,40%  { opacity:0; transform:translateY(10px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes stagger3 { 0%,50%  { opacity:0; transform:translateY(10px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes stagger4 { 0%,60%  { opacity:0; transform:translateY(10px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes stagger5 { 0%,70%  { opacity:0; transform:translateY(10px); } 100% { opacity:1; transform:translateY(0); } }
      `}</style>

      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', padding: '140px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 320,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(233,30,140,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: '5px 12px', borderRadius: 20, background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.25)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E91E8C' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#E91E8C', letterSpacing: '0.02em' }}>Powered by Claude AI</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 600, color: '#fff',
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
            maxWidth: 620, margin: '0 auto 20px',
          }}>
            Code review that<br />actually helps
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 16, color: '#666', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Catch bugs, security issues, and bad patterns before they reach production.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                height: 40, padding: '0 22px', borderRadius: 8, border: 'none',
                background: '#E91E8C', color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#C2185B'}
              onMouseLeave={e => e.currentTarget.style.background = '#E91E8C'}
            >
              Start for free
            </button>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                height: 40, padding: '0 20px', borderRadius: 8,
                border: '1px solid #2A2A2A', background: 'transparent',
                color: '#888', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3A3A3A'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2A2A2A'; }}
            >
              See how it works
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#3A3A3A' }}>
            Free 15 reviews/month · No credit card required
          </p>
        </motion.div>
      </section>

      {/* ── Browser Mockup ────────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 80px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <BrowserMockup />
        </motion.div>
      </section>

      {/* ── Social proof ──────────────────────────────────────────────────── */}
      <section style={{ padding: '16px 32px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {AVATARS.map((av, i) => (
              <div
                key={i}
                style={{
                  width: 26, height: 26, borderRadius: '50%', background: av.bg,
                  border: '2px solid #0A0A0A', marginLeft: i === 0 ? 0 : -8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
                  flexShrink: 0,
                }}
              >
                {av.initials}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#555' }}>
            Trusted by <span style={{ color: '#888', fontWeight: 500 }}>1,200+ developers</span>
          </span>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 32px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#E91E8C', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Features
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>
            Everything your code review needs
          </h2>
        </div>

        <div
          ref={featRef}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 48px' }}
        >
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                opacity: featVisible ? 1 : 0,
                transform: featVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity 300ms ${i * 60}ms, transform 300ms ${i * 60}ms`,
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: 'rgba(233,30,140,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={17} strokeWidth={1.75} style={{ color: '#E91E8C' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <HowItWorks steps={STEPS} />

      {/* ── Live demo ─────────────────────────────────────────────────────── */}
      <div id="demo">
        <DemoSection />
      </div>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <Pricing />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #1F1F1F', padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E91E8C' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>CodeSense</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {['Privacy', 'Terms', 'GitHub'].map((link) => (
            <a key={link} href="#" style={{ fontSize: 13, color: '#555', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.target.style.color = '#888'}
              onMouseLeave={e => e.target.style.color = '#555'}
            >
              {link}
            </a>
          ))}
        </div>

        <span style={{ fontSize: 12, color: '#3A3A3A' }}>
          © {new Date().getFullYear()} CodeSense. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

function HowItWorks({ steps }) {
  const [ref, visible] = useFadeIn(0.15);
  return (
    <section ref={ref} style={{
      padding: '80px 32px', maxWidth: 960, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 300ms, transform 300ms',
    }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 11, color: '#E91E8C', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          How it works
        </p>
        <h2 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>
          Three steps to better code
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, position: 'relative' }}>
        {/* Connector line */}
        <div style={{
          position: 'absolute', top: 24, left: '16.66%', right: '16.66%', height: 1,
          background: 'linear-gradient(to right, #1F1F1F, #2A2A2A 50%, #1F1F1F)',
          zIndex: 0,
        }} />

        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 28px 0 0', position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#E91E8C', letterSpacing: '0.08em',
              background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)',
              width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, fontFamily: 'JetBrains Mono, monospace',
              background: '#0A0A0A', border: '1px solid #2A2A2A',
              color: '#333',
            }}>{step.n}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{step.title}</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}