# TITANE∞ "Titanium Dark" Implementation Plan

**Version:** 26.2.0  
**Date:** 2026-01-03  
**Based on:** UI_AUDIT_REPORT.md + RESEARCH_NOTES.md

> NOTE (gouvernance): plan UI/UX historique (v26.2.0). Runtime actuel: v26.3.0.
> Production: EN ATTENTE (autorisation explicite requise).

---

## Executive Summary

**Objective:** Transform TITANE∞ UI from multi-color (Violet/Sage/Titane) to premium monochrome "Titanium Dark" design with subtle metallic accents.

**Duration:** 5 weeks (25 working days)  
**Approach:** Incremental, atomic changes with continuous validation  
**Risk Level:** Medium (hardcoded colors, accessibility debt)

---

## Design Decisions (Based on Research)

### Answered Questions

Based on user requirements and research best practices:

1. **"Titane sombre" tone:** **Graphite neutre** (#1A1A1A base, not pure black)
2. **Accent autorisé:** **OUI** - Cool gray subtle accent for critical CTAs only
3. **Densité UI:** **Équilibrée** (comfortable spacing, not cramped)
4. **Radius:** **16px** (premium feel, rounded but not toy-like)
5. **Police:** **Conserver Inter + JetBrains Mono** (optimize loading)
6. **Icônes:** **Garder Lucide React** (already coherent, 1300+ icons)
7. **Animations:** **Micro-interactions sobres** (subtle hover/focus, no heavy effects)
8. **Reflets métalliques:** **Subtil** (rare usage on hero/active states)
9. **Priorité modules:** **Shell → Chat → Governance → DevTools** ✅ Confirmed
10. **Style system:** **Tailwind CSS primary** (deprecate tokens.ts)

---

## Phase 0: Foundation & Preparation (Days 1-5)

### Day 1-2: Design System Definition

#### Titanium Dark Color Palette

```css
/* MONOCHROME BASE */
:root {
  /* Backgrounds (off-black, layered depth) */
  --titanium-bg-base: #0f0f0f;         /* Deep background */
  --titanium-bg-elevated: #1a1a1a;     /* Cards, panels */
  --titanium-bg-interactive: #242424;  /* Hover states */
  --titanium-bg-overlay: #2e2e2e;      /* Modals, overlays */
  
  /* Surfaces (glass morphism variants) */
  --titanium-surface-glass: rgba(26, 26, 26, 0.8);
  --titanium-surface-frosted: rgba(36, 36, 36, 0.9);
  
  /* Text (high contrast whites/grays) */
  --titanium-text-primary: #f5f5f5;     /* Primary text (WCAG AAA 7:1) */
  --titanium-text-secondary: #b8b8b8;   /* Secondary text (WCAG AA 4.5:1) */
  --titanium-text-tertiary: #8a8a8a;    /* Muted text */
  --titanium-text-disabled: #5a5a5a;    /* Disabled states */
  
  /* Borders & Dividers */
  --titanium-border-subtle: rgba(255, 255, 255, 0.06);
  --titanium-border-default: rgba(255, 255, 255, 0.12);
  --titanium-border-strong: rgba(255, 255, 255, 0.18);
  
  /* Accent (minimal cool gray for critical CTAs) */
  --titanium-accent-cool: #9ca3af;      /* Gray-400 equivalent */
  --titanium-accent-bright: #d1d5db;    /* Gray-300 for focus */
  
  /* Metallic Effects (rare, semantic usage) */
  --titanium-metal-sheen: linear-gradient(135deg, 
    rgba(255,255,255,0.08) 0%, 
    rgba(255,255,255,0.02) 50%, 
    rgba(255,255,255,0.08) 100%);
  --titanium-metal-glow: 0 0 20px rgba(255, 255, 255, 0.1);
  
  /* Semantic Colors (kept for states) */
  --titanium-success: #10b981;    /* Keep green for success */
  --titanium-error: #ef4444;      /* Keep red for errors */
  --titanium-warning: #f59e0b;    /* Keep orange for warnings */
  --titanium-info: #3b82f6;       /* Keep blue for info */
}
```

#### Typography Scale
```css
/* Based on research: clear hierarchy, minimal font sizes */
:root {
  --font-family-sans: 'Inter', -apple-system, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Courier New', monospace;
  
  /* Type scale (1.250 - Major Third) */
  --text-xs: 0.75rem;      /* 12px - captions */
  --text-sm: 0.875rem;     /* 14px - body small */
  --text-base: 1rem;       /* 16px - body */
  --text-lg: 1.125rem;     /* 18px - subheadings */
  --text-xl: 1.25rem;      /* 20px - headings */
  --text-2xl: 1.563rem;    /* 25px - page titles */
  --text-3xl: 1.953rem;    /* 31px - hero */
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Spacing Scale
```css
/* 4px base unit (research: consistent rhythm) */
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px - base */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

#### Elevation (Shadows)
```css
/* Subtle depth, no heavy shadows (research: premium = subtle) */
:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-base: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.7);
  
  /* Focus ring (WCAG 2.2: 3px solid, 3:1 contrast) */
  --focus-ring: 0 0 0 3px rgba(209, 213, 219, 0.5); /* White-ish glow */
}
```

#### Border Radius
```css
/* 16px base (from decision) */
:root {
  --radius-none: 0;
  --radius-sm: 8px;
  --radius-base: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;
}
```

**Deliverable:** Create `src/styles/titanium-dark-tokens.css` with above definitions

---

### Day 3: Tailwind Config Update

Update `tailwind.config.ts` to use Titanium Dark palette:

```typescript
// tailwind.config.ts updates
const config: Config = {
  theme: {
    extend: {
      colors: {
        titanium: {
          'bg-base': '#0f0f0f',
          'bg-elevated': '#1a1a1a',
          'bg-interactive': '#242424',
          'bg-overlay': '#2e2e2e',
          'text-primary': '#f5f5f5',
          'text-secondary': '#b8b8b8',
          'text-tertiary': '#8a8a8a',
          'text-disabled': '#5a5a5a',
          'border-subtle': 'rgba(255, 255, 255, 0.06)',
          'border-default': 'rgba(255, 255, 255, 0.12)',
          'border-strong': 'rgba(255, 255, 255, 0.18)',
          'accent-cool': '#9ca3af',
          'accent-bright': '#d1d5db',
        },
        // Keep semantic colors
        success: { ... },
        error: { ... },
        warning: { ... },
      },
      spacing: {
        // Already defined, verify 4px base
      },
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(209, 213, 219, 0.5)',
        'metal': '0 0 20px rgba(255, 255, 255, 0.1)',
      },
    },
  },
};
```

**Deliverable:** Updated `tailwind.config.ts`

---

### Day 4-5: Document Design System

Create comprehensive documentation:

#### `docs/ui/DESIGN_SYSTEM.md`

**Contents:**
1. **Philosophy** - Minimal, monochrome, premium
2. **Color Palette** - Titanium Dark swatch with contrast ratios
3. **Typography** - Scale, weights, line-heights
4. **Spacing** - 4px rhythm examples
5. **Elevation** - Shadow usage guidelines
6. **Components** - Usage patterns for Button, Card, Input, etc.
7. **Do's and Don'ts** - Visual examples
8. **Accessibility** - WCAG 2.2 compliance checklist

**Deliverable:** `docs/ui/DESIGN_SYSTEM.md` (comprehensive guide)

---

## Phase 1: Core Components Refactor (Days 6-10)

### Day 6-7: Primitive Components

#### Button (`src/components/ui/button.tsx`)

**Current Issues:**
- Uses violet colors (`bg-blue-500`, `bg-red-500`, etc.)
- Focus ring too subtle

**Titanium Dark Updates:**
```tsx
const variantStyles = {
  default: 'bg-titanium-bg-interactive text-titanium-text-primary hover:bg-titanium-bg-overlay',
  primary: 'bg-titanium-accent-cool text-titanium-bg-base hover:bg-titanium-accent-bright',
  destructive: 'bg-error-500 text-white hover:bg-error-600',
  outline: 'border border-titanium-border-default bg-transparent hover:bg-titanium-bg-interactive',
  ghost: 'hover:bg-titanium-bg-interactive hover:text-titanium-text-primary',
  link: 'text-titanium-accent-cool underline-offset-4 hover:underline',
};

// Add focus ring
className="... focus-visible:ring-4 focus-visible:ring-titanium-accent-bright/50"
```

**New States:**
- Loading: Spinner inside button
- Success: Checkmark + green tint (1s duration)
- Error: X mark + red tint (1s duration)

**Deliverable:** Updated Button component with all states

---

#### Card (`src/components/ui/card.tsx`)

**Updates:**
```tsx
className="rounded-[16px] border border-titanium-border-default bg-titanium-bg-elevated shadow-base"

// Hover variant
hoverable && 'hover:shadow-md hover:border-titanium-border-strong transition-shadow duration-200'
```

**New Props:**
- `loading` - Show skeleton shimmer
- `empty` - Show empty state placeholder

**Deliverable:** Updated Card with states

---

#### Input (`src/components/ui/input.tsx`)

**Updates:**
```tsx
className="bg-titanium-bg-interactive border border-titanium-border-default text-titanium-text-primary
  placeholder:text-titanium-text-tertiary
  focus:outline-none focus:ring-4 focus:ring-titanium-accent-bright/50 focus:border-titanium-accent-cool
  disabled:bg-titanium-bg-elevated disabled:text-titanium-text-disabled"
```

**New Features:**
- Add `<label>` element (accessibility)
- Success state (green border + checkmark icon)
- Error state (red border + error icon)
- Loading state (spinner icon)

**Deliverable:** Accessible Input with states

---

#### Badge, Modal, Alert

Apply same Titanium Dark palette updates.

**Checklist:**
- [ ] Button - all variants + states
- [ ] Card - hover, loading, empty
- [ ] Input - label, success, error, loading
- [ ] Badge - monochrome variants
- [ ] Modal - glass morphism overlay
- [ ] Alert - semantic colors preserved

---

### Day 8-9: Layout Components

#### Sidebar (`src/components/layout/Sidebar.tsx`)

**Critical Fix (P0):**
```tsx
// BEFORE (non-accessible)
<motion.div onClick={handleClick}>

// AFTER (accessible)
<motion.button
  type="button"
  onClick={handleClick}
  className="w-full text-left"
  aria-label={item.label}
>
```

**Titanium Dark Updates:**
- Inactive: `text-titanium-text-secondary`
- Hover: `bg-titanium-bg-interactive text-titanium-text-primary`
- Active: `bg-titanium-bg-overlay text-titanium-text-primary border-l-4 border-titanium-accent-cool`

**Memoization:**
```tsx
const renderItem = useCallback((item: SidebarItem) => {
  // Render logic
}, [onItemClick, collapsed, shouldReduceMotion]);
```

**Deliverable:** Accessible, performant Sidebar

---

#### AppLayout, Header, Footer

Apply Titanium Dark palette consistently.

---

### Day 10: UI Showcase Page

Create `/design-system` route with all components + states.

**Structure:**
```tsx
<DesignSystemShowcase>
  <Section title="Colors">
    <ColorSwatch palette={titaniumDarkPalette} />
  </Section>
  
  <Section title="Typography">
    <TypeScale />
  </Section>
  
  <Section title="Buttons">
    <ComponentGrid>
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button loading>Loading</Button>
      <Button success>Success</Button>
      <Button error>Error</Button>
      <Button disabled>Disabled</Button>
    </ComponentGrid>
  </Section>
  
  <Section title="Cards">...</Section>
  <Section title="Forms">...</Section>
  <Section title="Feedback">...</Section>
</DesignSystemShowcase>
```

**Deliverable:** Live UI Showcase page at `/design-system`

---

## Phase 2: Pages & Features (Days 11-17)

### Day 11-13: Shell & Main Pages

#### TitanePage (Dashboard)
- Replace hardcoded colors
- Apply Titanium card styling
- Ensure visual hierarchy (shadow elevation)
- Test empty/loading states

#### ChatPage
- Monochrome message bubbles
- Distinct user vs AI (subtle opacity difference)
- Accessible focus on input
- Loading/error states for messages

#### Stats/Memory/Sentinel Pages
- Charts: Use monochrome + subtle accent
- Tables: Zebra striping with Titanium grays
- Filters: Accessible dropdowns

**Deliverable:** 5 main pages updated

---

### Day 14-15: Admin & Settings

#### Forms
- All inputs use new Input component
- Success/error feedback inline
- Submit button states (loading/success/error)

#### Governance UI
- Tabs with clear active state
- Cards for each setting group
- Validation feedback immediate

**Deliverable:** Admin section modernized

---

### Day 16-17: DevTools & Specialized Pages

#### DevTools
- Dense table layout (compact spacing)
- Monochrome log levels (use opacity, not color)
- Filters accessible
- Performance metrics charts (grayscale + accent)

**Deliverable:** DevTools UI refined

---

## Phase 3: Accessibility & Polish (Days 18-20)

### Day 18: Accessibility Audit & Fixes

**Checklist:**
- [ ] All icon buttons have ARIA labels
- [ ] All interactive divs → buttons
- [ ] Landmarks added to AppLayout (`<main>`, `<nav>`, `<header>`)
- [ ] Input labels associated with fields
- [ ] Focus rings 3px solid, 3:1 contrast
- [ ] Contrast ratios verified (automated + manual)
- [ ] Keyboard navigation tested (all pages)
- [ ] Screen reader tested (NVDA/VoiceOver on 3 pages)

**Deliverable:** `docs/ui/A11Y_CHECKLIST.md` with results

---

### Day 19: Performance Optimization

**Tasks:**
- Reduce glass morphism to 10 components max
- Memoize Sidebar, MessageList render functions
- Increase `useLivingEngines` interval to 500ms
- Replace `transition: all` with specific properties
- Optimize font loading (add preload links)

**Deliverable:** Performance improvements applied

---

### Day 20: Visual QA

- Screenshot all pages (before/after)
- Test on 3 screen sizes (mobile/tablet/desktop)
- Test on 2 browsers (Chrome/Firefox)
- Verify all states (hover/focus/active/disabled)
- Fix any visual regressions

**Deliverable:** QA report, all issues fixed

---

## Phase 4: Cleanup & Documentation (Days 21-23)

### Day 21: Code Cleanup

**Tasks:**
- Remove 8 unused components (archive to `src/_disabled/`)
- Delete 2000+ lines of commented code
- Remove unused CSS files (aura-effects, experience)
- Deprecate `src/themes/tokens.ts` (add deprecation notice)

**Deliverable:** `docs/ui/CLEANUP_REPORT.md`

---

### Day 22: Final Documentation

**Create:**
1. `docs/ui/FINAL_UI_RELEASE_NOTES.md` - Summary for users
2. `docs/ui/BEFORE_AFTER_SUMMARY.md` - Visual + technical comparison
3. `docs/ui/MIGRATION_GUIDE.md` - For developers (old → new token mappings)

---

### Day 23: Score Re-Assessment

**Re-run Audit:**
- Esthétique: Target 95/100
- Cohérence: Target 95/100
- Accessibilité: Target 90/100
- Maintenabilité: Target 92/100
- Performance: Target 88/100

**Deliverable:** Updated scores in comparison table

---

## Phase 5: Final Validation (Days 24-25)

### Day 24: Build & Test

```bash
pnpm run lint          # Should pass
pnpm run format:check  # Should pass
pnpm run check         # TypeScript check
pnpm run test:all      # All tests pass
pnpm run build         # Production build succeeds
```

**Deliverable:** All checks pass

---

### Day 25: User Acceptance

- Deploy to dev environment
- Collect feedback from Kevin Thibault (creator)
- Make final tweaks
- Prepare production deploy

**Deliverable:** Signed-off "100/100 Done" ✅

---

## Validation Criteria ("100/100 Done")

### Must Have (Non-negotiable)

✅ **Design System**
- [ ] Titanium Dark tokens defined and documented
- [ ] All primitive components use tokens (zero hardcoded colors)
- [ ] UI Showcase page complete and accurate

✅ **Components**
- [ ] Shell + Sidebar accessible and modernized
- [ ] Chat UI with monochrome bubbles + states
- [ ] Governance/Settings forms accessible
- [ ] DevTools tables/logs readable and dense

✅ **Accessibility**
- [ ] Focus indicators 3px solid, visible everywhere
- [ ] Keyboard navigation works on all pages
- [ ] ARIA labels on all icon buttons
- [ ] Contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI)

