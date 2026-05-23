import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentCode,
  selectCurrentLanguage,
} from '@features/review/reviewSelectors';
import { setCode, setLanguage } from '@features/review/reviewSlice';

// ── Language catalogue ────────────────────────────────────────────────────────
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', color: '#F7DF1E', monaco: 'javascript' },
  { id: 'typescript', label: 'TypeScript', color: '#3178C6', monaco: 'typescript' },
  { id: 'python',     label: 'Python',     color: '#3776AB', monaco: 'python'     },
  { id: 'go',         label: 'Go',         color: '#00ADD8', monaco: 'go'         },
  { id: 'rust',       label: 'Rust',       color: '#CE422B', monaco: 'rust'       },
  { id: 'java',       label: 'Java',       color: '#ED8B00', monaco: 'java'       },
  { id: 'csharp',     label: 'C#',         color: '#9B4F96', monaco: 'csharp'     },
  { id: 'cpp',        label: 'C++',        color: '#00599C', monaco: 'cpp'        },
  { id: 'php',        label: 'PHP',        color: '#777BB4', monaco: 'php'        },
  { id: 'ruby',       label: 'Ruby',       color: '#CC342D', monaco: 'ruby'       },
  { id: 'swift',      label: 'Swift',      color: '#FA7343', monaco: 'swift'      },
  { id: 'kotlin',     label: 'Kotlin',     color: '#7F52FF', monaco: 'kotlin'     },
  { id: 'sql',        label: 'SQL',        color: '#4479A1', monaco: 'sql'        },
  { id: 'bash',       label: 'Bash',       color: '#4EAA25', monaco: 'shell'      },
  { id: 'unknown',    label: 'Plain Text', color: '#888888', monaco: 'plaintext'  },
];

// ── Monaco editor options ─────────────────────────────────────────────────────
const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderLineHighlight: 'gutter',
  lineNumbers: 'on',
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 6,
  lineNumbersMinChars: 3,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  padding: { top: 16, bottom: 16 },
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'off',
  contextmenu: false,
  fixedOverflowWidgets: true,
};

// ── Language selector ─────────────────────────────────────────────────────────
function LanguageSelector({ value, onChange }) {
  const current = LANGUAGES.find((l) => l.id === value) ?? LANGUAGES[0];

  return (
    <div className="relative inline-flex items-center">
      <span
        className="w-2 h-2 rounded-full shrink-0 mr-2"
        style={{ background: current.color }}
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-dark-surface border border-dark-border rounded
                   text-sm text-white pl-1 pr-6 py-1.5
                   focus:outline-none focus:border-pink
                   cursor-pointer transition-colors duration-150"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#555]"
        width="10" height="10" viewBox="0 0 10 10" fill="none"
        aria-hidden="true"
      >
        <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Monaco-based code editor wired to Redux review state.
 *
 * @param {{
 *   minHeight?: number,
 *   maxHeight?: number,
 *   placeholder?: string,
 *   readOnly?: boolean,
 *   showLanguageSelector?: boolean,
 *   showStats?: boolean,
 *   className?: string,
 * }} props
 */
export default function CodeEditor({
  minHeight = 400,
  maxHeight = 700,
  readOnly = false,
  showLanguageSelector = true,
  showStats = true,
  className = '',
}) {
  const dispatch = useDispatch();
  const code = useSelector(selectCurrentCode);
  const language = useSelector(selectCurrentLanguage);
  const editorRef = useRef(null);

  const monacoLang = LANGUAGES.find((l) => l.id === language)?.monaco ?? 'plaintext';

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code ? code.length : 0;

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
    // Focus on mount for immediate typing
    editor.focus();
  }, []);

  const handleChange = useCallback(
    (value) => {
      dispatch(setCode(value ?? ''));
    },
    [dispatch],
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-dark-card border border-dark-border rounded-t-lg border-b-0">
        <div className="flex items-center gap-3">
          {showLanguageSelector && (
            <LanguageSelector
              value={language}
              onChange={(v) => dispatch(setLanguage(v))}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {code && (
            <button
              onClick={() => dispatch(setCode(''))}
              className="text-[11px] text-[#444] hover:text-[#888] transition-colors duration-150"
              aria-label="Clear editor"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Editor ────────────────────────────────────────────────────── */}
      <div
        className="border border-dark-border rounded-b-lg overflow-hidden"
        style={{ minHeight, maxHeight }}
      >
        <Editor
          height={Math.max(minHeight, Math.min(lineCount * 22 + 48, maxHeight))}
          language={monacoLang}
          value={code}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{ ...EDITOR_OPTIONS, readOnly }}
        />
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      {showStats && (
        <div className="flex items-center gap-4 mt-2 px-1">
          <span className="text-[11px] text-[#444]">
            {lineCount.toLocaleString()} {lineCount === 1 ? 'line' : 'lines'}
          </span>
          <span className="text-[11px] text-[#444]">
            {charCount.toLocaleString()} {charCount === 1 ? 'char' : 'chars'}
          </span>
          {lineCount > 600 && (
            <span className="text-[11px] text-status-warning">
              Free plan limit: 600 lines
            </span>
          )}
        </div>
      )}
    </div>
  );
}