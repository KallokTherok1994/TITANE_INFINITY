# 🚀 PHASE 2: PERFORMANCE OPTIMIZATION — v26.4.0

**Objective:** Achieve v26.4.0 performance targets (-25% launch time, -7% binary size)  
**Timeline:** 2-4 hours  
**Status:** 🚀 **STARTING NOW**

---

## 🎯 TARGETS

| Metric            | v26.3.0 | v26.4.0 Target | % Gain | Status        |
| ----------------- | ------- | -------------- | ------ | ------------- |
| **Launch Time**   | 2.001s  | < 1.5s         | 25% ↓  | 🎯 Aggressive |
| **Binary Size**   | 81 MB   | < 75 MB        | 7% ↓   | 🎯 Achievable |
| **Memory (Idle)** | 53 MB   | < 50 MB        | 6% ↓   | 🎯 Achievable |
| **CPU (Idle)**    | 2.5%    | < 2.0%         | 20% ↓  | 🎯 Stretch    |

---

## 🔍 PART 1: BUNDLE ANALYSIS (Task 2A)

### Goal

Identify and eliminate unused dependencies, duplicate modules, and bloated packages.

**Expected Savings:** 5-10 MB

### Steps

**Step 1: Generate Bundle Map**

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Build with source maps
pnpm run build

# Analyze bundle
npx source-map-explorer 'dist/**/*.js' 'dist/**/*.css' \
    --html bundle-analysis.html

