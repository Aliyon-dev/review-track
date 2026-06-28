import { NavLink, useNavigate } from 'react-router-dom';
import { initials, isActiveStatus } from '@/api/mappers';
import { useAuth } from '@/context/AuthContext';
import { useReviewerApplications } from '@/hooks/useApplications';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb: string;
  mobileNavOpen: boolean;
  onMobileNavToggle: () => void;
  onMobileNavClose: () => void;
}

export function AppShell({
  children,
  breadcrumb,
  mobileNavOpen,
  onMobileNavToggle,
  onMobileNavClose,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isApplicant = user?.role === 'applicant';
  const { data: allApps } = useReviewerApplications(!isApplicant);

  const queueCount =
    allApps?.filter((a) => isActiveStatus(a.status)).length ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className={styles.shell}>
      {mobileNavOpen && (
        <div className={styles.overlay} onClick={onMobileNavClose} />
      )}

      <aside
        className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className={styles.brandName}>ApprovalFlow</span>
        </div>

        <div className={styles.menuLabel}>Menu</div>
        <nav className={styles.nav}>
          {isApplicant && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navActive : ''}`
                }
                onClick={onMobileNavClose}
              >
                <NavIconDashboard />
                Dashboard
              </NavLink>
              <NavLink
                to="/applications/new"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navActive : ''}`
                }
                onClick={onMobileNavClose}
              >
                <NavIconPlus />
                New application
              </NavLink>
            </>
          )}
          {!isApplicant && (
            <NavLink
              to="/queue"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navActive : ''}`
              }
              onClick={onMobileNavClose}
            >
              <NavIconQueue />
              Review queue
              <span className={styles.badge}>{queueCount}</span>
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navActive : ''}`
            }
            onClick={onMobileNavClose}
          >
            <NavIconProfile />
            Profile
          </NavLink>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials(user.name)}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>
                {isApplicant ? 'Applicant' : 'Reviewer'}
              </div>
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              title="Sign out"
              onClick={handleLogout}
            >
              <svg
                width="16"
                height="16"
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
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.topLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={onMobileNavToggle}
              aria-label="Toggle menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className={styles.crumb}>{breadcrumb}</div>
          </div>
          {isApplicant && (
            <button
              type="button"
              className={styles.newBtn}
              onClick={() => navigate('/applications/new')}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New application</span>
            </button>
          )}
        </header>
        <div className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </div>
      </main>
    </div>
  );
}

function NavIconDashboard() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function NavIconPlus() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function NavIconQueue() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function NavIconProfile() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
