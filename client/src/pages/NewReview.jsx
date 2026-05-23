import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';

import AppLayout from '@components/layout/AppLayout.jsx';
import Card from '@components/ui/Card.jsx';
import Button from '@components/ui/Button.jsx';

import {
  setCode, setLanguage, toggleFocusArea, setReviewDepth, setAnalyzeStatus,
} from '@features/review/reviewSlice';
import {
  selectCurrentCode, selectCurrentLanguage, selectFocusAreas, selectReviewDepth,
} from '@features/review/reviewSelectors';
import { setActiveReview } from '@features/review/reviewSlice';
import { useAnalyzeCodeMutation } from '@features/review/reviewApiSlice';
import { selectRepos, selectPRs } from '@features/github/githubSlice';

// ── Language config ───────────────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', dot: '#F7DF1E' },
  { id: 'typescript', label: 'TypeScript', dot: '#3178C6' },
  { id: 'python',     label: 'Python',     dot: '#3776AB' },
  { id: 'go',         label: 'Go',         dot: '#00ADD8' },
  { id: 'rust',       label: 'Rust',       dot: '#CE422B' },
  { id: 'java',       label: 'Java',       dot: '#ED8B00' },
  { id: 'csharp',     label: 'C#',         dot: '#239120' },
  { id: 'cpp',        label: 'C++',        dot: '#00599C' },
  { id: 'php',        label: 'PHP',        dot: '#777BB4' },
  { id: 'ruby',       label: 'Ruby',       dot: '#CC342D' },
  { id: 'swift',      label: 'Swift',      dot: '#FA7343' },
  { id: 'kotlin',     label: 'Kotlin',     dot: '#7F52FF' },
  { id: 'sql',        label: 'SQL',        dot: '#336791' },
  { id: 'bash',       label: 'Bash',       dot: '#4EAA25' },
  { id: 'html',       label: 'HTML',       dot: '#E34F26' },
];

const FOCUS_AREAS = [
  { id: 'bug',         label: 'Bug Detection' },
  { id: 'security',    label: 'Security'      },
  { id: 'performance', label: 'Performance'   },
  { id: 'style',       label: 'Code Style'    },
];

const DEPTHS = [
  { id: 'quick',    label: 'Quick',    desc: 'Critical only' },
  { id: 'standard', label: 'Standard', desc: 'Balanced'       },
  { id: 'deep',     label: 'Deep',     desc: 'Thorough'       },
];

