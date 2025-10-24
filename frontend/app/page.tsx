'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Wallet, Check, ArrowRight, Sparkles, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ModernNavbar from '@/components/ModernNavbar';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-700 font-medium">Loading your experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background Orbs - Optimized for mobile performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Reduced blur from blur-3xl to blur-2xl, reduced opacity for better performance */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.18, 0.28, 0.18],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-2xl will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        />

        {/* Grid Pattern Overlay - Hidden on mobile for better performance */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] hidden md:block" />
      </div>

      {/* Modern Navigation */}
      <ModernNavbar />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-dark rounded-full mb-8 border border-blue-500/30"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
            </motion.div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Join 1000+ learners earning daily
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="text-gray-900">Learn, Grow, and </span>
            <motion.span
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Earn
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Unlock premium courses and build{' '}
            <span className="text-emerald-600 font-semibold">passive income</span> through our proven{' '}
            <span className="text-blue-600 font-semibold">2-level affiliate system</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all px-8 py-6 text-lg font-bold"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/packages">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-gray-300 hover:border-blue-500 text-gray-900 px-8 py-6 text-lg font-semibold"
                >
                  View Packages
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
          >
            {[
              { value: '1000+', label: 'Active Learners' },
              { value: '₹5,625', label: 'Max Earnings' },
              { value: '100+', label: 'Premium Courses' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: BookOpen,
              title: 'Premium Courses',
              description: 'Access high-quality video courses across Silver, Gold, and Platinum tiers',
              gradient: 'from-blue-500 to-cyan-500',
              glowColor: 'blue',
            },
            {
              icon: TrendingUp,
              title: 'Earn Commissions',
              description: 'Earn up to ₹5,625 per referral with our proven 2-level system',
              gradient: 'from-emerald-500 to-teal-500',
              glowColor: 'emerald',
            },
            {
              icon: Wallet,
              title: 'Weekly Payouts',
              description: 'Get paid weekly directly to your bank account or UPI',
              gradient: 'from-purple-500 to-pink-500',
              glowColor: 'purple',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: 'spring' }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <Card className="h-full bg-white/90 backdrop-blur-sm border-gray-200/50 hover:border-blue-400/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                {/* Glow Effect on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <CardHeader className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Packages */}
      <section className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
          >
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Package
            </span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-xl max-w-2xl mx-auto"
          >
            Select the perfect plan to start your learning and earning journey
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Silver',
              price: '2,950',
              features: ['Basic courses', 'Earn commissions', '2-level referrals', 'Weekly payouts'],
              popular: false,
              gradient: 'from-slate-600 to-slate-700',
            },
            {
              name: 'Gold',
              price: '5,310',
              features: ['All Silver features', 'Advanced courses', 'Higher commissions', 'Priority support'],
              popular: true,
              gradient: 'from-yellow-500 to-orange-500',
            },
            {
              name: 'Platinum',
              price: '8,850',
              features: ['All Gold features', 'Premium courses', 'Maximum commissions', 'VIP support'],
              popular: false,
              gradient: 'from-purple-500 to-pink-500',
            },
          ].map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: 'spring' }}
              whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
              className={`group ${pkg.popular ? 'md:scale-105' : ''}`}
            >
              <Card className={`h-full relative overflow-hidden ${
                pkg.popular
                  ? 'bg-white/95 backdrop-blur-sm border-2 border-blue-500 shadow-2xl shadow-blue-500/20'
                  : 'bg-white/90 backdrop-blur-sm border-gray-200/50 hover:border-gray-300 hover:shadow-xl transition-all'
              }`}>
                {/* Popular Badge */}
                {pkg.popular && (
                  <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className="absolute -top-0 left-0 right-0"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-center text-sm font-bold">
                      ⭐ MOST POPULAR ⭐
                    </div>
                  </motion.div>
                )}

                {/* Gradient Glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`}
                />

                <CardHeader className={`text-center ${pkg.popular ? 'pt-16' : 'pt-8'} pb-8 relative z-10`}>
                  <CardTitle className="text-3xl font-black text-gray-900 mb-4">
                    {pkg.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-gray-600 text-xl">₹</span>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`text-6xl font-black bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}
                    >
                      {pkg.price}
                    </motion.span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10">
                  <ul className="space-y-4">
                    {pkg.features.map((feature, idx) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-gray-700 text-lg">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Link href="/register" className="block mt-8">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        className={`w-full group text-lg font-bold ${
                          pkg.popular
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-500/50'
                            : 'glass-dark border-slate-600 hover:border-blue-500'
                        }`}
                        variant={pkg.popular ? 'default' : 'outline'}
                      >
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative container mx-auto px-4 py-20 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-3xl p-12 md:p-16 text-center shadow-xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 animate-pulse" />

          <div className="relative z-10">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
            >
              Ready to Start Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Journey?
              </span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto"
            >
              Join thousands of learners who are already{' '}
              <span className="text-emerald-600 font-semibold">earning while they learn</span>
            </motion.p>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-blue-500/50 px-10 py-7 text-xl font-bold"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Create Free Account
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Affiliate Learning
              </h3>
              <p className="text-slate-300 text-sm">
                Learn, grow, and earn with our comprehensive affiliate learning platform.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="text-slate-300 hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="/packages" className="text-slate-300 hover:text-white transition-colors">Packages</Link></li>
                <li><Link href="/register" className="text-slate-300 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-slate-300 hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Email: support@affiliatelearning.com</li>
                <li>Phone: +91 XXXXX XXXXX</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Affiliate Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

