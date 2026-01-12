# TITANE∞ Design System — "Titanium Dark" Quick Reference

**Version:** 26.2.0  
**Last Updated:** 2026-01-03  
**Status:** Document historique (UI/UX) — Production EN ATTENTE (autorisation)  
**Compliance:** WCAG 2.2 AA

> NOTE (gouvernance): ce document décrit un design system UI/UX (v26.2.0) et ne constitue pas une validation de déploiement.
> Runtime actuel: v26.3.0.

> **Complete documentation:** See `titanium-dark-tokens.css` for all token definitions.
> **Research basis:** See `RESEARCH_NOTES.md` for design rationale.
> **Migration plan:** See `IMPLEMENTATION_PLAN.md` for rollout strategy.

---

## Philosophy

**Titanium Dark** is a monochrome premium design system built on three principles:

1. **Minimal = Intentional** — Every element serves a purpose
2. **Monochrome Premium** — Hierarchy through opacity, not color
3. **Accessibility First** — WCAG 2.2 AA compliance is mandatory

---

## Quick Start

### Import Tokens

```tsx
// Tokens are auto-imported via src/index.css
import '../index.css';

// Use Tailwind classes directly
<div className="bg-titanium-bg-elevated text-titanium-text-primary">
  Content
</div>
```

### Core Pattern

```tsx
// Standard Card
<div className="bg-titanium-bg-elevated rounded-lg p-4 shadow border border-titanium-border-default">
  <h2 className="text-xl font-semibold text-titanium-text-primary mb-2">
    Title
  </h2>
  <p className="text-base text-titanium-text-secondary">
    Description
  </p>
</div>
```

---

## Color Palette

### Backgrounds (Layered Depth)

```css
--titanium-bg-base: #0f0f0f          /* Page root */
--titanium-bg-elevated: #1a1a1a      /* Cards, panels */
--titanium-bg-interactive: #242424   /* Hover states */
--titanium-bg-overlay: #2e2e2e       /* Modals */
```

**Tailwind:** `bg-titanium-bg-base`, `bg-titanium-bg-elevated`, etc.

### Text (High Contrast)

```css
--titanium-text-primary: #f5f5f5     /* 7:1 contrast (AAA) */
--titanium-text-secondary: #b8b8b8   /* 4.8:1 contrast (AA+) */
--titanium-text-tertiary: #8a8a8a    /* Muted */
--titanium-text-disabled: #5a5a5a    /* Disabled */
```

**Tailwind:** `text-titanium-text-primary`, `text-titanium-text-secondary`, etc.

### Accent (Minimal Cool Gray)

```css
--titanium-accent-cool: #9ca3af      /* Primary CTAs */
--titanium-accent-bright: #d1d5db    /* Focus rings */
```

**Tailwind:** `bg-titanium-accent-cool`, `text-titanium-accent-bright`

### Semantic (Status Only)

```css
--titanium-success: #10b981     /* Green */
--titanium-error: #ef4444       /* Red */
--titanium-warning: #f59e0b     /* Orange */
--titanium-info: #3b82f6        /* Blue */
```

**Tailwind:** `text-success-500`, `bg-error-500`, etc.

---

## Typography

### Scale (1.250 Ratio)

| Size | Rem | Pixels | Tailwind | Use Case |
|------|-----|--------|----------|----------|
| xs | 0.75rem | 12px | `text-xs` | Labels, metadata |
| sm | 0.875rem | 14px | `text-sm` | Secondary text |
| base | 1rem | 16px | `text-base` | **Body text** |
| lg | 1.125rem | 18px | `text-lg` | Subheadings |
| xl | 1.25rem | 20px | `text-xl` | H2/H3 |
| 2xl | 1.563rem | 25px | `text-2xl` | **H1 Page titles** |
| 3xl | 1.953rem | 31px | `text-3xl` | Hero text |

### Fonts

```css
--titanium-font-sans: 'Inter', sans-serif
--titanium-font-mono: 'JetBrains Mono', monospace
```

**Tailwind:** `font-sans`, `font-mono`

### Weights

