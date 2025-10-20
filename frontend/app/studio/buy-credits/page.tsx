'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { paymentsAPI, studioAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Check,
  ArrowLeft,
  Loader,
  Sparkles,
} from 'lucide-react';

interface CreditPackage {
  id: number;
  credits: number;
  price: number;
  discount?: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 1, credits: 10, price: 50 },
  { id: 2, credits: 25, price: 100, discount: 5 },
  { id: 3, credits: 50, price: 200, discount: 10, popular: true },
  { id: 4, credits: 100, price: 350, discount: 15 },
  { id: 5, credits: 250, price: 800, discount: 20 },
];

export default function BuyCreditsPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    CREDIT_PACKAGES[2]
  );
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCreditsBalance();
  }, []);

  const loadCreditsBalance = async () => {
    try {
      const response = await studioAPI.getCreditsBalance();
      setCreditsBalance(response.data.balance);
    } catch (error: any) {
      console.error('Failed to load credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    try {
      // Create order for credit package
      const response = await paymentsAPI.createOrder(selectedPackage.id);
      const { order_id, amount, razorpay_key } = response.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: razorpay_key,
          amount: amount * 100,
          currency: 'INR',
          name: 'Creative Studio',
          description: `${selectedPackage.credits} Credits`,
          order_id: order_id,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await paymentsAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                package_id: selectedPackage.id,
              });

              toast.success(
                `${selectedPackage.credits} credits added to your account!`
              );
              setCreditsBalance(
                (prev) => prev + selectedPackage.credits
              );
              setTimeout(() => {
                router.push('/studio');
              }, 2000);
            } catch (error: any) {
              console.error('Payment verification failed:', error);
              toast.error('Payment verification failed');
              setPurchasing(false);
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#3b82f6',
          },
          modal: {
            ondismiss: function () {
              setPurchasing(false);
              toast.error('Payment cancelled');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(
        error.response?.data?.detail || 'Failed to create order'
      );
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                  <Zap className="w-10 h-10 text-yellow-500" />
                  Buy Credits
                </h1>
                <p className="text-slate-600 mt-2">
                  Purchase credits to generate more images
                </p>
              </div>
            </div>

            {/* Current Balance */}
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-primary-100">Current Balance</p>
                    <p className="text-4xl font-bold">{creditsBalance}</p>
                  </div>
                  <Sparkles className="w-12 h-12 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Credit Packages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            {CREDIT_PACKAGES.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'ring-2 ring-primary-500 shadow-lg'
                      : 'hover:shadow-md'
                  } ${pkg.popular ? 'border-primary-500' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg text-center">
                      POPULAR
                    </div>
                  )}
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {pkg.credits}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Credits</p>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-slate-900">
                        ₹{pkg.price}
                      </div>
                      {pkg.discount && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Save {pkg.discount}%
                        </Badge>
                      )}
                      <p className="text-xs text-slate-500">
                        ₹{(pkg.price / pkg.credits).toFixed(2)}/credit
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary & Purchase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPackage && (
                    <>
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-slate-600">
                          {selectedPackage.credits} Credits
                        </span>
                        <span className="font-semibold">
                          ₹{selectedPackage.price}
                        </span>
                      </div>
                      {selectedPackage.discount && (
                        <div className="flex justify-between items-center pb-4 border-b text-green-600">
                          <span>Discount ({selectedPackage.discount}%)</span>
                          <span>
                            -₹
                            {(
                              (selectedPackage.price *
                                selectedPackage.discount) /
                              100
                            ).toFixed(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">
                          ₹{selectedPackage.price}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Instant activation</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">No expiration</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Secure payment</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">24/7 support</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Purchase Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex gap-4"
          >
            <Button
              onClick={() => router.push('/studio')}
              variant="outline"
              className="flex-1"
            >
              Continue Creating
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!selectedPackage || purchasing}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              {purchasing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Buy {selectedPackage?.credits} Credits
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

