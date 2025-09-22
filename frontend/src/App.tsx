import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AuthProvider, ProtectedRoute } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load pages for better performance
const Login = React.lazy(() => import('@/pages/auth/Login'));
const Register = React.lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/auth/ResetPassword'));
const Dashboard = React.lazy(() => import('@/pages/dashboard/Dashboard'));
const Profile = React.lazy(() => import('@/pages/profile/Profile'));
const Users = React.lazy(() => import('@/pages/users/Users'));
const Batches = React.lazy(() => import('@/pages/batches/Batches'));
const BatchDetails = React.lazy(() => import('@/pages/batches/BatchDetails'));
const Attendance = React.lazy(() => import('@/pages/attendance/Attendance'));
const Assignments = React.lazy(() => import('@/pages/assignments/Assignments'));
const AssignmentDetails = React.lazy(() => import('@/pages/assignments/AssignmentDetails'));
const Materials = React.lazy(() => import('@/pages/materials/Materials'));
const Payments = React.lazy(() => import('@/pages/payments/Payments'));
const NotFound = React.lazy(() => import('@/pages/error/NotFound'));
const Unauthorized = React.lazy(() => import('@/pages/error/Unauthorized'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <AuthProvider>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Protected Routes */}
                  <Route element={
                    <ProtectedRoute>
                      <Outlet />
                    </ProtectedRoute>
                  }>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/batches" element={<Batches />} />
                    <Route path="/batches/:id" element={<BatchDetails />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/assignments" element={<Assignments />} />
                    <Route path="/assignments/:id" element={<AssignmentDetails />} />
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/payments" element={<Payments />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" />
            </AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </ReduxProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

export default App;
