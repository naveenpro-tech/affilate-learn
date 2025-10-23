# Mobile UI/UX Specifications - Community AI Studio

**Design System:** TikTok/Instagram Reels-inspired  
**Platform:** Progressive Web App (PWA)  
**Target Devices:** iOS 14+, Android 10+  
**Screen Sizes:** 375px - 428px width (mobile)

---

## Design Principles

1. **Thumb-Zone First:** All primary actions within bottom 1/3 of screen
2. **One-Tap Actions:** Minimize steps to core actions (remix, like, share)
3. **Instant Feedback:** Optimistic UI updates, smooth animations
4. **Addictive Scroll:** Infinite vertical feed, no friction
5. **Visual Hierarchy:** Image first, text minimal, actions prominent

---

## Color Palette

### Primary Colors
```css
--primary: #667eea;        /* Purple - Brand color */
--primary-dark: #5568d3;   /* Darker purple - Hover states */
--primary-light: #a5b4fc;  /* Light purple - Backgrounds */
```

### Secondary Colors
```css
--secondary: #f59e0b;      /* Amber - Accents, CTAs */
--success: #10b981;        /* Green - Success states */
--error: #ef4444;          /* Red - Error states */
--warning: #f59e0b;        /* Amber - Warnings */
```

### Neutral Colors
```css
--background: #ffffff;     /* White - Main background */
--surface: #f9fafb;        /* Light gray - Cards */
--text-primary: #111827;   /* Dark gray - Primary text */
--text-secondary: #6b7280; /* Medium gray - Secondary text */
--border: #e5e7eb;         /* Light gray - Borders */
```

### Dark Mode (Optional V2)
```css
--background-dark: #111827;
--surface-dark: #1f2937;
--text-primary-dark: #f9fafb;
--text-secondary-dark: #9ca3af;
```

---

## Typography

### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Poppins', 'Inter', sans-serif; /* For headings */
```

### Font Sizes
```css
--text-xs: 12px;    /* Captions, metadata */
--text-sm: 14px;    /* Body text, buttons */
--text-base: 16px;  /* Default body */
--text-lg: 18px;    /* Subheadings */
--text-xl: 20px;    /* Headings */
--text-2xl: 24px;   /* Page titles */
--text-3xl: 30px;   /* Hero text */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing System

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

---

## Component Specifications

### 1. Vertical Feed Card

**Dimensions:**
- Width: 100vw (full screen)
- Height: 100vh (full screen, minus safe areas)
- Aspect Ratio: Preserve original (fit to screen)

**Layout:**
```
┌─────────────────────────────────┐
│                                 │ ← Safe area top (status bar)
│                                 │
│                                 │
│        [AI Generated Image]     │ ← Full-screen image
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ 👤 @username                    │ ← Author info (overlay)
│ "Cyberpunk cat warrior"         │ ← Title (overlay)
│                                 │
│ ❤️ 1.2K  💬 45  🔄 23          │ ← Engagement stats
│                                 │
│         [🎨 Remix]              │ ← Primary CTA (prominent)
│                                 │
│ [💾]  [📤]  [⋯]                │ ← Secondary actions
└─────────────────────────────────┘
  ↑ Safe area bottom (home indicator)
```

**Styling:**
```css
.feed-card {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}

.feed-card__image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Preserve aspect ratio */
  background: #000;
}

.feed-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-6);
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.feed-card__author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.feed-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-3);
}

.feed-card__stats {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.feed-card__remix-btn {
  width: 100%;
  padding: var(--space-4);
  background: var(--primary);
  color: white;
  border-radius: 12px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.feed-card__remix-btn:active {
  transform: scale(0.95);
}
```

**Interactions:**
- **Swipe up/down:** Navigate to next/previous post
- **Double-tap:** Like post (heart animation)
- **Tap image:** View full details (optional)
- **Tap Remix:** Open remix flow
- **Long-press:** Show save/share menu

---

### 2. Remix Flow Modal

**Step 1: Photo Source Selection**

```
┌─────────────────────────────────┐
│  [×]                            │ ← Close button
│                                 │
│  [Blurred original image]       │ ← Preview of style
│                                 │
│  Remix this style               │
│  with your photo                │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📸 Take Photo          │   │ ← Primary action
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🖼️ Choose from Gallery │   │ ← Secondary action
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Styling:**
```css
.remix-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-6);
  z-index: 1000;
}

.remix-modal__preview {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: var(--space-6);
  filter: blur(8px);
}

.remix-modal__title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: white;
  text-align: center;
  margin-bottom: var(--space-8);
}

.remix-modal__button {
  width: 100%;
  max-width: 320px;
  padding: var(--space-4);
  background: var(--primary);
  color: white;
  border-radius: 12px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.remix-modal__button--secondary {
  background: var(--surface);
  color: var(--text-primary);
}
```

**Step 2: Generation Progress**

```
┌─────────────────────────────────┐
│  [×]                            │
│                                 │
│  [Your uploaded photo]          │ ← Preview
│                                 │
│  Applying style...              │
│  ⏱️ ~8 seconds                  │
│                                 │
│  ████████░░░░░░░░░░░░░░░░░░░░  │ ← Progress bar (45%)
│                                 │
│  You can close this             │
│  We'll notify you when ready    │
│                                 │
│  [Close & Continue Browsing]    │
└─────────────────────────────────┘
```

**Styling:**
```css
.generation-progress {
  text-align: center;
  color: white;
}

.generation-progress__preview {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  margin: 0 auto var(--space-6);
}

.generation-progress__status {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
}

.generation-progress__time {
  font-size: var(--text-sm);
  color: var(--text-secondary-dark);
  margin-bottom: var(--space-6);
}

.generation-progress__bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-6);
}

