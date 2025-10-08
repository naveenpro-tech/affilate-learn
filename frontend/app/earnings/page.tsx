'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { walletAPI, commissionsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function EarningsPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallet' | 'commissions' | 'transactions'>('wallet');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletRes, commissionsRes, summaryRes] = await Promise.all([
        walletAPI.getWithTransactions(10),
        commissionsAPI.getMyCommissions(),
        commissionsAPI.getSummary(),
      ]);

      setWallet(walletRes.data.wallet);
      setTransactions(walletRes.data.transactions);
      setCommissions(commissionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = () => {
    router.push('/payouts');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const minPayoutAmount = 500;
  const canRequestPayout = wallet?.balance >= minPayoutAmount;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Earnings & Wallet</h1>
            <p className="text-gray-600">Manage your earnings, commissions, and payouts</p>
          </motion.div>

          {/* Wallet Card - Prominent Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-indigo-200 text-sm font-medium mb-1">YOUR WALLET</p>
                  <h2 className="text-5xl font-bold">₹{wallet?.balance?.toFixed(2) || '0.00'}</h2>
                  <p className="text-indigo-200 text-sm mt-2">Available for payout</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3">
                    <p className="text-xs text-indigo-200 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold">₹{wallet?.total_earned?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-xs text-indigo-200 mb-1">Total Withdrawn</p>
                    <p className="text-2xl font-bold">₹{wallet?.total_withdrawn?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRequestPayout}
                  disabled={!canRequestPayout}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    canRequestPayout
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }`}
                >
                  💸 Request Payout {!canRequestPayout && `(min ₹${minPayoutAmount})`}
                </button>
                <button
                  onClick={() => router.push('/payouts')}
                  className="py-4 px-6 rounded-xl font-semibold text-lg bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  📋 View Payout History
                </button>
              </div>

              {!canRequestPayout && (
                <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 text-sm">
                  <p className="flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>Minimum payout amount is ₹{minPayoutAmount}. Earn ₹{(minPayoutAmount - (wallet?.balance || 0)).toFixed(2)} more to request a payout.</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md">
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  activeTab === 'wallet'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                💳 Wallet Overview
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  activeTab === 'commissions'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Commission History
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📜 Transaction History
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'wallet' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Wallet Overview</h3>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-2">Available Balance</p>
                    <p className="text-3xl font-bold text-green-600">₹{wallet?.balance?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-green-600 mt-2">Ready for withdrawal</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-2">Total Earned</p>
                    <p className="text-3xl font-bold text-blue-600">₹{wallet?.total_earned?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-blue-600 mt-2">Lifetime earnings</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium mb-2">Total Withdrawn</p>
                    <p className="text-3xl font-bold text-purple-600">₹{wallet?.total_withdrawn?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-purple-600 mt-2">All-time payouts</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>How Your Wallet Works</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span><strong>Automatic Credits:</strong> All commissions are automatically added to your wallet when your referrals make purchases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span><strong>Instant Debit:</strong> When you request a payout, the amount is immediately deducted from your wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span><strong>Minimum Payout:</strong> You need at least ₹{minPayoutAmount} in your wallet to request a payout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span><strong>Processing Time:</strong> Payouts are processed by admin and transferred to your bank account within 3-5 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Commission History</h3>
                  <p className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                    For your records only - All commissions are auto-credited to wallet
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <p className="text-sm text-orange-700 font-medium mb-2">Level 1 Commissions (40%)</p>
                    <p className="text-3xl font-bold text-orange-600">
                      ₹{summary?.level1_commissions?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-orange-600 mt-2">Direct referrals</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <p className="text-sm text-pink-700 font-medium mb-2">Level 2 Commissions (10%)</p>
                    <p className="text-3xl font-bold text-pink-600">
                      ₹{summary?.level2_commissions?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-pink-600 mt-2">Indirect referrals</p>
                  </div>
                </div>

                {commissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">From</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map((commission: any) => (
                          <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(commission.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                commission.commission_type === 'level1'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}>
                                {commission.commission_type === 'level1' ? 'Level 1 (40%)' : 'Level 2 (10%)'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {commission.referral_name || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              ₹{commission.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Credited to Wallet
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No commissions yet</p>
                    <p className="text-sm">Start referring users to earn commissions!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Transaction History</h3>

                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            transaction.transaction_type === 'credit'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}>
                            {transaction.transaction_type === 'credit' ? '💰' : '💸'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            transaction.transaction_type === 'credit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Balance: ₹{transaction.balance_after.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No transactions yet</p>
                    <p className="text-sm">Your wallet transactions will appear here</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

