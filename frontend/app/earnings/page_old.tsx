'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { commissionsAPI, payoutsAPI, referralsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EarningsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [pendingAmount, setPendingAmount] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'commissions' | 'payouts' | 'referrals'>('commissions');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    bank_account_number: '',
    bank_ifsc: '',
    upi_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [commissionsRes, payoutsRes, referralsRes, pendingRes, summaryRes] = await Promise.all([
        commissionsAPI.getMyCommissions(),
        payoutsAPI.getMyPayouts(),
        referralsAPI.getMyReferrals(),
        payoutsAPI.getPendingAmount(),
        commissionsAPI.getSummary(),
      ]);

      setCommissions(commissionsRes.data);
      setPayouts(payoutsRes.data);
      setReferrals(referralsRes.data);
      setPendingAmount(pendingRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pendingAmount?.eligible_for_payout) {
      toast.error(`Minimum payout amount is ₹${pendingAmount?.minimum_payout}`);
      return;
    }

    try {
      await payoutsAPI.requestPayout(payoutForm);
      toast.success('Payout request submitted successfully!');
      setShowPayoutModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to request payout');
    }
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

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Earnings</h1>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Total Earnings</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{summary?.total_commissions?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                ₹{pendingAmount?.pending_amount?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600 mb-2">Paid Out</div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{summary?.paid_commissions?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={!pendingAmount?.eligible_for_payout}
                className={`w-full py-3 rounded-lg font-semibold ${
                  pendingAmount?.eligible_for_payout
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Request Payout
              </button>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Min: ₹{pendingAmount?.minimum_payout || 500}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={`px-6 py-4 font-semibold ${
                    activeTab === 'commissions'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Commissions ({commissions.length})
                </button>
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`px-6 py-4 font-semibold ${
                    activeTab === 'payouts'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Payouts ({payouts.length})
                </button>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`px-6 py-4 font-semibold ${
                    activeTab === 'referrals'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Referrals ({referrals.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'commissions' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Referee</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Package</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((commission) => (
                        <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(commission.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              commission.level === 1
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              Level {commission.level}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{commission.referee_email || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{commission.package_name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600">
                            ₹{commission.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              commission.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
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

              {activeTab === 'payouts' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Method</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Transaction ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(payout.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            ₹{payout.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{payout.payment_method || 'Pending'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{payout.transaction_id || '-'}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payout.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payout.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payout.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'referrals' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Level</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Referee</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Package</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              referral.level === 1
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              Level {referral.level}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{referral.referee_email || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{referral.package_name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600">
                            ₹{referral.commission_amount?.toFixed(2) || '0.00'}
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
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Payout</h2>
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bank Account Number</label>
                <input
                  type="text"
                  value={payoutForm.bank_account_number}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bank_account_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={payoutForm.bank_ifsc}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bank_ifsc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="SBIN0001234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={payoutForm.upi_id}
                  onChange={(e) => setPayoutForm({ ...payoutForm, upi_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="user@upi"
                />
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Payout Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{pendingAmount?.pending_amount?.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

