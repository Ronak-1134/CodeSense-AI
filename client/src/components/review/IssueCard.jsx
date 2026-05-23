import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown, IconCode } from '@tabler/icons-react';
import SeverityBadge from './SeverityBadge.jsx';

// ── Category tag ──────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  bug:         { bg: 'bg-status-error/8',   text: 'text-status-error'   },
  security:    { bg: 'bg-orange-500/8',      text: 'text-orange-400'     },
  performance: { bg: 'bg-status-warning/8', text: 'text-status-warning' },
  style:       { bg: 'bg-status-info/8',    text: 'text-status-info'    },
  logic:       { bg: 'bg-purple-500/8',     text: 'text-purple-400'     },
};

function CategoryTag({ category }) {
  const c = CATEGORY_COLORS[category] ?? { bg: 'bg-dark-elevated', text: 'text-[#888]' };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${c.bg} ${c.text}`}>
      {category}
    </span>
  );
}

// ── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, variant = 'neutral' }) {
  const styles = {
    neutral: 'bg-dark-page border-dark-border text-[#abb2bf]',
    fix:     'bg-status-success/5 border-status-success/20 text-[#abb2bf]',
  };

  return (
    <pre
      className={`text-[12px] font-code leading-relaxed rounded-lg p-3 overflow-x-auto border ${styles[variant]}`}
    >
      <code>{code}</code>
    </pre>
  );
}

// ── Severity border map ───────────────────────────────────────────────────────
const SEVERITY_BORDER = {
  critical:   'border-l-status-error',
  warning:    'border-l-status-warning',
  suggestion: 'border-l-pink',
  info:       'border-l-status-info',
};

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Expandable issue card. Collapsed by default.
 *
 * @param {{ issue: object, defaultOpen?: boolean }} props
 */
export default function IssueCard({ issue, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const borderClass = SEVERITY_BORDER[issue.severity] ?? 'border-l-dark-border';

  return (
    <div
      className={`bg-dark-card border border-dark-border border-l-[3px] rounded-lg overflow-hidden
                  transition-colors duration-150 ${borderClass}
                  ${open ? '' : 'hover:border-dark-borderHover'}`}
    >
      {/* ── Header (always visible) ──────────────────────────────────── */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <SeverityBadge severity={issue.severity} />
          <CategoryTag category={issue.category} />
          <span className="text-[13px] font-medium text-white leading-snug flex-1 min-w-0">
            {issue.title}
          </span>
          {issue.lineNumber != null && (
            <span className="text-[11px] text-[#444] font-code shrink-0 ml-auto">
              L{issue.lineNumber}
            </span>
          )}
        </div>
        <IconChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 text-[#444] group-hover:text-[#888] transition-transform duration-200 mt-0.5 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* ── Expandable body ──────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-dark-border pt-3">
              {/* Description */}
              <p className="text-[13px] text-[#888] leading-relaxed">
                {issue.description}
              </p>

              {/* Code snippet */}
              {issue.codeSnippet && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <IconCode size={12} strokeWidth={1.75} className="text-[#444]" />
                    <span className="text-[10px] text-[#444] uppercase tracking-wide font-medium">Problematic code</span>
                  </div>
                  <CodeBlock code={issue.codeSnippet} variant="neutral" />
                </div>
              )}

              {/* Suggested fix */}
              {issue.suggestedFix && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-success" aria-hidden="true" />
                    <span className="text-[10px] text-status-success uppercase tracking-wide font-medium">Suggested fix</span>
                  </div>
                  <CodeBlock code={issue.suggestedFix} variant="fix" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}