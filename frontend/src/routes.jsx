import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar';
import ProtectedRoute from './components/protected-routes';
import { ROLES } from './constants/roles';

import SetUser        from './pages/set-user/set-user';
import EditProfile    from './pages/edit-profile/edit-profile';
import Dashboard      from './components/dashboard';
import Users          from './pages/users/users';
import Profile        from './components/profile';
import Settings       from './components/settings';
import RequestHistory from './pages/request-history/request_history';
import TeamRequests  from './pages/team-requests/team_requests';
import Login          from './pages/login';
import ResetPassword  from './pages/reset_password';
import NewPassword    from './pages/new_password';


const Loading = () => <div className="loading-spinner">Carregando...</div>;

const AppLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{ flex: 1, marginLeft: '12vw' }}>
      <Outlet />
    </main>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<Loading />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: "/new-password",
    element: (
      <Suspense fallback={<Loading />}>
        <NewPassword />
      </Suspense>
    ),
  },
  {
    path: "/set-password",
    element: (
      <Suspense fallback={<Loading />}>
        <SetUser />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<Loading />}>
            {/* Only Admin (1) and Team Leader (2) can */}
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEAM_LEADER]}>
              <Users />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loading />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "users/edit-profile",
        element: (
          <Suspense fallback={<Loading />}>
            <EditProfile />
          </Suspense>
        ),
      },
      {
        path: "users/:userId",
        element: (
          <Suspense fallback={<Loading />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<Loading />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: "historico",
        element: (
          <Suspense fallback={<Loading />}>
            <RequestHistory />
          </Suspense>
        ),
      },
      {
        path: "equipas",
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEAM_LEADER]}>
              <TeamRequests />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
