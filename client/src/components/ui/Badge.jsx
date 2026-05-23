const VARIANT_CLASSES = {
  pink:    'bg-pink-muted text-pink',
  success: 'bg-status-success/10 text-status-success',
  error:   'bg-status-error/10 text-status-error',
  warning: 'bg-status-warning/10 text-status-warning',
  info:    'bg-status-info/10 text-status-info',
  neutral: 'bg-dark-elevated text-[#888]',
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px] tracking-wide',
  md: 'px-2 py-0.5 text-[11px] tracking-wide',
};

/**
 * Pill badge with semantic color variants.
 *
 * @param {{
 *   variant?: 'pink'|'success'|'error'|'warning'|'info'|'neutral',
 *   size?: 'sm'|'md',
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Badge({
  variant = 'pink',
  size = 'md',
  children,
  className = '',
  ...rest
}) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'rounded-full font-medium uppercase',
        'whitespace-nowrap leading-none',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}