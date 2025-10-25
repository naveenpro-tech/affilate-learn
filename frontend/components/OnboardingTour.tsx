'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface OnboardingTourProps {
  run?: boolean;
  onComplete?: () => void;
}

export default function OnboardingTour({ run = false, onComplete }: OnboardingTourProps) {
  const { user } = useAuthStore();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Auto-start tour if user hasn't completed onboarding
    if (user && !user.onboarding_completed && !run) {
      // Delay to ensure page is fully loaded
      setTimeout(() => {
        setRunTour(true);
      }, 1000);
    } else if (run) {
      setRunTour(true);
    }
  }, [user, run]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to Affiliate Learning Platform! 🎉
          </h2>
          <p className="text-gray-700">
            Let's take a quick tour to help you get started. This will only take 2 minutes!
          </p>
          <p className="text-sm text-gray-500">
            You can skip this tour anytime by clicking "Skip" or restart it later from your profile settings.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">📊 Dashboard</h3>
          <p className="text-gray-700">
            Your dashboard shows your learning progress, earnings, and quick access to important features.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="courses"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">📚 Browse Courses</h3>
          <p className="text-gray-700">
            Explore and enroll in courses based on your package tier. You can also purchase individual courses!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="referrals"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">🤝 Referral Program</h3>
          <p className="text-gray-700">
            Share your unique referral code and earn commissions when others join through your link!
          </p>
          <p className="text-sm text-blue-600 font-medium">
            💰 Earn up to 2 levels of commissions on every purchase!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="earnings"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">💰 Track Earnings</h3>
          <p className="text-gray-700">
            Monitor your referral commissions and see how much you've earned.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="wallet"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">💳 Wallet</h3>
          <p className="text-gray-700">
            Your wallet shows your available balance from commissions. Request payouts when you're ready!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="payouts"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">💸 Request Payouts</h3>
          <p className="text-gray-700">
            Once you have a balance, you can request payouts to your bank account. Make sure to add your bank details first!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            You're All Set! 🚀
          </h2>
          <p className="text-gray-700">
            You now know the basics of the platform. Start exploring, learning, and earning!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro Tip:</strong> Complete your profile and add bank details to start earning from referrals!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);

      // Only mark onboarding as completed if this is the first-time tour (not manually triggered)
      if (!run && user && !user.onboarding_completed) {
        try {
          await authAPI.completeOnboarding();
          toast.success('Welcome tour completed! 🎉');
        } catch (error) {
          console.error('Error completing onboarding:', error);
          // Don't show error to user, just log it
        }
      } else if (run) {
        // Manually triggered tour
        toast.success('Tutorial completed! 🎓');
      }

      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

