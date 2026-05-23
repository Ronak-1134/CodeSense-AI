import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

// ── Animation variants ────────────────────────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 4 },
};

const TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };

/**
 * Accessible modal dialog with Framer Motion animation and React portal.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   children: React.ReactNode,
 *   size?: 'sm'|'md'|'lg',
 *   hideClose?: boolean,
 * }} props
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false,
}) {
  // ── Keyboard: Escape closes ───────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Lock body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // ── Backdrop click: close only if clicking the backdrop itself ────────────
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={TRANSITION}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label={title}
        >
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={TRANSITION}
            className={[
              'w-full bg-dark-surface border border-dark-border rounded-xl',
              'shadow-lg flex flex-col',
              SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border shrink-0">
                {title && (
                  <h2 className="text-[15px] font-semibold text-white leading-none">
                    {title}
                  </h2>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1 rounded text-[#555] hover:text-white hover:bg-dark-elevated transition-colors duration-150"
                    aria-label="Close modal"
                  >
                    <IconX size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}