import { forwardRef } from 'react';
import { motion } from 'framer-motion';

// ── Variant styles ────────────────────────────────────────────────────────────
const VARIANT_CLASSES = {
  primary:
    'bg-pink text-white border border-transparent hover:bg-pink-hover active:scale-[0.97]',
  secondary:
    'bg-transparent text-[#888] border border-dark-borderHover hover:text-white hover:border-[#3A3A3A] active:scale-[0.97]',
  danger:
    'bg-transparent text-status-error border border-status-error/40 hover:border-status-error hover:bg-status-error/10 active:scale-[0.97]',
  ghost:
    'bg-transparent text-[#888] border border-transparent hover:bg-dark-elevated hover:text-white active:scale-[0.97]',
};

const SIZE_CLASSES = {
  sm: 'h-7 px-3 text-xs gap-1.5 rounded',
  md: 'h-8 px-4 text-sm gap-2 rounded',
  lg: 'h-10 px-5 text-[15px] gap-2 rounded',
};

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size }) {
  const dim = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <span
      className={`${dim} rounded-full border-2 border-current border-t-transparent animate-spin shrink-0`}
      aria-hidden="true"
    />
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    children,
    className = '',
    onClick,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={[
        'inline-flex items-center justify-center font-medium',
        'select-none cursor-pointer',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-dark-page',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Spinner size={size} />
      ) : Icon ? (
        <Icon
          size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0"
        />
      ) : null}

      {children && <span className="leading-none">{children}</span>}

      {IconRight && !loading && (
        <IconRight
          size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;