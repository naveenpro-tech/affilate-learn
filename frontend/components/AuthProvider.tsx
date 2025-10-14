'use client';

import { useEffect, useState } from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize auth state from localStorage on app load
    if (typeof window !== 'undefined') {
      // Dynamically import the store only on client side
      import('@/store/authStore').then(({ useAuthStore }) => {
        const fetchUser = useAuthStore.getState().fetchUser;
        fetchUser();
      });
    }
  }, []);

  // Always render children to prevent hydration mismatch
  return <>{children}</>;
}

