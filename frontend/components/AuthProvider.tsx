'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    // Initialize auth state from localStorage on app load
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}

