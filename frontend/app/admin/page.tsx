'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <ProtectedRoute requireAdmin>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-neutral-900">Admin Dashboard</h1>
            <p className="text-neutral-600 mb-8">Manage your platform and monitor performance</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-primary-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600">
                    {dashboard?.users?.total || 0}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {dashboard?.users?.active || 0} active
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-success-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success-600">
                    ₹{dashboard?.revenue?.total?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Net: ₹{dashboard?.revenue?.net_profit?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-warning-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning-600">
                    ₹{dashboard?.commissions?.total?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Pending: ₹{dashboard?.commissions?.pending?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-primary-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Packages Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600">
                    {dashboard?.packages?.total_sold || 0}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    S:{dashboard?.packages?.silver || 0} G:{dashboard?.packages?.gold || 0} P:{dashboard?.packages?.platinum || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <motion.button
              variants={itemVariants}
              onClick={() => router.push('/admin/users')}
              className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-all text-left group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-3">👥</div>
              <div className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">Manage Users</div>
              <div className="text-sm text-neutral-600">View and manage all users</div>
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={() => router.push('/admin/payouts')}
              className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-all text-left group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-3">💰</div>
              <div className="font-semibold text-neutral-900 group-hover:text-success-600 transition-colors">Process Payouts</div>
              <div className="text-sm text-neutral-600">Manage payout requests</div>
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={() => router.push('/admin/courses')}
              className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-all text-left group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-3">📚</div>
              <div className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">Manage Courses</div>
              <div className="text-sm text-neutral-600">Add and edit courses</div>
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={() => router.push('/dashboard')}
              className="bg-white p-6 rounded-xl shadow-soft hover:shadow-medium transition-all text-left group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-3">📊</div>
              <div className="font-semibold text-neutral-900 group-hover:text-warning-600 transition-colors">View Analytics</div>
              <div className="text-sm text-neutral-600">Track platform metrics</div>
            </motion.button>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Recent Users */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activity?.recent_users?.length > 0 ? (
                      activity.recent_users.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                          <div>
                            <div className="font-semibold text-neutral-900">{user.full_name}</div>
                            <div className="text-sm text-neutral-600">{user.email}</div>
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-neutral-500">No recent registrations</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Purchases */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activity?.recent_purchases?.length > 0 ? (
                      activity.recent_purchases.map((purchase: any) => (
                        <div key={purchase.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                          <div>
                            <div className="font-semibold text-success-600">₹{purchase.amount.toFixed(2)}</div>
                            <div className="text-sm text-neutral-600">User ID: {purchase.user_id}</div>
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(purchase.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-neutral-500">No recent purchases</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-4 text-lg">Referrals</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Total:</span>
                        <span className="font-semibold text-primary-600">{dashboard?.referrals?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Level 1:</span>
                        <span className="font-semibold text-neutral-900">{dashboard?.referrals?.level1 || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Level 2:</span>
                        <span className="font-semibold text-neutral-900">{dashboard?.referrals?.level2 || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-4 text-lg">Payouts</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Total Paid:</span>
                        <span className="font-semibold text-success-600">₹{dashboard?.payouts?.total?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Pending:</span>
                        <span className="font-semibold text-warning-600">₹{dashboard?.payouts?.pending?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-4 text-lg">Content</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Courses:</span>
                        <span className="font-semibold text-primary-600">{dashboard?.content?.courses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Published:</span>
                        <span className="font-semibold text-success-600">{dashboard?.content?.published_courses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-neutral-50 transition-colors">
                        <span className="text-neutral-600">Videos:</span>
                        <span className="font-semibold text-neutral-900">{dashboard?.content?.videos || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

