'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { emailVerificationAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('No verification token provided');
      setVerifying(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setVerifying(true);
      const response = await emailVerificationAPI.verifyEmail(token);
      setSuccess(true);
      toast.success(response.data.message || 'Email verified successfully!');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to verify email';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to verify email');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {verifying && (
            <>
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {!verifying && success && (
            <>
              <div className="mb-6">
                <div className="text-6xl mb-4">✅</div>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Email Verified Successfully!
              </h1>
              <p className="text-gray-600 mb-4">
                Your email has been verified. You will be redirected to the dashboard shortly.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Redirecting to dashboard in 3 seconds...
                </p>
              </div>
            </>
          )}

          {!verifying && error && (
            <>
              <div className="mb-6">
                <div className="text-6xl mb-4">❌</div>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@bilvanaturals.online" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