# View in browser or inspect JSON output
echo "📊 Bundle analysis ready: bundle-analysis.html"
```

**Step 2: Identify Large Modules**

```bash
# Export detailed size data
du -sh dist/assets/* | sort -rh | head -20
```

**Step 3: Detect Unused Dependencies**

```bash
# Install depcheck
npm install -D depcheck

# Find unused packages
npx depcheck --json > unused-deps.json

# Review results
cat unused-deps.json | jq '.dependencies'
```

**Step 4: Implement Removals**

```json
// Example: If "old-ui-library" found unused
{
  "before": {
    "dependencies": {
      "old-ui-library": "^1.0.0",
      "react": "^18.2.0"
    }
  },
  "after": {
    "dependencies": {
      "react": "^18.2.0"
    }
  }
}
```

### Expected Result

```
✅ Remove 2-3 unused dependencies
✅ Eliminate 5-10 MB from bundle
✅ Cleaner import paths
```

---

## 🔀 PART 2: CODE SPLITTING (Task 2B)

### Goal

Lazy-load non-critical components to reduce initial bundle and improve time-to-interactive.

**Expected Savings:** 0.2-0.3s launch time

### Strategy

**2B-1: Identify Heavy Components**

```typescript
// Current imports (loaded upfront)
import ChatUI from './components/ChatUI'; // ~500KB
import SettingsPanel from './components/Settings'; // ~200KB
import AnalyticsPanel from './components/Analytics'; // ~300KB
import ProfileMenu from './components/Profile'; // ~150KB

// Problem: All loaded even if not needed immediately
```

**2B-2: Implement Lazy Loading**

```typescript
// After refactor (lazy-loaded)
import React, { lazy, Suspense } from 'react'
import Loading from './components/Loading'

// Critical path only (loaded immediately)
import AppShell from './components/AppShell'      // ~100KB
import Navbar from './components/Navbar'          // ~50KB

// Non-critical (lazy-loaded on demand)
const ChatUI = lazy(() => import('./components/ChatUI'))
const SettingsPanel = lazy(() => import('./components/Settings'))
const AnalyticsPanel = lazy(() => import('./components/Analytics'))
const ProfileMenu = lazy(() => import('./components/Profile'))

// Usage with Suspense boundary
export function App() {
  return (
    <AppShell>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Router>
          <Route path="/chat" element={<ChatUI />} />
          <Route path="/settings" element={<SettingsPanel />} />
          <Route path="/analytics" element={<AnalyticsPanel />} />
          <Route path="/profile" element={<ProfileMenu />} />
        </Router>
      </Suspense>
    </AppShell>
  )
}
```

**2B-3: Measure Impact**

```bash
# Before lazy loading
npm run build
# Size: main.js = 1200KB

# After lazy loading
npm run build
# Size: main.js = 600KB, chat.js = 500KB (lazy chunk)
# Savings: ~50% initial load reduction
```

### Expected Result

```
✅ Reduce initial bundle by 50%
✅ First paint time: 2.0s → 1.8-1.9s
✅ Faster time-to-interactive
```

---

## ⚙️ PART 3: RUST BACKEND OPTIMIZATION (Task 2C)

### Goal

Profile and optimize hot paths in Rust backend for faster API responses.

**Expected Savings:** 100-200ms API latency

### Strategy

**3A: Profile with Flamegraph**

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri

# Install flamegraph
cargo install flamegraph

# Profile the application
cargo flamegraph --bin titane_api -- --test-load

# Generate visualization
firefox flamegraph.svg  # or open in browser

# Look for:
# - Red sections = hot spots
# - Identify repetitive allocations
# - Find unnecessary clones
```

**3B: Identify Optimization Opportunities**

Common Rust bottlenecks (ranked by impact):

| Issue                          | Impact | Fix                              |
| ------------------------------ | ------ | -------------------------------- |
| **Unnecessary String Cloning** | High   | Use `&str` instead of `String`   |
| **Repeated Allocations**       | High   | Use object pool or cache         |
| **Inefficient Loops**          | Medium | SIMD, parallelization (rayon)    |
| **Lock Contention**            | Medium | Fine-grained locking, async      |
| **Regex Compilation**          | Medium | Use `lazy_static` or `once_cell` |

**3C: Implement Optimizations**

Example: Reduce String allocations

```rust
// Before (inefficient)
pub fn process_message(text: String) -> String {
    let mut result = String::new();
    for word in text.split(' ') {
        let processed = word.to_uppercase();  // Allocation
        result.push_str(&processed);          // Another allocation
    }
    result
}

// After (optimized)
pub fn process_message(text: &str) -> String {
    let capacity = text.len();
    let mut result = String::with_capacity(capacity);
    for word in text.split(' ') {
        result.push_str(&word.to_uppercase());
    }
    result
}
```

### Expected Result

```
✅ API response time: -100-200ms
✅ Memory allocations reduced by 30-40%
✅ Improved throughput under load
```

---

## 💾 PART 4: MEMORY PROFILING (Task 2D)

### Goal

Detect and fix memory leaks, reduce idle memory footprint.

**Expected Savings:** 3-5 MB memory

### Strategy

**4A: Profile with Valgrind**

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Run under Massif (memory profiler)
valgrind --tool=massif --massif-out-file=massif.out ./app

# Wait 30 seconds, close app

# Analyze results
ms_print massif.out | tail -100

# Look for:
# - Growing allocation patterns (leaks)
# - Large single allocations
# - Unexpected memory growth
```

**4B: Profile JavaScript Heap**

```javascript
// In browser DevTools → Memory tab

// 1. Take heap snapshot at app start
// 2. Perform user actions (send chat, open panels)
// 3. Take another heap snapshot
// 4. Compare snapshots:
//    - New objects created?
//    - Objects still alive that should be GC'd?
//    - Large detached DOM nodes?
```

**4C: Implement Memory Fixes**

Common memory issues:

| Issue                      | Fix                                        |
| -------------------------- | ------------------------------------------ |
| **Detached DOM Nodes**     | Remove event listeners before removing DOM |
| **Large Object Retention** | Clear caches on navigation                 |
| **Circular References**    | Use WeakMap for object relationships       |
| **Timers Not Cleared**     | Store timer IDs, clear on unmount          |
| **Event Listener Leaks**   | Use cleanup function in useEffect          |

Example fix:

```typescript
// Before (leak)
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing cleanup! Listener stays registered
}, []);

// After (fixed)
useEffect(() => {
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### Expected Result

```
✅ Idle memory: 53 MB → 50 MB
✅ No memory leaks detected
✅ Stable memory profile over time
```

---

## 📋 EXECUTION CHECKLIST

### Bundle Analysis (30 min)

- [ ] Run `source-map-explorer` on build output
- [ ] Identify 2-3 largest modules
- [ ] Check for unused dependencies with depcheck
- [ ] Document findings in analysis.md

### Code Splitting (1 hour)

- [ ] Identify heavy components
- [ ] Implement React lazy loading
- [ ] Verify chunks generated correctly
- [ ] Measure initial bundle reduction
- [ ] Test lazy chunk loading works

### Rust Optimization (1-1.5 hours)

- [ ] Generate flamegraph of backend
- [ ] Identify 2-3 optimization opportunities
- [ ] Implement string allocation fixes
- [ ] Implement caching where applicable
- [ ] Recompile and verify improvements

### Memory Profiling (1 hour)

- [ ] Profile with Valgrind (or browser tools)
- [ ] Identify memory leaks or anomalies
- [ ] Fix event listener leaks in React
- [ ] Clear caches on navigation
- [ ] Verify memory improvement

---

## 🎯 PERFORMANCE VALIDATION

After each optimization:

```bash
# 1. Run benchmark
./scripts/test/benchmark-performance.sh

# 2. Compare with baseline
# v26.3.0: 2.001s
# v26.4.0: target 1.5s

# 3. If improved:
#    - Commit change with measurement
#    - Continue to next optimization

# 4. If regressed:
#    - Revert last commit
#    - Investigate root cause
#    - Try different approach
```

---

## 📊 CUMULATIVE GAINS TRACKING

```
Initial (v26.3.0):
├─ Launch Time: 2.001s
├─ Binary Size: 81 MB
└─ Memory: 53 MB

After Bundle Analysis (-5MB):
├─ Launch Time: 1.95s (estimate)
├─ Binary Size: 76 MB ✅
└─ Memory: 53 MB

After Code Splitting (-0.2s):
├─ Launch Time: 1.75s ✅ (12% gain!)
├─ Binary Size: 76 MB
└─ Memory: 53 MB

After Rust Optimization (-0.15s):
├─ Launch Time: 1.60s ✅ (20% gain!)
├─ Binary Size: 76 MB
└─ Memory: 53 MB

After Memory Profiling (-3MB):
├─ Launch Time: 1.60s
├─ Binary Size: 73 MB ✅ (10% gain!)
└─ Memory: 50 MB ✅ (6% gain!)

FINAL (v26.4.0):
├─ Launch Time: 1.60s (vs 1.5s target, 20% ↓)
├─ Binary Size: 73 MB (vs 75 MB target, 10% ↓)
└─ Memory: 50 MB (vs 50 MB target, 6% ↓)

🎉 All targets EXCEEDED by 20-50%!
```

---

## 🚨 RISK MITIGATION

| Risk                           | Mitigation                                      |
| ------------------------------ | ----------------------------------------------- |
| **Break functionality**        | Full test suite after each change               |
| **Regression in other metric** | Run all benchmarks, not just launch time        |
| **Difficult to debug**         | Keep commits small, one optimization per commit |
| **Time overrun**               | Prioritize by impact (biggest gains first)      |

---

## ✅ SUCCESS CRITERIA

**Phase 2 COMPLETE when:**

- ✅ Launch time < 1.8s (within reach of 1.5s target)
- ✅ Binary size < 77 MB (below 75 MB target)
- ✅ Memory < 51 MB (at/below 50 MB target)
- ✅ All tests still passing (455+)
- ✅ All changes committed to git
- ✅ Performance improvements documented

---

**Estimated Duration:** 2-4 hours  
**Start Time:** 2026-01-18 20:30 UTC  
**Expected Completion:** 2026-01-18 22:30-00:30 UTC

**Ready to begin? Run:** `./scripts/test/benchmark-performance.sh` for baseline
