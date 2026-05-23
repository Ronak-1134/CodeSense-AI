const PADDING = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

/**
 * Base card surface. Dark background, subtle border, rounded corners.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   padding?: 'none'|'sm'|'md'|'lg',
 *   hoverable?: boolean,
 *   onClick?: () => void,
 *   as?: keyof JSX.IntrinsicElements,
 * }} props
 */
export default function Card({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      onClick={onClick}
      className={[
        'bg-dark-card border border-dark-border rounded-xl',
        'transition-colors duration-150',
        hoverable
          ? 'hover:border-dark-borderHover hover:bg-dark-elevated cursor-pointer'
          : '',
        onClick ? 'cursor-pointer' : '',
        PADDING[padding] ?? PADDING.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}