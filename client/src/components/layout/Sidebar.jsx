import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconCode,
  IconBrandGithub,
  IconHistory,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

import { toggleSidebar, selectSidebarCollapsed } from '@features/ui/uiSlice';
import { selectUser, selectUserPlan } from '@features/auth/authSelectors';
import Tooltip from '@components/ui/Tooltip.jsx';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard',  Icon: IconLayoutDashboard, label: 'Dashboard'  },
  { path: '/review/new', Icon: IconCode,            label: 'New Review' },
  { path: '/github',     Icon: IconBrandGithub,     label: 'GitHub PRs' },
  { path: '/history',    Icon: IconHistory,         label: 'History'    },
  { path: '/settings',   Icon: IconSettings,        label: 'Settings'   },
];

const FREE_LIMIT = 15;

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 28 }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User'}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0 ring-1 ring-dark-border"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = (user?.displayName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className="rounded-full bg-pink-muted text-pink text-[10px] font-semibold
                 flex items-center justify-center shrink-0 ring-1 ring-pink-border"
      style={{ width: size, height: size, minWidth: size }}
    >
      {initials}
    </span>
  );
}

// ── PlanBadge ─────────────────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  return plan === 'pro' ? (
    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider
                     bg-pink-muted text-pink leading-none">
      Pro
    </span>
  ) : (
    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider
                     bg-dark-elevated text-[#666] leading-none">
      Free
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const collapsed = useSelector(selectSidebarCollapsed);
  const user = useSelector(selectUser);
  const plan = useSelector(selectUserPlan);

  const reviewsUsed = user?.reviewsThisMonth ?? 0;
  const usagePct = Math.min((reviewsUsed / FREE_LIMIT) * 100, 100);
  const isPro = plan === 'pro';

  return (
    <nav
      className="flex flex-col h-full bg-[#0D0D0D] border-r border-[#1A1A1A] overflow-hidden"
      aria-label="Primary navigation"
    >
      {/* ── Logo + Collapse toggle ─────────────────────────────────────────── */}
      <div
        className={`flex items-center h-[52px] shrink-0 border-b border-[#1A1A1A] px-3
                    ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!collapsed && (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 group"
            aria-label="Go to dashboard"
          >
            {/* Pink dot logo mark */}
            <span className="w-2 h-2 rounded-full bg-pink shrink-0" />
            <span className="text-[15px] font-semibold text-white tracking-tight leading-none">
              CodeSense
            </span>
          </button>
        )}

        {collapsed && (
          <span className="w-2 h-2 rounded-full bg-pink" aria-hidden="true" />
        )}

        {/* Collapse toggle */}
        <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className={`
              w-6 h-6 flex items-center justify-center rounded
              text-[#444] hover:text-white hover:bg-dark-elevated
              transition-colors duration-150 shrink-0
              ${collapsed ? 'mt-0' : ''}
            `}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <IconChevronRight size={14} strokeWidth={2} />
              : <IconChevronLeft size={14} strokeWidth={2} />
            }
          </button>
        </Tooltip>
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────────── */}
      <ul className="flex flex-col gap-0.5 px-2 pt-3 flex-1 list-none" role="list">
        {NAV_ITEMS.map(({ path, Icon, label }) => (
          <li key={path}>
            <Tooltip content={collapsed ? label : ''} position="right">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded transition-colors duration-150 relative',
                    'text-sm font-medium select-none',
                    collapsed ? 'w-full justify-center h-9' : 'gap-2.5 px-3 h-9',
                    isActive
                      ? 'bg-dark-elevated text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:rounded-r before:bg-pink'
                      : 'text-[#666] hover:text-white hover:bg-dark-elevated/50',
                  ].join(' ')
                }
                aria-label={collapsed ? label : undefined}
              >
                <Icon
                  size={17}
                  strokeWidth={1.75}
                  className="shrink-0"
                  aria-hidden="true"
                />
                {!collapsed && (
                  <span className="leading-none truncate">{label}</span>
                )}
              </NavLink>
            </Tooltip>
          </li>
        ))}
      </ul>

      {/* ── Bottom section ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#1A1A1A] mt-auto">
        {/* Usage meter — only when expanded and on free plan */}
        {!collapsed && !isPro && (
          <div className="px-3 py-3 border-b border-[#1A1A1A]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#555] leading-none">Reviews this month</span>
              <span className="text-[11px] text-[#888] leading-none tabular-nums">
                {reviewsUsed}
                <span className="text-[#444]"> / {FREE_LIMIT}</span>
              </span>
            </div>
            {/* Progress track */}
            <div className="h-[3px] rounded-full bg-dark-elevated overflow-hidden">
              <div
                className="h-full rounded-full bg-pink transition-all duration-500"
                style={{ width: `${usagePct}%` }}
                role="progressbar"
                aria-valuenow={reviewsUsed}
                aria-valuemin={0}
                aria-valuemax={FREE_LIMIT}
                aria-label={`${reviewsUsed} of ${FREE_LIMIT} reviews used`}
              />
            </div>
            {usagePct >= 80 && (
              <p className="text-[10px] text-status-warning mt-1.5 leading-none">
                {reviewsUsed >= FREE_LIMIT ? 'Limit reached — upgrade for more' : 'Running low — consider upgrading'}
              </p>
            )}
          </div>
        )}

        {/* User info */}
        <div
          className={`flex items-center py-3 px-3 gap-2.5
                      ${collapsed ? 'justify-center' : ''}`}
        >
          <Avatar user={user} size={28} />

          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-white leading-none truncate">
                {user?.displayName || user?.email || 'User'}
              </span>
              <span className="text-[11px] text-[#555] leading-none truncate">
                {user?.email}
              </span>
            </div>
          )}

          {!collapsed && <PlanBadge plan={plan} />}
        </div>
      </div>
    </nav>
  );
}