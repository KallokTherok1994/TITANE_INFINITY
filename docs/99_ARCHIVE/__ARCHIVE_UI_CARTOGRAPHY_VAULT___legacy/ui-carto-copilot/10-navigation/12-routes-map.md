# Routes Map — Complete Route Configuration

**Date:** 2026-02-07  
**Routers:** Primary (`App.tsx` with React Router v7) + Secondary (`router.tsx` with createBrowserRouter)

---

## Routing Architecture

### Dual Router System

TITANE∞ uses **two parallel router configurations**:

1. **Primary Router** (`src/App.tsx`)
   - Uses `<BrowserRouter>` + `<Routes>` + `<Route>`
   - 40+ lazy-loaded pages
   - Extensive redirect mapping (legacy routes → unified centers)
   - Production-active router

2. **Secondary Router** (`src/router.tsx`)
   - Uses `createBrowserRouter` (React Router v7 data API)
   - 13 routes with `<AppLayout>` wrapper
   - Alternate/experimental router
   - May be for specific contexts or future migration

---

## Primary Router Routes (`App.tsx`)

### Core Routes (Active)

| Path | Component | Layout | Lazy | Purpose | Guards |
|------|-----------|--------|------|---------|--------|
| `/titane` | `TitanePage` | `AppShell + TopNav` | ✅ | Main hub (8 tabs) | None |
| `/stats` | `Stats` | `AppShell + TopNav` | ✅ | System metrics (4 panels) | None |
| `/time` | `TimePage` | `AppShell + TopNav` | ✅ | Temporal/agenda center | None |
| `/experience` | `Experience` | `AppShell + TopNav` | ✅ | XP progression page | None |
| `/admin` | `AdminPage` | `AppShell + TopNav` | ✅ | Admin center (5 tabs) | None |
| `/dev` | `DevPage` | `AppShell + TopNav` | ✅ | Dev tools (9 sections) | None |
| `/orchestration-center` | `OrchestrationCenter` | `AppShell + TopNav` | ✅ | Multi-AI orchestration | None |
| `/fusion` | `FusionPage` | `AppShell + TopNav` | ✅ | Backend/Frontend fusion | None |
| `/optimization` | `OptimizationPage` | `AppShell + TopNav` | ✅ | Performance optimization | None |

### Redirect Routes (Legacy → Unified Centers)

#### Redirects to `/titane`
- `/` → `/titane` (root)
- `/chat` → `/titane`
- `/camera` → `/titane`
- `/evo` → `/titane`
- `/dashboard` → `/titane`
- `/evolution-center` → `/titane`
- `/progression` → `/titane`
- `/xp` → `/titane`

#### Redirects to `/stats`
- `/cognitive` → `/stats`

#### Redirects to `/time`
- `/temporal-center` → `/time`
- `/agenda` → `/time`
- `/time-navigator` → `/time`

#### Redirects to `/admin`
- `/system-center` → `/admin`
- `/diagnostics` → `/admin`
- `/devtools` → `/admin`
- `/cluster` → `/admin`
- `/introspection` → `/admin`
- `/hypervision` → `/admin`
- `/configuration` → `/admin`
- `/design-center` → `/admin`
- `/design-system` → `/admin`
- `/settings` → `/admin`
- `/governance-center` → `/admin`
- `/governance` → `/admin`
- `/secure` → `/admin`
- `/audio-center` → `/admin`
- `/audio` → `/admin`
- `/voice` → `/admin`
- `/tts` → `/admin`

#### Redirects to `/orchestration-center`
- `/meta` → `/orchestration-center`

#### Redirects to `/dev`
- `/one-core` → `/dev`
- `/command-center` → `/dev`
- `/unified` → `/dev`
- `/singularity` → `/dev`
- `/qa-monitoring` → `/dev`
- `/qa` → `/dev`
- `/monitoring` → `/dev`
- `/tests` → `/dev`
- `/developer-mode` → `/dev`
- `/dev-mode` → `/dev`
- `/devmode` → `/dev`
- `/ia-dev` → `/dev`

### Total Redirects
- **To /titane:** 8 routes
- **To /stats:** 1 route
- **To /time:** 3 routes
- **To /admin:** 18 routes
- **To /orchestration-center:** 1 route
- **To /dev:** 12 routes
- **Total:** 43 redirect rules

---

## Secondary Router Routes (`router.tsx`)

### Routes (React Router v7 Data API)

