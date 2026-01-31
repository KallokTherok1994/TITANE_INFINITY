# TITANE∞ v34.0.0 — Bundle Optimization Strategy

**Initiative**: Reduce production bundle size through dependency analysis, code splitting, and Tauri-specific optimizations  
**Started**: 2026-01-30  
**Status**: 🔄 Planning Phase  
**Target**: -15-20% bundle size reduction

---

## 🎯 OBJECTIVES

### Primary Goals
1. **Dependency Audit**: Identify heavy/unused dependencies for removal or replacement
2. **Code Splitting**: Implement dynamic imports for large modules (AI providers, markdown, etc.)
3. **Tauri Bundle**: Optimize production build configuration
4. **Tree Shaking**: Ensure proper dead code elimination

### Success Metrics
- Bundle size reduction: Target -15-20% (baseline: TBD after analysis)
- First Load JS: Reduce critical path payload
- Build time: Maintain or improve current build performance
- Runtime behavior: Zero regressions in functionality

---

## 📋 PHASE 1: DEPENDENCY ANALYSIS

### 1.1 Identify Heavy Dependencies

**Action Items**:
- [ ] Run `pnpm list --depth=0` to inventory direct dependencies
- [ ] Use `vite-bundle-visualizer` or similar to map bundle composition
- [ ] Identify top 10 heaviest dependencies by size
- [ ] Check for duplicate dependencies (different versions)
- [ ] Scan for unused dependencies (no imports in codebase)

**Tools**:
```bash
# Install bundle analyzer
pnpm add -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true })
  ]
});

# Build and analyze
pnpm run build
```

### 1.2 Candidate Dependencies for Review

**Potential Targets** (based on typical React/Tauri stacks):
- **Markdown/Syntax**: `react-markdown`, `remark-*`, `rehype-*` plugins
- **Icons**: `lucide-react` or similar (check if all icons used)
- **Date/Time**: `date-fns` (can we use native Intl?)
- **Utilities**: `lodash` (replace with native JS or lightweight alternatives)
- **Charts/Viz**: If present, check tree-shaking effectiveness

**Analysis Pattern**:
```typescript
// For each heavy dependency:
// 1. Measure size contribution
// 2. Check usage frequency (grep workspace)
// 3. Evaluate alternatives (lighter libs, native APIs)
// 4. Assess removal risk (breaking changes?)
```

---

## 📋 PHASE 2: CODE SPLITTING STRATEGY

### 2.1 Dynamic Import Candidates

**High-Value Targets**:
1. **AI Provider Modules**: OpenAI, Anthropic, GitHub models (load on-demand)
2. **Markdown Renderer**: Lazy-load markdown parsing/rendering
3. **Settings Pages**: Non-critical UI loaded via React.lazy()
4. **Large Utilities**: Heavy computation modules (encryption, compression)

**Implementation Pattern**:
```typescript
// Before: Eager import
import { OpenAIClient } from '@/services/ai/openai';

// After: Dynamic import
const openaiModule = await import('@/services/ai/openai');
const client = new openaiModule.OpenAIClient();

// React components: Use React.lazy()
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
```

### 2.2 Route-Based Code Splitting

**Current Routes** (to audit):
- `/` — Dashboard (critical path, keep eager)
- `/chat` — Chat IA (critical, but AI providers can be lazy)
- `/memory` — Memory viewer (candidate for lazy)
- `/settings` — Settings (strong candidate for lazy)
- `/parametres` — Paramètres (strong candidate for lazy)

**Pattern**:
```typescript
// In router configuration
const routes = [
  { path: '/', component: Dashboard }, // Eager
  { path: '/chat', component: ChatPage }, // Eager
  { path: '/memory', component: React.lazy(() => import('@/pages/MemoryPage')) },
  { path: '/settings', component: React.lazy(() => import('@/pages/SettingsPage')) },
];
```

---

## 📋 PHASE 3: TAURI-SPECIFIC OPTIMIZATIONS

### 3.1 Build Configuration Review

**Check Points**:
- [ ] Review `src-tauri/Cargo.toml` dependencies (strip unused features)
- [ ] Verify `tauri.conf.json` bundle settings (compression, minification)
- [ ] Ensure production mode strips debug symbols
- [ ] Check for unused Tauri APIs (permissions, capabilities)

**tauri.conf.json Optimizations**:
```json
{
  "build": {
    "beforeBuildCommand": "pnpm run build",
    "distDir": "../dist",
    "withGlobalTauri": false // Ensure false for production
  },
  "bundle": {
    "active": true,
    "targets": ["appimage", "deb"],
    "resources": [] // Minimize embedded resources
  }
}
```

### 3.2 Rust Dependencies Audit

**Action Items**:
- [ ] Run `cargo tree` to visualize Rust dependency graph
- [ ] Check for duplicate crates (different versions)
- [ ] Verify `default-features = false` for heavy crates
- [ ] Consider `lto = true` and `codegen-units = 1` for release

**Cargo.toml Optimization**:
```toml
[profile.release]
lto = true              # Link-time optimization
codegen-units = 1       # Single codegen unit (slower build, smaller binary)
opt-level = "z"         # Optimize for size (or "s")
strip = true            # Strip debug symbols
panic = "abort"         # Smaller panic handler
```

---

## 📋 PHASE 4: TREE SHAKING & DEAD CODE

### 4.1 Verify Tree Shaking Configuration

