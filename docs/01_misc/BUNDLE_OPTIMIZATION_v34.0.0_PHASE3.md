# v34.0.0 Phase 3: Quick Wins + AI Provider Splitting

**Initiative**: Implement high-impact, low-risk optimizations  
**Target**: -8-12% bundle size reduction  
**Effort**: 2-3 hours  
**Status**: 🔄 Planning

---

## Quick Wins (30-45 min, -3-5% impact)

### 3.1 Three.js Lazy Loader Migration

**Current State**:

- 4 files still with eager imports despite `ThreeJSLazyLoader` existing
- Files: `AudioVisualSyncEngine.ts`, `VoiceReactionSystem.ts`, `BodyGestureFluidityEngine.ts`, `PBRMaterialSystem.ts`

**Action**: Replace eager `import * as THREE from 'three'` with dynamic loading

**Pattern**:

```typescript
// Before: Eager (blocks module load)
import * as THREE from 'three';

// After: Lazy (async initialization)
import { loadThreeJS } from './ThreeJSLazyLoader';

// In initialization code:
const THREE = await loadThreeJS();
```

**Complexity**: Medium (requires async/await conversion at initialization point)  
**Impact**: -2-3% bundle size (Three.js won't load until avatar module activated)  
**Risk**: Low (ThreeJSLazyLoader tested pattern exists)

**Files to Update**:

1. `src/modules/avatar/core/AudioVisualSyncEngine.ts` (line 5)
2. `src/modules/avatar/voice/VoiceReactionSystem.ts` (check imports)
3. `src/modules/avatar/gesture/BodyGestureFluidityEngine.ts` (check imports)
4. `src/modules/avatar/rendering/PBRMaterialSystem.ts` (check imports)

---

### 3.2 Vendor Utils Tree-Shaking Verification

**Current State**:

- `vendor-utils` (308K) - Generic utilities bundle
- May contain unused exports preventing tree-shaking

**Action**:

1. Audit what's exported from vendor-utils module
2. Check unused exports with `eslint-plugin-unused-imports`
3. Enable stricter tree-shaking in rollup config

**Command**:

```bash
# Find vendor-utils index
find src -name "*vendor*" -o -name "*utils*" | grep -i index

# Check all exports
grep -r "export.*" src/utils/ --include="*.ts" | wc -l
```

**Potential Gains**: -1-2% (if 20-30% of exports unused)  
**Risk**: Low (only removes unused code)

---

## Medium Effort (1-2 hours, -5-8% impact)

### 3.3 AI Service Provider Splitting

**Current State**:

- `service-ai` bundle (232K) - Monolithic AI service layer
- Loads OpenAI/Anthropic/GitHub clients eagerly

**Action**: Create provider-specific modules for lazy-loading

**New Structure**:

```
src/services/ai/
  ├── base/ (core, 10K)
  │   └── AIServiceBase.ts
  ├── providers/
  │   ├── openai/ (OpenAI client, 80K) - LAZY LOAD
  │   ├── anthropic/ (Anthropic client, 60K) - LAZY LOAD
  │   └── github/ (GitHub models, 40K) - LAZY LOAD
  ├── unified/
  │   └── UnifiedAIService.ts (orchestrator, 20K)
  └── index.ts (factory with dynamic imports)
```

**Implementation**:

```typescript
// Before: All providers imported eagerly
import OpenAIService from './providers/openai';
import AnthropicService from './providers/anthropic';

// After: Dynamic import based on config
async function getAIProvider(type: 'openai' | 'anthropic' | 'github') {
  switch (type) {
    case 'openai':
      return (await import('./providers/openai')).default;
    case 'anthropic':
      return (await import('./providers/anthropic')).default;
    case 'github':
      return (await import('./providers/github')).default;
  }
}
```

**Impact**: -5-8% (192K - 200K saved if providers split)  
**Risk**: Medium (requires factory refactoring, API compatibility)  
**Test**: Smoke test each provider initialization

---

### 3.4 ONNX Runtime Lazy-Loading

**Current State**:

- `onnxruntime` (536K) - Largest single dependency
- Possibly loaded eagerly if AI models initialized early

**Action**: Check current usage, consider lazy-loading for on-demand model inference

**Investigation**:

```bash
# Find onnxruntime imports
grep -r "onnxruntime" src/ --include="*.ts" --include="*.tsx"

# Check if imported eagerly or dynamically
grep -r "import.*onnxruntime" src/ --include="*.ts"
```

**Expected Finding**: Likely dynamic import already (via @xenova/transformers)  
**If Eager**: Move to dynamic import in AI provider init  
**Impact**: Potential -3-5% if refactored  
**Risk**: Low (if already dynamic)

---

## Implementation Roadmap

### Step 1: Three.js Lazy Loader Migration (20 min)

- [ ] Audit current Three.js usage in 4 avatar files
- [ ] Convert imports to `loadThreeJS()` pattern
- [ ] Test avatar initialization
- [ ] Commit: "perf(avatar): Three.js lazy-loading via ThreeJSLazyLoader"

### Step 2: Vendor Utils Audit (15 min)

- [ ] Map all exports in utils modules
- [ ] Run tree-shaking analysis
- [ ] Identify unused exports
- [ ] If >20% unused: Enable stricter config, remove, commit
- [ ] Commit: "perf(build): vendor-utils tree-shaking optimization"

### Step 3: AI Provider Splitting (1-2 hours)

- [ ] Extract provider modules (openai, anthropic, github)
- [ ] Implement factory with dynamic imports
- [ ] Update service initialization
- [ ] Test each provider separately
- [ ] Measure bundle size reduction
- [ ] Commit: "perf(ai): split AI providers for lazy-loading (v34.0.0 Phase 3)"

### Step 4: ONNX Runtime Check (15 min)

- [ ] Verify current loading strategy
- [ ] If eager: Move to dynamic import
- [ ] Verify @xenova/transformers already handles this
- [ ] Commit: "perf(ai): verify onnxruntime lazy-loading (v34.0.0 Phase 3)"

---

## Success Metrics

| Target     | Current         | After Phase 3           | Gain   |
| ---------- | --------------- | ----------------------- | ------ |
| Total JS   | 4.04 MB         | ~3.6-3.8 MB             | -8-12% |
| Main chunk | ~300K           | ~290K                   | -3-5%  |
| service-ai | 232K            | ~150K (split)           | -35%   |
| Three.js   | ~38MB (dynamic) | Loaded only when needed | ✅     |

**Cumulative v27-v34 Achievement**:

- v30.0.0: -58% component rerenders
- v33.0.0: -80% computation overhead
- v34.0.0 Phase 3: -8-12% bundle size
- **Total Stack**: ~85-90% performance improvement across metrics

---

## Rollback Plan

Each optimization commits independently:

1. Three.js migration: Can revert to eager imports if issues
2. Tree-shaking: No code changes, only config (safe)
3. AI provider split: New modules created, old service still works
4. ONNX: Verification only, no changes if already dynamic

---

**Ready to Begin**: Phase 3 implementation  
**Next Action**: Start with Three.js migration (quickest win)  
**Expected Time**: 2-3 hours for full Phase 3  
**Smoke Test**: Build + load avatar features after each step