| Weight | Value | Tailwind | Use Case |
|--------|-------|----------|----------|
| Normal | 400 | `font-normal` | Body text |
| Medium | 500 | `font-medium` | Labels |
| Semibold | 600 | `font-semibold` | Buttons, H2/H3 |
| Bold | 700 | `font-bold` | H1 |

---

## Spacing (4px Rhythm)

| Token | Pixels | Tailwind | Use Case |
|-------|--------|----------|----------|
| space-2 | 8px | `p-2`, `gap-2` | Tight |
| space-3 | 12px | `p-3`, `gap-3` | **Flex/grid gap** |
| space-4 | 16px | `p-4`, `gap-4` | **Card padding** |
| space-6 | 24px | `p-6`, `mb-6` | **Section spacing** |
| space-8 | 32px | `p-8` | Large padding |
| space-12 | 48px | `mb-12` | Page sections |

---

## Elevation (Shadows)

| Level | Tailwind | Use Case |
|-------|----------|----------|
| none | `shadow-none` | Flat buttons |
| sm | `shadow-sm` | Subtle cards |
| base | `shadow` | **Default cards** |
| md | `shadow-md` | **Elevated panels** |
| lg | `shadow-lg` | **Modals, dropdowns** |
| xl | `shadow-xl` | Hero sections |
| focus | `shadow-focus` | **Focus indicator (WCAG)** |

**Focus Ring (WCAG 2.2):**

```tsx
<button className="focus-visible:shadow-focus focus-visible:outline-none">
  Accessible Button
</button>
```

---

## Border Radius

| Size | Pixels | Tailwind | Use Case |
|------|--------|----------|----------|
| sm | 8px | `rounded-sm` | Badges |
| base | 16px | `rounded` | **Buttons, inputs** |
| lg | 24px | `rounded-lg` | **Cards** |
| xl | 32px | `rounded-xl` | Hero sections |
| full | 9999px | `rounded-full` | **Avatars, pills** |

---

## Component Patterns

### Button

```tsx
// Primary CTA
<button className="
  bg-titanium-accent-cool 
  text-titanium-bg-base 
  hover:bg-titanium-accent-bright 
  focus-visible:shadow-focus focus-visible:outline-none
  rounded px-4 py-2 font-medium
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>

// Ghost (Default)
<button className="
  bg-transparent 
  text-titanium-text-secondary 
  hover:bg-titanium-bg-interactive hover:text-titanium-text-primary
  focus-visible:shadow-focus focus-visible:outline-none
  rounded px-4 py-2 font-medium
  transition-colors duration-200
">
  Ghost Button
</button>

// Destructive
<button className="
  bg-error-500 
  text-white 
  hover:bg-error-700
  focus-visible:shadow-focus focus-visible:outline-none
  rounded px-4 py-2 font-medium
  transition-colors duration-200
">
  Delete
</button>
```

### Card

```tsx
// Standard Card
<div className="
  bg-titanium-bg-elevated 
  border border-titanium-border-default 
  rounded-lg p-4 shadow
  hover:shadow-md transition-shadow
">
  <h3 className="text-xl font-semibold text-titanium-text-primary mb-2">
    Card Title
  </h3>
  <p className="text-base text-titanium-text-secondary">
    Card content goes here.
  </p>
</div>
```

### Input

```tsx
<div className="flex flex-col gap-2">
  <label htmlFor="input-id" className="text-sm font-medium text-titanium-text-primary">
    Label
  </label>
  <input
    id="input-id"
    type="text"
    className="
      bg-titanium-bg-interactive 
      border border-titanium-border-default 
      text-titanium-text-primary 
      placeholder:text-titanium-text-tertiary
      rounded px-4 py-2
      focus:outline-none focus:shadow-focus focus:border-titanium-accent-bright
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors duration-200
    "
    placeholder="Enter text..."
  />
</div>
```

### Modal

```tsx
<dialog className="
  fixed inset-0 z-modal
  flex items-center justify-center
  bg-black/50 backdrop-blur-sm
">
  <div className="
    bg-titanium-bg-overlay 
    rounded-lg shadow-lg p-6 
    max-w-md w-full
    border border-titanium-border-default
  ">
    <h2 className="text-xl font-semibold text-titanium-text-primary mb-4">
      Modal Title
    </h2>
    <p className="text-base text-titanium-text-secondary mb-6">
      Modal content.
    </p>
    <div className="flex gap-3 justify-end">
      <button className="bg-transparent border border-titanium-border-default rounded px-4 py-2">
        Cancel
      </button>
      <button className="bg-titanium-accent-cool text-titanium-bg-base rounded px-4 py-2">
        Confirm
      </button>
    </div>
  </div>
</dialog>
```