**Vite Config Check**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendors for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
        },
      },
    },
    minify: 'terser', // or 'esbuild' (faster)
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
```

### 4.2 Identify Unused Code

**Tools & Techniques**:
- [ ] Run `tsc --noEmit` to catch unused imports
- [ ] Use ESLint rule: `no-unused-vars`
- [ ] Grep for unused exports: `grep -r "export.*function" src/ | ...`
- [ ] Check for commented-out code blocks

---

## 📊 BASELINE METRICS (Collected 2026-01-30)

### Current Bundle Size
```bash
# Production build completed successfully
pnpm run build
du -h dist/assets/*.js | sort -h
```

**Baseline Measurements**:
```
Top 15 JS Bundles (largest first):
react-vendor:      812K  (React + React DOM + Router)
onnxruntime:       536K  (ONNX Runtime Web - AI inference)
vendor-utils:      308K  (Utility libraries)
service-ai:        232K  (AI service layer)
ui-common:         196K  (Common UI components)
charts:            196K  (Chart.js + Recharts)
ai-transformers:   192K  (@xenova/transformers)
services-common:   152K  (Common services)
devSudoIntegration: 136K  (Dev integration)
ui-chat:            92K  (Chat UI)
service-audio:      80K  (Audio services)
service-cognitive:  68K  (Cognitive services)
validation:         64K  (Zod validation)
TitanePage:         52K  (Main page)

Total JS: 4140K (4.04 MB uncompressed)
Total Assets (CSS+JS+fonts): 7.1M
Bundle Analyzer: dist/stats.html (2.2M visualization)

Gzipped Sizes (top 5):
react-vendor:     239.51kb gzip / 201.32kb brotli
onnxruntime:      126.79kb gzip / 99.78kb brotli
vendor-utils:     100.74kb gzip / 88.29kb brotli
service-ai:        70.66kb gzip / 60.56kb brotli
charts:            65.38kb gzip / 56.59kb brotli
```

### Current Dependencies Count
```bash
pnpm list --depth=0 | wc -l
# Direct dependencies: 42 production packages
# Dev dependencies: 95 packages
# Total: 137 direct dependencies
```

### Key Heavy Dependencies Identified
1. **@xenova/transformers** (191.72kb) - AI model loading
2. **chart.js** + **recharts** (194.64kb combined) - Charting
3. **onnxruntime-web** (532.52kb) - Neural network inference
4. **react-markdown** + **remark-gfm** - Markdown rendering
5. **three** (packaged separately) - 3D graphics
6. **framer-motion** - Animation library
7. **react-chrono** + **react-d3-tree** - Timeline/tree visualizations

---

## 🚀 IMPLEMENTATION PLAN

### Step 1: Baseline Analysis (15-20 min)
1. Build production bundle
2. Measure sizes (JS, CSS, assets)
3. Run bundle visualizer
4. Document top 10 heaviest dependencies

### Step 2: Quick Wins (30-45 min)
1. Remove unused dependencies (if any found)
2. Replace heavy libs with lighter alternatives (case-by-case)
3. Enable console stripping in production
4. Verify tree-shaking config

### Step 3: Code Splitting (45-60 min)
1. Implement lazy loading for non-critical routes
2. Dynamic import AI provider modules
3. Lazy-load markdown renderer
4. Add Suspense boundaries with fallback UI

### Step 4: Tauri Optimization (30-45 min)
1. Review Cargo.toml (features, profile.release)
2. Audit tauri.conf.json bundle settings
3. Test build with optimizations enabled
4. Measure binary size (AppImage, DEB)

### Step 5: Validation (20-30 min)
1. Rebuild production bundle
2. Compare metrics (before vs after)
3. Test critical paths (smoke test AppImage)
4. Document results

**Total Estimated Time**: 2.5-3.5 hours

---

## 🔧 IMPLEMENTATION NOTES

### Critical Safety Rules
- **NO breaking changes**: All optimizations must preserve functionality
- **Test after each phase**: Smoke test AppImage between major changes
- **Commit incrementally**: One optimization category per commit
- **Measure impact**: Document size reduction for each change

### Risk Assessment
- **Low Risk**: Unused dependency removal, console stripping, terser config
- **Medium Risk**: Code splitting (requires Suspense boundaries)
- **High Risk**: Dependency replacement (API changes, behavior differences)

---

## ✅ NEXT ACTIONS

1. **Start Phase 1**: Run bundle analyzer to establish baseline
2. **Identify targets**: List top 10 heaviest dependencies
3. **Quick audit**: Check for obvious unused dependencies
4. **Create TODO list**: Prioritize optimizations by impact/risk ratio

---

## 📋 PHASE 1 COMPLETE: BASELINE ESTABLISHED ✅

**Status**: Baseline metrics collected (2026-01-30)

### Fixes Applied
1. **vite.config.ts**: Enabled `rollup-plugin-visualizer` with gzip/brotli analysis
2. **AuraControlPanel.tsx**: Fixed duplicate arrow function syntax (build error)
3. **SingularityState.selectors.ts**: Fixed import name (`useSingularityStore` → `useSingularityState`)

### Build Results
- ✅ Production build: **SUCCESS**
- ✅ Bundle analyzer: Generated `dist/stats.html` (2.2MB visualization)
- ✅ Total JS: **4.04 MB** uncompressed (gzipped to ~1.2MB estimated)
- ✅ Brotli compression: Active (~15% better than gzip)

### Analysis Complete
**Bundle Visualizer**: Open `dist/stats.html` to explore dependency tree interactively

**Top Optimization Targets** (Phase 2 candidates):
1. **onnxruntime-web** (536K) - Consider lazy loading for AI features
2. **@xenova/transformers** (192K) - Dynamic import when AI models needed
3. **charts** (196K) - Lazy load chart libraries per-route
4. **react-markdown** - Lazy load markdown renderer
5. **react-chrono** + **react-d3-tree** - Lazy load visualization libs

---

**Ready for Phase 2**: Code splitting implementation  
**Estimated Impact**: 15-20% bundle size reduction (lazy-loading heavy modules)  
**Risk Level**: Low (dynamic imports with Suspense boundaries)

---