// ── Language dropdown ─────────────────────────────────────────────────────────
function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.id === value) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 h-8 px-3 rounded border border-dark-border
                   bg-dark-surface text-sm text-white hover:border-dark-borderHover
                   transition-colors duration-150"
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: current.dot }} />
        <span className="font-medium">{current.label}</span>
        <IconChevronDown size={13} strokeWidth={2} className="text-[#555] ml-1" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 z-20 bg-dark-card border border-dark-border rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { onChange(lang.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left
                         transition-colors duration-100
                         ${value === lang.id ? 'text-white bg-dark-elevated' : 'text-[#888] hover:text-white hover:bg-dark-elevated/50'}`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lang.dot }} />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collapsible GitHub section ────────────────────────────────────────────────
function GitHubPanel() {
  const [open, setOpen] = useState(false);
  const [postToGithub, setPostToGithub] = useState(false);
  const repos = useSelector(selectRepos);
  const prs = useSelector(selectPRs);

  return (
    <Card padding="none">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[13px] font-semibold text-white">GitHub PR</span>
        {open
          ? <IconChevronUp size={14} strokeWidth={2} className="text-[#555]" />
          : <IconChevronDown size={14} strokeWidth={2} className="text-[#555]" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-dark-border pt-3">
          <div>
            <label className="label">Repository</label>
            <select className="select text-sm w-full" disabled={repos.length === 0}>
              <option value="">{repos.length ? 'Select repo…' : 'No repos — connect GitHub'}</option>
              {repos.map((r) => (
                <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Pull Request</label>
            <select className="select text-sm w-full" disabled={prs.length === 0}>
              <option value="">{prs.length ? 'Select PR…' : 'Select a repo first'}</option>
              {prs.map((pr) => (
                <option key={pr.number} value={pr.number}>#{pr.number} {pr.title}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setPostToGithub((p) => !p)}
              className={`relative w-8 h-4 rounded-full transition-colors duration-150
                         ${postToGithub ? 'bg-pink' : 'bg-dark-elevated border border-dark-borderHover'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-150
                               ${postToGithub ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[13px] text-[#888] group-hover:text-white transition-colors">
              Post comments to GitHub
            </span>
          </label>
        </div>
      )}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NewReview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const code = useSelector(selectCurrentCode);
  const language = useSelector(selectCurrentLanguage);
  const focusAreas = useSelector(selectFocusAreas);
  const depth = useSelector(selectReviewDepth);

  const [analyzeCode, { isLoading }] = useAnalyzeCodeMutation();

  // Prefill code from Dashboard quick review
  useEffect(() => {
    if (location.state?.prefillCode) {
      dispatch(setCode(location.state.prefillCode));
    }
  }, []);

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code.length;

  async function handleAnalyze() {
    if (!code.trim()) return;
    dispatch(setAnalyzeStatus('loading'));
    try {
      const review = await analyzeCode({ code, language, focusAreas, depth }).unwrap();
      dispatch(setActiveReview(review));
      dispatch(setAnalyzeStatus('success'));
      navigate(`/review/${review._id}`);
    } catch (err) {
      dispatch(setAnalyzeStatus('error'));
      toast.error(err.message || 'Analysis failed. Please try again.');
    }
  }

  return (
    <AppLayout title="New Review">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col lg:flex-row gap-6 items-start"
      >
        {/* ── Left: editor ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Language selector */}
          <div className="flex items-center justify-between">
            <LanguageSelector value={language} onChange={(l) => dispatch(setLanguage(l))} />
            <span className="text-[12px] text-[#555]">
              Paste or type your code below
            </span>
          </div>

          {/* Monaco editor */}
          <div className="rounded-lg overflow-hidden border border-dark-border">
            <Editor
              height="460px"
              language={language === 'csharp' ? 'csharp' : language}
              value={code}
              onChange={(val) => dispatch(setCode(val ?? ''))}
              theme="vs-dark"
              options={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 13,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'gutter',
                padding: { top: 16, bottom: 16 },
                suggestOnTriggerCharacters: true,
                tabSize: 2,
                wordWrap: 'on',
                overviewRulerLanes: 0,
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              }}
            />
          </div>

          {/* Counters */}
          <div className="flex items-center gap-4 text-[12px] text-[#444]">
            <span>{lineCount.toLocaleString()} {lineCount === 1 ? 'line' : 'lines'}</span>
            <span>{charCount.toLocaleString()} characters</span>
          </div>
        </div>

        {/* ── Right: options ─────────────────────────────────────────────── */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          {/* Review options card */}
          <Card padding="md" className="flex flex-col gap-5">
            <h3 className="text-[13px] font-semibold text-white">Review Options</h3>

            {/* Depth toggle */}
            <div>
              <p className="label">Review Depth</p>
              <div className="flex rounded overflow-hidden border border-dark-border">
                {DEPTHS.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => dispatch(setReviewDepth(d.id))}
                    className={`flex-1 flex flex-col items-center py-2 text-[12px] font-medium transition-colors duration-150
                               ${i > 0 ? 'border-l border-dark-border' : ''}
                               ${depth === d.id
                                 ? 'bg-pink-muted text-pink'
                                 : 'text-[#666] hover:text-white hover:bg-dark-elevated/50'}`}
                  >
                    <span>{d.label}</span>
                    <span className={`text-[10px] font-normal mt-0.5 ${depth === d.id ? 'text-pink/70' : 'text-[#444]'}`}>
                      {d.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Focus areas */}
            <div>
              <p className="label">Focus Areas</p>
              <div className="flex flex-col gap-2">
                {FOCUS_AREAS.map((area) => {
                  const active = focusAreas.includes(area.id);
                  return (
                    <label key={area.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => dispatch(toggleFocusArea(area.id))}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors duration-150 shrink-0
                                   ${active
                                     ? 'bg-pink border-pink'
                                     : 'bg-transparent border-dark-borderHover group-hover:border-[#444]'}`}
                      >
                        {active && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-[13px] transition-colors ${active ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>
                        {area.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* GitHub PR panel */}
          <GitHubPanel />

          {/* Analyze button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={!code.trim() || isLoading}
            onClick={handleAnalyze}
          >
            {isLoading ? 'Analyzing…' : 'Analyze Code'}
          </Button>

          {!code.trim() && (
            <p className="text-[11px] text-[#444] text-center -mt-2">
              Paste or type code to get started
            </p>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}