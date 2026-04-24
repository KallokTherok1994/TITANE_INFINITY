# Persistent Widgets — Always-On UI Components

**Date:** 2026-02-07  
**Scope:** UI components that persist across routes and page transitions

---

## Overview

Persistent widgets are UI components that remain mounted and visible regardless of route changes. They provide continuous system monitoring, error handling, and user feedback.

---

## Widget 1: CognitiveLayout (Helios/Nexus Visualization)

### Purpose
Visual representation of the cognitive architecture state (Helios/Nexus engines).

### File Location
```
src/components/cognitive/CognitiveLayoutControl.tsx
src/components/cognitive/CognitiveLayoutControl.css
```

### Integration Point
- **Location:** App-level (mounted in App.tsx or AppShell)
- **Visibility:** Conditional (user-toggleable)
- **Z-Index:** High (overlay above content)

### Hook
```typescript
import { useCognitiveLayout } from '@/hooks/useCognitiveLayout';

const { layoutState, toggleLayout } = useCognitiveLayout();
```

### Features
- **Real-time Engine State:** Displays Helios (vitality) and Nexus (cognitive network) metrics
- **Interactive Controls:** User can toggle visibility, adjust opacity
- **Animation:** Smooth transitions (Framer Motion)

### State Source
```typescript
// Service integration
import { cognitiveLayoutService } from '@/services/cognitive/cognitiveLayoutService';

// Engine subscriptions
useEngineSubscription('helios');
useEngineSubscription('nexus');
```

### Rendering Position
- **Desktop:** Fixed position (top-right or custom)
- **Mobile:** Collapsible panel or hidden by default

---

## Widget 2: ConsoleMonitor (Dev Tools Overlay)

### Purpose
Real-time console output monitoring for developers (DEV mode).

### File Location
```
src/components/dev/ConsoleMonitorDashboard.tsx
src/components/dev/ConsoleMonitorDashboard.css
```

### Integration Point
- **Location:** AppShellWithDevTools.tsx (dev-only variant)
- **Visibility:** Visible only in DEV mode or when explicitly enabled
- **Z-Index:** Very high (dev tools layer)

### Features
- **Console Log Capture:** Intercepts console.log, console.warn, console.error
- **Real-time Updates:** Live streaming of logs
- **Filtering:** Filter by log level (info, warn, error)
- **Persistence:** Logs persist across page navigations
- **Clear Control:** User can clear log history

### State Management
```typescript
// Global console monitor store (if exists)
import { useConsoleMonitorStore } from '@/stores/consoleMonitorStore';

const { logs, addLog, clearLogs } = useConsoleMonitorStore();
```

### Console Hijacking (Implementation)
```typescript
// Intercept console methods
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  addLog({ level: 'info', message: args.join(' '), timestamp: Date.now() });
};
```

### Rendering Position
- **Desktop:** Docked bottom or side panel (draggable)
- **Mobile:** Full-screen modal

### Activation
- **Keyboard Shortcut:** Ctrl+Shift+C (potential)
- **Dev Menu:** Toggle from DEV section
- **URL Param:** `?devtools=true` (potential)

---

## Widget 3: ErrorBoundary (Global Error Catcher)

### Purpose
Catches React errors and prevents app crashes, displays user-friendly fallback UI.

### File Locations
```
src/components/ErrorBoundary.tsx                           # Generic error boundary
src/components/AutoHealErrorBoundary.tsx                   # Self-healing variant
src/components/AutoHealErrorBoundary.css
src/components/ChatErrorBoundary.tsx                       # Chat-specific
src/features/system-center/components/SystemCenterErrorBoundary.tsx  # System-specific
```

### Integration Layers

#### Layer 1: Global ErrorBoundary (App.tsx)
```tsx
<ErrorBoundary fallback={<GenericErrorFallback />}>
  <Routes>
    {/* All routes */}
  </Routes>
</ErrorBoundary>
```

#### Layer 2: AutoHealErrorBoundary (App.tsx)
```tsx
<AutoHealErrorBoundary>
  <AppShell>
    {/* Content */}
  </AppShell>
</AutoHealErrorBoundary>
```

#### Layer 3: Route-Specific Boundaries
```tsx
// In router.tsx
{
  path: '/chat',
  element: (
    <ChatErrorBoundary>
      <Chat />
    </ChatErrorBoundary>
  ),
}
```

### Features

#### ErrorBoundary (Generic)
- **Catches:** All React errors in child tree
- **Fallback:** Simple error message + stack trace (dev mode)
- **Reset:** Page reload button

#### AutoHealErrorBoundary
- **Catches:** All React errors
- **Fallback:** Self-healing UI with diagnostic info
- **Features:**
  - Automatic retry mechanism
  - Error logging to Tauri backend
  - Diagnostic suggestions
  - "Report Issue" button
- **Recovery:** Attempts automatic recovery via state reset

#### ChatErrorBoundary
- **Catches:** Errors in Chat subsystem
- **Fallback:** Chat-specific error UI
- **Features:**
  - Preserve conversation history
  - Offer conversation export
  - Safe mode toggle (disable features until recovery)

### Error Reporting
```typescript
// Error captured and reported
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo);
  
  // Send to Tauri backend for logging
  secureInvoke('log_error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
  
  // Optional: Send to external monitoring (Sentry, etc.)
}
```

### Accessibility
- **Role:** `alert` on error message
- **Focus:** Automatic focus on "Retry" button
- **Keyboard:** Tab navigation to all action buttons

---

## Widget 4: Toasts (Notifications)

### Purpose
Transient notification system for user feedback (success, error, info, warning).

### Library
**Sonner** (React toast library)
```json
"sonner": "^2.0.7"
```

