"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Zap,
  BookOpen,
  Search,
  GraduationCap,
  DollarSign,
  Wallet,
  CreditCard,
  Users,
  Trophy,
  Settings,
  Bell,
  UserCircle,
  LogOut,
  Shield,
  BookMarked,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

export function ModernSidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Main navigation links
  const mainLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      dataTour: "dashboard",
    },
    {
      label: "Packages",
      href: "/packages",
      icon: (
        <Package className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Creative Studio section
  const studioLinks = [
    {
      label: "Create Images",
      href: "/studio",
      icon: (
        <Sparkles className="text-purple-600 dark:text-purple-400 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My Creations",
      href: "/studio/my-creations",
      icon: (
        <ImageIcon className="text-purple-600 dark:text-purple-400 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Buy Credits",
      href: "/studio/buy-credits",
      icon: (
        <Zap className="text-yellow-600 dark:text-yellow-400 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Learning section
  const learningLinks = [
    {
      label: "My Courses",
      href: "/courses",
      icon: (
        <BookOpen className="text-blue-600 dark:text-blue-400 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Browse Courses",
      href: "/courses/browse",
      icon: (
        <Search className="text-blue-600 dark:text-blue-400 h-5 w-5 flex-shrink-0" />
      ),
      dataTour: "courses",
    },
    {
      label: "Certificates",
      href: "/certificates",
      icon: (
        <GraduationCap className="text-blue-600 dark:text-blue-400 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Earnings section
  const earningsLinks = [
    {
      label: "Earnings Overview",
      href: "/earnings",
      icon: (
        <DollarSign className="text-green-600 dark:text-green-400 h-5 w-5 flex-shrink-0" />
      ),
      dataTour: "earnings",
    },
    {
      label: "Wallet",
      href: "/wallet",
      icon: (
        <Wallet className="text-green-600 dark:text-green-400 h-5 w-5 flex-shrink-0" />
      ),
      dataTour: "wallet",
    },
    {
      label: "Payouts",
      href: "/payouts",
      icon: (
        <CreditCard className="text-green-600 dark:text-green-400 h-5 w-5 flex-shrink-0" />
      ),
      dataTour: "payouts",
    },
  ];

  // Network section
  const networkLinks = [
    {
      label: "My Referrals",
      href: "/referrals",
      icon: (
        <Users className="text-indigo-600 dark:text-indigo-400 h-5 w-5 flex-shrink-0" />
      ),
      dataTour: "referrals",
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      icon: (
        <Trophy className="text-yellow-600 dark:text-yellow-400 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Settings section
  const settingsLinks = [
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <UserCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: (
        <Bell className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Admin section (conditional)
  const adminLinks = user?.is_admin
    ? [
        {
          label: "Admin Dashboard",
          href: "/admin",
          icon: (
            <Shield className="text-red-600 dark:text-red-400 h-5 w-5 flex-shrink-0" />
          ),
        },
        {
          label: "Manage Modules",
          href: "/admin/modules",
          icon: (
            <BookMarked className="text-red-600 dark:text-red-400 h-5 w-5 flex-shrink-0" />
          ),
        },
      ]
    : [];

  return (
    <div className="h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            
            {/* Main Navigation */}
            <div className="mt-8 flex flex-col gap-2">
              {mainLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Creative Studio Section */}
            {open && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-2">
                  Creative Studio
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {studioLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Learning Section */}
            {open && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-2">
                  Learning
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {learningLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Earnings Section */}
            {open && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-2">
                  Earnings
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {earningsLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Network Section */}
            {open && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-2">
                  Network
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {networkLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Settings Section */}
            {open && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-2">
                  Settings
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {settingsLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Admin Section (if admin) */}
            {user?.is_admin && (
              <>
                {open && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider px-2 mb-2">
                      Admin
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {adminLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Profile & Logout */}
          <div>
            <SidebarLink
              link={{
                label: user?.full_name || "User",
                href: "/profile",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                ),
              }}
            />
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md px-2 transition-colors"
            >
              <LogOut className="text-red-600 dark:text-red-400 h-5 w-5 flex-shrink-0" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-red-600 dark:text-red-400 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-black dark:text-white whitespace-pre bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >
        Affiliate Learn
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

