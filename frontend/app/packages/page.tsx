'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { packagesAPI, paymentsAPI } from '@/lib/api';
import { initiatePayment } from '@/lib/razorpay';
import toast from 'react-hot-toast';

export default function PackagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await packagesAPI.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: any) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setPurchasing(pkg.id);

    try {
      // Create Razorpay order
      const orderResponse = await paymentsAPI.createOrder(pkg.id);
      const { order_id, amount } = orderResponse.data;

      // Initiate Razorpay payment
      await initiatePayment({
        orderId: order_id,
        amount: amount,
        packageName: pkg.name,
        userEmail: user.email,
        userPhone: user.phone,
        onSuccess: async (response) => {
          try {
            // Verify payment
            await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Refresh user data to get updated package info
            const { fetchUser } = useAuthStore.getState();
            await fetchUser();

            toast.success('Payment successful! Package activated.');
            router.push('/dashboard');
          } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Payment verification failed';
            toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
          } finally {
            setPurchasing(null);
          }
        },
        onFailure: (error) => {
          const errorMessage = error.message || 'Payment failed';
          toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
          setPurchasing(null);
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create order';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      setPurchasing(null);
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Package</h1>
            <p className="text-xl text-gray-600">
              Select the perfect package for your learning journey
            </p>
          </div>

          {user?.current_package && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg mb-8 text-center">
              You currently have the <strong>{user.current_package}</strong> package.
              You can upgrade to a higher tier anytime!
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  index === 1 ? 'transform scale-105 border-4 border-indigo-600' : 'border-2 border-gray-200'
                }`}
              >
                {index === 1 && (
                  <div className="bg-indigo-600 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-indigo-600 mb-6">
                    ₹{pkg.final_price?.toLocaleString() || pkg.price?.toLocaleString() || '0'}
                  </div>

                  <p className="text-gray-600 mb-6">{pkg.description}</p>

                  <div className="space-y-3 mb-8">
                    {pkg.features && typeof pkg.features === 'object' && Object.entries(pkg.features).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id || user?.current_package === pkg.name}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      user?.current_package === pkg.name
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : purchasing === pkg.id
                        ? 'bg-gray-400 text-white cursor-wait'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {user?.current_package === pkg.name
                      ? 'Current Package'
                      : purchasing === pkg.id
                      ? 'Processing...'
                      : 'Buy Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Commission Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Earn While You Learn</h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-600 mb-6 text-center">
                Refer others and earn commissions based on your package tier and their purchase!
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">Up to ₹5,625</div>
                  <div className="text-sm text-gray-600">Level 1 Commission</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">Up to ₹1,000</div>
                  <div className="text-sm text-gray-600">Level 2 Commission</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">Weekly</div>
                  <div className="text-sm text-gray-600">Payout Schedule</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

