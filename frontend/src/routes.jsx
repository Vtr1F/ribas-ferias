import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './layouts/main-layout';
import ProtectedRoute from './components/protected-routes';
import { ROLES } from './constants/roles';
const Dashboard = lazy(() => import('./pages/dashboard'));
const Users = lazy(() => import('./pages/users/users'));
const Login = lazy(() => import('./pages/login'));
const ResetPassword = lazy(() => import('./pages/reset_password'));
const NewPassword = lazy(() => import('./pages/new_password'));

const Loading = () => <div className="loading-spinner">Carregando...</div>;

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
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout /> {/* This component MUST have an <Outlet /> inside it */}
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
        index: true, // This handles the base "/" path
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);