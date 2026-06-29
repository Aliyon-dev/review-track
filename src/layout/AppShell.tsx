import { NavLink, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  ShoppingBag,
  User,
} from 'lucide-react';
import { initials, isActiveStatus } from '@/api/mappers';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import { useReviewerApplications } from '@/hooks/useApplications';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb: string;
  mobileNavOpen: boolean;
  onMobileNavToggle: () => void;
  onMobileNavClose: () => void;
}

function NavItem({
  to,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-muted text-brand'
            : 'text-brand/60 hover:bg-brand-muted/50 hover:text-brand',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="font-mono text-xs text-brand/40">{badge}</span>
      )}
    </NavLink>
  );
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
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-brand/40 lg:hidden"
          onClick={onMobileNavClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-brand/10 bg-sidebar px-3 py-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 px-2 pb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-brand">
            ReviewTrack
          </span>
        </div>

        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-widest text-brand/40 font-mono">
          Menu
        </p>
        <nav className="flex flex-col gap-0.5">
          {isApplicant && (
            <>
              <NavItem
                to="/dashboard"
                icon={LayoutGrid}
                label="Dashboard"
                onClick={onMobileNavClose}
              />
              <NavItem
                to="/applications/new"
                icon={Plus}
                label="New application"
                onClick={onMobileNavClose}
              />
            </>
          )}
          {!isApplicant && (
            <NavItem
              to="/queue"
              icon={ShoppingBag}
              label="Review queue"
              badge={queueCount}
              onClick={onMobileNavClose}
            />
          )}
          <NavItem
            to="/profile"
            icon={User}
            label="Profile"
            onClick={onMobileNavClose}
          />
        </nav>

        <div className="relative mt-auto">
          <div
            className="pointer-events-none absolute -bottom-2 -left-4 h-32 w-32 rounded-full bg-brand-muted/60 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-8 -left-8 h-24 w-24 rounded-full bg-tan/40 blur-xl"
            aria-hidden
          />

          <div className="relative border-t border-brand/10 pt-4">
            <div className="flex items-center gap-2.5 px-2">
              <Avatar size="md">{initials(user.name)}</Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-brand">
                  {user.name}
                </div>
                <div className="text-xs text-brand/50 font-mono">
                  {isApplicant ? 'Applicant' : 'Reviewer'}
                </div>
              </div>
              <button
                type="button"
                title="Sign out"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-brand/40 hover:bg-brand-muted hover:text-brand transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <ChevronDown className="h-4 w-4 text-brand/30 shrink-0" />
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex flex-col min-h-screen bg-canvas">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-brand/10 bg-canvas/90 px-4 backdrop-blur-sm lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-brand/60 hover:bg-brand-muted lg:hidden"
            onClick={onMobileNavToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium uppercase tracking-wider text-brand/40 font-mono lg:ml-0 ml-3">
            {breadcrumb}
          </span>
        </header>

        <div className="flex-1 px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
