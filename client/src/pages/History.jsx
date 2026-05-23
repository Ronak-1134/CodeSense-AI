import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconSearch, IconTrash, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import toast from 'react-hot-toast';

import AppLayout from '@components/layout/AppLayout.jsx';
import Card from '@components/ui/Card.jsx';
import Badge from '@components/ui/Badge.jsx';
import Button from '@components/ui/Button.jsx';
import Skeleton from '@components/ui/Skeleton.jsx';
import EmptyState from '@components/ui/EmptyState.jsx';

import { useGetHistoryQuery, useDeleteReviewMutation } from '@features/review/reviewApiSlice';

// ── Constants ─────────────────────────────────────────────────────────────────
const LANGUAGES = ['all','javascript','typescript','python','go','rust','java','csharp','php','ruby'];
const GRADES = ['all','A+','A','B','C','D','F'];
const PAGE_LIMIT = 12;

// ── Score ring (tiny SVG) ─────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 14, c = 2 * Math.PI * r;
  const fill = c - (score / 100) * c;
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444';
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-label={`Score ${score}`}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={fill}
        transform="rotate(-90 18 18)" />
      <text x="18" y="22" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="JetBrains Mono, monospace">
        {score}
      </text>
    </svg>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, onDelete }) {
  const navigate = useNavigate();
  const issueCount = review.result?.issues?.length ?? 0;
  const critical = review.result?.issues?.filter(i => i.severity === 'critical').length ?? 0;

  return (
    <Card
      hoverable
      padding="md"
      className="relative group flex flex-col gap-3 cursor-pointer"
      onClick={() => navigate(`/review/${review._id}`)}
    >
      {/* Delete button — top right */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(review._id); }}
        className="absolute top-3 right-3 p-1.5 rounded text-[#444] hover:text-status-error hover:bg-status-error/10
                   opacity-0 group-hover:opacity-100 transition-all duration-150"
        title="Delete review"
        aria-label="Delete review"
      >
        <IconTrash size={13} strokeWidth={1.75} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 pr-6">
        <ScoreRing score={review.result?.score ?? 0} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white leading-snug truncate">{review.title}</p>
          <p className="text-[11px] text-[#555] mt-0.5">
            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="neutral" size="sm">{review.language || 'unknown'}</Badge>
        {review.result?.grade && (
          <Badge variant="pink" size="sm">Grade {review.result.grade}</Badge>
        )}
        <span className="text-[11px] text-[#666] ml-auto tabular-nums">
          {issueCount} issue{issueCount !== 1 ? 's' : ''}
          {critical > 0 && <span className="text-status-error ml-1">· {critical} critical</span>}
        </span>
      </div>
    </Card>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" width={36} height={36} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" height={10} />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton variant="text" width={60} height={18} className="rounded-full" />
        <Skeleton variant="text" width={50} height={18} className="rounded-full" />
      </div>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function History() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const { data, isLoading } = useGetHistoryQuery({
    page,
    limit: PAGE_LIMIT,
    language: langFilter !== 'all' ? langFilter : undefined,
    grade: gradeFilter !== 'all' ? gradeFilter : undefined,
  });

  const [deleteReview] = useDeleteReviewMutation();

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Client-side search filter
  const filtered = search.trim()
    ? reviews.filter((r) => r.title?.toLowerCase().includes(search.toLowerCase()))
    : reviews;

  async function handleDelete(id) {
    try {
      await deleteReview(id).unwrap();
      toast.success('Review deleted.');
    } catch {
      toast.error('Could not delete review.');
    }
  }

  return (
    <AppLayout title="Review History">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-6"
      >
        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <IconSearch size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews…"
              className="input pl-8 h-8 text-sm w-full"
            />
          </div>

          {/* Language */}
          <select
            value={langFilter}
            onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
            className="select h-8 text-sm w-36 capitalize"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l === 'all' ? 'All languages' : l}</option>
            ))}
          </select>

          {/* Grade */}
          <select
            value={gradeFilter}
            onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
            className="select h-8 text-sm w-28"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>{g === 'all' ? 'All grades' : `Grade ${g}`}</option>
            ))}
          </select>

          <span className="text-[12px] text-[#555] ml-auto">
            {total} review{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Grid ────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(PAGE_LIMIT)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No matching reviews' : 'No reviews yet'}
            description={search ? 'Try a different search term.' : 'Run your first code review to see it here.'}
            action={!search ? { label: 'New Review', onClick: () => navigate('/review/new') } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <ReviewCard key={r._id} review={r} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              icon={IconChevronLeft}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            />

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="text-[#555] px-1 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded text-[13px] font-medium transition-colors duration-150
                                 ${page === p
                                   ? 'bg-pink-muted text-pink'
                                   : 'text-[#666] hover:text-white hover:bg-dark-elevated'}`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={IconChevronRight}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            />
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}