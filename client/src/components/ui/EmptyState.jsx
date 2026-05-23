import Button from './Button.jsx';

/**
 * Centered empty state with optional icon, title, description, and CTA.
 *
 * @param {{
 *   icon?: React.ComponentType<{ size?: number, strokeWidth?: number, className?: string }>,
 *   title: string,
 *   description?: string,
 *   action?: {
 *     label: string,
 *     onClick: () => void,
 *     icon?: React.ComponentType,
 *   },
 *   className?: string,
 * }} props
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6',
        className,
      ].join(' ')}
    >
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-dark-elevated inline-flex">
          <Icon size={32} strokeWidth={1.25} className="text-[#444]" />
        </div>
      )}

      <h3 className="text-[16px] font-medium text-white leading-snug mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-[#888] leading-relaxed max-w-xs">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}