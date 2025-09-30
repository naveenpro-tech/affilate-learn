'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-indigo-600">
            Affiliate Learning Platform
          </h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-6 py-2 text-indigo-600 hover:text-indigo-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Learn, Grow, and Earn
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our affiliate learning platform and unlock premium courses while earning commissions by referring others.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Start Your Journey
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-3">Premium Courses</h3>
            <p className="text-gray-600">
              Access high-quality video courses across Silver, Gold, and Platinum tiers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">Earn Commissions</h3>
            <p className="text-gray-600">
              Earn up to ₹5,625 per referral with our 2-level commission system.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-2xl font-bold mb-3">Weekly Payouts</h3>
            <p className="text-gray-600">
              Get paid weekly directly to your bank account or UPI.
            </p>
          </div>
        </div>

        {/* Packages */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">Choose Your Package</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h4 className="text-2xl font-bold mb-2">Silver</h4>
              <p className="text-4xl font-bold text-indigo-600 mb-4">₹2,950</p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Basic courses</li>
                <li>✓ Earn commissions</li>
                <li>✓ 2-level referrals</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-indigo-600 transform scale-105">
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm inline-block mb-2">
                Most Popular
              </div>
              <h4 className="text-2xl font-bold mb-2">Gold</h4>
              <p className="text-4xl font-bold text-indigo-600 mb-4">₹5,310</p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ All Silver features</li>
                <li>✓ Advanced courses</li>
                <li>✓ Higher commissions</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h4 className="text-2xl font-bold mb-2">Platinum</h4>
              <p className="text-4xl font-bold text-indigo-600 mb-4">₹8,850</p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ All Gold features</li>
                <li>✓ Premium courses</li>
                <li>✓ Maximum commissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

