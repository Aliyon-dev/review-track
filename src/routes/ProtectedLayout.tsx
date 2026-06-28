import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AppShell } from '@/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import type { UiRole } from '@/types/ui';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Applications',
  '/applications/new': 'New application',
  '/queue': 'Review queue',
  '/profile': 'Profile',
};

function getBreadcrumb(pathname: string): string {
  if (pathname.match(/^\/applications\/[^/]+\/edit$/)) return 'Edit application';
  if (pathname.match(/^\/applications\/[^/]+$/)) return 'Application detail';
  return BREADCRUMBS[pathname] ?? 'ApprovalFlow';
}

export function ProtectedLayout({ role }: { role?: UiRole }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    const redirect = user?.role === 'applicant' ? '/dashboard' : '/queue';
    return <Navigate to={redirect} replace />;
  }

  return (
    <AppShell
      breadcrumb={getBreadcrumb(location.pathname)}
      mobileNavOpen={mobileNavOpen}
      onMobileNavToggle={() => setMobileNavOpen((o) => !o)}
      onMobileNavClose={() => setMobileNavOpen(false)}
    >
      <Outlet />
    </AppShell>
  );
}
