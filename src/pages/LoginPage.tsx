import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { useSubmitLock } from '@/lib/use-submit-lock';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

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
  const runLocked = useSubmitLock();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'applicant' ? '/dashboard' : '/queue';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) return null;

  const handleSignIn = () =>
    runLocked(async () => {
      setLoading(true);
      try {
        const uiUser = await login(email, password);
        showToast('success', `Signed in as ${uiUser.name}`);
        navigate(uiUser.role === 'applicant' ? '/dashboard' : '/queue', {
          replace: true,
        });
      } catch (err) {
        showToast(
          'error',
          err instanceof ApiError ? err.message : 'Sign in failed',
        );
      } finally {
        setLoading(false);
      }
    });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-canvas via-white to-brand-muted/40 px-4 py-12">
      <Card className="w-full max-w-[400px] p-8 shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-md">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-brand">
            ReviewTrack
          </span>
        </div>

        <h1 className="font-serif text-2xl font-semibold tracking-tight text-brand">
          Sign in
        </h1>
        <p className="mt-1.5 text-sm text-brand/60">
          Choose a role to explore the workspace.
        </p>

        <div className="mt-6 flex gap-1 rounded-lg border border-brand/15 bg-canvas p-1">
          {(['applicant', 'reviewer'] as const).map((role) => (
            <button
              key={role}
              type="button"
              disabled={loading}
              onClick={() => {
                setLoginRole(role);
                setEmail(DEMO_EMAILS[role]);
              }}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                loginRole === role
                  ? 'bg-brand-muted text-brand shadow-sm'
                  : 'text-brand/50 hover:text-brand',
              )}
            >
              {role === 'applicant' ? 'Applicant' : 'Reviewer'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="mt-2 w-full" loading={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-brand/40 font-mono">
          Demo environment — credentials from your API
        </p>
      </Card>
    </div>
  );
}
