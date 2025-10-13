'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { emailVerificationAPI } from '@/lib/api';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Sparkles, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    referred_by_code: searchParams.get('ref') || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [validatingReferral, setValidatingReferral] = useState(false);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({ score: 0, text: '', color: '' });
      return;
    }

    let score = 0;
    const password = formData.password;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Determine strength
    let text = '';
    let color = '';
    if (score <= 2) {
      text = 'Weak';
      color = 'bg-danger-500';
    } else if (score <= 4) {
      text = 'Medium';
      color = 'bg-warning-500';
    } else {
      text = 'Strong';
      color = 'bg-success-500';
    }

    setPasswordStrength({ score, text, color });
  }, [formData.password]);

  // Validate referral code with API
  useEffect(() => {
    if (!formData.referred_by_code) {
      setReferralValid(null);
      setReferrerName(null);
      return;
    }

    const code = formData.referred_by_code.trim().toUpperCase();

    // Basic format validation
    if (code.length < 6 || code.length > 12 || !/^[A-Z0-9]+$/.test(code)) {
      setReferralValid(false);
      setReferrerName(null);
      return;
    }

    // Validate with API
    const validateCode = async () => {
      setValidatingReferral(true);
      try {
        const response = await fetch(`http://localhost:8000/api/auth/validate-referral-code?code=${code}`);
        const data = await response.json();

        if (data.valid) {
          setReferralValid(true);
          setReferrerName(data.referrer_name);
        } else {
          setReferralValid(false);
          setReferrerName(null);
        }
      } catch (error) {
        console.error('Error validating referral code:', error);
        setReferralValid(false);
        setReferrerName(null);
      } finally {
        setValidatingReferral(false);
      }
    };

    const debounceTimer = setTimeout(validateCode, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.referred_by_code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength
    if (passwordStrength.score < 3) {
      toast.error('Please use a stronger password');
      return;
    }

    try {
      await register(formData);
      toast.success('🎉 Registration successful! Welcome aboard!');

      // Send verification email (non-blocking)
      try {
        await emailVerificationAPI.sendVerification();
        toast.success('📧 Verification email sent! Please check your inbox.');
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't block registration if email fails
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Sparkles className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Affiliate Learning
            </span>
          </Link>
        </motion.div>

        <Card className="shadow-xl border-neutral-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-neutral-900 mb-2">
              Create Account
            </CardTitle>
            <p className="text-neutral-600">
              Join our learning platform and start earning
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <label htmlFor="fullname" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Full Name <span className="text-danger-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="fullname"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    autoComplete="name"
                    data-testid="register-fullname"
                    className="pl-10"
                    aria-required="true"
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Email <span className="text-danger-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    autoComplete="email"
                    data-testid="register-email"
                    className="pl-10"
                    aria-required="true"
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <label htmlFor="phone" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Phone <span className="text-danger-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    autoComplete="tel"
                    data-testid="register-phone"
                    className="pl-10"
                    aria-required="true"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Password <span className="text-danger-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    data-testid="register-password"
                    className="pl-10 pr-10"
                    aria-required="true"
                    aria-describedby="password-strength"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-600">
                        {passwordStrength.text}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Use 8+ characters with mix of letters, numbers & symbols
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Referral Code */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.referred_by_code}
                    onChange={(e) => setFormData({ ...formData, referred_by_code: e.target.value.toUpperCase() })}
                    placeholder="Enter referral code"
                    autoComplete="off"
                    className={
                      referralValid === true ? 'border-success-500' :
                      referralValid === false ? 'border-danger-500' : ''
                    }
                  />
                  {validatingReferral && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                  {!validatingReferral && referralValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {referralValid ? (
                        <span className="text-success-600">✓</span>
                      ) : (
                        <span className="text-danger-600">✗</span>
                      )}
                    </div>
                  )}
                </div>
                {referralValid === false && (
                  <p className="text-xs text-danger-600 mt-1">
                    Invalid referral code. Please check and try again.
                  </p>
                )}
                {referralValid === true && referrerName && (
                  <div className="mt-2 p-3 bg-success-50 border border-success-200 rounded-lg">
                    <p className="text-sm text-success-800">
                      ✓ Valid referral code! You were referred by <strong>{referrerName}</strong>
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                  data-testid="register-submit"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="text-center mt-6 text-neutral-600"
            >
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Login
              </Link>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

