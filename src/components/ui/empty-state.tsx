import { cn } from '@/lib/cn';
import { Button } from './button';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-brand/15 bg-white px-6 py-14 text-center',
        className,
      )}
    >
      <div className="text-sm font-medium text-brand">{title}</div>
      {description && (
        <p className="mt-1.5 text-sm text-brand/60">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