.generation-progress__fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}
```

**Step 3: Result Display**

```
┌─────────────────────────────────┐
│  [×]                            │
│                                 │
│  [Generated image - full size]  │
│                                 │
│  ✨ Your Remix!                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │  💾 Save to Device      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📤 Share               │   │
│  └─────────────────────────┘   │
│                                 │
│  [🔄 Try Again]  [🎨 Remix More]│
└─────────────────────────────────┘
```

---

### 3. Navigation Bar (Bottom)

**Layout:**
```
┌─────────────────────────────────┐
│  [🏠]  [🔍]  [➕]  [❤️]  [👤]  │
│  Home  Browse  Create Likes  Me │
└─────────────────────────────────┘
```

**Styling:**
```css
.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom); /* iOS safe area */
  z-index: 100;
}

.nav-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-bar__item--active {
  color: var(--primary);
}

.nav-bar__icon {
  width: 24px;
  height: 24px;
}
```

---

### 4. Profile Screen

**Layout:**
```
┌─────────────────────────────────┐
│  [← Back]              [⚙️]     │
│                                 │
│       [Profile Picture]         │
│       @username                 │
│                                 │
│  💰 125 Credits                 │
│  [Buy More Credits]             │
│                                 │
│  ┌─────┬─────┬─────┐           │
│  │ 23  │ 456 │ 12  │           │
│  │Posts│Likes│Fllws│           │
│  └─────┴─────┴─────┘           │
│                                 │
│  [My Remixes] [Liked] [Saved]  │ ← Tabs
│                                 │
│  ┌───┬───┬───┐                 │
│  │🎨│🎨│🎨│                     │ ← Grid of images
│  ├───┼───┼───┤                 │
│  │🎨│🎨│🎨│                     │
│  └───┴───┴───┘                 │
└─────────────────────────────────┘
```

**Styling:**
```css
.profile {
  padding: var(--space-6);
  padding-top: calc(var(--space-6) + env(safe-area-inset-top));
}

.profile__header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.profile__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin: 0 auto var(--space-3);
  border: 3px solid var(--primary);
}

.profile__username {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-4);
}

.profile__credits {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--primary-light);
  border-radius: 20px;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--primary-dark);
  margin-bottom: var(--space-3);
}

.profile__stats {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
  margin-bottom: var(--space-6);
}

.profile__stat {
  text-align: center;
}

.profile__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  display: block;
}

.profile__stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.profile__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.profile__grid-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface);
}
```

---

### 5. Onboarding Screens

**Screen 1: Welcome**
```
┌─────────────────────────────────┐
│  [Skip]                         │
│                                 │
│         🎨                      │
│                                 │
│  See It. Remix It.              │
│  Make It Yours.                 │
│                                 │
│  [3-second auto-play video]     │
│  showing the remix flow         │
│                                 │
│  [Try Without Signing Up]       │
│                                 │
│  [Sign Up - Get 50 Credits]     │
└─────────────────────────────────┘
```

**Styling:**
```css
.onboarding {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--space-6);
  text-align: center;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary));
}

.onboarding__icon {
  font-size: 64px;
  margin-bottom: var(--space-6);
}

.onboarding__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-4);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.onboarding__video {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 9/16;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: var(--space-8);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.onboarding__cta {
  width: 100%;
  max-width: 320px;
  padding: var(--space-4);
  background: white;
  color: var(--primary);
  border-radius: 12px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  margin-bottom: var(--space-3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.onboarding__cta--primary {
  background: var(--primary);
  color: white;
}
```

---

## Animations

### Like Animation (Double-Tap)
```css
@keyframes heart-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.like-animation {
  animation: heart-pop 0.3s ease-out;
}
```

### Swipe Transition
```css
.feed-card-enter {
  transform: translateY(100vh);
}

.feed-card-enter-active {
  transform: translateY(0);
  transition: transform 0.3s ease-out;
}

.feed-card-exit {
  transform: translateY(0);
}

.feed-card-exit-active {
  transform: translateY(-100vh);
  transition: transform 0.3s ease-out;
}
```

### Button Press
```css
.button-press {
  transition: transform 0.1s ease;
}

.button-press:active {
  transform: scale(0.95);
}
```

---

## Accessibility

### Touch Targets
- Minimum size: 44px × 44px (iOS HIG)
- Spacing between targets: 8px minimum

### Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum

### Focus States
```css
.focusable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Screen Reader Support
- All images have `alt` text
- Buttons have `aria-label`
- Form inputs have `label` or `aria-label`

---

## Performance Targets

- **First Contentful Paint:** < 2s
- **Time to Interactive:** < 3s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Frame Rate:** 60fps (smooth scroll)

---

**Last Updated:** 2025-10-23  
**Design Tool:** Figma  
**Component Library:** Tailwind CSS + Custom Components

