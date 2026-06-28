import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fmtDate, initials, isActiveStatus } from '@/api/mappers';
import { StatusBadge } from '@/components/StatusBadge';
import { useReviewerApplications } from '@/hooks/useApplications';
import type { UiStatus } from '@/types/ui';

type QueueFilter = 'all' | UiStatus;

export function QueuePage() {
  const navigate = useNavigate();
  const { data: apps = [], isLoading, isError } = useReviewerApplications();
  const [filter, setFilter] = useState<QueueFilter>('all');

  const queueApps = useMemo(
    () => apps.filter((a) => a.status !== 'draft'),
    [apps],
  );

  const counts = useMemo(() => ({
    all: queueApps.filter((a) => isActiveStatus(a.status)).length,
    submitted: queueApps.filter((a) => a.status === 'submitted').length,
    under_review: queueApps.filter((a) => a.status === 'under_review').length,
    changes_requested: queueApps.filter((a) => a.status === 'changes_requested').length,
  }), [queueApps]);

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return queueApps.filter((a) => isActiveStatus(a.status));
    }
    return queueApps.filter((a) => a.status === filter);
  }, [queueApps, filter]);

  if (isLoading) return <p style={{ color: '#8a8a8a' }}>Loading queue…</p>;
  if (isError) return <p style={{ color: '#8a8a8a' }}>Failed to load queue.</p>;

  const filters: { key: QueueFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'submitted', label: 'Submitted', count: counts.submitted },
    { key: 'under_review', label: 'Under review', count: counts.under_review },
    { key: 'changes_requested', label: 'Changes', count: counts.changes_requested },
  ];

  return (
    <>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>Review queue</h1>
        <p>Applications awaiting your review.</p>
      </div>

      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span>{f.count}</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: 660 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Applicant</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <td
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12.5px',
                      color: '#8a8a8a',
                    }}
                  >
                    {app.id}
                  </td>
                  <td style={{ fontWeight: 500, color: '#141414' }}>
                    {app.title}
                  </td>
                  <td style={{ color: '#7a7a7a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 23,
                          height: 23,
                          borderRadius: '50%',
                          border: '1px solid #dcdcdc',
                          background: '#fff',
                          color: '#7a7a7a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9.5px',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {initials(app.applicantId)}
                      </span>
                      {app.applicantId}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td
                    style={{
                      color: '#9a9a9a',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12px',
                    }}
                  >
                    {fmtDate(app.updatedAt)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#cfcfcf' }}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-title">Queue is clear</div>
          <p className="empty-state-text">No applications match this filter.</p>
        </div>
      )}
    </>
  );
}
