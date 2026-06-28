import { useNavigate } from 'react-router-dom';
import { initials } from '@/api/mappers';
import { useAuth } from '@/context/AuthContext';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>Profile</h1>
        <p>Your account and workspace details.</p>
      </div>

      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.avatar}>{initials(user.name)}</div>
          <div>
            <div className={styles.name}>{user.name}</div>
            <div className={styles.subtitle}>
              {user.role === 'applicant' ? 'Program Manager' : 'Senior Reviewer'}
            </div>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div>
            <div className={styles.metaLabel}>Role</div>
            <div className={styles.metaValue}>
              {user.role === 'applicant' ? 'Applicant' : 'Reviewer'}
            </div>
          </div>
          <div>
            <div className={styles.metaLabel}>Email</div>
            <div className={styles.metaValue}>{user.email}</div>
          </div>
          <div>
            <div className={styles.metaLabel}>Workspace</div>
            <div className={styles.metaValue}>ApprovalFlow</div>
          </div>
        </div>

        <div className={styles.logoutSection}>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
