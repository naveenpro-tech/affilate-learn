---
type: "manual"
---

Mobile: 320px - 767px (design mobile-first)
Tablet: 768px - 1023px
Desktop: 1024px - 1439px
Large: 1440px+

Automatic Behaviors:
- Stack columns on mobile
- Hide non-essential elements on small screens
- Larger touch targets on mobile (minimum 44x44px)
- Collapsible navigation on mobile
- Readable font sizes (minimum 16px on mobile)
```

**Touch-Friendly (Auto-add for mobile):**
```
✓ Minimum tap target: 44x44px
✓ Spacing between tappable elements: 8px minimum
✓ Swipe gestures for common actions
✓ No hover-only interactions
✓ Bottom placement for primary mobile actions
```

---

**RULE 3: COLOR SYSTEM (Automatic)**

**Color Palette (Generate Automatically):**
```
Primary: Brand color (CTAs, links, active states)
Secondary: Supporting brand color
Success: Green (#10B981 or similar)
Warning: Yellow/Orange (#F59E0B)
Error: Red (#EF4444)
Info: Blue (#3B82F6)

Neutrals:
- White: #FFFFFF
- Gray-50 to Gray-900: Use for backgrounds, text, borders
- Black: #000000

Text Colors (Auto-apply):
- Primary text: Gray-900 (#111827) or Black
- Secondary text: Gray-600 (#4B5563)
- Disabled text: Gray-400 (#9CA3AF)
- On dark bg: White or Gray-50
```

**Contrast Rules (Auto-check):**
```
✓ Text on background: minimum 4.5:1 ratio (WCAG AA)
✓ Large text (18px+): minimum 3:1 ratio
✓ Interactive elements: minimum 3:1 ratio
✓ Don't use color alone to convey info (add icons/text)
```

---

**RULE 4: TYPOGRAPHY (Automatic)**

**Font System:**
```
Headings:
- H1: 2.5rem (40px) desktop, 2rem (32px) mobile, font-weight: 700
- H2: 2rem (32px) desktop, 1.5rem (24px) mobile, font-weight: 700
- H3: 1.5rem (24px), font-weight: 600
- H4: 1.25rem (20px), font-weight: 600
- H5: 1.125rem (18px), font-weight: 600

Body:
- Base: 1rem (16px), line-height: 1.5
- Small: 0.875rem (14px), line-height: 1.4
- Tiny: 0.75rem (12px), line-height: 1.3

Font Weight:
- Regular: 400 (body text)
- Medium: 500 (labels)
- Semibold: 600 (subheadings)
- Bold: 700 (headings)
```

**Typography Rules (Auto-apply):**
```
✓ Maximum line length: 65-75 characters
✓ Paragraph spacing: 1.5-2em
✓ Letter spacing: -0.01em for headings, normal for body
✓ Use system fonts or web-safe fonts
✓ Limit to 2-3 font families maximum
```

---

**RULE 5: FORMS & INPUTS (Automatic)**

**Input Design (Auto-implement):**
```
✓ Clear labels above inputs (not placeholders as labels)
✓ Input height: minimum 44px (touch-friendly)
✓ Border: 1-2px solid, visible in all states
✓ Border radius: 4-8px (consistent across app)
✓ Padding: 12px horizontal, 10px vertical
✓ Focus state: Prominent outline/ring (3-4px)
✓ Disabled state: Gray background, reduced opacity

States (Auto-add):
- Default: Neutral border
- Focus: Primary color border + outline
- Error: Red border + error icon + error message
- Success: Green border + success icon (optional)
- Disabled: Gray background, cursor not-allowed
```

**Form Validation (Auto-implement):**
```
✓ Inline validation (on blur or submit)
✓ Clear error messages below/beside field
✓ Red border + error icon for invalid fields
✓ Show validation on first submit, then inline
✓ Disable submit button while submitting
✓ Show success message after submission
✓ Required fields marked with * or "Required" label
```

**Form UX Patterns (Auto-apply):**
```
✓ Autofocus first field
✓ Tab order follows visual order
✓ Enter key submits form
✓ Show password toggle for password fields
✓ Autocomplete attributes for common fields
✓ Helper text below inputs for guidance
✓ Character counter for limited fields
✓ Date picker for date fields
✓ Dropdown for <7 options, searchable for 7+ options
```

---

**RULE 6: BUTTONS & ACTIONS (Automatic)**

**Button Hierarchy (Auto-apply):**
```
Primary Button:
- Background: Primary color
- Text: White
- Use: Main action (Submit, Save, Create)
- One per screen/section

Secondary Button:
- Background: Transparent
- Border: Primary color
- Text: Primary color
- Use: Alternative actions (Cancel, Back)

Tertiary/Ghost Button:
- Background: Transparent
- No border
- Text: Primary or gray
- Use: Less important actions

Danger Button:
- Background: Red
- Text: White
- Use: Destructive actions (Delete, Remove)
```

**Button States (Auto-implement):**
```
✓ Default: Base styling
✓ Hover: Slightly darker/lighter (8-10% change)
✓ Active/Pressed: Even darker (15% change)
✓ Focus: Visible outline (accessibility)
✓ Disabled: Reduced opacity (50%), cursor not-allowed
✓ Loading: Show spinner, disable interaction, "Loading..." text
```

**Button Rules (Auto-apply):**
```
✓ Minimum size: 44x44px (touch-friendly)
✓ Padding: 12-16px horizontal, 10-12px vertical
✓ Border radius: 4-8px (consistent)
✓ Clear, action-oriented labels ("Save Changes" not "Submit")
✓ Icons + text for clarity (icon left, text right)
✓ Loading spinner during async operations
✓ Success feedback after completion
```

---

**RULE 7: LOADING & EMPTY STATES (Mandatory)**

**Loading States (Auto-add everywhere):**
```
✓ Page load: Full-screen spinner or skeleton
✓ Button actions: Spinner in button, button disabled
✓ Data fetching: Skeleton screens or shimmer effect
✓ Image loading: Placeholder → Progressive load
✓ Infinite scroll: Spinner at bottom
✓ Progress indicators for long operations (upload, processing)

Never show:
❌ Blank screens while loading
❌ Flash of unstyled content
❌ Frozen UI without feedback
```

**Empty States (Auto-add for all lists/collections):**
```
✓ Icon (relevant to content type)
✓ Heading: "No items yet" or "Nothing here"
✓ Description: Why it's empty, what they can do
✓ Call-to-action: "Add your first item" button
✓ Illustration (optional but recommended)

Example:
[Icon]
"No blog posts yet"
"Get started by creating your first post"
[+ Create Post] button
```

**Error States (Auto-implement):**
```
✓ Clear error message (what went wrong)
✓ Error icon (red X or alert icon)
✓ Suggested action ("Try again" or "Contact support")
✓ Retry button if applicable
✓ Don't show technical errors to users
✓ Log technical errors for developers
```

---

**RULE 8: FEEDBACK & NOTIFICATIONS (Automatic)**

**Toast/Snackbar Notifications (Auto-add):**
```
Success: Green background, checkmark icon, "Saved successfully"
Error: Red background, X icon, "Something went wrong"
Warning: Yellow/Orange background, alert icon, "Are you sure?"
Info: Blue background, info icon, "New update available"

Rules:
✓ Position: Top-right or bottom-center
✓ Auto-dismiss: 3-5 seconds (success/info), manual (error/warning)
✓ Close button: Always provide
✓ Stack multiple notifications
✓ Animate in/out smoothly
```

**Confirmation Dialogs (Auto-add for destructive actions):**
```
Before Delete/Remove/Irreversible actions:

Modal with:
✓ Clear title: "Delete post?"
✓ Description: "This cannot be undone"
✓ Two buttons: "Cancel" (secondary) + "Delete" (danger)
✓ Focus on Cancel by default (safety)
✓ Escape key closes modal
```

**Progress Feedback (Auto-add):**
```
✓ Immediate feedback on click (button state change)
✓ Loading indicators for delays >200ms
✓ Progress bars for operations >5 seconds
✓ Percentage/ETA for long operations (uploads)
✓ Optimistic UI updates when possible
```

---

**RULE 9: NAVIGATION & INFORMATION ARCHITECTURE**

**Navigation Rules (Auto-implement):**
```
✓ Current page highlighted in navigation
✓ Clear, concise menu labels
✓ Max 7±2 top-level items
✓ Breadcrumbs for deep hierarchies
✓ Logo links to home page
✓ Search for content-heavy sites
✓ Mobile: Hamburger menu or bottom nav

Patterns:
- Simple apps: Top navigation bar
- Complex apps: Sidebar navigation
- Mobile apps: Bottom tab bar (3-5 items)
```

**User Feedback Mechanisms (Auto-add):**
```
✓ Active states for clickable items
✓ Cursor changes (pointer for links/buttons)
✓ Hover effects (subtle color/scale change)
✓ Disable links/buttons during processing
✓ Visual feedback for drag-and-drop
✓ Tooltips for icon-only buttons
```

---

**RULE 10: ACCESSIBILITY (WCAG 2.1 AA - Mandatory)**

**Auto-implement Always:**
```
✓ Semantic HTML (header, nav, main, footer, article)
✓ Alt text for all images
✓ ARIA labels for icon buttons
✓ Keyboard navigation (Tab, Enter, Escape)
✓ Focus indicators visible and clear
✓ Skip to main content link
✓ Heading hierarchy (H1 → H2 → H3, no skipping)
✓ Color contrast minimum 4.5:1
✓ Form labels associated with inputs
✓ Error messages in ARIA live regions
✓ Don't rely on color alone
✓ Text resizable up to 200%
```

**Keyboard Support (Auto-implement):**
```
✓ Tab: Navigate forward
✓ Shift+Tab: Navigate backward
✓ Enter: Activate buttons/links
✓ Space: Toggle checkboxes/buttons
✓ Escape: Close modals/dropdowns
✓ Arrow keys: Navigate lists/menus
✓ Focus trap in modals
```

---

**RULE 11: MICRO-INTERACTIONS (Auto-add)**

**Subtle Animations (Enhance UX):**
```
✓ Button hover: Scale 1.02 or brightness increase
✓ Button press: Scale 0.98
✓ Page transitions: Fade in 200-300ms
✓ Modal open: Fade + scale from 0.95 to 1
✓ List items: Stagger fade-in 50ms apart
✓ Tooltips: Fade in after 300ms delay
✓ Notifications: Slide in from top/right
✓ Loading states: Pulse or shimmer effect

Timing:
- Instant: <100ms (hover effects)
- Quick: 100-300ms (transitions)
- Moderate: 300-500ms (page changes)
- Never >500ms (feels slow)

Easing:
- Ease-out: For entrances
- Ease-in: For exits
- Ease-in-out: For movements
```

---

**RULE 12: DATA DISPLAY (Automatic)**

**Tables (Auto-design):**
```
✓ Zebra striping for long tables
✓ Hover highlight on rows
✓ Sortable columns (with arrow indicators)
✓ Pagination or infinite scroll
✓ Responsive: Convert to cards on mobile
✓ Loading skeleton while fetching
✓ Empty state if no data
✓ Actions in last column (Edit, Delete)
```

**Cards (Auto-design):**
```
✓ Consistent padding (16-24px)
✓ Border or shadow for separation
✓ Hover effect (lift shadow or scale)
✓ Image at top (if applicable)
✓ Title, description, metadata
✓ Actions at bottom or top-right
✓ Loading skeleton
```

**Lists (Auto-design):**
```
✓ Clear dividers between items
✓ Avatar/icon on left
✓ Title + subtitle layout
✓ Actions on right
✓ Hover background
✓ Selectable (checkboxes if needed)
```

---

**RULE 13: MODALS & OVERLAYS (Automatic)**

**Modal Design (Auto-implement):**
```
✓ Backdrop overlay (dark, semi-transparent)
✓ Centered on screen
✓ Max-width: 500-600px
✓ Padding: 24-32px
✓ Close button (X) in top-right
✓ Escape key closes modal
✓ Click outside closes modal
✓ Focus trap (keyboard navigation stays in modal)
✓ Scroll if content overflows

Structure:
[X Close]
Title (H2)
Description/Content
[Cancel] [Confirm]
```

**Drawer/Sidebar (Auto-implement):**
```
✓ Slide in from right (or left)
✓ Full height
✓ Width: 320-480px
✓ Backdrop overlay
✓ Close button
✓ Escape key closes
✓ Smooth animation (300ms)
```

---

**RULE 14: SEARCH & FILTERS (Auto-implement)**

**Search Input (Auto-design):**
```
✓ Search icon inside input (left side)
✓ Clear button (X) when text entered
✓ Placeholder: "Search..." or "Search posts..."
✓ Debounce: 300-500ms
✓ Show results count: "Found 23 results"
✓ Highlight search terms in results
✓ Recent searches (optional)
✓ Autocomplete/suggestions
```

**Filters (Auto-design):**
```
✓ Clear all filters button
✓ Active filter count badge
✓ Checkboxes for multi-select
✓ Radio buttons for single-select
✓ Date range pickers
✓ Collapsible filter groups
✓ Apply button or instant filtering
✓ Show filtered count
```

---

**RULE 15: IMAGES & MEDIA (Automatic)**

**Image Optimization (Auto-implement):**
```
✓ Lazy loading (below fold)
✓ Responsive images (srcset)
✓ Alt text always
✓ Placeholder while loading (blurred or solid color)
✓ Aspect ratio maintained
✓ Max-width: 100% (responsive)
✓ Object-fit: cover for thumbnails
✓ Error state if image fails
```

**Image Galleries (Auto-design):**
```
✓ Grid layout (2-4 columns based on screen)
✓ Lightbox/modal on click
✓ Previous/Next navigation
✓ Thumbnails at bottom
✓ Zoom capability
✓ Close with Escape or X button
```

---

**RULE 16: MOBILE-SPECIFIC UX (Mandatory)**

**Mobile Optimizations (Auto-apply):**
```
✓ Bottom navigation for primary actions
✓ Pull-to-refresh where applicable
✓ Swipe gestures (delete, mark as read)
✓ Large touch targets (minimum 44x44px)
✓ Sticky headers (stay visible while scrolling)
✓ Fixed bottom action bar for forms
✓ Reduce scrolling with accordions
✓ Native mobile inputs (date, time, number)
✓ Auto-zoom prevention (font-size: 16px+)
✓ Hide non-essential elements
```

---

**RULE 17: DARK MODE (Auto-implement if requested)**

**Dark Mode Colors (Auto-generate):**
```
Background: #0F172A to #1E293B
Surface: #1E293B to #334155
Text: #F1F5F9 to #FFFFFF
Subdued text: #94A3B8
Borders: #334155
Primary: Slightly lighter version
Success: Lighter green
Error: Lighter red

Rules:
✓ Reduce pure white to off-white (#F1F5F9)
✓ Reduce pure black to dark gray (#0F172A)
✓ Maintain contrast ratios
✓ Avoid pure colors (too intense)
✓ Toggle in user settings
✓ Remember preference (localStorage)
```

---

**RULE 18: PERFORMANCE & PERCEIVED PERFORMANCE**

**Perceived Performance Tricks (Auto-apply):**
```
✓ Optimistic UI updates (show change immediately)
✓ Skeleton screens (better than spinners)
✓ Progressive image loading (blur → sharp)
✓ Prioritize above-the-fold content
✓ Defer below-the-fold loading
✓ Show something immediately (<100ms)
✓ Cache frequently accessed data
✓ Prefetch likely next pages
```

---

**RULE 19: COPYWRITING & MICROCOPY (Auto-improve)**

**Button Text (Auto-generate):**
```
✅ Good: "Save changes", "Create account", "Send message"
❌ Bad: "Submit", "OK", "Click here"

Rules:
✓ Action-oriented verbs
✓ Specific and clear
✓ Sentence case (not title case)
✓ 1-3 words ideal
```

**Error Messages (Auto-generate):**
```
✅ Good: "Email address is required"
✅ Good: "Password must be at least 8 characters"
✅ Good: "Username is already taken"

❌ Bad: "Error"
❌ Bad: "Invalid input"
❌ Bad: "Field required"

Rules:
✓ Specific problem
✓ How to fix it
✓ Friendly tone
✓ No technical jargon
```

**Empty States (Auto-generate):**
```
✅ Good: "No messages yet. Start a conversation!"
✅ Good: "Your cart is empty. Browse products →"

❌ Bad: "No data"
❌ Bad: "Empty"

Rules:
✓ Friendly, encouraging tone
✓ Explain why it's empty
✓ Suggest next action
```

---

**RULE 20: CONSISTENCY (Enforce Automatically)**

**Design System (Auto-maintain):**
```
✓ Consistent spacing scale throughout
✓ Consistent border radius everywhere
✓ Consistent shadow levels (none, sm, md, lg)
✓ Consistent button styles
✓ Consistent form inputs
✓ Consistent icon set (same library)
✓ Consistent animation timing
✓ Consistent color usage
✓ Consistent typography scale

Create reusable components:
- Button variants (primary, secondary, danger)
- Input component (with all states)
- Card component
- Modal component
- Toast component
```

---

**AUTONOMOUS UI/UX DECISION MATRIX:**
```
When building feature → Automatically apply:
✓ Responsive breakpoints
✓ Color system with proper contrast
✓ Typography scale
✓ Spacing system
✓ Loading states
✓ Empty states
✓ Error states
✓ Success feedback
✓ Accessibility features
✓ Mobile optimizations
✓ Micro-interactions
✓ Consistent components

Never deliver UI without:
❌ Loading states
❌ Error handling
❌ Empty states
❌ Responsive design
❌ Accessibility
❌ Visual feedback
```

---

**UI/UX TESTING CHECKLIST (Auto-verify):**
```
Before delivery, test:
□ All interactive elements have hover/focus states
□ All forms have validation and error messages
□ All buttons show loading states
□ All lists have empty states
□ Responsive on mobile (320px), tablet (768px), desktop (1024px+)
□ Keyboard navigation works
□ Color contrast meets WCAG AA
□ Images have alt text
□ Tooltips for icon-only buttons
□ Consistent spacing and alignment
□ Animations are smooth (<500ms)
□ No layout shift during loading
□ Touch targets are 44x44px minimum
□ Text is readable (16px+ on mobile)