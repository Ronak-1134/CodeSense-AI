import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconBell,
  IconPlus,
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react';

import { selectUser } from '@features/auth/authSelectors';
import { logoutUser } from '@features/auth/authSlice';
import Button from '@components/ui/Button.jsx';

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 30 }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User'}
        width={size}
        height={size}
        className="rounded-full object-cover ring-1 ring-dark-border"
        style={{ width: size, height: size }}
        draggable={false}
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
      className="rounded-full bg-pink-muted text-pink text-[11px] font-semibold
                 flex items-center justify-center ring-1 ring-pink-border select-none"
      style={{ width: size, height: size, minWidth: size }}
    >
      {initials}
    </span>
  );
}

// ── Dropdown ───────────────────────────────────────────────────────────────────
function UserDropdown({ user, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-52 z-50
                 bg-dark-card border border-dark-border rounded-lg shadow-lg
                 py-1 overflow-hidden"
      role="menu"
      aria-label="User menu"
    >
      {/* User info header */}
      <div className="px-3 py-2.5 border-b border-dark-border">
        <p className="text-[13px] font-medium text-white leading-tight truncate">
          {user?.displayName || 'User'}
        </p>
        <p className="text-[11px] text-[#555] leading-tight mt-0.5 truncate">
          {user?.email}
        </p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2
                     text-[13px] text-[#888] hover:text-white hover:bg-dark-elevated
                     transition-colors duration-100 text-left"
          onClick={() => handleNav('/settings')}
          role="menuitem"
        >
          <IconUser size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          Profile
        </button>

        <button
          className="w-full flex items-center gap-2.5 px-3 py-2
                     text-[13px] text-[#888] hover:text-white hover:bg-dark-elevated
                     transition-colors duration-100 text-left"
          onClick={() => handleNav('/settings')}
          role="menuitem"
        >
          <IconSettings size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          Settings
        </button>
      </div>

      <div className="border-t border-dark-border py-1">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2
                     text-[13px] text-status-error hover:bg-status-error/8
                     transition-colors duration-100 text-left"
          onClick={handleLogout}
          role="menuitem"
        >
          <IconLogout size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────────
/**
 * Top bar for the authenticated app shell.
 *
 * @param {{ title?: string }} props
 */
export default function Topbar({ title = '' }) {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Close dropdown on outside click ────────────────────────────────────────
  const handleOutsideClick = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen, handleOutsideClick]);

  // ── Close on Escape ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dropdownOpen]);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between
                 h-[52px] px-6 shrink-0
                 bg-dark-page border-b border-dark-border"
    >
      {/* ── Left: page title ─────────────────────────────────────────────── */}
      <h1 className="text-[16px] font-medium text-white leading-none truncate">
        {title}
      </h1>

      {/* ── Right: actions ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* New Review CTA */}
        <Button
          variant="primary"
          size="sm"
          icon={IconPlus}
          onClick={() => navigate('/review/new')}
          aria-label="Start new review"
        >
          New Review
        </Button>

        {/* Notification bell — placeholder */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded
                     text-[#555] hover:text-white hover:bg-dark-elevated
                     transition-colors duration-150 relative"
          aria-label="Notifications (coming soon)"
          title="Notifications"
        >
          <IconBell size={17} strokeWidth={1.75} />
          {/* Future: unread dot
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink" />
          */}
        </button>

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            className="flex items-center gap-1.5 p-1 rounded
                       hover:bg-dark-elevated transition-colors duration-150"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="Open user menu"
          >
            <Avatar user={user} size={28} />
            <IconChevronDown
              size={13}
              strokeWidth={2}
              className={`text-[#555] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {dropdownOpen && (
            <UserDropdown
              user={user}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}