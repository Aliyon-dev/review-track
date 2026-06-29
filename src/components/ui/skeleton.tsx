import { cn } from '@/lib/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-brand/10', className)}
      {...props}
    />
  );
}

export function ApplicationListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-brand/5 last:border-0">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-48 max-w-full mb-2" />
        <Skeleton className="h-3 w-36 max-w-full" />
      </div>
      <Skeleton className="hidden sm:block h-6 w-24 rounded-full shrink-0" />
      <Skeleton className="hidden md:block h-3 w-20 shrink-0" />
      <Skeleton className="h-4 w-4 shrink-0 rounded" />
    </div>
  );
}

export function ApplicationListSkeleton({
  rows = 4,
  title,
}: {
  rows?: number;
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-brand/10 bg-white shadow-sm">
      {title && (
        <div className="px-5 py-4 border-b border-brand/5">
          <Skeleton className="h-6 w-40" />
        </div>
      )}
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <ApplicationListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function StatsBarSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="mb-8 flex flex-wrap items-center rounded-xl border border-brand/10 bg-white shadow-sm"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-1 min-w-[140px] items-center gap-4 px-6 py-5',
            i > 0 && 'border-l border-brand/10',
          )}
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div>
            <Skeleton className="h-7 w-8 mb-1.5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton({
  showAction = false,
  className,
}: {
  showAction?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div>
        <Skeleton className="h-9 w-56 max-w-full mb-2" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {showAction && <Skeleton className="h-9 w-36 shrink-0 rounded-lg" />}
    </div>
  );
}

export function FilterPillsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-28 rounded-full" />
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-16 mb-4" />
      <div className="mb-8">
        <Skeleton className="h-6 w-24 rounded-full mb-3" />
        <Skeleton className="h-9 w-80 max-w-full mb-2" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-brand/10 bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-brand/5">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="px-5 py-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-brand/10 bg-white shadow-sm p-5">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-9 w-full mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="rounded-xl border border-brand/10 bg-white shadow-sm p-5">
            <Skeleton className="h-6 w-20 mb-4" />
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

export function FormPageSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-16 mb-4" />
      <PageHeaderSkeleton className="mb-6" />
      <div className="max-w-2xl rounded-xl border border-brand/10 bg-white shadow-sm p-6 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2 justify-end max-w-2xl">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-brand/10 bg-white p-4 shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return <ApplicationListSkeleton rows={rows} />;
}
