'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    setMounted(true);
    // Initialize auth state from localStorage on app load
    fetchUser();
  }, [fetchUser]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

