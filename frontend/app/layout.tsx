import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Affiliate Learning Platform',
  description: 'Learn and earn with our affiliate program',
};

// Disable caching for all pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark smooth-scroll">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-dark border-slate-700/50',
            style: {
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(71, 85, 105, 0.5)',
            },
          }}
        />
      </body>
    </html>
  );
}

