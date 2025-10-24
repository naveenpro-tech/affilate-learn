'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { bankDetailsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BankDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasDetails, setHasDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    account_type: 'Savings',
    upi_id: '',
    pan_number: '',
    gst_number: '',
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate IFSC code
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (formData.ifsc_code && !ifscPattern.test(formData.ifsc_code)) {
      newErrors.ifsc_code = 'Invalid IFSC code format (e.g., SBIN0001234)';
    }

    // Validate PAN number
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.pan_number && !panPattern.test(formData.pan_number)) {
      newErrors.pan_number = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    // Validate GST number
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.gst_number && !gstPattern.test(formData.gst_number)) {
      newErrors.gst_number = 'Invalid GST format (e.g., 22AAAAA0000A1Z5)';
    }

    // Validate UPI ID
    if (formData.upi_id && !formData.upi_id.includes('@')) {
      newErrors.upi_id = 'Invalid UPI ID format (e.g., yourname@paytm)';
    }

    // Validate account number (only digits)
    if (formData.account_number && !/^\d+$/.test(formData.account_number)) {
      newErrors.account_number = 'Account number must contain only digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

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
      console.error('Bank details error:', error.response?.data);

      // Handle validation errors from backend
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (Array.isArray(detail)) {
          // Pydantic validation errors
          const backendErrors: Record<string, string> = {};
          detail.forEach((err: any) => {
            const field = err.loc[err.loc.length - 1];
            backendErrors[field] = err.msg;
          });
          setErrors(backendErrors);
          toast.error('Please fix the validation errors');
        } else if (typeof detail === 'string') {
          toast.error(detail);
        } else {
          toast.error('Failed to save bank details');
        }
      } else {
        toast.error('Failed to save bank details. Please try again.');
      }
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
        branch_name: '',
        account_type: 'Savings',
        upi_id: '',
        pan_number: '',
        gst_number: '',
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
    <ProtectedRoute>      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Bank Details
                  </CardTitle>
                  {hasDetails && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">✓ Saved</Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  Add your bank details to receive commission payouts
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Bank Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Bank Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.account_holder_name}
                          onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                          placeholder="John Doe"
                          className={errors.account_holder_name ? 'border-red-500' : ''}
                        />
                        {errors.account_holder_name && (
                          <p className="text-xs text-red-600 mt-1">{errors.account_holder_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="State Bank of India"
                          className={errors.bank_name ? 'border-red-500' : ''}
                        />
                        {errors.bank_name && (
                          <p className="text-xs text-red-600 mt-1">{errors.bank_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number *
                        </label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          required
                          value={formData.account_number}
                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, '') })}
                          placeholder="1234567890"
                          className={errors.account_number ? 'border-red-500' : ''}
                        />
                        {errors.account_number && (
                          <p className="text-xs text-red-600 mt-1">{errors.account_number}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IFSC Code *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.ifsc_code}
                          onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                          placeholder="SBIN0001234"
                          maxLength={11}
                          className={errors.ifsc_code ? 'border-red-500' : ''}
                        />
                        {errors.ifsc_code ? (
                          <p className="text-xs text-red-600 mt-1">{errors.ifsc_code}</p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">11 characters (e.g., SBIN0001234)</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch Name (Optional)
                        </label>
                        <Input
                          type="text"
                          value={formData.branch_name}
                          onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                          placeholder="Main Branch, Mumbai"
                          className={errors.branch_name ? 'border-red-500' : ''}
                        />
                        {errors.branch_name && (
                          <p className="text-xs text-red-600 mt-1">{errors.branch_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type *
                        </label>
                        <select
                          required
                          value={formData.account_type}
                          onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="Savings">Savings Account</option>
                          <option value="Current">Current Account</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Details</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID (Optional)
                      </label>
                      <Input
                        type="text"
                        value={formData.upi_id}
                        onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                        placeholder="yourname@paytm"
                        className={errors.upi_id ? 'border-red-500' : ''}
                      />
                      {errors.upi_id ? (
                        <p className="text-xs text-red-600 mt-1">{errors.upi_id}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">For faster payouts (e.g., yourname@paytm)</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PAN Number (Optional)
                        </label>
                        <Input
                          type="text"
                          value={formData.pan_number}
                          onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className={errors.pan_number ? 'border-red-500' : ''}
                        />
                        {errors.pan_number ? (
                          <p className="text-xs text-red-600 mt-1">{errors.pan_number}</p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">10 characters (e.g., ABCDE1234F)</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number (Optional)
                        </label>
                        <Input
                          type="text"
                          value={formData.gst_number}
                          onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                          placeholder="22AAAAA0000A1Z5"
                          maxLength={15}
                          className={errors.gst_number ? 'border-red-500' : ''}
                        />
                        {errors.gst_number ? (
                          <p className="text-xs text-red-600 mt-1">{errors.gst_number}</p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">15 characters (e.g., 22AAAAA0000A1Z5)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Saving...
                        </>
                      ) : hasDetails ? (
                        '✓ Update Bank Details'
                      ) : (
                        '💾 Save Bank Details'
                      )}
                    </Button>

                    {hasDetails && (
                      <Button
                        type="button"
                        onClick={handleDelete}
                        variant="destructive"
                        size="lg"
                        className="sm:w-auto"
                      >
                        🗑️ Delete
                      </Button>
                    )}
                  </div>
                </form>

                {/* Info Box */}
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">ℹ️</span>
                    Important Information
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Ensure all details are accurate to avoid payout delays</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Account holder name should match your PAN card</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>IFSC code must be valid and active (11 characters)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>PAN and GST are optional but recommended for tax compliance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>You can update your details anytime</span>
                    </li>
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

