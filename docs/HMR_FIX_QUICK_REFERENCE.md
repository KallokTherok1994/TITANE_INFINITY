# HMR Infinite Loop - Quick Reference Guide

## TL;DR: What Happened?

**Problem**: App was stuck in infinite HMR reload loop during development
**Root Cause**: Circular dependency `logger.ts ↔ logLevelConfig.ts` + hooks barrel exports
**Quick Fix**: Stashed 12 hooks with logger imports (temporary)
**Permanent Fix**: Extract `LogLevel` enum to break circular dependency

---

## The Circular Dependency

```
┌──────────────────────────────────────────────┐
│          CIRCULAR IMPORT CHAIN               │
└──────────────────────────────────────────────┘

    @/utils/logger.ts
           ↓
    lazy import('@/config/logLevelConfig')
           ↓
    @/config/logLevelConfig.ts
           ↓
    import { LogLevel } from '@/utils/logger'
           ↓
    ⟲ CIRCULAR BACK TO logger.ts
           ↓
    HMR INFINITE LOOP 💥
```

---

## The Amplification Effect

```
┌──────────────────────────────────────────────┐
│       HOOKS BARREL AMPLIFICATION             │
└──────────────────────────────────────────────┘

App.tsx → hooks/index.ts (92 exports)
                ↓
    ┌───────────┴────────────┐
    │                        │
    12 Hooks with logger     80 Other hooks
    (STASHED)               (OK)
    ↓
    Each import triggers circular dep
    ↓
    12x amplification = MEGA LOOP 🔥
```

---

## Stashed Hooks (Temporary)

These 12 hooks had their logger imports removed:

1. ✅ `useHybridEngine`
2. ✅ `useIdentityMatrix`
3. ✅ `useKeyboardShortcuts`
4. ✅ `useSingularityState`
5. ✅ `useSingularityStore`
6. ✅ `useTimeAgenda`
7. ✅ `useTwinBehavior`
8. ✅ `useTwinEvolution`
9. ✅ `useTwinIdentity`
10. ✅ `useUnifiedMemory`
11. ✅ `useVoiceMode`
12. ✅ `useWhisperStream`

**Restore after implementing permanent fix!**

---

## Permanent Fix (30 minutes)

### Step 1: Extract LogLevel Enum

```typescript
// NEW FILE: src/types/logLevel.ts
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}
```

### Step 2: Update Logger

```typescript
// src/utils/logger.ts
// REMOVE: export enum LogLevel { ... }
// ADD:
import { LogLevel } from '@/types/logLevel';

// Keep rest of file unchanged
```

### Step 3: Update Config

```typescript
// src/config/logLevelConfig.ts
// CHANGE:
import { LogLevel } from '@/utils/logger';
// TO:
import { LogLevel } from '@/types/logLevel';
```

### Step 4: Test

```bash
# Start dev server
pnpm dev

# Verify:
# ✅ App starts without loop
# ✅ No circular dependency warnings
# ✅ HMR works when changing files
```

### Step 5: Restore Stashed Changes

```bash
# Restore one hook at a time, test each
git stash pop
# If HMR breaks, you know which hook caused it
```

---

## Why This Works

```
BEFORE (Circular):
logger.ts → config.ts → logger.ts ⟲

AFTER (Acyclic):
logger.ts → types/logLevel.ts ✅
config.ts → types/logLevel.ts ✅

No cycle = No HMR loop!
```

---

## Long-Term Solutions

### 1. Remove Logger from Hooks (Best Practice)

```typescript
// ❌ BAD
import { logger } from '@/utils/logger';
export function useMyHook() {
  logger.debug('Called');
}

// ✅ GOOD
export function useMyHook() {
  const logger = useLogger('MyHook');
  logger.debug('Called');
}
```

### 2. Replace Barrel Imports

```typescript
// ❌ BAD (slow HMR)
import { useSomeHook } from './hooks';

// ✅ GOOD (fast HMR)
import { useSomeHook } from './hooks/useSomeHook';
```

### 3. Create LoggingContext

```typescript
// contexts/LoggingContext.tsx
export function LoggingProvider({ children }) {
  return (
    <LoggingContext.Provider value={logger}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogger(module?: string) {
  return useContext(LoggingContext);
}
```

---

## Verification Commands

```bash
# Check for circular dependencies
npx madge --circular src/

# Find all logger imports
grep -r "from '@/utils/logger'" src | wc -l

# Find all barrel imports
grep -r "from './hooks'" src | wc -l

# Test HMR speed
# Change a file, measure reload time in browser DevTools
```

---

## Metrics to Track

| Metric | Before | Target | Current |
|--------|--------|--------|---------|
| HMR update time | >2s | <200ms | ? |
| Dev startup | ~8s | <5s | ~8s |
| Circular deps | ≥1 | 0 | 1 |
| Logger implementations | 2 | 1 | 2 |
| Hooks with logger | 12 | 0 | 0 (stashed) |

---

## Related Issues

### runtime/dev/tauri.dev.conf.json Change

**Not related to HMR**, but improved in same session:

- **Before**: `npx vite dev ...`
- **After**: Explicit PATH, logging, error handling
- **Why**: Fix `pnpm not found` errors in some environments

### 150+ Modified Files

⚠️ Large uncommitted changeset detected

**Recommendation**:
```bash
# Review what changed
git diff --stat

# Stage logical chunks
git add -p

# Commit focused changes
git commit -m "fix: break logger circular dependency"
git commit -m "refactor: optimize hooks barrel"
```

---

## Quick Decision Tree

```
Is HMR looping?
    ├─ YES → Check for circular deps
    │         ├─ Found logger ↔ config?
    │         │    └─ Apply permanent fix (30 min)
    │         └─ Other circular dep?
    │              └─ Use madge to identify
    │
    └─ NO → Is HMR slow (>500ms)?
              ├─ YES → Check barrel imports
              │         └─ Replace with direct imports
              └─ NO → All good! 🎉
```

---

## Emergency Rollback

If permanent fix breaks something:

```bash
# Revert changes
git checkout HEAD -- src/types/logLevel.ts
git checkout HEAD -- src/utils/logger.ts
git checkout HEAD -- src/config/logLevelConfig.ts

# Stash again
git stash push -m "Revert logger fix" src/hooks/*.ts

# App should work (without the 12 hooks)
pnpm dev
```

---

## Resources

- **Full Analysis**: `docs/ANALYSIS_HMR_INFINITE_LOOP_2026-01-09.md`
- **Git Stash**: `git stash list` (find stashed hooks)
- **Vite HMR Docs**: https://vitejs.dev/guide/api-hmr.html
- **Madge (circular deps)**: https://github.com/pahen/madge

---

## Questions?

**Why did this happen?**
- Lazy import pattern for logLevelConfig created circular dependency
- HMR doesn't understand dynamic imports are "lazy"
- Triggers full reload every time

**Why not just remove logger entirely?**
- Logger provides structured logging, log levels, runtime control
- Essential for debugging production issues
- Need better architecture, not removal

**Can we just disable HMR?**
- Technically yes, but terrible dev experience
- Would need full page reload on every change
- Not acceptable for modern development

**Why didn't tests catch this?**
- Tests don't use HMR (they run in Node.js)
- Only affects Vite dev server
- Need to add HMR health checks

---

**Last Updated**: 2026-01-09
**Status**: Quick fix applied, permanent fix pending
**Owner**: TITANE Team
