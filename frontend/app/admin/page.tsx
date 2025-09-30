'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, activityRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRecentActivity(),
      ]);
      
      setDashboard(dashboardRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Total Users</div>
              <div className="text-3xl font-bold text-indigo-600">
                {dashboard?.users?.total || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dashboard?.users?.active || 0} active
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-green-600">
                ₹{dashboard?.revenue?.total?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Net: ₹{dashboard?.revenue?.net_profit?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Commissions</div>
              <div className="text-3xl font-bold text-yellow-600">
                ₹{dashboard?.commissions?.total?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Pending: ₹{dashboard?.commissions?.pending?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Packages Sold</div>
              <div className="text-3xl font-bold text-blue-600">
                {dashboard?.packages?.total_sold || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                S:{dashboard?.packages?.silver || 0} G:{dashboard?.packages?.gold || 0} P:{dashboard?.packages?.platinum || 0}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">Manage Users</div>
              <div className="text-sm text-gray-600">View and manage all users</div>
            </button>

            <button
              onClick={() => router.push('/admin/payouts')}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Process Payouts</div>
              <div className="text-sm text-gray-600">Manage payout requests</div>
            </button>

            <button
              onClick={() => router.push('/admin/courses')}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold">Manage Courses</div>
              <div className="text-sm text-gray-600">Add and edit courses</div>
            </button>

            <button
              onClick={() => router.push('/admin/commissions')}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">View Commissions</div>
              <div className="text-sm text-gray-600">Track all commissions</div>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Registrations</h2>
              <div className="space-y-3">
                {activity?.recent_users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{user.full_name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Purchases */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Purchases</h2>
              <div className="space-y-3">
                {activity?.recent_purchases?.map((purchase: any) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">₹{purchase.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">User ID: {purchase.user_id}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(purchase.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Platform Statistics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Referrals</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{dashboard?.referrals?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level 1:</span>
                    <span className="font-semibold">{dashboard?.referrals?.level1 || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level 2:</span>
                    <span className="font-semibold">{dashboard?.referrals?.level2 || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Payouts</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-semibold">₹{dashboard?.payouts?.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold">₹{dashboard?.payouts?.pending?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Content</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courses:</span>
                    <span className="font-semibold">{dashboard?.content?.courses || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="font-semibold">{dashboard?.content?.published_courses || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Videos:</span>
                    <span className="font-semibold">{dashboard?.content?.videos || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

