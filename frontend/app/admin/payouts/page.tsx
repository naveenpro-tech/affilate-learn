'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [processForm, setProcessForm] = useState({
    transaction_id: '',
    payment_method: 'bank_transfer',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [payoutsRes, pendingRes] = await Promise.all([
        api.get('/api/payouts/all'),
        api.get('/api/payouts/pending-users'),
      ]);
      
      setPayouts(payoutsRes.data);
      setPendingUsers(pendingRes.data);
    } catch (error) {
      console.error('Error loading payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const createBatchPayouts = async () => {
    if (!confirm('Create payout batch for all eligible users?')) return;
    
    setProcessing(-1);
    try {
      const response = await api.post('/api/payouts/batch-create');
      toast.success(response.data.message);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create batch');
    } finally {
      setProcessing(null);
    }
  };

  const openProcessModal = (payout: any) => {
    setSelectedPayout(payout);
    setShowProcessModal(true);
  };

  const processPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    setProcessing(selectedPayout.id);
    try {
      await api.put(`/api/payouts/${selectedPayout.id}/process`, processForm);
      toast.success('Payout processed successfully');
      setShowProcessModal(false);
      setProcessForm({ transaction_id: '', payment_method: 'bank_transfer' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process payout');
    } finally {
      setProcessing(null);
    }
  };

  const cancelPayout = async (payoutId: number) => {
    if (!confirm('Cancel this payout?')) return;

    setProcessing(payoutId);
    try {
      await api.put(`/api/payouts/${payoutId}/cancel`);
      toast.success('Payout cancelled');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to cancel payout');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const completedPayouts = payouts.filter(p => p.status === 'completed');

  return (
    <ProtectedRoute requireAdmin>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Payout Management</h1>
            <button
              onClick={createBatchPayouts}
              disabled={processing === -1 || pendingUsers.length === 0}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {processing === -1 ? 'Creating...' : `Create Weekly Batch (${pendingUsers.length})`}
            </button>
          </div>

          {/* Eligible Users */}
          {pendingUsers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Users Eligible for Payout</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingUsers.map((user: any) => (
                  <div key={user.user_id} className="bg-white p-4 rounded-lg">
                    <div className="font-semibold">{user.full_name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-lg font-bold text-green-600 mt-2">
                      ₹{user.pending_amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Payouts */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Pending Payouts ({pendingPayouts.length})</h2>
            {pendingPayouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending payouts
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Bank Details</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayouts.map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{payout.user_name}</div>
                          <div className="text-sm text-gray-600">{payout.user_email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-green-600">₹{payout.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{payout.commission_count} commissions</div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {payout.bank_account_number && (
                            <div>Bank: {payout.bank_account_number}</div>
                          )}
                          {payout.bank_ifsc && (
                            <div>IFSC: {payout.bank_ifsc}</div>
                          )}
                          {payout.upi_id && (
                            <div>UPI: {payout.upi_id}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openProcessModal(payout)}
                              disabled={processing === payout.id}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => cancelPayout(payout.id)}
                              disabled={processing === payout.id}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed Payouts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Completed Payouts ({completedPayouts.length})</h2>
            {completedPayouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No completed payouts yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Transaction ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedPayouts.slice(0, 20).map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{payout.user_name}</div>
                          <div className="text-sm text-gray-600">{payout.user_email}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ₹{payout.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {payout.payment_method || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {payout.transaction_id || 'N/A'}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(payout.completed_at || payout.created_at).toLocaleDateString()}
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

      {/* Process Payout Modal */}
      {showProcessModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Process Payout</h2>
            <form onSubmit={processPayout} className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600">User</div>
                <div className="font-semibold">{selectedPayout.user_name}</div>
                <div className="text-sm text-gray-600 mt-2">Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{selectedPayout.amount.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Transaction ID</label>
                <input
                  type="text"
                  required
                  value={processForm.transaction_id}
                  onChange={(e) => setProcessForm({ ...processForm, transaction_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="TXN123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={processForm.payment_method}
                  onChange={(e) => setProcessForm({ ...processForm, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing === selectedPayout.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing === selectedPayout.id ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

