# 🔄 CIRCULAR DEPENDENCY ANALYSIS GUIDE
## Detection, Prevention, and Resolution Strategy

**Date**: 2026-01-10 18:00 EST
**Purpose**: Guide for detecting and resolving circular dependencies in TITANE∞
**Status**: Ready for execution after dependency installation

---

## 📊 EXECUTIVE SUMMARY

**What Are Circular Dependencies?**
When module A imports module B, and module B (directly or indirectly) imports module A, creating a cycle that can cause:
- Runtime errors (undefined exports)
- Initialization order issues
- Build/bundling problems
- Maintenance nightmares

**Why This Matters**:
- Can break lazy loading
- Increases bundle size
- Makes code harder to understand
- Can cause subtle runtime bugs

**Current Status**: Unknown (blocked on madge installation)

---

## 🔍 DETECTION TOOLS

### Primary Tool: madge

**Installation**:
```bash
npm install -D madge tsconfig-paths
# tsconfig-paths required for TypeScript path aliases (@/ imports)
```

**Basic Usage**:
```bash
# Check for circular dependencies
npx madge --circular src/

# With TypeScript support
npx madge --circular --ts-config tsconfig.json src/

# Generate visual graph
npx madge --circular --image graph.svg src/

# JSON output for automation
npx madge --circular --json src/
```

**Expected Output**:
```
✓ No circular dependencies found
```

Or if found:
```
✖ Found 3 circular dependencies!

1) src/hooks/useChat.ts > src/services/ai/chatEngine.ts > src/hooks/useChat.ts
2) src/modules/fusion/FusionEngine.ts > src/engines/autopoiesis/autopoiesisEngine.ts > src/modules/fusion/FusionEngine.ts
3) src/services/singularityBridge.ts > src/hooks/useSingularityState.ts > src/services/singularityBridge.ts
```

---

### Alternative Tool: dpdm

**Installation**:
```bash
npm install -D dpdm
```

**Usage**:
```bash
# Check circular dependencies
npx dpdm --circular src/index.tsx

# With details
npx dpdm --circular --tree src/**/*.ts src/**/*.tsx

# Specific module
npx dpdm --circular src/modules/devSudo/devSudoHandler.ts
```

**Advantages**:
- Faster than madge
- Better TypeScript support
- More detailed output
- Works without tsconfig-paths

---

## 🎯 HIGH-RISK AREAS TO CHECK

Based on codebase analysis, these areas are most likely to have circular dependencies:

### 1. Hooks ↔ Services Pattern ⚠️

**Pattern**: Hooks import services, services import hooks

**Example Risk**:
```typescript
// src/hooks/useChat.ts
import { chatEngine } from '@/services/ai/chatEngine';

// src/services/ai/chatEngine.ts
import { useMemory } from '@/hooks/useMemoryEngine'; // ❌ CIRCULAR
```

**Files to Check**:
- src/hooks/useChat.ts ↔ src/services/ai/chatEngine.ts
- src/hooks/useMemoryEngine.ts ↔ src/services/unified/UnifiedMemory.ts
- src/hooks/useSingularityState.ts ↔ src/services/singularityBridge.ts
- src/hooks/useAuraOrchestrator.ts ↔ src/services/orchestration/UnifiedOrchestrator.ts

**Detection Command**:
```bash
npx madge --circular src/hooks/ src/services/
```

---

### 2. Engine Interdependencies ⚠️

**Pattern**: Engines importing each other

**Example Risk**:
```typescript
// src/engines/fusion/FusionEngine.ts
import { autopoiesisEngine } from '@/engines/autopoiesis/autopoiesisEngine';

// src/engines/autopoiesis/autopoiesisEngine.ts
import { fusionEngine } from '@/engines/fusion/FusionEngine'; // ❌ CIRCULAR
```

**Files to Check**:
- src/engines/fusion/ ↔ src/engines/autopoiesis/
- src/engines/identity/ ↔ src/engines/metasingularity/
- src/engines/conscious/ ↔ src/engines/narrative/
- src/engines/time/ ↔ src/engines/agenda/

**Detection Command**:
```bash
npx madge --circular src/engines/
```

---

### 3. Singularity Bridge Network ⚠️

