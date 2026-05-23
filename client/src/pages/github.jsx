import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconBrandGithub,
  IconGitPullRequest,
  IconRefresh,
  IconChevronRight,
  IconLock,
  IconLockOpen,
  IconStar,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

import AppLayout from '@components/layout/AppLayout.jsx';
import Card from '@components/ui/Card.jsx';
import Button from '@components/ui/Button.jsx';
import Badge from '@components/ui/Badge.jsx';
import Skeleton from '@components/ui/Skeleton.jsx';
import EmptyState from '@components/ui/EmptyState.jsx';
import { useGithub } from '@hooks/useGithub.js';
import { useSelector, useDispatch } from 'react-redux';
import { selectGithubConnected } from '@features/auth/authSelectors';
import { setGithubConnected } from '@features/auth/authSlice';

// ── Language color dots ───────────────────────────────────────────────────────
const LANG_COLORS = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
  go: '#00ADD8', rust: '#CE422B', java: '#ED8B00', csharp: '#9B4F96',
  cpp: '#00599C', ruby: '#CC342D', php: '#777BB4', swift: '#FA7343',
  kotlin: '#7F52FF',
};

function LangDot({ language }) {
  const color = LANG_COLORS[language?.toLowerCase()] ?? '#555';
  return (
    <span
      className="w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: color }}
      title={language}
    />
  );
}

