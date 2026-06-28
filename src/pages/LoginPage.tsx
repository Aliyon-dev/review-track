import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './LoginPage.module.css';

const DEMO_EMAILS = {
  applicant: 'alex.morgan@company.com',
  reviewer: 'jordan.lee@company.com',
};

export function LoginPage() {
  const [loginRole, setLoginRole] = useState<'applicant' | 'reviewer'>(
    'applicant',
  );
  const [email, setEmail] = useState(DEMO_EMAILS.applicant);
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'applicant' ? '/dashboard' : '/queue';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return null;
  }

  const pickApplicant = () => {
    setLoginRole('applicant');
    setEmail(DEMO_EMAILS.applicant);
  };

  const pickReviewer = () => {
    setLoginRole('reviewer');
    setEmail(DEMO_EMAILS.reviewer);
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const uiUser = await login(email, password);
      showToast('success', `Signed in as ${uiUser.name}`);
      navigate(uiUser.role === 'applicant' ? '/dashboard' : '/queue', {
        replace: true,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Sign in failed';
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg
              width="15"
              height="15"
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

        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>
          Choose a role to explore the workspace.
        </p>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${loginRole === 'applicant' ? styles.tabActive : ''}`}
            onClick={pickApplicant}
          >
            Applicant
          </button>
          <button
            type="button"
            className={`${styles.tab} ${loginRole === 'reviewer' ? styles.tabActive : ''}`}
            onClick={pickReviewer}
          >
            Reviewer
          </button>
        </div>

        <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>
          Email
        </label>
        <input
          type="email"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 18 }}
        />

        <label className="mono-label" style={{ display: 'block', marginBottom: 7 }}>
          Password
        </label>
        <input
          type="password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 28 }}
        />

        <button
          type="button"
          className={styles.signInBtn}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className={styles.demoHint}>
          Demo environment — credentials from your API
        </p>
      </div>
    </div>
  );
}
