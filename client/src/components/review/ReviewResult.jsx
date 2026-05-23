import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconArrowRight, IconClock } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import {
  selectActiveReview,
  selectFilteredIssues,
  selectIssueCounts,
  selectIssueFilter,
  selectIssueSort,
} from '@features/review/reviewSelectors';
import { useDispatch } from 'react-redux';
import { setIssueFilter, setIssueSort } from '@features/review/reviewSlice';
import ScoreGauge from './ScoreGauge.jsx';
import IssueCard from './IssueCard.jsx';

const TABS = ['Issues', 'Overview', 'Code'];

const FADE = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.15 },
};

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({ counts, activeFilter, onFilter, activeSort, onSort }) {
  const filters = [
    { key: 'all',        label: 'All',        count: counts.total },
    { key: 'critical',   label: 'Critical',   count: counts.critical },
    { key: 'warning',    label: 'Warning',    count: counts.warning },
    { key: 'suggestion', label: 'Suggestion', count: counts.suggestion },
    { key: 'info',       label: 'Info',       count: counts.info },
  ];

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Severity filter pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => onFilter(key)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150',
              activeFilter === key
                ? 'bg-pink-muted text-pink'
                : 'text-[#555] hover:text-white hover:bg-dark-elevated',
            ].join(' ')}
          >
            {label}
            <span className={`text-[10px] tabular-nums ${activeFilter === key ? 'text-pink' : 'text-[#444]'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={activeSort}
        onChange={(e) => onSort(e.target.value)}
        className="appearance-none bg-dark-surface border border-dark-border rounded
                   text-xs text-[#888] px-2 py-1
                   focus:outline-none focus:border-pink cursor-pointer"
        aria-label="Sort issues"
      >
        <option value="severity">Sort: Severity</option>
        <option value="line">Sort: Line number</option>
        <option value="category">Sort: Category</option>
      </select>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ review }) {
  const result = review?.result ?? {};

  return (
    <div className="flex flex-col gap-6">
      {/* Score + summary */}
      <div className="flex items-start gap-6">
        <ScoreGauge score={result.score ?? 0} grade={result.grade} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#888] leading-relaxed">{result.summary}</p>
          {result.estimatedFixTime && (
            <div className="flex items-center gap-1.5 mt-3 text-[12px] text-[#666]">
              <IconClock size={13} strokeWidth={1.75} />
              Estimated fix time: <span className="text-white font-medium">{result.estimatedFixTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-column: positives + improvements */}
      <div className="grid grid-cols-2 gap-4">
        {/* Positives */}
        <div className="bg-status-success/5 border border-status-success/15 rounded-lg p-4">
          <p className="text-[11px] font-semibold text-status-success uppercase tracking-wide mb-3">
            What's Good
          </p>
          <ul className="flex flex-col gap-2.5">
            {(result.positives ?? []).map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#888] leading-relaxed">
                <IconCheck size={13} strokeWidth={2.5} className="text-status-success mt-0.5 shrink-0" />
                {p}
              </li>
            ))}
            {(!result.positives || result.positives.length === 0) && (
              <li className="text-[12px] text-[#444]">No positives identified.</li>
            )}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-pink-muted border border-pink-border rounded-lg p-4">
          <p className="text-[11px] font-semibold text-pink uppercase tracking-wide mb-3">
            Top Improvements
          </p>
          <ul className="flex flex-col gap-2.5">
            {(result.improvements ?? []).map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#888] leading-relaxed">
                <IconArrowRight size={13} strokeWidth={2} className="text-pink mt-0.5 shrink-0" />
                {imp}
              </li>
            ))}
            {(!result.improvements || result.improvements.length === 0) && (
              <li className="text-[12px] text-[#444]">No improvements suggested.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab({ review }) {
  const code = review?.originalCode ?? '';
  const issues = review?.result?.issues ?? [];

  // Build a line → issues map
  const lineIssues = {};
  for (const issue of issues) {
    if (issue.lineNumber != null) {
      if (!lineIssues[issue.lineNumber]) lineIssues[issue.lineNumber] = [];
      lineIssues[issue.lineNumber].push(issue);
    }
  }

  const sevColor = { critical: '#EF4444', warning: '#F59E0B', suggestion: '#E91E8C', info: '#3B82F6' };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-auto">
      <table className="w-full border-collapse text-[12px] font-code">
        <tbody>
          {code.split('\n').map((line, i) => {
            const lineNum = i + 1;
            const lineIss = lineIssues[lineNum];
            const topSev = lineIss?.[0]?.severity;
            const color = topSev ? sevColor[topSev] : null;

            return (
              <tr
                key={lineNum}
                className={`group hover:bg-dark-elevated ${lineIss ? 'bg-dark-elevated/40' : ''}`}
                title={lineIss?.map((is) => is.title).join(' · ')}
              >
                {/* Severity gutter mark */}
                <td className="w-[3px] p-0">
                  {color && <div className="w-[3px] h-full min-h-[1.5rem]" style={{ background: color }} />}
                </td>
                {/* Line number */}
                <td className="w-10 text-right pr-4 pl-2 py-0.5 text-[#3B4048] select-none align-top">
                  {lineNum}
                </td>
                {/* Code */}
                <td className="py-0.5 pr-4 text-[#abb2bf] whitespace-pre">
                  {line || ' '}
                </td>
                {/* Issue count badge on hover */}
                {lineIss && (
                  <td className="pr-3 text-right align-top opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}20`, color }}
                    >
                      {lineIss.length}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
/**
 * Full review result display with Issues / Overview / Code tabs.
 * Reads active review and filter state from Redux.
 */
export default function ReviewResult() {
  const dispatch = useDispatch();
  const review = useSelector(selectActiveReview);
  const filteredIssues = useSelector(selectFilteredIssues);
  const counts = useSelector(selectIssueCounts);
  const activeFilter = useSelector(selectIssueFilter);
  const activeSort = useSelector(selectIssueSort);
  const [activeTab, setActiveTab] = useState('Issues');

  if (!review) return null;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-dark-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors duration-150 relative',
              activeTab === tab
                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-pink after:rounded-t'
                : 'text-[#555] hover:text-white',
            ].join(' ')}
          >
            {tab}
            {tab === 'Issues' && counts.total > 0 && (
              <span className="ml-1.5 text-[10px] text-[#444] tabular-nums">{counts.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="pt-5">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'Issues' && (
            <motion.div key="issues" {...FADE} className="flex flex-col gap-4">
              <FilterBar
                counts={counts}
                activeFilter={activeFilter}
                onFilter={(f) => dispatch(setIssueFilter(f))}
                activeSort={activeSort}
                onSort={(s) => dispatch(setIssueSort(s))}
              />
              <div className="flex flex-col gap-3">
                {filteredIssues.length === 0 ? (
                  <p className="text-[13px] text-[#444] py-6 text-center">
                    No issues matching this filter.
                  </p>
                ) : (
                  filteredIssues.map((issue, i) => (
                    <IssueCard key={`${issue.lineNumber}-${i}`} issue={issue} />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Overview' && (
            <motion.div key="overview" {...FADE}>
              <OverviewTab review={review} />
            </motion.div>
          )}

          {activeTab === 'Code' && (
            <motion.div key="code" {...FADE}>
              <CodeTab review={review} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}