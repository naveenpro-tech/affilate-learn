'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Payout {
  id: number;
  user_id: number;
  amount: number;
  status: string;
  created_at: string;
  completed_at?: string;
  transaction_id?: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export default function AdminPayoutsPage() {
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [allPayouts, setAllPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Dialog states
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  
  // Form states
  const [rejectReason, setRejectReason] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        adminAPI.getPendingPayouts(),
        adminAPI.getAllPayouts(),
      ]);
      
      setPendingPayouts(pendingRes.data);
      setAllPayouts(allRes.data);
    } catch (error) {
      console.error('Error loading payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessing(selectedPayout.id);
      await adminAPI.approvePayout(selectedPayout.id);
      toast.success('Payout approved - Status changed to processing');
      setIsApproveDialogOpen(false);
      setSelectedPayout(null);
      loadPayouts();
    } catch (error) {
      console.error('Error approving payout:', error);
      toast.error('Failed to approve payout');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectPayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessing(selectedPayout.id);
      await adminAPI.rejectPayout(selectedPayout.id, rejectReason);
      toast.success('Payout rejected');
      setIsRejectDialogOpen(false);
      setSelectedPayout(null);
      setRejectReason('');
      loadPayouts();
    } catch (error) {
      console.error('Error rejecting payout:', error);
      toast.error('Failed to reject payout');
    } finally {
      setProcessing(null);
    }
  };

  const handleCompletePayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessing(selectedPayout.id);
      await adminAPI.completePayout(selectedPayout.id, transactionId);
      toast.success('Payout marked as completed');
      setIsCompleteDialogOpen(false);
      setSelectedPayout(null);
      setTransactionId('');
      loadPayouts();
    } catch (error) {
      console.error('Error completing payout:', error);
      toast.error('Failed to complete payout');
    } finally {
      setProcessing(null);
    }
  };

  const openApproveDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsRejectDialogOpen(true);
  };

  const openCompleteDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsCompleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
      pending: 'warning',
      processing: 'default',
      completed: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const filteredPayouts = filterStatus === 'all' 
    ? allPayouts 
    : allPayouts.filter(p => p.status === filterStatus);

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Payout Management</h1>
            <p className="text-neutral-600">Approve and manage user payout requests</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="border-l-4 border-warning-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning-600">
                  {pendingPayouts.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-primary-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-600">
                  {allPayouts.filter(p => p.status === 'processing').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-success-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-600">
                  {allPayouts.filter(p => p.status === 'completed').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-danger-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-danger-600">
                  {allPayouts.filter(p => p.status === 'cancelled').length}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Payouts Section */}
          {pendingPayouts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="border-l-4 border-warning-500">
                <CardHeader>
                  <CardTitle className="text-2xl">Pending Approvals ({pendingPayouts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPayouts.map((payout) => (
                      <div key={payout.id} className="bg-neutral-50 p-4 rounded-lg hover:bg-neutral-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900 text-lg">
                              {payout.user?.full_name || `User #${payout.user_id}`}
                            </div>
                            <div className="text-sm text-neutral-600">{payout.user?.email}</div>
                            <div className="mt-2 text-2xl font-bold text-success-600">
                              ₹{payout.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-neutral-500 mt-2">
                              Requested: {new Date(payout.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openApproveDialog(payout)}
                              disabled={processing === payout.id}
                              className="bg-success-600 hover:bg-success-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRejectDialog(payout)}
                              disabled={processing === payout.id}
                              className="text-danger-600 hover:bg-danger-50"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* All Payouts Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">All Payouts ({filteredPayouts.length})</CardTitle>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPayouts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">User</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayouts.map((payout) => (
                          <tr key={payout.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-neutral-900">{payout.user?.full_name || `User #${payout.user_id}`}</div>
                              <div className="text-sm text-neutral-600">{payout.user?.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-success-600">₹{payout.amount.toFixed(2)}</div>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(payout.status)}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600">
                              {new Date(payout.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {payout.status === 'processing' && (
                                <Button
                                  size="sm"
                                  onClick={() => openCompleteDialog(payout)}
                                  disabled={processing === payout.id}
                                  className="bg-success-600 hover:bg-success-700"
                                >
                                  Complete
                                </Button>
                              )}
                              {payout.status === 'completed' && payout.transaction_id && (
                                <div className="text-xs text-neutral-500">
                                  TXN: {payout.transaction_id}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    No payouts found
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payout</DialogTitle>
            <DialogDescription>
              Approve this payout request? Status will change to "processing".
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="font-semibold">{selectedPayout.user?.full_name}</div>
              <div className="text-2xl font-bold text-success-600 mt-2">
                ₹{selectedPayout.amount.toFixed(2)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprovePayout} disabled={processing !== null} className="bg-success-600 hover:bg-success-700">
              {processing ? 'Approving...' : 'Approve Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payout request.
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="bg-neutral-50 p-4 rounded-lg mb-4">
              <div className="font-semibold">{selectedPayout.user?.full_name}</div>
              <div className="text-2xl font-bold text-danger-600 mt-2">
                ₹{selectedPayout.amount.toFixed(2)}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Reason (Optional)</label>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRejectPayout} disabled={processing !== null} className="bg-danger-600 hover:bg-danger-700">
              {processing ? 'Rejecting...' : 'Reject Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payout</DialogTitle>
            <DialogDescription>
              Mark this payout as completed and provide transaction details.
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="bg-neutral-50 p-4 rounded-lg mb-4">
              <div className="font-semibold">{selectedPayout.user?.full_name}</div>
              <div className="text-2xl font-bold text-success-600 mt-2">
                ₹{selectedPayout.amount.toFixed(2)}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Transaction ID (Optional)</label>
            <Input
              placeholder="TXN123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompletePayout} disabled={processing !== null} className="bg-success-600 hover:bg-success-700">
              {processing ? 'Completing...' : 'Mark as Completed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

