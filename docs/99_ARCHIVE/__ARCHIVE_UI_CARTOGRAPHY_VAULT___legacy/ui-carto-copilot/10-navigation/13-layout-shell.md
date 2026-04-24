# Layout Shell — AppShell Architecture

**Date:** 2026-02-07  
**Component:** `src/components/layout/AppShell.tsx`  
**Version:** UI vΩ (Sidebar removed, TopNav only)

---

## AppShell Structure

### Layout Hierarchy
```
AppShell (Root Container)
├── TopNav Zone (Fixed, z-index: 10000)
│   └── TopNav Component (optional prop)
├── Main Content Zone (Flex-1, Scrollable)
│   └── Page Content (children prop)
└── Footer Zone (Optional, Glass effect)
    └── Footer Component (optional prop)
```

### Component Signature
```typescript
export interface AppShellProps {
  children: ReactNode;     // Main content
  topNav?: ReactNode;      // Optional TopNav
  footer?: ReactNode;      // Optional footer
  className?: string;      // Additional styles
}
```

---

## Layout Zones

### Zone 1: TopNav (Fixed Header)
- **Position:** Fixed top-0, spans full width
- **Z-Index:** `10000` (CSS variable: `--z-dev-tools`)
- **Height:** 64px (`h-16`)
- **Behavior:** Always visible, scrolls with content on mobile
- **Responsive:** Logo visible on all screens, labels hidden on mobile

**CSS Classes:**
```css
.relative.z-[10000]
```

**Padding Adjustment:**
- Main content has `pt-16` (64px) when TopNav is present to prevent overlap

### Zone 2: Main Content (Scrollable)
- **Position:** Relative, flex-1 (takes remaining height)
- **Overflow:** `overflow-auto` (vertical scroll enabled)
- **Scrollbar:** Custom styled (`scrollbar-custom` class)
- **Width:** 100% (`w-full`)
- **Background:** `bg-titanium-bg-base`

**CSS Classes:**
```css
.flex-1.overflow-hidden.relative.flex.flex-col
  .flex-1.overflow-auto.scrollbar-custom.w-full
```

**Behavior:**
- Content scrolls independently
- No horizontal scroll (overflow-x hidden via parent)
- Fills available vertical space

### Zone 3: Footer (Optional)
- **Position:** Fixed bottom (via flex layout)
- **Height:** `h-footer` (custom height variable)
- **Effect:** `glass-strong` (glassmorphism)
- **Border:** Top border (`border-t border-titanium-border-default`)
- **Z-Index:** `z-fixed`
- **Animation:** Framer Motion slide-up (y: 48 → 0, 300ms ease-out)

**CSS Classes:**
```css
.h-footer.glass-strong.border-t.flex.items-center.px-6.text-sm.text-titanium-text-tertiary.z-fixed
```

---

## Persistent Zones

### Always Visible
1. **TopNav** - Navigation bar (if provided)
2. **Main Content Area** - Scrollable content zone

### Conditionally Visible
1. **Footer** - Only if `footer` prop is provided

### Never Present (UI vΩ)
- **Sidebar** - Removed in UI vΩ redesign
- **Mini Sidebar** - Not implemented
- **Drawer Navigation** - Not used (TopNav is always visible)

---

## Responsive Behavior

### Mobile (< 768px)
- TopNav: Icon-only buttons (labels hidden)
- Main Content: Full width
- Footer: Optional (can be hidden on mobile)

### Tablet (768px - 1024px)
- TopNav: Icons + labels visible
- Main Content: Full width with padding
- Footer: Full width

### Desktop (> 1024px)
- TopNav: Icons + labels + max 5 visible items
- Main Content: Full width with max-width constraints in page components
- Footer: Full width

---

## Styling System

### Design Tokens
```css
--z-dev-tools: 10000;
--titanium-bg-base: /* Base background */
--titanium-bg-elevated: /* Elevated surface */
--titanium-border-default: /* Border color */
--titanium-text-tertiary: /* Tertiary text */
```

