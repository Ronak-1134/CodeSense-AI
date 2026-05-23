// ── Severity config ───────────────────────────────────────────────────────────
const CONFIG = {
  critical: {
    dot: 'bg-status-error',
    text: 'text-status-error',
    bg: 'bg-status-error/10',
    label: 'Critical',
  },
  warning: {
    dot: 'bg-status-warning',
    text: 'text-status-warning',
    bg: 'bg-status-warning/10',
    label: 'Warning',
  },
  suggestion: {
    dot: 'bg-pink',
    text: 'text-pink',
    bg: 'bg-pink-muted',
    label: 'Suggestion',
  },
  info: {
    dot: 'bg-status-info',
    text: 'text-status-info',
    bg: 'bg-status-info/10',
    label: 'Info',
  },
};

/**
 * Small badge with a colored dot and severity label.
 *
 * @param {{
 *   severity: 'critical'|'warning'|'suggestion'|'info',
 *   showLabel?: boolean,
 *   className?: string,
 * }} props
 */
export default function SeverityBadge({
  severity,
  showLabel = true,
  className = '',
}) {
  const cfg = CONFIG[severity] ?? CONFIG.info;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2 py-0.5 rounded-full',
        'text-[11px] font-medium uppercase tracking-wide leading-none',
        cfg.bg,
        cfg.text,
        className,
      ].join(' ')}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}
        aria-hidden="true"
      />
      {showLabel && cfg.label}
    </span>
  );
}