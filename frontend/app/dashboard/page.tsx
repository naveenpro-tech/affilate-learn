'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { commissionsAPI, referralsAPI, authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [commissionSummary, setCommissionSummary] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [recentCommissions, setRecentCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(false); // Show UI immediately, load data in background
    try {
      const [commSummary, refStats, commissions] = await Promise.all([
        commissionsAPI.getSummary(),
        referralsAPI.getStats(),
        commissionsAPI.getMyCommissions(),
      ]);

      setCommissionSummary(commSummary.data);
      setReferralStats(refStats.data);
      setStats(refStats.data);
      setRecentCommissions(commissions.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast.success('Referral code copied!');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-neutral-900">
              Dashboard
            </h1>
            <p className="text-neutral-600 mb-8">Welcome back, {user?.full_name}!</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid md:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-primary-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Current Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600">
                    {user?.current_package || 'None'}
                  </div>
                  {!user?.current_package && (
                    <Button
                      onClick={() => router.push('/packages')}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Buy Package →
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-success-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success-600">
                    ₹{commissionSummary?.total_commissions?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">
                    {commissionSummary?.total_count || 0} commissions
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-warning-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning-600">
                    ₹{commissionSummary?.pending_commissions?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">
                    {commissionSummary?.pending_count || 0} pending
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="hover:scale-105 transition-transform duration-300 border-l-4 border-primary-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600">
                    {referralStats?.total_referrals || 0}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">
                    L1: {referralStats?.level1_referrals || 0} | L2: {referralStats?.level2_referrals || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Referral Link Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl shadow-lg mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Share Your Referral Link</h2>
            <p className="mb-4 opacity-90">
              Earn commissions by referring others. Share your unique link or code!
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm opacity-75 mb-1">Your Referral Code</div>
                  <div className="text-2xl font-bold">{user?.referral_code}</div>
                </div>
                <button
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  Copy Code
                </button>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm opacity-75 mb-2">Your Referral Link</div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.referral_code}`}
                  className="flex-1 px-4 py-2 bg-white/30 rounded-lg text-white placeholder-white/50"
                />
                <button
                  onClick={copyReferralLink}
                  className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Commissions</h2>
              <button
                onClick={() => router.push('/earnings')}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
              >
                View All →
              </button>
            </div>

            {recentCommissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No commissions yet. Start referring to earn!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Package</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCommissions.map((commission) => (
                      <tr key={commission.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            commission.commission_type === 'level1' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {commission.commission_type === 'level1' ? 'Level 1' : 'Level 2'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{commission.package_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-green-600">
                          ₹{commission.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            commission.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : commission.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {commission.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

