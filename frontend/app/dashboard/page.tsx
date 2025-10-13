'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { commissionsAPI, referralsAPI, authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Package,
  TrendingUp,
  Clock,
  Users,
  Copy,
  Share2,
  ArrowRight,
  Sparkles,
  DollarSign,
  Award,
  Target,
  CheckCircle2,
} from 'lucide-react';

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
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Advanced Loading Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 border-4 border-primary-200 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 border-4 border-primary-600 border-t-transparent rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-primary-600" />
              </motion.div>
            </div>

            <motion.h2
              className="text-xl font-semibold text-neutral-900 mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading your dashboard
            </motion.h2>
            <p className="text-neutral-600">Preparing your personalized experience...</p>

            {/* Loading Progress Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
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
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                  Welcome back, {user?.full_name}! 👋
                </h1>
                <p className="text-neutral-600 text-lg">
                  Here's what's happening with your account today
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.push('/courses')}
                  size="lg"
                  className="group"
                >
                  <Award className="w-5 h-5 mr-2" aria-hidden="true" />
                  Browse Courses
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Current Package Card */}
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-bl-full opacity-50" aria-hidden="true" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                      Current Package
                    </CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {user?.current_package || 'None'}
                  </div>
                  {!user?.current_package && (
                    <Button
                      onClick={() => router.push('/packages')}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full group"
                      aria-label="Buy a package"
                    >
                      Buy Package
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Earnings Card */}
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full border-neutral-200 hover:border-success-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-success-50 rounded-bl-full opacity-50" aria-hidden="true" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                      Total Earnings
                    </CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success-600 mb-1">
                    ₹{commissionSummary?.total_commissions?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-neutral-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    {commissionSummary?.total_count || 0} commissions
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Earnings Card */}
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full border-neutral-200 hover:border-warning-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-warning-50 rounded-bl-full opacity-50" aria-hidden="true" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                      Pending
                    </CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-warning-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning-600 mb-1">
                    ₹{commissionSummary?.pending_commissions?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-neutral-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {commissionSummary?.pending_count || 0} pending
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Referrals Card */}
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-bl-full opacity-50" aria-hidden="true" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                      Total Referrals
                    </CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {referralStats?.total_referrals || 0}
                  </div>
                  <div className="text-sm text-neutral-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" aria-hidden="true" />
                      L1: {referralStats?.level1_referrals || 0}
                    </span>
                    <span>|</span>
                    <span>L2: {referralStats?.level2_referrals || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Referral Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 md:p-8 rounded-2xl shadow-xl mb-8"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" aria-hidden="true" />

            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Share & Earn
                  </h2>
                  <p className="text-primary-100 text-sm md:text-base">
                    Earn up to ₹5,625 per referral with our 2-level commission system
                  </p>
                </div>
              </div>

              {/* Referral Code */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-xl mb-4"
              >
                <label htmlFor="referral-code" className="text-sm text-primary-100 mb-2 block font-medium">
                  Your Referral Code
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <div
                      id="referral-code"
                      className="text-2xl md:text-3xl font-bold text-white tracking-wider font-mono"
                      aria-label={`Your referral code is ${user?.referral_code}`}
                    >
                      {user?.referral_code}
                    </div>
                  </div>
                  <Button
                    onClick={copyReferralCode}
                    variant="secondary"
                    size="default"
                    className="group whitespace-nowrap"
                    aria-label="Copy referral code to clipboard"
                  >
                    <Copy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    Copy Code
                  </Button>
                </div>
              </motion.div>

              {/* Referral Link */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-xl"
              >
                <label htmlFor="referral-link" className="text-sm text-primary-100 mb-2 block font-medium">
                  Your Referral Link
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    id="referral-link"
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.referral_code}`}
                    className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                    aria-label="Your referral link"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="secondary"
                    size="default"
                    className="group whitespace-nowrap"
                    aria-label="Copy referral link to clipboard"
                  >
                    <Copy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    Copy Link
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>

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

