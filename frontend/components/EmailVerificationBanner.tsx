'use client';

import { useEffect, useState } from 'react';
import { emailVerificationAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EmailVerificationBanner() {
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await emailVerificationAPI.getStatus();
      setEmailVerified(response.data.email_verified);
    } catch (error) {
      console.error('Failed to check verification status:', error);
      // If error, assume verified to avoid showing banner unnecessarily
      setEmailVerified(true);
    }
  };

  const handleResendVerification = async () => {
    try {
      setSending(true);
      await emailVerificationAPI.resendVerification();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Failed to resend verification:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send verification email';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  // Don't show banner if verified, dismissed, or still loading
  if (emailVerified === null || emailVerified === true || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600 text-xl">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Email Not Verified
              </p>
              <p className="text-xs text-yellow-700">
                Please verify your email address to access all features
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  📧 Resend Verification Email
                </>
              )}
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-yellow-700 hover:text-yellow-900 text-sm"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

