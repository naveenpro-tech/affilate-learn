import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  referral_code: string;
  is_active: boolean;
  is_admin: boolean;
  current_package?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean; // Track if initial auth check is complete
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false, // Start as false

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token, isAuthenticated: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ email, password });
      const { access_token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
      }
      set({ token: access_token, isAuthenticated: true });

      // Fetch user data
      const userResponse = await authAPI.getMe();
      set({ user: userResponse.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register(data);
      const { access_token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
      }
      set({ token: access_token, isAuthenticated: true });

      // Fetch user data
      const userResponse = await authAPI.getMe();
      set({ user: userResponse.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, isInitialized: true });
      return;
    }

    set({ isLoading: true, token, isAuthenticated: true });
    try {
      const response = await authAPI.getMe();
      set({ user: response.data, isLoading: false, isInitialized: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },
}));

