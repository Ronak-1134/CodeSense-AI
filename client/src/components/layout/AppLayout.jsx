import { useSelector } from 'react-redux';
import { selectSidebarCollapsed } from '@features/ui/uiSlice';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 60;

/**
 * Root layout for all authenticated pages.
 * Sidebar (fixed left) + scrollable main content area with Topbar.
 *
 * @param {{ children: React.ReactNode, title?: string }} props
 */
export default function AppLayout({ children, title = '' }) {
  const collapsed = useSelector(selectSidebarCollapsed);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="flex min-h-dvh bg-dark-page">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          transition: 'width 200ms cubic-bezier(0.4,0,0.2,1), min-width 200ms cubic-bezier(0.4,0,0.2,1)',
        }}
        className="sticky top-0 h-dvh flex-shrink-0 z-30"
      >
        <Sidebar />
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}