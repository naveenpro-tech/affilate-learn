'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'lg',
  rounded = 'xl',
  shadow = 'lg',
  onClick,
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  const baseClasses = `
    bg-white/80 
    backdrop-blur-xl 
    border 
    border-white/20
    ${paddingClasses[padding]}
    ${roundedClasses[rounded]}
    ${shadowClasses[shadow]}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}