---

## Accessibility Checklist

### WCAG 2.2 AA Requirements

- [ ] **Text Contrast:** 4.5:1 minimum (7:1 for primary)
- [ ] **Focus Indicators:** 3px solid ring on ALL interactive elements
- [ ] **Keyboard Navigation:** Tab order logical, no traps
- [ ] **ARIA Labels:** Icon-only buttons have `aria-label`
- [ ] **Semantic HTML:** Use `<button>`, not `<div onClick>`
- [ ] **Form Labels:** Associate `<label>` with `<input>` via `htmlFor`/`id`
- [ ] **Error States:** Use `aria-invalid` + `aria-describedby`
- [ ] **Reduced Motion:** Respect `prefers-reduced-motion`

### Focus Ring Pattern (Mandatory)

```tsx
<button className="focus-visible:shadow-focus focus-visible:outline-none">
  Always use this pattern
</button>
```

### Icon-Only Button Pattern

```tsx
{/* ❌ BAD */}
<button><Icon /></button>

{/* ✅ GOOD */}
<button aria-label="Close modal"><XIcon /></button>
```

---

## Migration Guide

### From Legacy Colors

| Old | New |
|-----|-----|
| `bg-primary` | `bg-titanium-bg-base` |
| `bg-secondary` | `bg-titanium-bg-elevated` |
| `text-primary` | `text-titanium-text-primary` |
| `violet-600` | `titanium-accent-cool` |
| `border-default` | `border-titanium-border-default` |

### From Hardcoded Values

| Hardcoded | Token |
|-----------|-------|
| `#1a1a1a` | `bg-titanium-bg-elevated` |
| `#f5f5f5` | `text-titanium-text-primary` |
| `rgba(255,255,255,0.12)` | `border-titanium-border-default` |
| `padding: 16px` | `p-4` |
| `border-radius: 16px` | `rounded` |

---

## Do's and Don'ts

### DO ✅

- ✅ Use `bg-titanium-bg-elevated` for cards
- ✅ Use `text-titanium-text-primary` for body text
- ✅ Use `p-4` (16px) for card padding
- ✅ Use `shadow-focus` for all interactive elements
- ✅ Use `rounded-lg` for cards, `rounded` for buttons
- ✅ Add `aria-label` to icon-only buttons

### DON'T ❌

- ❌ Use hardcoded hex colors (#1a1a1a)
- ❌ Use pure black (#000) backgrounds
- ❌ Use deprecated violet/sage colors
- ❌ Remove focus outlines without replacement
- ❌ Use `<div onClick>` instead of `<button>`
- ❌ Use text smaller than 14px for body content

---

## Resources

- **Tokens:** `src/styles/titanium-dark-tokens.css`
- **Tailwind Config:** `tailwind.config.ts`
- **Research:** `docs/ui/RESEARCH_NOTES.md`
- **Audit Report:** `docs/ui/UI_AUDIT_REPORT.md`
- **Implementation Plan:** `docs/ui/IMPLEMENTATION_PLAN.md`
- **WCAG 2.2:** https://www.w3.org/WAI/WCAG22/quickref/
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

## Changelog

### v26.2.0 (2026-01-03)

- ✅ Initial Titanium Dark design system
- ✅ Monochrome color palette with cool gray accent
- ✅ 4px spacing rhythm
- ✅ 16px base border radius
- ✅ WCAG 2.2 AA compliant focus indicators
- ✅ Comprehensive token system (11KB CSS)
- ✅ Tailwind integration complete

---

**Next Steps:**

1. Update primitive components (Button, Card, Input)
2. Build UI Showcase page at `/design-system`
3. Begin Sidebar accessibility fixes
4. Migrate pages module-by-module

**Questions?** Reference `IMPLEMENTATION_PLAN.md` for detailed rollout strategy.
