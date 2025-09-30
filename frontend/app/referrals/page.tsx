'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { referralsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ReferralStats {
  total_referrals: number;
  level1_referrals: number;
  level2_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  package_breakdown: Record<string, { level1: number; level2: number }>;
}

interface Referral {
  id: number;
  referee_name: string;
  referee_email: string;
  level: number;
  package_name: string;
  commission_amount: number;
  created_at: string;
}

export default function ReferralsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const [statsRes, referralsRes] = await Promise.all([
        referralsAPI.getStats(),
        referralsAPI.getMyReferrals(),
      ]);
      
      setStats(statsRes.data);
      setReferrals(referralsRes.data);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopiedCode(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    const message = `Join this amazing learning platform and start earning! Use my referral code: ${user?.referral_code}\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    const message = `Join this amazing learning platform! Use my referral code: ${user?.referral_code}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Referrals</h1>
            <p className="text-neutral-600">Share your referral link and earn commissions</p>
          </motion.div>

          {/* Referral Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-l-4 border-primary-500 bg-gradient-to-r from-primary-50 to-white">
              <CardHeader>
                <CardTitle className="text-2xl">Share Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-6">
                  Earn 40% commission on Level 1 referrals and 10% on Level 2 referrals!
                </p>
                
                {/* Referral Code */}
                <div className="bg-white p-4 rounded-lg mb-4 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-neutral-600 mb-1">Your Referral Code</div>
                      <div className="text-3xl font-bold text-primary-600">{user?.referral_code}</div>
                    </div>
                    <Button
                      onClick={copyReferralCode}
                      variant={copiedCode ? 'default' : 'outline'}
                      className={copiedCode ? 'bg-success-600 hover:bg-success-700' : ''}
                    >
                      {copiedCode ? '✓ Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="bg-white p-4 rounded-lg mb-6 border border-neutral-200">
                  <div className="text-sm text-neutral-600 mb-2">Your Referral Link</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.referral_code}`}
                      className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 text-sm"
                    />
                    <Button
                      onClick={copyReferralLink}
                      variant={copiedLink ? 'default' : 'outline'}
                      className={copiedLink ? 'bg-success-600 hover:bg-success-700' : ''}
                    >
                      {copiedLink ? '✓ Copied!' : 'Copy Link'}
                    </Button>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div>
                  <div className="text-sm text-neutral-600 mb-3">Share on Social Media</div>
                  <div className="flex gap-3">
                    <Button
                      onClick={shareOnWhatsApp}
                      className="bg-success-600 hover:bg-success-700 flex-1"
                    >
                      <span className="mr-2">📱</span> WhatsApp
                    </Button>
                    <Button
                      onClick={shareOnTwitter}
                      className="bg-primary-600 hover:bg-primary-700 flex-1"
                    >
                      <span className="mr-2">🐦</span> Twitter
                    </Button>
                    <Button
                      onClick={shareOnFacebook}
                      className="bg-primary-700 hover:bg-primary-800 flex-1"
                    >
                      <span className="mr-2">👥</span> Facebook
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-primary-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600">
                    {stats?.total_referrals || 0}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    L1: {stats?.level1_referrals || 0} | L2: {stats?.level2_referrals || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-success-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success-600">
                    ₹{stats?.total_earnings?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    From all referrals
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-warning-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Pending Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning-600">
                    ₹{stats?.pending_earnings?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Not yet paid
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-success-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-600">Paid Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success-600">
                    ₹{stats?.paid_earnings?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Already received
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Package Breakdown */}
          {stats?.package_breakdown && Object.keys(stats.package_breakdown).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Package Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(stats.package_breakdown).map(([packageName, counts]) => (
                      <div key={packageName} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <div className="text-lg font-semibold text-neutral-900 mb-2">{packageName}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Level 1:</span>
                            <span className="font-semibold text-primary-600">{counts.level1}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Level 2:</span>
                            <span className="font-semibold text-secondary-600">{counts.level2}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-neutral-300">
                            <span className="text-neutral-600">Total:</span>
                            <span className="font-bold text-neutral-900">{counts.level1 + counts.level2}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Referrals List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>My Referrals ({referrals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Referrals Yet</h3>
                    <p className="text-neutral-600 mb-6">
                      Start sharing your referral link to earn commissions!
                    </p>
                    <Button onClick={copyReferralLink}>
                      Copy Referral Link
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Level</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Package</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Commission</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((referral, index) => (
                          <motion.tr
                            key={referral.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-neutral-900 font-medium">
                              {referral.referee_name}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600">
                              {referral.referee_email}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={referral.level === 1 ? 'default' : 'secondary'}>
                                Level {referral.level}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  referral.package_name === 'Platinum' ? 'default' :
                                  referral.package_name === 'Gold' ? 'warning' :
                                  'secondary'
                                }
                              >
                                {referral.package_name}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-semibold text-success-600">
                              ₹{referral.commission_amount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600">
                              {new Date(referral.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-primary-50 to-white border-l-4 border-primary-500">
              <CardHeader>
                <CardTitle>How the Referral System Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">Level 1 Referrals (40%)</h4>
                        <p className="text-sm text-neutral-600">
                          When someone registers using your referral code and purchases a package, you earn 40% commission.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">Level 2 Referrals (10%)</h4>
                        <p className="text-sm text-neutral-600">
                          When your referrals refer someone who purchases a package, you earn 10% commission.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-neutral-200">
                    <h4 className="font-semibold text-neutral-900 mb-3">Example Earnings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Silver (₹2,950) - L1:</span>
                        <span className="font-semibold text-success-600">₹1,180</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Gold (₹5,310) - L1:</span>
                        <span className="font-semibold text-success-600">₹2,124</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Platinum (₹8,850) - L1:</span>
                        <span className="font-semibold text-success-600">₹3,540</span>
                      </div>
                      <div className="border-t border-neutral-300 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Level 2 commissions:</span>
                          <span className="font-semibold text-primary-600">25% of L1</span>
                        </div>
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

