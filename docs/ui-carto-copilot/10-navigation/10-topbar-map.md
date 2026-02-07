# TopBar Navigation Map

**Date:** 2026-02-07  
**Component:** `src/components/layout/TopNav.tsx`  
**Pattern:** Horizontal navigation (replaces sidebar in UI vΩ)

---

## TopNav Structure

### Design Principles (UI vΩ)
- **Max 5 visible items** in primary nav
- **"Plus" dropdown menu** for additional items
- **WCAG 2.2 AA compliant** (keyboard nav, focus management, ARIA)
- **Responsive:** Icons only on mobile, labels on desktop (md:)
- **Active indicator:** Bottom border (0.5px accent color)

### Architecture
```
TopNav (z-index: 10000, fixed top-0)
├── Logo Section (left)
│   ├── TitaneLogo (32px)
│   └── "TITANE∞" text (hidden on sm)
├── Navigation Items (center, max-w-5xl)
│   ├── Visible Items (max 5)
│   │   ├── Item 1: TITANE
│   │   ├── Item 2: TIME
│   │   ├── Item 3: STATS
│   │   ├── Item 4: ADMIN
│   │   └── Item 5: DEV
│   └── More Menu (if items > 5)
│       ├── Button: "Plus" (MoreHorizontal icon)
│       └── Dropdown Menu
│           ├── Item 6: FUSION
│           └── Item 7: OPTIMIZE
└── Actions (right, reserved slot)
    └── (Future: settings, user menu)
```

---

## TopNav Sections (Primary)

### Section 1: TITANE
- **ID:** `titane`
- **Label:** "TITANE"
- **Icon:** `<Atom size={18} />`
- **Route:** `/titane`
- **Description:** "Le Cœur du Système"
- **Purpose:** Main hub - Dashboard with 8 sub-sections (Chat, Overview, Vision, Identity, Memory, Evolution, XP, Transform)
- **Visibility:** Always visible (position 1)

### Section 2: TIME
- **ID:** `time`
- **Label:** "TIME"
- **Icon:** `<Timer size={18} />`
- **Route:** `/time`
- **Description:** "Centre Temporel"
- **Purpose:** Temporal management, agenda, scheduling
- **Visibility:** Always visible (position 2)

### Section 3: STATS
- **ID:** `stats`
- **Label:** "STATS"
- **Icon:** `<TrendingUp size={18} />`
- **Route:** `/stats`
- **Description:** "Métriques Système"
- **Purpose:** System metrics dashboard (4 panels: NEXUS, HELIOS, HARMONIA, Cognitive State)
- **Visibility:** Always visible (position 3)

### Section 4: ADMIN
- **ID:** `admin`
- **Label:** "ADMIN"
- **Icon:** `<Settings size={18} />`
- **Route:** `/admin`
- **Description:** "Centre Admin Unifié"
- **Purpose:** System administration (5 tabs: System, Config, Audio, Design, Governance)
- **Visibility:** Always visible (position 4)

### Section 5: DEV
- **ID:** `dev`
- **Label:** "DEV"
- **Icon:** `<Wrench size={18} />`
- **Route:** `/dev`
- **Description:** "Centre DEV Unifié"
- **Purpose:** Developer tools (9 sections: Overview, DevTools, CommandCenter, etc.)
- **Visibility:** Always visible (position 5)

---

## TopNav Sections (More Menu)

### Section 6: FUSION
- **ID:** `fusion`
- **Label:** "FUSION"
- **Icon:** Default `<Atom size={18} />`
- **Route:** `/fusion`
- **Description:** "Backend/Frontend Fusion"
- **Purpose:** Integration layer visualization
- **Visibility:** In "Plus" dropdown menu

### Section 7: OPTIMIZE
- **ID:** `optimization`
- **Label:** "OPTIMIZE"
- **Icon:** Default `<Atom size={18} />`
- **Route:** `/optimization`
- **Description:** "Performance Ultime"
- **Purpose:** Advanced performance optimization tools
- **Visibility:** In "Plus" dropdown menu

---

## Technical Details

### Icon Mapping
```typescript
const ICON_MAP: Record<string, React.ReactNode> = {
  titane: <Atom size={18} />,
  time: <Timer size={18} />,
  stats: <TrendingUp size={18} />,
  admin: <Settings size={18} />,
  dev: <Wrench size={18} />,
};
```

### Active Route Detection
```typescript
const isActive = (route: string): boolean => {
  return currentRoute === route || currentRoute.startsWith(route);
};
```
- **Exact match** OR **prefix match** (e.g., `/titane` matches `/titane/chat`)

### Accessibility Features
- **Role:** `navigation`
- **ARIA label:** "Navigation principale"
- **ARIA current:** `"page"` for active item
- **ARIA expanded:** `true/false` for "Plus" menu
- **ARIA haspopup:** `true` for "Plus" button
- **Keyboard support:** Enter/Space to navigate
- **Focus ring:** `focus:ring-2 focus:ring-titanium-accent-cool`
- **Click-outside:** Closes "Plus" menu on external click

### Styling
- **Background:** `bg-titanium-bg-elevated` + `backdrop-blur-md`
- **Border:** Bottom border (`border-b border-titanium-border-default`)
- **Height:** Fixed 64px (`h-16`)
- **Shadow:** `shadow-sm`
- **Active indicator:** Bottom border (0.5px, `bg-titanium-accent-cool`)

### Animation
- **"Plus" dropdown:** Framer Motion
  - **Initial:** `opacity: 0, y: -10`
  - **Animate:** `opacity: 1, y: 0`
  - **Exit:** `opacity: 0, y: -10`
  - **Duration:** 200ms
- **Chevron rotation:** `rotate-180` when open

---

## Navigation Handler

### Implementation (App.tsx)
```typescript
const handleNavigate = useCallback((route: string) => {
  navigate(route); // React Router v7 navigate()
}, [navigate]);
```

### Usage
```tsx
<TopNav
  items={topNavItems}
  currentRoute={location.pathname}
  onNavigate={handleNavigate}
  maxVisibleItems={5}
/>
```

---

## Route Redirects

### Legacy Routes → TopNav Routes
Defined in `src/App.tsx`:

| Legacy Route | Redirect Target | TopNav Section |
|--------------|-----------------|----------------|
| `/` | `/titane` | TITANE |
| `/chat` | `/titane` | TITANE |
| `/dashboard` | `/titane` | TITANE |
| `/cognitive` | `/stats` | STATS |
| `/system-center` | `/admin` | ADMIN |
| `/governance-center` | `/admin` | ADMIN |

---

## Proof of Implementation

### File Location
```
src/components/layout/TopNav.tsx (267 lines)
```

### Import Statement (App.tsx)
```typescript
import { AppShell, TopNav, createTopNavItems } from '@components/layout';
```

### Helper Function
```typescript
export const createTopNavItems = (
  menuSections: Array<{
    id: string;
    label: string;
    route: string;
    description?: string;
  }>
): TopNavItem[] => {
  return menuSections.map(section => ({
    id: section.id,
    label: section.label,
    icon: ICON_MAP[section.id] || <Atom size={18} />,
    route: section.route,
    description: section.description,
  }));
};
```

---

## Next: Section Details

⏭️ Continue to `11-sections-map.md` for detailed breakdown of each TopNav section's sub-tabs and components.
