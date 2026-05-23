import { useNavigate } from 'react-router-dom';
import { IconTrash, IconEye, IconArrowUpRight } from '@tabler/icons-react';
import { useDeleteReviewMutation } from '@features/review/reviewApiSlice';
import Badge from '@components/ui/Badge.jsx';
import Skeleton from '@components/ui/Skeleton.jsx';
import EmptyState from '@components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';

// ── Score chip ────────────────────────────────────────────────────────────────
function ScoreChip({ score, grade }) {
  let color = '#22C55E';
  if (score < 60) color = '#EF4444';
  else if (score < 75) color = '#F59E0B';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-semibold font-code tabular-nums"
      style={{ color, background: `${color}14` }}
    >
      {score}
      {grade && <span className="text-[10px] opacity-70">{grade}</span>}
    </span>
  );
}

// ── Language badge ────────────────────────────────────────────────────────────
function LangBadge({ language }) {
  if (!language || language === 'unknown') return <span className="text-[#444] text-xs">—</span>;
  return <Badge variant="neutral" size="sm">{language}</Badge>;
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRows({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-dark-border last:border-0">
          <td className="px-4 py-3"><Skeleton width="60%" height={14} /></td>
          <td className="px-4 py-3"><Skeleton width={60} height={20} className="rounded-full" /></td>
          <td className="px-4 py-3"><Skeleton width={40} height={20} /></td>
          <td className="px-4 py-3"><Skeleton width={24} height={14} /></td>
          <td className="px-4 py-3"><Skeleton width={80} height={14} /></td>
          <td className="px-4 py-3"><Skeleton width={60} height={28} /></td>
        </tr>
      ))}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Dashboard table of recent reviews.
 *
 * @param {{
 *   reviews: object[],
 *   isLoading: boolean,
 *   onDeleted?: () => void,
 * }} props
 */
export default function RecentReviews({ reviews = [], isLoading = false, onDeleted }) {
  const navigate = useNavigate();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  async function handleDelete(e, id) {
    e.stopPropagation();
    try {
      await deleteReview(id).unwrap();
      toast.success('Review deleted.');
      onDeleted?.();
    } catch {
      toast.error('Failed to delete review.');
    }
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <h3 className="text-[13px] font-semibold text-white">Recent Reviews</h3>
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1 text-[11px] text-[#555] hover:text-white transition-colors duration-150"
        >
          View all <IconArrowUpRight size={12} strokeWidth={2} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-dark-border text-left">
              {['Title', 'Language', 'Score', 'Issues', 'Date', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-[11px] font-medium text-[#444] uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows count={5} />
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No reviews yet"
                    description="Run your first code review to see results here."
                    action={{ label: 'Start a review', onClick: () => navigate('/review/new') }}
                  />
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const issueCount = review.result?.issues?.length ?? 0;
                const date = new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                });

                return (
                  <tr
                    key={review._id}
                    onClick={() => navigate(`/review/${review._id}`)}
                    className="border-b border-dark-border last:border-0 hover:bg-dark-elevated/50 cursor-pointer transition-colors duration-100 group"
                  >
                    {/* Title */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-white font-medium truncate block">{review.title}</span>
                      {review.githubRepo && (
                        <span className="text-[11px] text-[#444] truncate block">{review.githubRepo}</span>
                      )}
                    </td>

                    {/* Language */}
                    <td className="px-4 py-3">
                      <LangBadge language={review.language} />
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      <ScoreChip
                        score={review.result?.score ?? 0}
                        grade={review.result?.grade}
                      />
                    </td>

                    {/* Issues */}
                    <td className="px-4 py-3 text-[#888] tabular-nums">
                      {issueCount > 0 ? (
                        <span className={issueCount > 5 ? 'text-status-warning' : ''}>
                          {issueCount}
                        </span>
                      ) : (
                        <span className="text-status-success">0</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-[#555] whitespace-nowrap">{date}</td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => navigate(`/review/${review._id}`)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#555] hover:text-white hover:bg-dark-elevated transition-colors duration-100"
                          title="View review"
                          aria-label="View review"
                        >
                          <IconEye size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, review._id)}
                          disabled={isDeleting}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#555] hover:text-status-error hover:bg-status-error/8 transition-colors duration-100 disabled:opacity-40"
                          title="Delete review"
                          aria-label="Delete review"
                        >
                          <IconTrash size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}