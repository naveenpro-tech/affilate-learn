'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { walletAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface WalletStats {
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  total_spent: number;
  available_for_withdrawal: number;
  recent_transactions_count: number;
}

interface Transaction {
  id: number;
  type: string;
  source: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [statsRes, transactionsRes] = await Promise.all([
        walletAPI.getStats(),
        walletAPI.getTransactions(0, 20)
      ]);
      setStats(statsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }

    if (stats && amount > stats.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await walletAPI.withdraw(amount);
      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadWalletData();
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      toast.error(error.response?.data?.detail || 'Failed to withdraw');
    }
  };

  const getTransactionIcon = (source: string) => {
    switch (source) {
      case 'commission':
        return '💰';
      case 'payout':
        return '💸';
      case 'purchase':
        return '🛒';
      case 'refund':
        return '↩️';
      case 'admin':
        return '⚙️';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Wallet</h1>
            <p className="text-neutral-600">Manage your earnings and transactions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium opacity-90">Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹{stats?.balance.toFixed(2) || '0.00'}</div>
                  <p className="text-sm opacity-75 mt-1">Available to withdraw</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{stats?.total_earned.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">From commissions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Withdrawn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ₹{stats?.total_withdrawn.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">To bank account</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-neutral-600">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    ₹{stats?.total_spent.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">On purchases</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Actions */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={!stats || stats.balance < 500}
                >
                  💸 Withdraw to Bank
                </Button>
                <Button variant="outline" onClick={() => router.push('/payouts')}>
                  📋 View Payout History
                </Button>
                <Button variant="outline" onClick={() => router.push('/earnings')}>
                  💰 View Earnings
                </Button>
              </div>
              {stats && stats.balance < 500 && (
                <p className="text-sm text-neutral-500 mt-4">
                  Minimum withdrawal amount is ₹500. Current balance: ₹{stats.balance.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No transactions yet</h3>
                  <p className="text-neutral-600">Your wallet transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{getTransactionIcon(transaction.source)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-semibold text-neutral-900">{transaction.description}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="default" className="text-xs">
                                  {transaction.source}
                                </Badge>
                                <Badge variant={transaction.type === 'credit' ? 'success' : 'destructive'} className="text-xs">
                                  {transaction.type}
                                </Badge>
                              </div>
                            </div>
                            <div className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-500 mt-2">
                            <span>{formatDate(transaction.created_at)}</span>
                            <span>Balance: ₹{transaction.balance_after.toFixed(2)}</span>
                            {transaction.reference_id && (
                              <span className="text-xs">Ref: {transaction.reference_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Withdraw to Bank Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="500"
                    step="100"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    Minimum: ₹500 | Available: ₹{stats?.balance.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleWithdraw} className="flex-1">
                    Confirm Withdrawal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}

