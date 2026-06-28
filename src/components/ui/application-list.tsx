import { Calendar, ChevronRight, FileText } from 'lucide-react';
import { formatApplicationId, fmtDate } from '@/api/mappers';
import { StatusBadge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { UiStatus } from '@/types/ui';

const iconStyles: Record<UiStatus, { bg: string; color: string }> = {
  draft: { bg: 'bg-tan', color: 'text-tan-text' },
  submitted: { bg: 'bg-tan', color: 'text-tan-text' },
  under_review: { bg: 'bg-brand-muted', color: 'text-brand' },
  approved: { bg: 'bg-brand-muted', color: 'text-brand' },
  rejected: { bg: 'bg-red-50', color: 'text-red-600' },
  changes_requested: { bg: 'bg-tan', color: 'text-tan-text' },
};

export function ApplicationListItem({
  title,
  id,
  status,
  updatedAt,
  subtitle,
  onClick,
  className,
}: {
  title: string;
  id: string;
  status: UiStatus;
  updatedAt: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}) {
  const iconStyle = iconStyles[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-muted/30 border-b border-brand/5 last:border-0',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          iconStyle.bg,
        )}
      >
        <FileText className={cn('h-4 w-4', iconStyle.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-medium text-brand truncate">{title}</div>
        <div className="mt-0.5 text-xs text-brand/50 font-mono">
          {subtitle ?? `Application ID: ${formatApplicationId(id)}`}
        </div>
      </div>

      <div className="hidden sm:block shrink-0">
        <StatusBadge status={status} />
      </div>

      <div className="hidden md:flex shrink-0 items-center gap-1.5 text-xs text-brand/50 font-mono">
        <Calendar className="h-3.5 w-3.5" />
        {fmtDate(updatedAt)}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-brand/25" />
    </button>
  );
}

export function ApplicationList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('divide-y divide-brand/5', className)}>
      {children}
    </div>
  );
}
