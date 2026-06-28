import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastStack } from '@/components/ToastStack';
import { ProtectedLayout } from '@/routes/ProtectedLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplicationFormPage } from '@/pages/ApplicationFormPage';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage';
import { QueuePage } from '@/pages/QueuePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { useAuth } from '@/context/AuthContext';

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user?.role === 'applicant' ? '/dashboard' : '/queue'}
      replace
    />
  );
}

export function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        </Route>

        <Route element={<ProtectedLayout role="applicant" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/applications/new" element={<ApplicationFormPage />} />
          <Route
            path="/applications/:id/edit"
            element={<ApplicationFormPage />}
          />
        </Route>

        <Route element={<ProtectedLayout role="reviewer" />}>
          <Route path="/queue" element={<QueuePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastStack />
    </>
  );
}

export function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