**Pattern**: Central orchestration importing everything

**Example Risk**:
```typescript
// src/services/singularityBridge.ts
import { useSingularityState } from '@/hooks/useSingularityState';

// src/hooks/useSingularityState.ts
import { singularityBridge } from '@/services/singularityBridge'; // ❌ CIRCULAR
```

**Files to Check**:
- src/services/singularityBridge.ts
- src/services/singularityBridgeVInfinity.ts
- src/hooks/useSingularityState.ts
- src/hooks/useSingularitySync.ts
- src/singularity_cortex/coherence_supervisor.rs (Tauri side)

**Detection Command**:
```bash
npx madge --circular src/services/singularity*.ts src/hooks/useSingularity*.ts
```

---

### 4. Barrel Export Files ⚠️

**Pattern**: index.ts re-exporting everything

**Example Risk**:
```typescript
// src/hooks/index.ts
export * from './useChat';
export * from './useMemory';
// ... 50+ exports

// Can create implicit circular dependencies if hooks import from barrel
```

**Files to Check**:
- src/hooks/index.ts (773 lines - HIGH RISK)
- src/engines/time/index.ts
- src/features/*/index.ts
- src/services/index.ts (if exists)

**Detection Command**:
```bash
npx madge --circular src/hooks/index.ts
npx madge --circular src/engines/time/index.ts
```

**Note**: Large barrel files should be split (see NEXT_STEPS_ROADMAP Priority 4)

---

### 5. DevSudo Modules ✅

**Status**: LOW RISK (recently refactored)

**Why Safe**:
- Unidirectional flow: Handler → Executor → Builtins
- No circular imports between modules
- Lazy loading prevents runtime issues

**Files to Verify**:
- src/modules/devSudo/devSudoHandler.ts
- src/modules/devSudo/devSudoExecutor.ts
- src/modules/devSudo/devSudoPatterns.ts
- src/modules/devSudo/devSudoBuiltins.ts

**Detection Command**:
```bash
npx madge --circular src/modules/devSudo/
```

**Expected**: ✅ No circular dependencies

---

## 📋 DETECTION CHECKLIST

### Step 1: Install Tools (5 min)
```bash
npm install -D madge tsconfig-paths dpdm
```

### Step 2: Run Global Check (5 min)
```bash
# Check entire codebase
npx madge --circular --ts-config tsconfig.json src/

# If errors, get detailed output
npx madge --circular --warning src/ > circular-deps-report.txt
```

### Step 3: Check High-Risk Areas (15 min)

**Hooks ↔ Services**:
```bash
npx madge --circular src/hooks/ src/services/ > hooks-services-check.txt
```

**Engine Interdependencies**:
```bash
npx madge --circular src/engines/ > engines-check.txt
```

**Singularity Bridge**:
```bash
npx madge --circular src/services/singularity*.ts src/hooks/useSingularity*.ts
```

**Barrel Exports**:
```bash
npx madge --circular src/hooks/index.ts
npx madge --circular src/engines/time/index.ts
```

**DevSudo Modules** (should be clean):
```bash
npx madge --circular src/modules/devSudo/
```

### Step 4: Generate Visual Graph (10 min)
```bash
# Create dependency graph image
npx madge --image dependency-graph.svg src/

# Create circular dependency graph (if any found)
npx madge --circular --image circular-graph.svg src/

# View in browser
xdg-open dependency-graph.svg
```

### Step 5: Document Findings (10 min)
- List all circular dependencies found
- Categorize by severity (critical/medium/low)
- Create resolution plan

---

## 🔧 RESOLUTION STRATEGIES

### Strategy 1: Dependency Inversion

**Problem**:
```typescript
// serviceA.ts
import { functionB } from './serviceB';

// serviceB.ts
import { functionA } from './serviceA'; // ❌ CIRCULAR
```

**Solution**: Extract shared code to separate module
```typescript
// shared.ts
export const sharedLogic = () => { ... };

// serviceA.ts
import { sharedLogic } from './shared';

// serviceB.ts
import { sharedLogic } from './shared'; // ✅ NO CIRCULAR
```

---

### Strategy 2: Interface Segregation

**Problem**:
```typescript
// chatEngine.ts
import { MemoryEngine } from './memoryEngine';

// memoryEngine.ts
import { ChatEngine } from './chatEngine'; // ❌ CIRCULAR
```

**Solution**: Use interfaces/types
```typescript
// types.ts
export interface IChatEngine {
  sendMessage(msg: string): Promise<Response>;
}

export interface IMemoryEngine {
  store(data: any): Promise<void>;
}

// chatEngine.ts
import type { IMemoryEngine } from './types';

// memoryEngine.ts
import type { IChatEngine } from './types'; // ✅ Type-only import
```

---

### Strategy 3: Lazy Loading / Dynamic Imports

**Problem**:
```typescript
// moduleA.ts
import { funcB } from './moduleB';

// moduleB.ts
import { funcA } from './moduleA'; // ❌ CIRCULAR
```

**Solution**: Use dynamic imports
```typescript
// moduleA.ts
export async function doSomething() {
  const { funcB } = await import('./moduleB'); // ✅ Lazy load
  return funcB();
}

// moduleB.ts
import { funcA } from './moduleA'; // ✅ One-way dependency
```

---

### Strategy 4: Event-Driven Communication

**Problem**:
```typescript
// componentA.ts
import { componentB } from './componentB';
componentB.notify('update');

// componentB.ts
import { componentA } from './componentA'; // ❌ CIRCULAR
componentA.notify('response');
```

**Solution**: Use event emitters
```typescript
// events.ts
export const eventBus = new EventEmitter();

// componentA.ts
import { eventBus } from './events';
eventBus.emit('update');
eventBus.on('response', handleResponse);

// componentB.ts
import { eventBus } from './events'; // ✅ Both depend on events, not each other
eventBus.on('update', handleUpdate);
eventBus.emit('response');
```

---

### Strategy 5: Barrel File Splitting

**Problem**:
```typescript
// hooks/index.ts (773 lines)
export * from './useChat';
export * from './useMemory';
// ... 50+ exports

// Causes implicit circulars when hooks import from barrel
```

**Solution**: Direct imports instead of barrel
```typescript
// Before (via barrel - can cause circulars)
import { useChat, useMemory } from '@/hooks';

// After (direct - prevents circulars)
import { useChat } from '@/hooks/useChat';
import { useMemory } from '@/hooks/useMemory';
```

**Long-term**: Split barrel file (see NEXT_STEPS_ROADMAP Priority 4)

---

## 📊 SEVERITY CLASSIFICATION

### Critical (Must Fix Immediately) 🔴
- Breaks build/runtime
- Causes undefined exports
- Prevents lazy loading
- Creates initialization deadlocks

**Example**: Core services importing each other synchronously

### Medium (Fix This Week) 🟡
- Increases bundle size
- Makes code harder to understand
- Potential future issues
- Non-critical paths

**Example**: Dev tools with circular dependencies

### Low (Fix When Refactoring) 🟢
- Type-only circular imports
- In deprecated/archived code
- Not in production code path
- Already mitigated by lazy loading

**Example**: Circular type imports (TypeScript erases these)

---

## 📝 DOCUMENTATION TEMPLATE

When circular dependencies are found, document them:

```markdown
## Circular Dependency Report

**Date**: 2026-01-10
**Tool**: madge v7.0.0
**Command**: npx madge --circular --ts-config tsconfig.json src/

### Summary
- Total circular dependencies found: X
- Critical: X
- Medium: X
- Low: X

### Detailed Findings

#### 1. [Critical] useChat ↔ chatEngine
**Path**:
src/hooks/useChat.ts → src/services/ai/chatEngine.ts → src/hooks/useChat.ts

**Why It Happens**:
- useChat imports chatEngine for message sending
- chatEngine imports useChat for state updates

**Impact**:
- Can cause undefined exports at runtime
- Breaks lazy loading optimization

**Resolution**:
- Extract shared types to types.ts
- Use event emitter for state updates
- Estimated effort: 2 hours

**Priority**: 🔴 Critical (fix today)

---

#### 2. [Medium] FusionEngine ↔ AutopoiesisEngine
...
```

---

## 🎯 EXPECTED RESULTS

### Best Case (Ideal) ✅
```bash
npx madge --circular src/
```
```
✓ No circular dependencies found!
```

### Realistic Case (Common) ⚠️
```
Found 5-10 circular dependencies:
- 1-2 Critical (hooks ↔ services)
- 3-5 Medium (engine interdependencies)
- 2-3 Low (type-only imports)
```

**Action**: Prioritize and fix critical ones first

### Worst Case (Needs Work) ❌
```
Found 20+ circular dependencies across multiple domains
```

**Action**:
1. Fix critical runtime issues immediately
2. Create refactoring plan for medium issues
3. Document low-priority issues for later

---

## 📋 EXECUTION PLAN

### Immediate (After Dependency Installation)

**1. Initial Scan** (10 min)
```bash
npm install -D madge tsconfig-paths dpdm
npx madge --circular --ts-config tsconfig.json src/ | tee circular-deps.txt
```

**2. Analyze Results** (15 min)
- Count total circular dependencies
- Classify by severity (critical/medium/low)
- Identify patterns (hooks↔services, engines, etc.)

**3. Document Findings** (15 min)
- Create circular-deps-report.md
- List all circulars with file paths
- Prioritize resolution order

### This Week

**4. Fix Critical Issues** (4-6h)
- Focus on hooks ↔ services circulars
- Use dependency inversion pattern
- Extract shared types/interfaces
- Verify fixes with madge

**5. Create Prevention Guidelines** (1h)
- Add to developer documentation
- Create ESLint rules if possible
- Set up CI check for new circulars

### This Month

**6. Fix Medium Issues** (6-8h)
- Refactor engine interdependencies
- Split large barrel files
- Implement event-driven patterns

**7. Set Up Monitoring** (2h)
- Add madge to CI pipeline
- Fail builds on new circulars
- Generate dependency graphs regularly

---

## 🔗 RELATED DOCUMENTATION

**Technical References**:
- [NEXT_STEPS_ROADMAP_2026-01-10.md](NEXT_STEPS_ROADMAP_2026-01-10.md) - Priority 2: Circular Dependencies Audit
- [PHASE2_DAY2_PROGRESS_2026-01-10.md](PHASE2_DAY2_PROGRESS_2026-01-10.md) - Testing preparation

**Optimization Related**:
- [BUNDLE_OPTIMIZATION_ANALYSIS_2026-01-10.md](BUNDLE_OPTIMIZATION_ANALYSIS_2026-01-10.md) - Bundle splitting can help resolve circulars

**Architecture**:
- [PHASE2_DAY1_COMPLETE_2026-01-10.md](PHASE2_DAY1_COMPLETE_2026-01-10.md) - devSudo refactoring (circular-free example)

---

## ✅ SUCCESS CRITERIA

**Immediate Success**:
- [ ] Madge installed and working
- [ ] Full scan completed (< 10 minutes)
- [ ] Results documented
- [ ] Severity classification done

**Short-Term Success** (This Week):
- [ ] All critical circulars resolved
- [ ] No new circulars introduced
- [ ] Prevention guidelines documented

**Long-Term Success** (This Month):
- [ ] Zero critical circulars
- [ ] < 5 medium circulars (acceptable in large codebase)
- [ ] CI/CD checks in place
- [ ] Dependency graph visualization available

**Final Goal**:
```bash
npx madge --circular src/
✓ No circular dependencies found!
```

---

## 🚀 QUICK START

**After authentication and dependency installation**:

```bash
# 1. Install tools
npm install -D madge tsconfig-paths dpdm

# 2. Run scan
npx madge --circular --ts-config tsconfig.json src/ | tee circular-deps-report.txt

# 3. Check high-risk areas
npx madge --circular src/hooks/ src/services/

# 4. Generate graph
npx madge --image dependency-graph.svg src/

# 5. Review results
cat circular-deps-report.txt
xdg-open dependency-graph.svg
```

**Then**: Follow resolution strategies based on findings

---

**Prepared by**: Claude Sonnet 4.5
**Date**: 2026-01-10 18:00 EST
**Purpose**: Circular dependency detection and resolution guide
**Status**: Ready for execution (blocked on npm authentication)
**Next**: Install madge → Run scan → Document findings → Fix criticals

---

*This guide provides complete strategy for circular dependency management in TITANE∞*
