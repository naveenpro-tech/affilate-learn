'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import EmailVerificationBanner from './EmailVerificationBanner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-72 transition-all duration-300">
        <EmailVerificationBanner />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

