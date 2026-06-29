import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initials } from '@/api/mappers';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/context/AuthContext';

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
      <PageHeader
        title="Profile"
        description="Your account and workspace details."
        className="mb-6"
      />

      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 pb-6 border-b border-brand/5">
            <Avatar size="lg">{initials(user.name)}</Avatar>
            <div>
              <div className="text-lg font-semibold text-brand">{user.name}</div>
              <div className="text-sm text-brand/60">
                {user.role === 'applicant' ? 'Program Manager' : 'Senior Reviewer'}
              </div>
            </div>
          </div>

          <div className="grid gap-6 py-6 sm:grid-cols-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                Role
              </div>
              <div className="text-sm font-medium text-brand">
                {user.role === 'applicant' ? 'Applicant' : 'Reviewer'}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                Email
              </div>
              <div className="text-sm font-medium text-brand">{user.email}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-brand/40 font-mono mb-1">
                Workspace
              </div>
              <div className="text-sm font-medium text-brand">ApprovalFlow</div>
            </div>
          </div>

          <div className="border-t border-brand/5 pt-5">
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
