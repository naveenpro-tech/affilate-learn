'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * ToasterProvider - Client-side wrapper for react-hot-toast
 * This component is rendered on the client side only to avoid hydration issues
 * and to prevent Pydantic validation errors from being passed to the Toaster
 */
export default function ToasterProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Toaster position="top-right" reverseOrder={false} />;
}

