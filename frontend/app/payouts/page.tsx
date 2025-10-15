'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { payoutsAPI, bankDetailsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export default function PayoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [hasBankDetails, setHasBankDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, payoutsRes, bankRes] = await Promise.all([
        payoutsAPI.getAvailableBalance(),
        payoutsAPI.getHistory(),
        bankDetailsAPI.get(),
      ]);

      setBalance(balanceRes.data);
      setPayouts(payoutsRes.data);
      setHasBankDetails(!!bankRes.data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load payout information');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!hasBankDetails) {
      toast.error('Please add your bank details first');
      router.push('/profile/bank-details');
      return;
    }

    if (!balance?.can_request_payout) {
      toast.error(`Minimum payout amount is ₹${balance?.minimum_payout_amount || 500}`);
      return;
    }

    setRequesting(true);

    try {
      await payoutsAPI.requestPayout({});
      toast.success('Payout request submitted successfully!');
      loadData(); // Reload data
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to request payout';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setRequesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'warning',
      processing: 'default',
      completed: 'success',
      failed: 'danger',
      cancelled: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Payouts
            </h1>
            <p className="text-gray-600">Manage your earnings and payout requests</p>
          </motion.div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-l-4 border-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{balance?.available_balance?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-l-4 border-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{balance?.total_commissions?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-l-4 border-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    ₹{balance?.pending_payouts?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-l-4 border-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Paid Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ₹{balance?.paid_amount?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Request Payout Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Request Payout</h3>
                    <p className="text-gray-600">
                      Minimum payout amount: ₹{balance?.minimum_payout_amount || 500}
                    </p>
                    {!hasBankDetails && (
                      <p className="text-red-600 text-sm mt-1">
                        ⚠️ Please add your bank details first
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {!hasBankDetails && (
                      <Button
                        onClick={() => router.push('/profile/bank-details')}
                        variant="outline"
                      >
                        Add Bank Details
                      </Button>
                    )}
                    <Button
                      onClick={handleRequestPayout}
                      disabled={!balance?.can_request_payout || requesting}
                      size="lg"
                    >
                      {requesting ? 'Processing...' : 'Request Payout'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payout History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No payout history yet</p>
                    <p className="text-sm mt-2">Your payout requests will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            {new Date(payout.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{payout.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payout.status)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payout.payout_type || 'manual'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payout.transaction_id || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

