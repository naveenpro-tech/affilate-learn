declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayOptions {
  orderId: string;
  amount: number;
  packageName: string;
  userEmail: string;
  userPhone: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const initiatePayment = async ({
  orderId,
  amount,
  packageName,
  userEmail,
  userPhone,
  onSuccess,
  onFailure,
}: RazorpayOptions) => {
  const loaded = await loadRazorpay();
  
  if (!loaded) {
    onFailure(new Error('Failed to load Razorpay SDK'));
    return;
  }

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    name: 'Affiliate Learning Platform',
    description: `${packageName} Package`,
    order_id: orderId,
    handler: (response: any) => {
      onSuccess(response);
    },
    prefill: {
      email: userEmail,
      contact: userPhone,
    },
    theme: {
      color: '#4F46E5',
    },
    modal: {
      ondismiss: () => {
        onFailure(new Error('Payment cancelled by user'));
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

