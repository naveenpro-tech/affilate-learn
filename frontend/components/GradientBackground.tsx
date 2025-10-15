'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'blue' | 'pink';
  showGrid?: boolean;
  showOrbs?: boolean;
}

export default function GradientBackground({
  children,
  variant = 'default',
  showGrid = true,
  showOrbs = true,
}: GradientBackgroundProps) {
  const gradients = {
    default: 'from-blue-50 via-purple-50 to-pink-50',
    purple: 'from-purple-50 via-pink-50 to-indigo-50',
    blue: 'from-blue-50 via-cyan-50 to-indigo-50',
    pink: 'from-pink-50 via-rose-50 to-purple-50',
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${gradients[variant]}`}>
      {/* Animated Background Orbs */}
      {showOrbs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Blue Orb */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
          />

          {/* Purple Orb */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -80, 0],
              y: [0, 80, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          />

          {/* Pink Orb */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.25, 0.45, 0.25],
              x: [0, 60, 0],
              y: [0, -60, 0],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-pink-400/30 to-blue-400/30 rounded-full blur-3xl"
          />
        </div>
      )}

      {/* Grid Pattern Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

