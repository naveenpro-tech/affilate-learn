'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import DashboardLayout from './DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  useLayout?: boolean; // Option to disable layout for specific pages
}

export default function ProtectedRoute({ children, requireAdmin = false, useLayout = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (!isLoading && isAuthenticated && requireAdmin && !user?.is_admin) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, requireAdmin, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-900">Loading...</p>
          <p className="mt-2 text-sm text-gray-600">Please wait while we load your content</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Admin privileges are required.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Wrap children in DashboardLayout if useLayout is true
  if (useLayout) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <>{children}</>;
}