| Path | Component | Layout | Lazy | Suspense | Error Boundary |
|------|-----------|--------|------|----------|----------------|
| `/` | `Dashboard` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/chat` | `Chat` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/stats` | `Stats` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/sentinel` | `Sentinel` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/watchdog` | `Watchdog` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/selfheal` | `SelfHeal` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/adaptive` | `AdaptiveEngine` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/memory` | `Memory` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/settings` | `Settings` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/devtools` | `DevTools` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/cloud` | `CloudCenter` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/agenda` | `Agenda` | `LayoutWrapper + AppLayout` | ✅ | ✅ | `ErrorFallback` |
| `/design-system` | `DesignSystemShowcase` | `Suspense only` | ✅ | ✅ | `ErrorFallback` |
| `*` | `Navigate to="/"` | None | ❌ | ❌ | None |

### LayoutWrapper Component
```typescript
const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const currentRoute = window.location.pathname;
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <AppLayout
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      onOpenExpPanel={() => {}}
    >
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </AppLayout>
  );
};
```

---

## Layout Hierarchy

### Primary Router Layout (App.tsx)

```
App (Root)
├── Providers
│   ├── ThemeProvider
│   ├── AnimationProvider
│   ├── TitanStateProvider
│   └── ToastProvider
├── BrowserRouter
│   └── Routes
│       ├── AutoHealErrorBoundary (global error boundary)
│       │   └── Suspense (lazy loading)
│       │       └── AppShell (main layout)
│       │           ├── TopNav (navigation)
│       │           └── Route Content
│       └── ErrorBoundary (fallback)
```

### Secondary Router Layout (router.tsx)

```
RouterProvider
└── Route
    ├── LayoutWrapper
    │   └── AppLayout
    │       ├── Sidebar (optional)
    │       ├── Header (fixed)
    │       ├── XP Bar (progression bar)
    │       └── Suspense
    │           └── Page Component
    └── ErrorFallback (on error)
```

---

## Suspense & Lazy Loading

### Loading Fallback (Primary Router)
```tsx
<div className="flex items-center justify-center h-screen">
  <div className="text-center">
    <div className="text-6xl mb-4">⚡</div>
    <div className="text-xl font-medium text-titanium-text-primary">
      Chargement TITANE∞...
    </div>
  </div>
</div>
```

### Loading Fallback (Secondary Router)
```tsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  color: 'var(--color-primary)',
  fontSize: '1.2rem',
}}>
  <div style={{ textAlign: 'center' }}>
    <div style={{ marginBottom: '1rem' }}>⚡</div>
    <div>Chargement TITANE∞...</div>
  </div>
</div>
```

### Lazy Import Pattern
```typescript
// Primary Router (App.tsx)
const TitanePage = lazy(() => import('./pages/TitanePage'));
const Stats = lazy(() => import('./pages/Stats'));
// ... etc.

// Secondary Router (router.tsx)
const Dashboard = lazy(() => import('./pages').then(m => ({ default: m.DashboardPage })));
const Chat = lazy(() => import('./ui/pages/Chat').then(m => ({ default: m.Chat })));
// ... etc.
```

---

## Error Boundaries

### AutoHealErrorBoundary (Primary Router)
- **Purpose:** Self-healing error recovery
- **Fallback:** AutoHeal UI with recovery options
- **Location:** Wraps entire route content
- **Features:** Automatic retry, diagnostic logging

### ErrorBoundary (Primary Router)
- **Purpose:** Generic error catching
- **Fallback:** Error message with stack trace (dev mode)
- **Location:** Wraps individual routes
- **Features:** Error reporting, user-friendly messages

### ErrorFallback (Secondary Router)
```tsx
const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div style={{ /* ... centered error display ... */ }}>
    <div>⚠️</div>
    <div>Erreur de chargement</div>
    {error && <div>{error.message}</div>}
  </div>
);
```

---

## Route Guards

### Current State
- **No authentication guards:** All routes publicly accessible
- **No role-based access:** No permission checks
- **No conditional rendering:** All features visible

### Future Considerations
- User authentication guard
- Admin role verification
- Feature flags for DEV section
- Onboarding completion check (currently skippable)

---

## Navigation Methods

### Primary Router
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/titane'); // Programmatic navigation
```

### Secondary Router
```typescript
// Manual navigation (no useNavigate hook used)
window.location.href = '/path';
```

### TopNav Handler
```typescript
const handleNavigate = useCallback((route: string) => {
  navigate(route); // Uses React Router navigate
}, [navigate]);
```

---

## Route Analytics

### Total Routes
- **Primary Router:** 9 active + 43 redirects = 52 total
- **Secondary Router:** 13 routes + 1 catch-all = 14 total

### Lazy-Loaded Pages
- **Primary Router:** 40+ pages
- **Secondary Router:** 12 pages (excluding catch-all)

### Redirect Strategy
- **Pattern:** Legacy routes → Unified centers
- **Purpose:** Consolidation (UI vΩ redesign)
- **Method:** `<Navigate to="..." replace />`

---

## Next: Layout Shell

⏭️ Continue to `13-layout-shell.md` for AppShell and persistent UI zones documentation.
