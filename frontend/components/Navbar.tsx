'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: '🏠 Dashboard' },
    { href: '/packages', label: '📦 Packages' },
    { href: '/courses', label: '📚 Courses' },
    { href: '/referrals', label: '👥 Referrals' },
    { href: '/earnings', label: '💰 Earnings' },
    { href: '/payouts', label: '💸 Payouts' },
    { href: '/certificates', label: '🏆 Certificates' },
    { href: '/notifications', label: '🔔 Notifications' },
    { href: '/leaderboard', label: '🥇 Leaderboard' },
    { href: '/profile', label: '👤 Profile' },
  ];

  if (user?.is_admin) {
    navLinks.push(
      { href: '/admin', label: '⚙️ Admin' },
      { href: '/admin/modules', label: '📖 Modules' }
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600">
              Affiliate Learning
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationBell />
            <div className="text-sm">
              <div className="font-semibold text-neutral-900">{user?.full_name}</div>
              <div className="text-xs text-neutral-500">{user?.email}</div>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
            >
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="px-4 py-3 border-t border-gray-200 mt-2">
                  <div className="text-sm font-semibold text-gray-900 mb-1">{user?.full_name}</div>
                  <div className="text-xs text-gray-500 mb-3">{user?.email}</div>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

