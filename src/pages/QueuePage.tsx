import { useMemo, useState } from 'react';
import {
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isActiveStatus } from '@/api/mappers';
import {
  ApplicationList,
  ApplicationListItem,
} from '@/components/ui/application-list';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import {
  ApplicationListSkeleton,
  FilterPillsSkeleton,
  PageHeaderSkeleton,
  StatsBarSkeleton,
} from '@/components/ui/skeleton';
import { StatsBar } from '@/components/ui/stats-bar';
import { cn } from '@/lib/cn';
import { useReviewerApplications } from '@/hooks/useApplications';
import type { UiStatus } from '@/types/ui';

type QueueFilter = 'active' | UiStatus;

const LIST_TITLES: Record<QueueFilter, string> = {
  active: 'Applications in queue',
  submitted: 'Submitted applications',
  under_review: 'Under review',
  changes_requested: 'Changes requested',
  approved: 'Approved applications',
  rejected: 'Rejected applications',
  draft: 'Draft applications',
};

export function QueuePage() {
  const navigate = useNavigate();
  const { data: apps = [], isLoading, isError } = useReviewerApplications();
  const [filter, setFilter] = useState<QueueFilter>('active');

  const queueApps = useMemo(
    () => apps.filter((a) => a.status !== 'draft'),
    [apps],
  );

  const counts = useMemo(
    () => ({
      active: queueApps.filter((a) => isActiveStatus(a.status)).length,
      submitted: queueApps.filter((a) => a.status === 'submitted').length,
      under_review: queueApps.filter((a) => a.status === 'under_review').length,
      changes_requested: queueApps.filter((a) => a.status === 'changes_requested').length,
      approved: queueApps.filter((a) => a.status === 'approved').length,
      rejected: queueApps.filter((a) => a.status === 'rejected').length,
    }),
    [queueApps],
  );

  const filtered = useMemo(() => {
    if (filter === 'active') {
      return queueApps.filter((a) => isActiveStatus(a.status));
    }
    return queueApps.filter((a) => a.status === filter);
  }, [queueApps, filter]);

  const stats = [
    {
      label: 'Active',
      value: counts.active,
      icon: Layers,
      iconBg: 'bg-brand-muted',
      iconColor: 'text-brand',
    },
    {
      label: 'Submitted',
      value: counts.submitted,
      icon: Clock,
      iconBg: 'bg-tan',
      iconColor: 'text-tan-text',
    },
    {
      label: 'Under review',
      value: counts.under_review,
      icon: CheckCircle,
      iconBg: 'bg-brand-muted',
      iconColor: 'text-brand',
    },
    {
      label: 'Approved',
      value: counts.approved,
      icon: CheckCircle,
      iconBg: 'bg-brand-muted',
      iconColor: 'text-brand',
    },
  ];

  const filters: { key: QueueFilter; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'submitted', label: 'Submitted', count: counts.submitted },
    { key: 'under_review', label: 'Under review', count: counts.under_review },
    { key: 'changes_requested', label: 'Changes', count: counts.changes_requested },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const listTitle = LIST_TITLES[filter] ?? 'Applications';

  if (isLoading) {
    return (
      <>
        <PageHeaderSkeleton />
        <StatsBarSkeleton count={4} />
        <FilterPillsSkeleton count={6} />
        <ApplicationListSkeleton rows={4} title="Applications in queue" />
      </>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load queue"
        description="Check your connection and try again."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Review queue"
        description="Review active applications and browse approved or rejected submissions."
      />

      <StatsBar items={stats} />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium font-mono uppercase tracking-wide transition-colors',
              filter === f.key
                ? 'border-brand bg-brand text-white'
                : 'border-brand/15 bg-white text-brand/60 hover:border-brand/30 hover:bg-brand-muted/50',
            )}
          >
            {f.label}
            <span className={cn(filter === f.key ? 'text-white/70' : 'text-brand/40')}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <SectionCard title={listTitle}>
          <ApplicationList>
            {filtered.map((app) => (
              <ApplicationListItem
                key={app.id}
                title={app.title}
                id={app.id}
                status={app.status}
                updatedAt={app.updatedAt}
                subtitle={app.applicantName ?? app.applicantId}
                onClick={() => navigate(`/applications/${app.id}`)}
              />
            ))}
          </ApplicationList>
        </SectionCard>
      ) : (
        <EmptyState
          title={
            filter === 'approved'
              ? 'No approved applications'
              : filter === 'rejected'
                ? 'No rejected applications'
                : 'Queue is clear'
          }
          description="No applications match this filter."
        />
      )}
    </>
  );
}
