# UI/UX Research Notes — Redesign Session 2026-05-15
**TITANE∞ v35+** | Senior Frontend Audit & Redesign

---

## Sources Consulted

1. **Apple Human Interface Guidelines** (HIG) — macOS, spatial density, restrained motion
2. **Nielsen Norman Group** — usability heuristics, navigation models, error prevention
3. **WCAG 2.2 / WAI-ARIA** — contrast ratios, keyboard navigation, motion preferences
4. **Radix UI / shadcn/ui documentation** — headless component patterns, accessible primitives
5. **Linear, Vercel, Raycast** — professional dark-mode product UI references

---

## Useful Principles Applied

### Spatial Hierarchy (Apple HIG + Linear)
- macOS sidebars use 16px padding, not 24px+ — the web tendency to over-pad hurts density
- Navigation items should be 36–40px tall in the primary bar — currently 40px (`h-10`) is correct
- Secondary content belongs to secondary surfaces, not primary navigation
- Content that is always visible should not be in a modal

### Typography Restraint (HIG + Nielsen)
- Use a maximum of 3 type weights per surface: 400 (body), 500 (labels/nav), 600 (headings/CTAs)
- Monospace font reserved for code, timestamps, metrics — not general UI text
- Line height 1.5 for body text; 1.25 for tight headings
- Never size body text below 14px (0.875rem) for readability

### Interaction Feedback Latency (HIG)
- Visual response to clicks/key presses must be < 100ms (CSS transitions, not JS)
- Loading states must appear within 100ms of an action being initiated
- Button active states should use `scale(0.97)` — not color-only — for tactility
- Hover states should use `translateY(-1px)` max — currently −2px is slightly too much

### Navigation Depth (Nielsen's 10 Heuristics)
- No more than 2 visible levels of navigation hierarchy at once
- "More" menus are acceptable but must be keyboard navigable with arrow keys
- Active state must be visually unambiguous — underline + color + background, not just color
- Breadcrumbs or page titles should always indicate where the user is

### Motion — Only for Continuity (HIG reduced-motion + Material)
- Decorative looping animations (glow-pulse, spiral-rotate, arc-flow, glitch) degrade professional feel
- State-change animations: 150–200ms ease-out (not 500ms — too sluggish for interactive UI)
- Page transitions: 200–300ms is the outer limit before it feels slow
- Skeleton shimmer: acceptable as loading indicator (functional, not decorative)
- `prefers-reduced-motion` must kill all looping animations, not just shorten them

### Dark Mode Quality (Vercel/Linear/Raycast)
- Background layers: 5 distinct surfaces using slate-900 → slate-800 → slate-700 → slate-600 → slate-500
- Never use pure black (#000) — use #0f172a (slate-900) as the base
- Borders at slate-700 (--color-border-default) create separation without noise
- Text hierarchy: slate-100 (primary) → slate-300 (secondary) → slate-400 (muted) → slate-500 (disabled)
- Accent sparingly: violet #7c3aed for primary CTAs only; semantic colors for status only

### Accessible Contrast (WCAG 2.2)
- Normal text: 4.5:1 minimum (AA), 7:1 preferred (AAA)
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components and icons: 3:1 against adjacent background
- Focus indicators: 3:1 contrast against unfocused state AND adjacent colors
- Disabled text at slate-500 (#64748b) on slate-900 (#0f172a): ratio ≈ 3.2:1 — acceptable for disabled
- Muted text at slate-400 (#94a3b8) on slate-900: ratio ≈ 4.6:1 — passes AA ✅

### Light Mode Principles (HIG + WCAG)
- Light backgrounds: white (#ffffff) → slate-50 (#f8fafc) → slate-100 (#f1f5f9) hierarchy
- Borders: slate-200 (#e2e8f0) for default, slate-300 (#cbd5e1) for strong
- Text: slate-900 (#0f172a) primary, slate-700 (#334155) secondary, slate-500 (#64748b) muted
- Accent: violet-600 (#7c3aed) works on both dark and light — good for token reuse
- Shadows must be stronger on light backgrounds (dark surfaces use opacity, light uses actual shadow)

---

## Rejected Trends and Why

| Trend | Reason Rejected |
|-------|----------------|
| Full glassmorphism everywhere | GPU cost, reduces readability on complex backgrounds |
| Neon glow on interactive elements | Clashes with professional macOS-level restraint |
| Heavy particle/3D background animations | Performance cost, distracts from content |
| Rounded corners > 16px on main panels | Looks childish/casual, not professional |
| Color gradients on body text | Reduces legibility, accessibility fail |
| Dark overlay with blur on page transitions | Too heavy for an app with 46+ routes |
| Sticky scrolling parallax | Performance, accessibility, motion sickness |
| Infinite scroll without pagination | UX heuristic: users need control and orientation |

---

## Final Design Direction for TITANE∞

**Core identity:** Calm, precise, professional — like a macOS app that happens to run in a browser.

**Palette strategy:**
- Dark mode (default): slate-900 base, violet-600 accent, semantic status colors
- Light mode (new): white base, violet-600 accent, same semantic colors — unified token set

**Motion strategy:**
- State changes: 150ms ease-out
- Modals/panels: 200ms ease-out (scale + fade)
- Page transitions: 250ms fade (Framer Motion)
- Looping animations: dev/diagnostic pages only
- All looping animations gated by `prefers-reduced-motion: no-preference` (not `reduce`)

**Component strategy:**
- `src/ui/components/` is the canonical primitive layer
- shadcn wrappers may call canonical primitives or Radix directly
- No inline hardcoded colors — all through CSS custom properties

**Typography strategy:**
- Inter (sans-serif) at weights 400, 500, 600 only across main UI paths
- JetBrains Mono for code blocks, metrics, terminal output
- Font size: min 14px (sm), standard 16px (base), headings up to 24px on main pages

**Accessibility minimum bar:**
- All interactive elements keyboard-reachable
- All icon-only buttons have `aria-label`
- Focus rings: 2px solid violet-600 with 2px offset
- Modals: focus trap, Escape to close, return focus on dismiss
- Toast notifications: `role="alert"` with `aria-live="polite"`
