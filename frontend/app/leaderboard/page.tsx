'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { commissionsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface TopEarner {
  rank: number;
  user_id: number;
  full_name: string;
  email: string;
  referral_code: string;
  current_package: string | null;
  total_earnings: number;
  commission_count: number;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await commissionsAPI.getTopEarners(50); // Get top 50
      const earners = response.data;
      setTopEarners(earners);

      // Find current user's rank
      const currentUserRank = earners.findIndex((e: TopEarner) => e.user_id === user?.id);
      if (currentUserRank !== -1) {
        setUserRank(currentUserRank + 1);
      }
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-orange-600';
    return 'text-neutral-600';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              🏆 Top Earners Leaderboard
            </h1>
            <p className="text-xl text-neutral-600">
              See who's leading the way in earnings!
            </p>
          </motion.div>

          {/* User's Rank Card */}
          {userRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="border-4 border-primary-500 bg-gradient-to-r from-primary-50 to-white">
                <CardContent className="py-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{getMedalEmoji(userRank)}</div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      Your Rank: #{userRank}
                    </h2>
                    <p className="text-neutral-600">
                      Keep referring to climb higher!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Top 3 Podium */}
          {topEarners.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-12"
            >
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="md:order-1"
                >
                  <Card className="border-4 border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 h-full">
                    <CardContent className="pt-8 pb-6 text-center">
                      <div className="text-6xl mb-3">🥈</div>
                      <div className="text-4xl font-bold text-gray-600 mb-2">2nd</div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        {topEarners[1].full_name}
                      </h3>
                      <div className="text-3xl font-bold text-success-600 mb-2">
                        ₹{topEarners[1].total_earnings.toLocaleString()}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {topEarners[1].commission_count} commissions
                      </div>
                      {topEarners[1].current_package && (
                        <Badge variant="secondary" className="mt-3">
                          {topEarners[1].current_package}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="md:order-2 md:-mt-8"
                >
                  <Card className="border-4 border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-2xl h-full">
                    <CardContent className="pt-10 pb-8 text-center">
                      <div className="text-8xl mb-4">🥇</div>
                      <div className="text-5xl font-bold text-yellow-600 mb-3">1st</div>
                      <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                        {topEarners[0].full_name}
                      </h3>
                      <div className="text-4xl font-bold text-success-600 mb-3">
                        ₹{topEarners[0].total_earnings.toLocaleString()}
                      </div>
                      <div className="text-sm text-neutral-600 mb-2">
                        {topEarners[0].commission_count} commissions
                      </div>
                      {topEarners[0].current_package && (
                        <Badge variant="default" className="mt-3">
                          {topEarners[0].current_package}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="md:order-3"
                >
                  <Card className="border-4 border-orange-500 bg-gradient-to-br from-orange-100 to-orange-200 h-full">
                    <CardContent className="pt-8 pb-6 text-center">
                      <div className="text-6xl mb-3">🥉</div>
                      <div className="text-4xl font-bold text-orange-600 mb-2">3rd</div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        {topEarners[2].full_name}
                      </h3>
                      <div className="text-3xl font-bold text-success-600 mb-2">
                        ₹{topEarners[2].total_earnings.toLocaleString()}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {topEarners[2].commission_count} commissions
                      </div>
                      {topEarners[2].current_package && (
                        <Badge variant="warning" className="mt-3">
                          {topEarners[2].current_package}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Full Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Complete Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {topEarners.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      No Earners Yet
                    </h3>
                    <p className="text-neutral-600">
                      Be the first to earn commissions and top the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topEarners.map((earner, index) => (
                      <motion.div
                        key={earner.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          earner.user_id === user?.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`text-3xl font-bold ${getRankColor(earner.rank)} min-w-[60px] text-center`}>
                              {getMedalEmoji(earner.rank)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-neutral-900">
                                  {earner.full_name}
                                  {earner.user_id === user?.id && (
                                    <span className="ml-2 text-sm text-primary-600">(You)</span>
                                  )}
                                </h3>
                                {earner.current_package && (
                                  <Badge
                                    variant={
                                      earner.current_package === 'Platinum' ? 'default' :
                                      earner.current_package === 'Gold' ? 'warning' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {earner.current_package}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-neutral-600">
                                {earner.commission_count} commissions earned
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-success-600">
                              ₹{earner.total_earnings.toLocaleString()}
                            </div>
                            <div className="text-xs text-neutral-500">Total Earnings</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Motivation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-primary-500 to-purple-600 text-white">
              <CardContent className="py-8 text-center">
                <h3 className="text-2xl font-bold mb-3">Want to climb the leaderboard?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Share your referral link and earn commissions on every successful referral!
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 font-bold text-lg"
                >
                  Get Your Referral Link →
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