### File Location
```
// Toast provider setup in App.tsx
import { Toaster } from 'sonner';
```

### Integration Point
```tsx
<ToastProvider>
  <Toaster 
    position="top-right"
    richColors
    closeButton
    duration={5000}
  />
  <App />
</ToastProvider>
```

### Usage
```typescript
import { toast } from 'sonner';

// Success
toast.success('Operation completed!');

// Error
toast.error('Failed to save changes');

// Info
toast.info('New version available');

// Warning
toast.warning('Low disk space');

// Custom
toast('Custom message', {
  description: 'Additional details here',
  action: {
    label: 'Undo',
    onClick: () => handleUndo(),
  },
});
```

### State Management
```typescript
// UI Store integration
import { useUIStore } from '@/stores/uiStore';

const { addToast, removeToast, toasts } = useUIStore();
```

### Toast Configuration
```typescript
interface ToastOptions {
  duration?: number;         // Auto-dismiss time (ms)
  position?: ToastPosition;  // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  richColors?: boolean;      // Use semantic colors
  closeButton?: boolean;     // Show close button
  action?: ToastAction;      // Action button
}
```

### Positioning
- **Primary:** Top-right corner
- **Mobile:** Top-center (responsive)
- **Z-Index:** Maximum (above all UI)

### Accessibility
- **Role:** `status` or `alert` (depending on type)
- **ARIA Live:** `polite` (info) or `assertive` (error)
- **Keyboard:** Focusable close button, action buttons

---

## Widget 5: XP Bar (Progression Display)

### Purpose
Persistent XP progression bar showing user level and progress.

### File Location
```
src/components/experience/XPBar.tsx
```

### Integration Point
- **Location:** App-level or AppLayout
- **Position:** Fixed top (below TopNav) or bottom
- **Visibility:** Always visible (unless explicitly hidden)

### Features
- **Current Level:** Display user level
- **XP Progress:** Visual bar showing progress to next level
- **Tooltip:** Hover to see exact XP values
- **Animation:** Smooth fill animation on XP gain

### State Source
```typescript
import { usePerformanceStore } from '@/stores/usePerformanceStore';
import { useAutomationXPStore } from '@/stores/useAutomationXPStore';

const { totalXP, level, nextLevelXP } = useAutomationXPStore();
```

### Rendering
```tsx
<motion.div 
  className="xp-bar-container"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
  <span>Level {level}</span>
  <span>{totalXP}/{nextLevelXP} XP</span>
</motion.div>
```

---

## Widget 6: ExpPanel (Experience Panel)

### Purpose
Expandable panel showing detailed XP breakdown and progression.

### File Location
```
src/components/experience/ExpPanel.tsx
```

### Integration Point
- **Trigger:** Click XP Bar or keyboard shortcut
- **Position:** Slide-out panel (right side)
- **Z-Index:** High (overlay)

### Features
- **XP Breakdown:** Show XP sources (conversations, tasks, optimizations)
- **Milestones:** Display reached milestones and unlocked features
- **Talent Tree:** Visual progression tree (if implemented)
- **History:** Recent XP gains timeline

---

## Widgets Activation Matrix

| Widget | Always Visible | Conditional | Toggleable | Dev Only |
|--------|----------------|-------------|------------|----------|
| **CognitiveLayout** | ❌ | ✅ | ✅ | ❌ |
| **ConsoleMonitor** | ❌ | ✅ | ✅ | ✅ |
| **ErrorBoundary** | ✅ | ❌ | ❌ | ❌ |
| **Toasts** | ✅* | ❌ | ❌ | ❌ |
| **XP Bar** | ✅ | ❌ | ✅ | ❌ |
| **ExpPanel** | ❌ | ✅ | ✅ | ❌ |

*Toasts are always mounted but only visible when active.

---

## Z-Index Hierarchy

```
Layer 10000: TopNav
Layer 9999:  Dev Tools (ConsoleMonitor)
Layer 9998:  Error Boundaries (Fallback UI)
Layer 9997:  Toasts
Layer 9996:  Modals/Dialogs
Layer 9995:  CognitiveLayout Overlay
Layer 9990:  ExpPanel Slide-out
Layer 1000:  XP Bar
Layer 1:     Main Content
```

---

## Performance Considerations

### Memoization
- **ErrorBoundary:** No memoization (must catch all errors)
- **Toasts:** Memoized (only re-render on toast changes)
- **XP Bar:** Memoized (only re-render on XP change)
- **CognitiveLayout:** Memoized (only re-render on state change)

### Rendering Optimization
- **Toasts:** Virtualized list if > 5 toasts
- **ConsoleMonitor:** Virtualized log list (react-window)
- **CognitiveLayout:** Throttled updates (max 1/sec)

---

## Accessibility Summary

| Widget | Keyboard Nav | Screen Reader | Focus Management | ARIA |
|--------|-------------|---------------|------------------|------|
| CognitiveLayout | ✅ | ✅ | ✅ | ✅ |
| ConsoleMonitor | ✅ | ⚠️ Partial | ✅ | ⚠️ Partial |
| ErrorBoundary | ✅ | ✅ | ✅ | ✅ |
| Toasts | ✅ | ✅ | ⚠️ Auto-dismiss | ✅ |
| XP Bar | ⚠️ Read-only | ✅ | ❌ | ✅ |
| ExpPanel | ✅ | ✅ | ✅ | ✅ |

---

## Next: Components Inventory

⏭️ Continue to Phase C (20-components/) for exhaustive component inventory.

✅ **GATE_B: PASSED**
- all_routes_listed: ✅
- widgets_documented: ✅
