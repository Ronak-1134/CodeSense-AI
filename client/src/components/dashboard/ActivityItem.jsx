import { useNavigate } from 'react-router-dom';
import { IconCode, IconBrandGithub, IconShieldCheck, IconAlertTriangle } from '@tabler/icons-react';

// ── Activity type config ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  review_completed: {
    Icon: IconCode,
    iconBg: 'bg-pink-muted',
    iconColor: 'text-pink',
    label: 'Review completed',
  },
  pr_reviewed: {
    Icon: IconBrandGithub,
    iconBg: 'bg-dark-elevated',
    iconColor: 'text-white',
    label: 'PR reviewed',
  },
  security_issue: {
    Icon: IconShieldCheck,
    iconBg: 'bg-status-error/10',
    iconColor: 'text-status-error',
    label: 'Security issue found',
  },
  warning: {
    Icon: IconAlertTriangle,
    iconBg: 'bg-status-warning/10',
    iconColor: 'text-status-warning',
    label: 'Warning',
  },
};

// ── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Single activity feed item for the dashboard.
 *
 * @param {{
 *   type?: 'review_completed'|'pr_reviewed'|'security_issue'|'warning',
 *   title: string,
 *   meta?: string,
 *   timestamp: string,
 *   reviewId?: string,
 *   score?: number,
 * }} props
 */
export default function ActivityItem({
  type = 'review_completed',
  title,
  meta,
  timestamp,
  reviewId,
  score,
}) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.review_completed;
  const { Icon, iconBg, iconColor } = cfg;

  const handleClick = () => {
    if (reviewId) navigate(`/review/${reviewId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={[
        'flex items-start gap-3 py-3 px-1',
        'border-b border-dark-border last:border-0',
        reviewId ? 'cursor-pointer hover:bg-dark-elevated/40 rounded transition-colors duration-100' : '',
      ].join(' ')}
    >
      {/* Icon */}
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        aria-hidden="true"
      >
        <Icon size={14} strokeWidth={1.75} className={iconColor} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white leading-tight truncate">{title}</p>
        {meta && (
          <p className="text-[11px] text-[#555] mt-0.5 truncate">{meta}</p>
        )}
      </div>

      {/* Right: score + time */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        {score != null && (
          <span
            className="text-[11px] font-semibold font-code tabular-nums"
            style={{
              color: score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444',
            }}
          >
            {score}
          </span>
        )}
        <span className="text-[11px] text-[#444] whitespace-nowrap">
          {timeAgo(timestamp)}
        </span>
      </div>
    </div>
  );
}