✅ **Quality**
- [ ] No regression (lint/typecheck/tests pass)
- [ ] Empty/loading/error states present where needed
- [ ] Performance optimized (memoization, reduced glass morphism)

✅ **Documentation**
- [ ] RESEARCH_NOTES.md ✅ (already done)
- [ ] UI_AUDIT_REPORT.md ✅ (already done)
- [ ] IMPLEMENTATION_PLAN.md ✅ (this file)
- [ ] DESIGN_SYSTEM.md
- [ ] A11Y_CHECKLIST.md
- [ ] CLEANUP_REPORT.md
- [ ] FINAL_UI_RELEASE_NOTES.md
- [ ] BEFORE_AFTER_SUMMARY.md

---

## Risk Mitigation

### High-Risk Areas

1. **Hardcoded Colors**
   - Mitigation: Regex search, PR review, visual QA
   - Fallback: Keep old tokens as `--legacy-*` during transition

2. **Contrast Failures**
   - Mitigation: Use axe-core automated tests in CI
   - Manual: Test on 3 devices with different brightness

3. **Breaking Sidebar Navigation**
   - Mitigation: Extensive keyboard testing
   - Fallback: Keep old Sidebar as `SidebarLegacy.tsx` temporarily

4. **Performance Regression**
   - Mitigation: Lighthouse audits before/after
   - Rollback: If TTI increases >500ms, revert glass morphism changes

