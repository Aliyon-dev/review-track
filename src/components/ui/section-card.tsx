import { cn } from '@/lib/cn';

export function SectionCard({
  title,
  action,
  actionLabel,
  onAction,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-brand/10 bg-white shadow-sm',
        className,
      )}
    >
      {(title || action || actionLabel) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand/5">
          {title && (
            <h2 className="font-serif text-lg font-semibold text-brand">
              {title}
            </h2>
          )}
          {action}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="text-sm text-brand/60 hover:text-brand transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
