import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import Card from '../ui/Card.jsx';

/**
 * Dashboard metric card: label / value / trend / icon.
 *
 * @param {{
 *   label: string,
 *   value: string | number,
 *   trend?: string,
 *   trendUp?: boolean,
 *   icon?: React.ComponentType<{ size?: number, strokeWidth?: number, className?: string }>,
 *   className?: string,
 * }} props
 */
export default function StatsCard({
  label,
  value,
  trend,
  trendUp,
  icon: Icon,
  className = '',
}) {
  const hasTrend = trend !== undefined && trend !== null;

  return (
    <Card padding="md" className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3">
        {/* ── Left: label + value + trend ────────────────────────────────── */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-medium text-[#888] uppercase tracking-wide leading-none">
            {label}
          </span>

          <span className="text-2xl font-semibold text-white leading-tight tabular-nums">
            {value}
          </span>

          {hasTrend && (
            <span
              className={[
                'inline-flex items-center gap-1 text-xs font-medium leading-none mt-0.5',
                trendUp ? 'text-status-success' : 'text-status-error',
              ].join(' ')}
            >
              {trendUp ? (
                <IconTrendingUp size={12} strokeWidth={2} aria-hidden="true" />
              ) : (
                <IconTrendingDown size={12} strokeWidth={2} aria-hidden="true" />
              )}
              {trend}
            </span>
          )}
        </div>

        {/* ── Right: icon ──────────────────────────────────────────────────── */}
        {Icon && (
          <div className="shrink-0 p-2.5 rounded-lg bg-pink-muted mt-0.5" aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} className="text-pink" />
          </div>
        )}
      </div>

      {/* Subtle decorative accent line on the left edge */}
      <span
        className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r bg-pink-border"
        aria-hidden="true"
      />
    </Card>
  );
}