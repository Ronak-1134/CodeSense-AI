// ── Position config ───────────────────────────────────────────────────────────
const POSITION_CLASSES = {
  top: {
    wrapper: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-dark-elevated',
    arrowBorder: 'border-l-transparent border-r-transparent border-b-transparent border-t-[5px] border-l-[5px] border-r-[5px]',
  },
  bottom: {
    wrapper: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-dark-elevated',
    arrowBorder: 'border-l-transparent border-r-transparent border-t-transparent border-b-[5px] border-l-[5px] border-r-[5px]',
  },
  left: {
    wrapper: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-dark-elevated',
    arrowBorder: 'border-t-transparent border-b-transparent border-r-transparent border-l-[5px] border-t-[5px] border-b-[5px]',
  },
  right: {
    wrapper: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-dark-elevated',
    arrowBorder: 'border-t-transparent border-b-transparent border-l-transparent border-r-[5px] border-t-[5px] border-b-[5px]',
  },
};

/**
 * Pure-CSS tooltip using Tailwind group-hover.
 * Wraps its child in a relative container; no JS required.
 *
 * @param {{
 *   content: string,
 *   children: React.ReactNode,
 *   position?: 'top'|'bottom'|'left'|'right',
 *   className?: string,
 * }} props
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}) {
  if (!content) return children;

  const pos = POSITION_CLASSES[position] ?? POSITION_CLASSES.top;

  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}

      {/* Tooltip bubble */}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute z-50 whitespace-nowrap',
          'px-2 py-1 rounded',
          'bg-dark-elevated border border-dark-borderHover',
          'text-[11px] font-medium text-white leading-none',
          'shadow-md',
          // Visibility + transition
          'opacity-0 group-hover:opacity-100',
          'scale-95 group-hover:scale-100',
          'transition-all duration-150 ease-out',
          pos.wrapper,
        ].join(' ')}
      >
        {content}

        {/* Arrow */}
        <span
          aria-hidden="true"
          className={[
            'absolute w-0 h-0 border-solid',
            pos.arrow,
            pos.arrowBorder,
          ].join(' ')}
        />
      </span>
    </span>
  );
}