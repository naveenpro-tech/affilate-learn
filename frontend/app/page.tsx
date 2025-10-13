'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Wallet, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Affiliate Learning
              </h1>
            </motion.div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="default">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="default" className="group">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
              Join 1000+ learners earning daily
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Learn, Grow, and{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Earn
            </span>
          </h2>
          <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unlock premium courses and build passive income through our proven 2-level affiliate system
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="group w-full sm:w-auto">
                Start Learning Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Packages
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-white">
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
              bgColor: 'bg-primary-50',
              iconColor: 'text-primary-600',
            },
            {
              icon: TrendingUp,
              title: 'Earn Commissions',
              description: 'Earn up to ₹5,625 per referral with our proven 2-level system',
              bgColor: 'bg-success-50',
              iconColor: 'text-success-600',
            },
            {
              icon: Wallet,
              title: 'Weekly Payouts',
              description: 'Get paid weekly directly to your bank account or UPI',
              bgColor: 'bg-warning-50',
              iconColor: 'text-warning-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-neutral-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Packages */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-4xl font-bold text-neutral-900 mb-4">
            Choose Your Package
          </h3>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Select the perfect plan to start your learning and earning journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Silver',
              price: '2,950',
              features: ['Basic courses', 'Earn commissions', '2-level referrals', 'Weekly payouts'],
              popular: false,
            },
            {
              name: 'Gold',
              price: '5,310',
              features: ['All Silver features', 'Advanced courses', 'Higher commissions', 'Priority support'],
              popular: true,
            },
            {
              name: 'Platinum',
              price: '8,850',
              features: ['All Gold features', 'Premium courses', 'Maximum commissions', 'VIP support'],
              popular: false,
            },
          ].map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={pkg.popular ? 'md:scale-105' : ''}
            >
              <Card className={`h-full relative ${pkg.popular ? 'border-primary-600 border-2 shadow-xl' : 'border-neutral-200'}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold text-neutral-900 mb-2">
                    {pkg.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-neutral-600 text-lg">₹</span>
                    <span className="text-5xl font-bold text-primary-600">{pkg.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-6">
                    <Button
                      variant={pkg.popular ? 'default' : 'outline'}
                      size="lg"
                      className="w-full group"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center text-white"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already earning while they learn
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="group">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

