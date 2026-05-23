/**
 * Skeleton loading placeholder. Uses CSS pulse animation — no Framer Motion.
 *
 * @param {{
 *   variant?: 'text'|'card'|'circle',
 *   width?: string | number,
 *   height?: string | number,
 *   className?: string,
 *   lines?: number,   ← for variant='text': render N stacked text skeletons
 * }} props
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
}) {
  const inlineStyle = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const base = 'bg-dark-elevated animate-pulse';

  if (variant === 'circle') {
    return (
      <span
        style={inlineStyle}
        className={`${base} rounded-full block ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <span
        style={inlineStyle}
        className={`${base} rounded-xl block ${className}`}
        aria-hidden="true"
      />
    );
  }

  // variant === 'text' — supports multi-line via `lines` prop
  if (lines > 1) {
    return (
      <span className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            style={{
              // Last line slightly shorter for realism
              width: i === lines - 1 ? '72%' : '100%',
            }}
            className={`${base} h-4 rounded block`}
            aria-hidden="true"
          />
        ))}
      </span>
    );
  }

  return (
    <span
      style={inlineStyle}
      className={`${base} h-4 rounded block ${className}`}
      aria-hidden="true"
    />
  );
}