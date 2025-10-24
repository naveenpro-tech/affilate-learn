'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  BookOpen,
  Package,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Award,
  Users,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function EnhancedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/courses', label: 'Courses', icon: BookOpen },
        { href: '/packages', label: 'Packages', icon: Package },
        { href: '/wallet', label: 'Wallet', icon: Wallet },
        { href: '/referrals', label: 'Referrals', icon: Users },
      ]
    : [
        { href: '/', label: 'Home', icon: Home },
        { href: '/courses', label: 'Courses', icon: BookOpen },
        { href: '/packages', label: 'Packages', icon: Package },
      ];

  // Add admin link if user is admin
  if (isAuthenticated && user?.is_admin) {
    navLinks.push({ href: '/admin', label: 'Admin', icon: Settings });
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50'
            : 'bg-white/60 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Affiliate Learning
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{link.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </motion.button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.profile_picture || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/wallet')}>
                        <Wallet className="w-4 h-4 mr-2" />
                        Wallet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/certificates')}>
                        <Award className="w-4 h-4 mr-2" />
                        Certificates
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          active
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                    </Link>
                  );
                })}

                {isAuthenticated ? (
                  <>
                    <div className="border-t border-gray-200 my-2 pt-2">
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                          <User className="w-5 h-5" />
                          <span className="font-medium">Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 my-2 pt-2 space-y-2">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="px-4 py-3 text-center text-gray-700 hover:bg-gray-100 rounded-lg font-medium">
                        Login
                      </div>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="px-4 py-3 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                        Get Started
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
}

