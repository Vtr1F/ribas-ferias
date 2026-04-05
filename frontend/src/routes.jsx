import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar';
import ProtectedRoute from './components/protected-routes';
import { ROLES } from './constants/roles';
const SetUser = lazy(() => import('./pages/set-user/set-user'));
const Dashboard = lazy(() => import('./components/dashboard'));
const Users = lazy(() => import('./pages/users/users'));
const Profile = lazy(() => import('./components/profile'));
const Settings = lazy(() => import('./components/settings'));
const Login = lazy(() => import('./pages/login'));
const ResetPassword = lazy(() => import('./pages/reset_password'));
const NewPassword = lazy(() => import('./pages/new_password'));

const Loading = () => <div className="loading-spinner">Carregando...</div>;

const AppLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{ flex: 1, marginLeft: '9vw' }}>
      <Outlet />
    </main>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/login",element: (
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
        path: "settings",
        element: (
            <Suspense fallback={<Loading />}>
                <Settings />
            </Suspense>
        ),
      },
      {
        index: true, // This handles the base "/" path
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);