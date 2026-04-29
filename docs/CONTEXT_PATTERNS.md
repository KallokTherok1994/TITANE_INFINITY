# TITANE∞ — Context Patterns (SPRINT 4)

> **Scope**: Canonical patterns for React Context authoring in TITANE_INFINITY.
> Applies to: `src/contexts/**/*.tsx`
> Last updated: 2026-04-30 | Sprint: 4 | Mode: DURABLE

---

## 1. Standard Context Pattern

Every context in TITANE_INFINITY follows this structure:

```tsx
// 1. Type definitions
interface MyContextValue {
  // typed fields only — no `any`
}

// 2. Context creation — always undefined as default
const MyContext = createContext<MyContextValue | undefined>(undefined);

// 3. Provider — accepts children + optional config props
interface MyProviderProps {
  children: React.ReactNode;
  // optional config overrides
}

export const MyProvider: React.FC<MyProviderProps> = ({ children, ...config }) => {
  // memoize value to prevent unnecessary re-renders (mandatory)
  const value = useMemo<MyContextValue>(
    () => ({
      // fields derived from hooks/state
    }),
    [/* deps */]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

// 4. Typed hook — always throws if used outside provider
export const useMyContext = (): MyContextValue => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

---

## 2. Rules

| Rule | Description |
|------|-------------|
| R1 | `createContext` default is **always `undefined`** (never a fake stub) |
| R2 | The hook **always throws** with a clear message when outside the provider |
| R3 | The provider **always memoizes** the context value with `useMemo` |
| R4 | Props accept injectable dependencies for **full testability** (e.g., `rootLogger`, `createModuleLogger`) |
| R5 | No direct `@tauri-apps/api/core` calls in context files (One Door Rule 5) |
| R6 | Every context must have a `data-testid` in its E2E probe component |
| R7 | No `any` types in context interfaces |

---

## 3. Current Contexts

### LoggingContext (`src/contexts/LoggingContext.tsx`)

- **Purpose**: Injects a scoped root logger and a module-logger factory throughout the component tree.
- **Exports**: `LoggingProvider`, `useLogging`, `useModuleLogger`
- **Injectable**: `rootLogger`, `createModuleLogger` (for test isolation)
- **Default fallback**: If no `createModuleLogger` is provided, uses `createLogger` from `@/utils/logger`
- **Tests**: `src/contexts/__tests__/LoggingContext.test.tsx` (5 tests, 100% branch coverage)

```tsx
// Usage
const { logger, createModuleLogger } = useLogging();
const moduleLogger = useModuleLogger('MyComponent');
moduleLogger.info('event fired');
```

### AnimationContext (`src/contexts/AnimationContext.tsx`)

- **Purpose**: Exposes performance-aware Framer Motion throttling config across the UI tree.
- **Exports**: `AnimationProvider`, `useAnimation`
- **Delegate**: Wraps `usePerformanceMonitor` hook (injectable for tests via `vi.mock`)
- **Default thresholds**: `fpsThreshold=40`, `cpuThreshold=80`
- **Tests**: `src/contexts/__tests__/AnimationContext.test.tsx` (5 tests, 100% coverage)

```tsx
// Usage
const { animationConfig, shouldReduceMotion, shouldThrottle, fps } = useAnimation();
```

---

## 4. Migration Checklist

Use this checklist when creating a new context or migrating an existing one:

- [ ] `createContext<T | undefined>(undefined)` — no stub default
- [ ] Provider wraps value in `useMemo` with correct deps
- [ ] Hook throws `'useX must be used within XProvider'` on missing context
- [ ] Injectable dependencies for test isolation (no global singleton imports)
- [ ] Vitest test file at `src/contexts/__tests__/<Name>Context.test.tsx`
- [ ] At least 5 test cases covering:
  - [ ] Happy path with values exposed correctly
  - [ ] Default prop fallback(s) tested
  - [ ] Throw when used outside provider
  - [ ] All exported hooks covered
  - [ ] `data-testid` present in probe component
- [ ] Coverage ≥ 70% lines, ≥ 60% branches
- [ ] No `any` types in interfaces
- [ ] Mapped in `UI_SURFACE_MAP.md` if provider wraps page/root

---

## 5. Test Pattern

```tsx
// Standard vitest + @testing-library/react context test
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyProvider, useMyContext } from '@/contexts/MyContext';

describe('MyContext', () => {
  it('exposes values from provider', () => {
    const Probe = () => {
      const { value } = useMyContext();
      return <div data-testid="probe" data-value={value}>ok</div>;
    };

    render(
      <MyProvider>
        <Probe />
      </MyProvider>
    );

    expect(screen.getByTestId('probe')).toHaveAttribute('data-value', 'expected');
  });

  it('throws when used outside provider', () => {
    const Probe = () => {
      useMyContext();
      return null;
    };

    expect(() => render(<Probe />)).toThrow('useMyContext must be used within MyProvider');
  });
});
```

---

## 6. Anti-patterns (FORBIDDEN)

| Anti-pattern | Why forbidden |
|---|---|
| `createContext(fakeDefault)` | Silences the error when consumer is outside provider |
| Context value without `useMemo` | Causes cascade re-renders on every parent render |
| Direct `invoke` / Tauri API in context | Violates One Door (Rule 5) — use a service layer |
| `as any` in context interfaces | Type safety loss, Rule 7 violation |
| Missing throw guard in hook | Silent undefined dereference at consumer |

---

_Governed under TITANE_INFINITY Rule 16 (mandatory tests) and Rule 17 (canonical surface anti-drift)._
