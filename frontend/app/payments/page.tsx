'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { paymentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  package_name: string;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_spent: 0,
    total_payments: 0,
    successful_payments: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getMyPayments();
      const paymentsData = response.data;
      setPayments(paymentsData);

      // Calculate stats
      const successful = paymentsData.filter((p: Payment) => p.status === 'completed');
      const totalSpent = successful.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      
      setStats({
        total_spent: totalSpent,
        total_payments: paymentsData.length,
        successful_payments: successful.length,
      });
    } catch (error: any) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      completed: 'default',
      pending: 'warning',
      failed: 'secondary',
    };

    const labels: any = {
      completed: 'Successful',
      pending: 'Pending',
      failed: 'Failed',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment history...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Payment History</h1>
            <p className="text-neutral-600">View all your package purchases and transactions</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="border-l-4 border-primary-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-600">
                  ₹{stats.total_spent.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-success-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Successful Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-600">
                  {stats.successful_payments}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-neutral-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-600">
                  {stats.total_payments}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No Payments Yet</h3>
                    <p className="text-neutral-600 mb-6">
                      You haven't made any package purchases yet.
                    </p>
                    <button
                      onClick={() => window.location.href = '/packages'}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                    >
                      View Packages
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {new Date(payment.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{payment.package_name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-success-600">
                                ₹{payment.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                {payment.razorpay_payment_id || payment.razorpay_order_id}
                              </code>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card */}
          {payments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6"
            >
              <Card className="bg-primary-50 border-primary-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary-900 mb-2">Payment Information</h3>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• All payments are processed securely through Razorpay</li>
                    <li>• Package upgrades are instant upon successful payment</li>
                    <li>• For payment issues, contact support with your payment ID</li>
                    <li>• Refunds are processed as per our refund policy</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

