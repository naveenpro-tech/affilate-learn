'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { bankDetailsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function BankDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasDetails, setHasDetails] = useState(false);
  const [formData, setFormData] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
  });

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const response = await bankDetailsAPI.get();
      if (response.data) {
        setFormData(response.data);
        setHasDetails(true);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error loading bank details:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (hasDetails) {
        await bankDetailsAPI.update(formData);
        toast.success('Bank details updated successfully!');
      } else {
        await bankDetailsAPI.create(formData);
        toast.success('Bank details added successfully!');
        setHasDetails(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to save bank details';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your bank details?')) {
      return;
    }

    try {
      await bankDetailsAPI.delete();
      toast.success('Bank details deleted successfully');
      setFormData({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: '',
      });
      setHasDetails(false);
    } catch (error: any) {
      toast.error('Failed to delete bank details');
    }
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
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Bank Details
                  </CardTitle>
                  {hasDetails && (
                    <Badge variant="success">✓ Verified</Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  Add your bank details to receive payouts
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Account Holder Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.account_holder_name}
                      onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Bank Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="State Bank of India"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Account Number *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      IFSC Code *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.ifsc_code}
                      onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                      placeholder="SBIN0001234"
                      maxLength={11}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      11-character IFSC code (e.g., SBIN0001234)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      UPI ID (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                      placeholder="yourname@paytm"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1"
                      size="lg"
                    >
                      {saving ? 'Saving...' : hasDetails ? 'Update Details' : 'Save Details'}
                    </Button>

                    {hasDetails && (
                      <Button
                        type="button"
                        onClick={handleDelete}
                        variant="destructive"
                        size="lg"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure all details are accurate to avoid payout delays</li>
                    <li>• Account holder name should match your registered name</li>
                    <li>• IFSC code must be valid and active</li>
                    <li>• You can update your details anytime</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

