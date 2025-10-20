'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from './NotificationBell';

interface MenuItem {
  href?: string;
  label: string;
  icon: string;
  children?: MenuItem[];
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Learning', 'Earnings', 'Network', 'Settings']);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  const menuItems: MenuItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/packages', label: 'Packages', icon: '📦' },
    {
      label: 'Creative Studio',
      icon: '✨',
      children: [
        { href: '/studio', label: 'Create Images', icon: '🎨' },
        { href: '/studio/my-creations', label: 'My Creations', icon: '🖼️' },
        { href: '/studio/buy-credits', label: 'Buy Credits', icon: '⚡' },
      ]
    },
    {
      label: 'Learning',
      icon: '📚',
      children: [
        { href: '/courses', label: 'My Courses', icon: '📖' },
        { href: '/certificates', label: 'Certificates', icon: '🎓' },
      ]
    },
    {
      label: 'Earnings',
      icon: '💰',
      children: [
        { href: '/earnings', label: 'Overview', icon: '💵' },
        { href: '/wallet', label: 'Wallet', icon: '💳' },
        { href: '/payouts', label: 'Payouts', icon: '💸' },
      ]
    },
    {
      label: 'Network',
      icon: '👥',
      children: [
        { href: '/referrals', label: 'My Referrals', icon: '🔗' },
        { href: '/leaderboard', label: 'Leaderboard', icon: '🥇' },
      ]
    },
    {
      label: 'Settings',
      icon: '⚙️',
      children: [
        { href: '/profile', label: 'Profile', icon: '👤' },
        { href: '/notifications', label: 'Notifications', icon: '🔔' },
      ]
    },
  ];

  if (user?.is_admin) {
    menuItems.push({
      label: 'Admin',
      icon: '🔧',
      children: [
        { href: '/admin', label: 'Dashboard', icon: '⚙️' },
        { href: '/admin/modules', label: 'Modules', icon: '📖' },
      ]
    });
  }

  const isActive = (path: string) => pathname === path;
  const isExpanded = (label: string) => expandedSections.includes(label);

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.label);

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleSection(item.label)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </div>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-500"
            >
              ▼
            </motion.span>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                  {item.children?.map(child => renderMenuItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href || '#'}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive(item.href || '')
            ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="text-lg">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
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

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-2xl z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarOpen ? 'w-72' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="text-2xl font-bold text-indigo-600">
                  {sidebarOpen ? 'Affiliate Learning' : 'AL'}
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map(item => renderMenuItem(item))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{user?.full_name}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <span>🚪</span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content spacer */}
      <div className={`${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} transition-all duration-300`}>
        {/* This div pushes content to the right of the sidebar */}
      </div>
    </>
  );
}

