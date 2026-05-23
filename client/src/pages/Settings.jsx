import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  IconBrandGithub, IconShieldCheck, IconTrash, IconAlertTriangle,
  IconCheck, IconExternalLink,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

import AppLayout from '@components/layout/AppLayout.jsx';
import Card from '@components/ui/Card.jsx';
import Button from '@components/ui/Button.jsx';
import Badge from '@components/ui/Badge.jsx';
import Modal from '@components/ui/Modal.jsx';

import { selectUser, selectUserPlan, selectGithubConnected } from '@features/auth/authSelectors';
import { logoutUser, updatePlan } from '@features/auth/authSlice';
import { loginWithGithub } from '@features/auth/authSlice';
import { post } from '@services/api';

const FREE_LIMIT = 15;

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
        {description && <p className="text-[13px] text-[#555] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 64 }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User'}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-dark-border"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span
      className="rounded-full bg-pink-muted text-pink font-semibold flex items-center justify-center
                 ring-2 ring-pink-border text-lg"
      style={{ width: size, height: size, minWidth: size }}
    >
      {initials}
    </span>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Confirm', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="px-5 py-4 flex flex-col gap-4">
        <p className="text-[13px] text-[#888] leading-relaxed">{description}</p>
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" size="sm" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const plan = useSelector(selectUserPlan);
  const githubConnected = useSelector(selectGithubConnected);

  const [modal, setModal] = useState(null); // 'deleteReviews' | 'deleteAccount'
  const [modalLoading, setModalLoading] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);

  const reviewsUsed = user?.reviewsThisMonth ?? 0;
  const usagePct = Math.min((reviewsUsed / FREE_LIMIT) * 100, 100);
  const isPro = plan === 'pro';

  // ── GitHub connect ────────────────────────────────────────────────────────
  async function handleConnectGithub() {
    setConnectingGithub(true);
    try {
      await dispatch(loginWithGithub()).unwrap();
      toast.success('GitHub connected successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to connect GitHub.');
    } finally {
      setConnectingGithub(false);
    }
  }

  // ── Delete all reviews ────────────────────────────────────────────────────
  async function handleDeleteReviews() {
    setModalLoading(true);
    try {
      await post('/review/delete-all');
      toast.success('All reviews deleted.');
      setModal(null);
    } catch {
      toast.error('Failed to delete reviews.');
    } finally {
      setModalLoading(false);
    }
  }

  // ── Delete account ────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    setModalLoading(true);
    try {
      await post('/auth/delete-account');
      await dispatch(logoutUser());
      toast.success('Account deleted.');
    } catch {
      toast.error('Failed to delete account.');
    } finally {
      setModalLoading(false);
      setModal(null);
    }
  }

  return (
    <AppLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-0 max-w-2xl"
      >

        {/* ── Profile ─────────────────────────────────────────────────────── */}
        <div className="py-8">
          <Section title="Profile" description="Your account information from your sign-in provider.">
            <Card padding="md">
              <div className="flex items-center gap-5">
                <Avatar user={user} size={56} />
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white leading-tight truncate">
                    {user?.displayName || 'No name set'}
                  </p>
                  <p className="text-[13px] text-[#555] truncate">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={isPro ? 'pink' : 'neutral'} size="sm">
                      {isPro ? 'Pro' : 'Free'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </Section>
        </div>

        <div className="h-px bg-dark-border" />

        {/* ── GitHub ──────────────────────────────────────────────────────── */}
        <div className="py-8">
          <Section
            title="GitHub Integration"
            description="Connect GitHub to review pull requests and post inline comments."
          >
            <Card padding="md">
              {githubConnected ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-status-success/10">
                      <IconShieldCheck size={18} strokeWidth={1.75} className="text-status-success" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-white">GitHub Connected</p>
                      <p className="text-[12px] text-[#555] mt-0.5">
                        You can review pull requests and post inline comments.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast('GitHub disconnect coming soon.')}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-dark-elevated">
                      <IconBrandGithub size={18} strokeWidth={1.75} className="text-[#666]" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-white">Connect GitHub</p>
                      <p className="text-[12px] text-[#555] mt-0.5">
                        Required for PR reviews and inline comment posting.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={IconBrandGithub}
                    loading={connectingGithub}
                    onClick={handleConnectGithub}
                  >
                    Connect
                  </Button>
                </div>
              )}
            </Card>
          </Section>
        </div>

        <div className="h-px bg-dark-border" />

        {/* ── Plan ────────────────────────────────────────────────────────── */}
        <div className="py-8">
          <Section title="Plan & Usage" description="Your current plan and monthly review usage.">
            <Card padding="md" className="flex flex-col gap-4">
              {/* Plan info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={isPro ? 'pink' : 'neutral'}>{isPro ? 'Pro' : 'Free'}</Badge>
                  <span className="text-[13px] text-[#555]">
                    {isPro ? 'Unlimited reviews' : `${FREE_LIMIT} reviews / month`}
                  </span>
                </div>
                {!isPro && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={IconExternalLink}
                    onClick={() => toast('Upgrade page coming soon.')}
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>

              {/* Usage meter — free only */}
              {!isPro && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#666]">Reviews this month</span>
                    <span className="text-white tabular-nums font-medium">
                      {reviewsUsed}
                      <span className="text-[#444] font-normal"> / {FREE_LIMIT}</span>
                    </span>
                  </div>
                  <div className="h-[4px] rounded-full bg-dark-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-pink transition-all duration-500"
                      style={{ width: `${usagePct}%` }}
                      role="progressbar"
                      aria-valuenow={reviewsUsed}
                      aria-valuemin={0}
                      aria-valuemax={FREE_LIMIT}
                    />
                  </div>
                  <p className="text-[11px] text-[#444]">
                    Resets on{' '}
                    {user?.monthResetDate
                      ? new Date(user.monthResetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                      : 'the 1st of next month'}
                  </p>
                </div>
              )}

              {isPro && (
                <div className="flex items-center gap-2 text-[13px] text-[#888]">
                  <IconCheck size={14} strokeWidth={2} className="text-status-success" />
                  {reviewsUsed} reviews run this month
                </div>
              )}
            </Card>
          </Section>
        </div>

        <div className="h-px bg-dark-border" />

        {/* ── Danger zone ──────────────────────────────────────────────────── */}
        <div className="py-8">
          <Section
            title="Danger Zone"
            description="These actions are permanent and cannot be undone."
          >
            <Card padding="md" className="border-status-error/20">
              <div className="flex flex-col gap-4">
                {/* Delete all reviews */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-white">Delete all reviews</p>
                    <p className="text-[12px] text-[#555] mt-0.5">
                      Permanently delete all your code reviews and results.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={IconTrash}
                    onClick={() => setModal('deleteReviews')}
                  >
                    Delete
                  </Button>
                </div>

                <div className="h-px bg-dark-border" />

                {/* Delete account */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-white">Delete account</p>
                    <p className="text-[12px] text-[#555] mt-0.5">
                      Permanently delete your account, all reviews, and associated data.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={IconAlertTriangle}
                    onClick={() => setModal('deleteAccount')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </Section>
        </div>
      </motion.div>

      {/* ── Confirmation modals ─────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={modal === 'deleteReviews'}
        onClose={() => setModal(null)}
        onConfirm={handleDeleteReviews}
        loading={modalLoading}
        title="Delete all reviews?"
        description="This will permanently delete all your code reviews, results, and issue data. This action cannot be undone."
        confirmLabel="Yes, delete all"
      />

      <ConfirmModal
        isOpen={modal === 'deleteAccount'}
        onClose={() => setModal(null)}
        onConfirm={handleDeleteAccount}
        loading={modalLoading}
        title="Delete your account?"
        description="This will permanently delete your account, all reviews, and all associated data. You will be signed out immediately. This cannot be undone."
        confirmLabel="Yes, delete account"
      />
    </AppLayout>
  );
}