import { cn } from '@/lib/cn';
import type { UiStatus } from '@/types/ui';

const statusStyles: Record<UiStatus, string> = {
  draft: 'bg-brand/5 text-brand/50 border-brand/10',
  submitted: 'bg-tan text-tan-text border-tan',
  under_review: 'bg-brand-muted text-brand border-brand/15',
  approved: 'bg-brand-muted text-brand border-brand/15',
  rejected: 'bg-red-50 text-red-700 border-red-100',
  changes_requested: 'bg-tan text-tan-text border-tan border-dashed',
};

const dotStyles: Record<UiStatus, string> = {
  draft: 'bg-brand/30',
  submitted: 'bg-tan-text',
  under_review: 'bg-brand/60',
  approved: 'bg-brand',
  rejected: 'bg-red-500',
  changes_requested: 'bg-tan-text',
};

const labels: Record<UiStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
};

export function StatusBadge({ status }: { status: UiStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wide font-mono whitespace-nowrap',
        statusStyles[status],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotStyles[status])} />
      {labels[status]}
    </span>
  );
}