// ── Repo card ─────────────────────────────────────────────────────────────────
function RepoCard({ repo, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left p-4 rounded-lg border transition-all duration-150',
        selected
          ? 'bg-pink-muted border-pink-border'
          : 'bg-dark-card border-dark-border hover:border-dark-borderHover hover:bg-dark-elevated',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {repo.language && <LangDot language={repo.language} />}
          <span className="text-[13px] font-medium text-white truncate">
            {repo.name}
          </span>
          {repo.isPrivate
            ? <IconLock size={12} strokeWidth={1.75} className="text-[#555] shrink-0" />
            : <IconLockOpen size={12} strokeWidth={1.75} className="text-[#444] shrink-0" />
          }
        </div>
        <div className="flex items-center gap-1 shrink-0 text-[#555]">
          <IconStar size={11} strokeWidth={1.75} />
          <span className="text-[11px]">{repo.stars}</span>
        </div>
      </div>
      <p className="text-[11px] text-[#444] mt-1 text-left">
        {repo.owner} · updated {new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
      {selected && (
        <p className="text-[11px] text-pink mt-1.5 font-medium">Selected ✓</p>
      )}
    </button>
  );
}

// ── PR row ────────────────────────────────────────────────────────────────────
function PRRow({ pr, onReview }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-dark-border last:border-0 hover:bg-dark-elevated/40 transition-colors duration-100">
      <IconGitPullRequest size={16} strokeWidth={1.75} className="text-status-success shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate">{pr.title}</p>
        <p className="text-[11px] text-[#555] mt-0.5">
          #{pr.number} · {pr.author} · {pr.branch} · {pr.changedFiles} file{pr.changedFiles !== 1 ? 's' : ''} changed
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-[#444]">
          {new Date(pr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <Button variant="primary" size="sm" onClick={() => onReview(pr)}>
          Review
        </Button>
      </div>
    </div>
  );
}

// ── Not connected state ───────────────────────────────────────────────────────
function NotConnected({ onConnect, loading }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="p-5 rounded-2xl bg-dark-elevated">
        <IconBrandGithub size={40} strokeWidth={1.25} className="text-[#444]" />
      </div>
      <div className="text-center">
        <h3 className="text-[16px] font-semibold text-white mb-2">Connect your GitHub account</h3>
        <p className="text-[13px] text-[#555] max-w-xs leading-relaxed">
          Link GitHub to browse your repositories and run AI reviews on open pull requests.
        </p>
      </div>
      <Button
        variant="primary"
        size="md"
        icon={IconBrandGithub}
        loading={loading}
        onClick={onConnect}
      >
        Connect GitHub
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GitHub() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const githubConnected = useSelector(selectGithubConnected);

  const {
    reposRTK: repos,
    prsRTK: prs,
    reposLoading,
    prsLoading,
    selectedRepo,
    selectRepo,
    refetchRepos,
    storeToken,
  } = useGithub();

  const [connecting, setConnecting] = useState(false);
  const [reviewing, setReviewing] = useState(null); // pr number being reviewed

  // ── Connect GitHub via OAuth popup ────────────────────────────────────────
  async function handleConnect() {
    setConnecting(true);
    try {
      const { signInWithGithub } = await import('@services/firebase');
      const credential = await signInWithGithub();
      if (credential.githubAccessToken) {
        await storeToken(credential.githubAccessToken);
        // Mark as connected in Redux so skip:!githubConnected lifts
        dispatch(setGithubConnected(true));
        toast.success('GitHub connected! Loading your repos…');
        // Small delay to let RTK Query re-evaluate skip condition
        setTimeout(() => refetchRepos(), 300);
      } else {
        toast.error('Could not get GitHub access token. Try again.');
      }
    } catch (err) {
      toast.error(err.message ?? 'Failed to connect GitHub.');
    } finally {
      setConnecting(false);
    }
  }

  // ── Start PR review → navigate to review page ─────────────────────────────
  async function handleReviewPR(pr) {
    if (!selectedRepo) return;
    setReviewing(pr.number);
    try {
      // Navigate to new review page with PR context pre-filled via location state
      navigate('/review/new', {
        state: {
          githubPR: {
            owner: selectedRepo.owner,
            repo: selectedRepo.name,
            prNumber: pr.number,
            prTitle: pr.title,
          },
        },
      });
    } finally {
      setReviewing(null);
    }
  }

  return (
    <AppLayout title="GitHub PRs">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-6"
      >
        {!githubConnected ? (
          <NotConnected onConnect={handleConnect} loading={connecting} />
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-white">Your Repositories</h2>
                <p className="text-[13px] text-[#555] mt-0.5">Select a repo to view open pull requests</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={IconRefresh}
                onClick={refetchRepos}
                loading={reposLoading}
              >
                Refresh
              </Button>
            </div>

            {/* ── Two-column layout ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* Left — Repo list */}
              <div className="flex flex-col gap-3">
                {reposLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="card" height={72} />
                  ))
                ) : repos.length === 0 ? (
                  <EmptyState
                    icon={IconBrandGithub}
                    title="No repositories found"
                    description="Make sure your GitHub account has repositories and the token has repo access."
                  />
                ) : (
                  repos.map((repo) => (
                    <RepoCard
                      key={repo.fullName}
                      repo={repo}
                      selected={selectedRepo?.name === repo.name && selectedRepo?.owner === repo.owner}
                      onClick={() => selectRepo(repo.owner, repo.name)}
                    />
                  ))
                )}
              </div>

              {/* Right — PR list */}
              <div>
                {!selectedRepo ? (
                  <Card padding="lg" className="flex flex-col items-center justify-center py-16 gap-3">
                    <IconChevronRight size={32} strokeWidth={1.25} className="text-[#333]" />
                    <p className="text-[13px] text-[#444]">Select a repository to see its open PRs</p>
                  </Card>
                ) : (
                  <Card padding="none">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                      <div>
                        <p className="text-[13px] font-semibold text-white">
                          {selectedRepo.owner}/{selectedRepo.name}
                        </p>
                        <p className="text-[11px] text-[#555] mt-0.5">Open pull requests</p>
                      </div>
                      {prs.length > 0 && (
                        <Badge variant="neutral" size="sm">{prs.length} open</Badge>
                      )}
                    </div>

                    {/* PR rows */}
                    {prsLoading ? (
                      <div className="p-4 flex flex-col gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} height={52} />
                        ))}
                      </div>
                    ) : prs.length === 0 ? (
                      <EmptyState
                        icon={IconGitPullRequest}
                        title="No open pull requests"
                        description="This repository has no open PRs right now."
                      />
                    ) : (
                      <div>
                        {prs.map((pr) => (
                          <PRRow
                            key={pr.number}
                            pr={pr}
                            onReview={handleReviewPR}
                            loading={reviewing === pr.number}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}