---

## Success Metrics

**Before Migration:**
- Cohérence: 65/100
- Accessibilité: 72/100
- Maintenabilité: 58/100

**Target After Migration:**
- Cohérence: 95/100 (+30)
- Accessibilité: 90/100 (+18)
- Maintenabilité: 92/100 (+34)
- Overall: 90+/100

**User Feedback:**
- "Interface feels premium and professional" ✅
- "Navigation is clearer and easier" ✅
- "Keyboard shortcuts work perfectly" ✅

---

## Appendix: Component Checklist

### Primitive Components (Priority 1)
- [ ] Button - All variants + states
- [ ] Card - Hover, loading, empty
- [ ] Input - Label, states
- [ ] Textarea - Same as Input
- [ ] Select - Accessible dropdown
- [ ] Badge - Monochrome variants
- [ ] Modal - Glass overlay
- [ ] Toast - Semantic colors preserved
- [ ] Alert - Success/error/warning/info
- [ ] Skeleton - Shimmer animation

### Layout Components (Priority 1)
- [ ] AppLayout - Landmarks
- [ ] Sidebar - Accessible buttons, focus
- [ ] Header - Consistent styling
- [ ] Container - Responsive padding

### Page Components (Priority 2)
- [ ] TitanePage
- [ ] ChatPage
- [ ] StatsPage
- [ ] AdminPage
- [ ] DevPage
- [ ] MemoryPage
- [ ] SentinelPage

### Specialized Components (Priority 3)
- [ ] Charts (Chartjs/Recharts)
- [ ] Tables (DevTools)
- [ ] Message bubbles (Chat)
- [ ] XP Progress bar
- [ ] Vitals panels

---

## Final Notes

**This plan is a living document.** Adjust as needed based on:
- Technical discoveries during implementation
- Feedback from Kevin Thibault
- Unforeseen challenges

**Communication:**
- Daily updates via `report_progress` tool
- Document all decisions in CHANGELOG.md
- Flag blockers immediately

**Completion Criteria:**
When ALL checklists are ✅ and Kevin Thibault signs off with "GO FOR PRODUCTION DEPLOY"

---

**Plan Created:** 2026-01-03  
**Estimated Duration:** 25 days (5 weeks)  
**Next Step:** Begin Phase 0 - Foundation & Preparation
