/**
 * Dark Theme Design System
 * Modern, colorful, gradient-rich design with NO white backgrounds
 */

export const theme = {
  // Dark Background Colors
  bg: {
    primary: '#0f172a',      // Darkest - main background
    secondary: '#1e293b',    // Dark - cards, sections
    tertiary: '#334155',     // Medium dark - hover states
    elevated: '#475569',     // Lighter dark - elevated elements
  },

  // Vibrant Accent Colors
  accent: {
    primary: '#3b82f6',      // Blue
    secondary: '#8b5cf6',    // Purple
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Orange
    danger: '#ef4444',       // Red
    info: '#06b6d4',         // Cyan
  },

  // Gradient Combinations
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    blue: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    ocean: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cosmic: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
    fire: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    emerald: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },

  // Text Colors
  text: {
    primary: '#f1f5f9',      // Almost white
    secondary: '#cbd5e1',    // Light gray
    tertiary: '#94a3b8',     // Medium gray
    muted: '#64748b',        // Muted gray
  },

  // Border Colors
  border: {
    primary: '#334155',
    secondary: '#475569',
    accent: '#3b82f6',
  },

  // Shadow Definitions
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    glowPurple: '0 0 20px rgba(139, 92, 246, 0.5)',
    glowGreen: '0 0 20px rgba(16, 185, 129, 0.5)',
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  // Glassmorphism Effect
  glass: {
    background: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: 'blur(10px)',
  },
} as const;

// Tailwind CSS Classes for Dark Theme
export const tw = {
  // Background Classes
  bgPrimary: 'bg-slate-900',
  bgSecondary: 'bg-slate-800',
  bgTertiary: 'bg-slate-700',
  bgElevated: 'bg-slate-600',

  // Text Classes
  textPrimary: 'text-slate-50',
  textSecondary: 'text-slate-300',
  textTertiary: 'text-slate-400',
  textMuted: 'text-slate-500',

  // Border Classes
  borderPrimary: 'border-slate-700',
  borderSecondary: 'border-slate-600',
  borderAccent: 'border-blue-500',

  // Gradient Text
  gradientText: 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
  gradientTextBlue: 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent',
  gradientTextPurple: 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent',

  // Gradient Backgrounds
  gradientBg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
  gradientBgBlue: 'bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900',
  gradientBgPurple: 'bg-gradient-to-br from-purple-900 via-pink-900 to-slate-900',

  // Glassmorphism
  glass: 'bg-slate-800/70 backdrop-blur-md border border-white/10',
  glassHover: 'hover:bg-slate-800/90 hover:border-white/20',

  // Card Styles
  card: 'bg-slate-800 border border-slate-700 rounded-xl shadow-lg',
  cardHover: 'hover:bg-slate-700 hover:border-slate-600 hover:shadow-xl transition-all duration-250',
  cardGlass: 'bg-slate-800/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg',

  // Button Styles
  btnPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-250',
  btnSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-250',
  btnGhost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold rounded-lg transition-all duration-250',

  // Input Styles
  input: 'bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-250',

  // Animation Classes
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-300',
} as const;

// Framer Motion Variants
export const motionVariants = {
  // Fade In
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  },

  // Slide Up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.25 },
  },

  // Slide Down
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.25 },
  },

  // Scale In
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.25 },
  },

  // Stagger Children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  // Stagger Item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25 },
  },

  // Hover Scale
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  },

  // Hover Lift
  hoverLift: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { y: 0 },
  },

  // Pulse
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Rotate
  rotate: {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
} as const;

// Sound Effect Triggers (Document where sounds should play)
export const soundTriggers = {
  // Button Clicks
  buttonClick: 'Play subtle "click" sound on button press',
  buttonHover: 'Play soft "hover" sound on button hover',

  // Navigation
  pageTransition: 'Play "whoosh" sound on page navigation',
  menuOpen: 'Play "slide" sound when menu opens',
  menuClose: 'Play "slide-reverse" sound when menu closes',

  // Notifications
  success: 'Play "success" chime for successful actions',
  error: 'Play "error" beep for failed actions',
  warning: 'Play "warning" tone for warnings',
  info: 'Play "info" ping for informational messages',

  // Interactions
  cardFlip: 'Play "flip" sound when cards animate',
  modalOpen: 'Play "pop" sound when modals open',
  modalClose: 'Play "pop-reverse" sound when modals close',
  tabSwitch: 'Play "switch" sound when switching tabs',

  // Achievements
  levelUp: 'Play "level-up" fanfare when user levels up',
  earnCommission: 'Play "coin" sound when earning commission',
  referralSuccess: 'Play "success-fanfare" when referral is successful',
} as const;

