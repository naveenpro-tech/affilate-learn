'use client';

import { ReactNode } from 'react';
import { ModernSidebar } from './ModernSidebar';
import EmailVerificationBanner from './EmailVerificationBanner';
import { cn } from '@/lib/utils';

interface ModernDashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ModernDashboardLayout({ children, className }: ModernDashboardLayoutProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-gray-100 dark:bg-neutral-900", className)}>
      <ModernSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmailVerificationBanner />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

