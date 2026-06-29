import { CheckCircle, FileText, Layers, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ApplicationList,
  ApplicationListItem,
} from '@/components/ui/application-list';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import {
  ApplicationListSkeleton,
  PageHeaderSkeleton,
  StatsBarSkeleton,
} from '@/components/ui/skeleton';
import { StatsBar } from '@/components/ui/stats-bar';
import { useMyApplications } from '@/hooks/useApplications';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: apps = [], isLoading, isError } = useMyApplications();

  const stats = [
    {
      label: 'Drafts',
      value: apps.filter((a) => a.status === 'draft').length,
      icon: FileText,
      iconBg: 'bg-tan',
      iconColor: 'text-tan-text',
    },
    {
      label: 'In progress',
      value: apps.filter((a) =>
        ['submitted', 'under_review', 'changes_requested'].includes(a.status),
      ).length,
      icon: Layers,
      iconBg: 'bg-brand-muted',
      iconColor: 'text-brand',
    },
    {
      label: 'Approved',
      value: apps.filter((a) => a.status === 'approved').length,
      icon: CheckCircle,
      iconBg: 'bg-brand-muted',
      iconColor: 'text-brand',
    },
    {
      label: 'Total',
      value: apps.length,
      icon: FileText,
      iconBg: 'bg-tan/60',
      iconColor: 'text-tan-text',
    },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeaderSkeleton showAction />
        <StatsBarSkeleton count={4} />
        <ApplicationListSkeleton rows={4} title="Recent applications" />
      </>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load applications"
        description="Check your connection and try again."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Applications"
        description="Create, track, and manage your submissions."
        actions={
          <Button onClick={() => navigate('/applications/new')}>
            <Plus className="h-4 w-4" />
            New application
          </Button>
        }
      />

      <StatsBar items={stats} />

      {apps.length > 0 ? (
        <SectionCard title="Recent applications">
          <ApplicationList>
            {apps.map((app) => (
              <ApplicationListItem
                key={app.id}
                title={app.title}
                id={app.id}
                status={app.status}
                updatedAt={app.updatedAt}
                onClick={() => navigate(`/applications/${app.id}`)}
              />
            ))}
          </ApplicationList>
        </SectionCard>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Create your first application to get started."
          actionLabel="New application"
          onAction={() => navigate('/applications/new')}
        />
      )}
    </>
  );
}