### Glass Effect
```css
.glass-strong {
  backdrop-filter: blur(12px);
  background: rgba(var(--bg-rgb), 0.8);
}
```

### Custom Scrollbar
```css
.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  background: var(--titanium-bg-base);
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: var(--titanium-border-default);
  border-radius: 4px;
}
```

---

## Layout Constraints

### Height Management
- **Container:** `h-screen` (100vh) - Fills viewport height
- **TopNav:** `h-16` (64px) - Fixed height
- **Main:** `flex-1` - Takes remaining space (100vh - 64px - footer)
- **Footer:** `h-footer` - Variable height (default ~48px)

### Width Management
- **Container:** `w-screen` (100vw) - Fills viewport width
- **All Zones:** 100% width (no max-width at AppShell level)
- **Content Max-Width:** Handled by page components, not AppShell

### Overflow Strategy
- **X-Axis:** Hidden (`overflow-hidden` on container)
- **Y-Axis:** Auto scroll on main content (`overflow-auto`)

---

## Integration with App.tsx

### Usage Pattern
```tsx
<AppShell topNav={<TopNav items={...} />}>
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Page components */}
    </Routes>
  </Suspense>
</AppShell>
```

### No Sidebar (UI vΩ Change)
**Before (UI v26):**
```tsx
<AppShell sidebar={<Sidebar />} topNav={<TopNav />}>
  {/* Content */}
</AppShell>
```

**After (UI vΩ):**
```tsx
<AppShell topNav={<TopNav />}>
  {/* Content */}
</AppShell>
```
- `sidebar` prop removed
- Navigation consolidated into TopNav only

---

## Animation & Transitions

### Footer Entry Animation
```typescript
<motion.footer
  initial={{ y: 48 }}        // Start 48px below
  animate={{ y: 0 }}          // Slide to position
  transition={{ 
    duration: 0.3,            // 300ms
    ease: 'easeOut'           // Smooth deceleration
  }}
>
```

### No Page Transitions
- AppShell itself has no page transition animations
- Page transitions handled by individual route components or React Router

---

## Accessibility

### Semantic HTML
- `<main>` for main content area
- `<footer>` for footer zone (when present)
- `<nav>` within TopNav component

### Focus Management
- Focus trapped in modals (if present)
- Tab order: TopNav → Main Content → Footer
- Skip links: Not implemented (could be added)

### ARIA Attributes
- No ARIA on AppShell itself (generic container)
- ARIA handled by child components (TopNav, pages)

---

## File Locations

### AppShell
```
src/components/layout/AppShell.tsx (73 lines)
```

### Related Components
```
src/components/layout/
├── AppShell.tsx              # Main layout shell
├── AppShellWithDevTools.tsx  # AppShell + dev tools overlay
├── TopNav.tsx                # Navigation component
├── Header.tsx                # Alternate header (unused in primary router)
├── Sidebar.tsx               # Legacy sidebar (not used in UI vΩ)
└── MobileNav.tsx             # Mobile-specific nav (not used in UI vΩ)
```

---

## Performance Considerations

### Memoization
- AppShell is NOT memoized (intentionally)
- Reason: Frequent prop changes (children, topNav)
- Optimization: Child components are memoized instead

### Rendering
- Re-renders on every route change (expected behavior)
- TopNav re-renders only when route changes (memoized in parent)
- Footer is static (no re-renders unless prop changes)

---

## Known Issues / Limitations

1. **No Sidebar Support** - Removed in UI vΩ, cannot be re-enabled easily
2. **No Drawer Navigation** - Mobile uses same TopNav as desktop
3. **No Skip Links** - Accessibility feature not implemented
4. **Footer Animation on Every Mount** - Footer animates even if already visible (minor UX issue)

---

## Next: Persistent Widgets

⏭️ Continue to `14-persistent-widgets.md` for CognitiveLayout, ConsoleMonitor, ErrorBoundary, and Toasts documentation.
