import { useNavigate } from 'react-router-dom';
import { fmtDate } from '@/api/mappers';
import { StatusBadge } from '@/components/StatusBadge';
import { useMyApplications } from '@/hooks/useApplications';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: apps = [], isLoading, isError } = useMyApplications();

  const stats = {
    drafts: apps.filter((a) => a.status === 'draft').length,
    active: apps.filter((a) =>
      ['submitted', 'under_review', 'changes_requested'].includes(a.status),
    ).length,
    approved: apps.filter((a) => a.status === 'approved').length,
    total: apps.length,
  };

  if (isLoading) return <p className={styles.loading}>Loading applications…</p>;
  if (isError) return <p className={styles.error}>Failed to load applications.</p>;

  return (
    <>
      <div className="page-header">
        <h1>Applications</h1>
        <p>Create, track, and manage your submissions.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-cell">
          <div className="stat-value">{stats.drafts}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">In progress</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {apps.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <td style={{ fontWeight: 500, color: '#141414' }}>
                    {app.title}
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
                  <td style={{ textAlign: 'right' }}>
                    {app.status === 'draft' && (
                      <button
                        type="button"
                        className={styles.editBtn}
                        title="Edit draft"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}/edit`);
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-title">No applications yet</div>
          <p className="empty-state-text">
            Create your first application to get started.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/applications/new')}
          >
            New application
          </button>
        </div>
      )}
    </>
  );
}
