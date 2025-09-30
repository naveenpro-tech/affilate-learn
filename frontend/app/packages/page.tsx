'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { packagesAPI, paymentsAPI } from '@/lib/api';
import { initiatePayment } from '@/lib/razorpay';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Package
            </h1>
            <p className="text-xl text-gray-600">
              Select the perfect package for your learning journey
            </p>
          </motion.div>

          {user?.current_package && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mb-8 border-l-4 border-blue-500">
                <CardContent className="py-4">
                  <p className="text-blue-700 text-center">
                    You currently have the <strong>{user.current_package}</strong> package.
                    You can upgrade to a higher tier anytime!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className={`relative ${index === 1 ? 'md:-mt-4' : ''}`}
              >
                <Card className={`h-full ${
                  index === 1 ? 'border-4 border-indigo-600 shadow-2xl' : 'shadow-lg'
                }`}>
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge variant="default" className="px-4 py-2 text-sm">
                        ⭐ Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </CardTitle>
                    <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      ₹{pkg.final_price?.toLocaleString() || pkg.price?.toLocaleString() || '0'}
                    </div>
                    <p className="text-gray-600">{pkg.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {pkg.features && typeof pkg.features === 'object' && Object.entries(pkg.features).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasing === pkg.id || user?.current_package === pkg.name}
                      variant={user?.current_package === pkg.name ? "secondary" : "default"}
                      className="w-full"
                      size="lg"
                    >
                      {user?.current_package === pkg.name
                        ? '✓ Current Package'
                        : purchasing === pkg.id
                        ? 'Processing...'
                        : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Commission Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Earn While You Learn
            </h2>
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <p className="text-gray-600 mb-8 text-center text-lg">
                  Refer others and earn commissions based on your package tier and their purchase!
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-4xl font-bold text-blue-600 mb-2">Up to ₹5,625</div>
                    <div className="text-sm font-medium text-gray-700">Level 1 Commission</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-4xl font-bold text-purple-600 mb-2">Up to ₹1,000</div>
                    <div className="text-sm font-medium text-gray-700">Level 2 Commission</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-4xl font-bold text-green-600 mb-2">Weekly</div>
                    <div className="text-sm font-medium text-gray-700">Payout Schedule</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

