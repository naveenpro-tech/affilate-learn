'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
            Affiliate Learning
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
              Dashboard
            </Link>
            <Link href="/packages" className="text-gray-700 hover:text-indigo-600">
              Packages
            </Link>
            <Link href="/courses" className="text-gray-700 hover:text-indigo-600">
              Courses
            </Link>
            <Link href="/earnings" className="text-gray-700 hover:text-indigo-600">
              Earnings
            </Link>
            {user?.is_admin && (
              <Link href="/admin" className="text-gray-700 hover:text-indigo-600">
                Admin
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

