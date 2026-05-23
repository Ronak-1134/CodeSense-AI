import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  IconCode, IconShieldCheck, IconTrendingUp, IconCalendar,
  IconEye, IconTrash, IconAlertCircle,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

import AppLayout from '@components/layout/AppLayout.jsx';
import StatsCard from '@components/dashboard/StatsCard.jsx';
import Card from '@components/ui/Card.jsx';
import Badge from '@components/ui/Badge.jsx';
import Button from '@components/ui/Button.jsx';
import Skeleton from '@components/ui/Skeleton.jsx';
import EmptyState from '@components/ui/EmptyState.jsx';

import { useGetHistoryQuery, useDeleteReviewMutation } from '@features/review/reviewApiSlice';
import { useSelector } from 'react-redux';
import { selectUser } from '@features/auth/authSelectors';

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 80) return 'text-status-success';
  if (score >= 60) return 'text-status-warning';
  if (score >= 40) return 'text-[#F97316]';
  return 'text-status-error';
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-dark-border">
      {[140, 70, 50, 40, 80, 80].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton width={w} height={14} />
        </td>
      ))}
    </tr>
  );
}

// ── Quick Review panel ────────────────────────────────────────────────────────
function QuickReview() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <h3 className="text-[13px] font-semibold text-white">Quick Review</h3>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste code snippet here…"
        className="textarea min-h-[120px] resize-none font-code text-xs"
      />
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        disabled={!code.trim()}
        onClick={() => navigate('/review/new', { state: { prefillCode: code } })}
      >
        Analyze →
      </Button>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const { data, isLoading } = useGetHistoryQuery({ page: 1, limit: 5 });
  const [deleteReview] = useDeleteReviewMutation();

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? 0;

  // Derived stats from recent reviews
  const totalIssues = reviews.reduce((sum, r) => sum + (r.result?.issues?.length ?? 0), 0);
  const avgScore = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + (r.result?.score ?? 0), 0) / reviews.length)
    : 0;

  async function handleDelete(id, e) {
    e.stopPropagation();
    try {
      await deleteReview(id).unwrap();
      toast.success('Review deleted.');
    } catch {
      toast.error('Could not delete review.');
    }
  }

  const stats = [
    { label: 'Total Reviews',  value: total,                        icon: IconCode,        trend: null },
    { label: 'Issues Found',   value: totalIssues,                  icon: IconAlertCircle, trend: null },
    { label: 'Avg Score',      value: reviews.length ? `${avgScore}` : '—', icon: IconTrendingUp,  trend: null },
    { label: 'This Month',     value: user?.reviewsThisMonth ?? 0,  icon: IconCalendar,    trend: null },
  ];

  return (
    <AppLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-8"
      >
        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
          ))}
        </div>

        {/* ── Main + sidebar ────────────────────────────────────────────────── */}
        <div className="flex gap-6 items-start">
          {/* Recent reviews table */}
          <div className="flex-1 min-w-0">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                <h2 className="text-[14px] font-semibold text-white">Recent Reviews</h2>
                {total > 5 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                    View all
                  </Button>
                )}
              </div>

              {isLoading ? (
                <table className="w-full">
                  <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
                </table>
              ) : reviews.length === 0 ? (
                <EmptyState
                  icon={IconCode}
                  title="No reviews yet"
                  description="Paste some code and get instant AI feedback on bugs, security, and style."
                  action={{ label: 'Run first review', onClick: () => navigate('/review/new') }}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-border text-left">
                        {['Title', 'Language', 'Score', 'Issues', 'Date', ''].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-[11px] text-[#555] font-medium uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr
                          key={r._id}
                          onClick={() => navigate(`/review/${r._id}`)}
                          className="border-b border-dark-border hover:bg-dark-elevated/50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 max-w-[200px]">
                            <span className="text-white font-medium truncate block">{r.title}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="neutral" size="sm">{r.language}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold tabular-nums ${scoreColor(r.result?.score)}`}>
                              {r.result?.score ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#888] tabular-nums">
                            {r.result?.issues?.length ?? 0}
                          </td>
                          <td className="px-4 py-3 text-[#555] whitespace-nowrap">
                            {fmtDate(r.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => navigate(`/review/${r._id}`)}
                                className="p-1.5 rounded text-[#555] hover:text-white hover:bg-dark-elevated transition-colors"
                                title="View review"
                              >
                                <IconEye size={14} strokeWidth={1.75} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(r._id, e)}
                                className="p-1.5 rounded text-[#555] hover:text-status-error hover:bg-status-error/10 transition-colors"
                                title="Delete"
                              >
                                <IconTrash size={14} strokeWidth={1.75} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Quick review sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <QuickReview />
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}