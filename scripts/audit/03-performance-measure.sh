#!/bin/bash

# ⚡ TITANE∞ Performance Measurement - Baseline Metrics
# Duration: 5-10 minutes (no production build by policy)
# Output: reports/performance-YYYYMMDD-HHMMSS/

set -e

# Initialize numeric metrics to safe defaults
BUILD_TIME=0
DIST_SIZE=0
NODE_MODULES_SIZE=0
IPC_COMMANDS=0
IPC_CALLS=0
DYNAMIC_IMPORTS=0
LAZY_COMPONENTS=0
IMAGE_COUNT=0
WILDCARD_IMPORTS=0
DEEP_IMPORTS=0

# Repo policy: production build is forbidden (dev-only). Do not penalize missing build/dist.
BUILD_FORBIDDEN_BY_POLICY=1

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="reports/performance-$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "⚡ TITANE∞ Performance Measurement - $TIMESTAMP"
echo "================================================"

# 1. Build Time Measurement
echo ""
echo "🏗️ [1/8] Measuring build time..."
echo "   └─ Production build is forbidden by repo policy (dev-mode only)."
{
    echo "Build step not executed."
    echo "Reason: Repo policy forbids production builds (pnpm run build / tauri build)."
} > "$REPORT_DIR/build-output.txt"
BUILD_TIME=0

echo "   ✅ Step completed (no build)"

# 2. Bundle Size Analysis
echo ""
echo "📦 [2/8] Analyzing bundle size..."
if [ -d "dist" ]; then
    {
        echo "=== Main Bundle ==="
        du -h dist/index.html 2>/dev/null || echo "Not found"
        echo ""
        echo "=== JavaScript Bundles ==="
        find dist/assets -name "*.js" -exec du -h {} \; 2>/dev/null | sort -hr | head -20
        echo ""
        echo "=== CSS Bundles ==="
        find dist/assets -name "*.css" -exec du -h {} \; 2>/dev/null | sort -hr | head -10
        echo ""
        echo "=== Total Dist Size ==="
        du -sh dist/
    } > "$REPORT_DIR/bundle-size.txt"
    
    DIST_SIZE=$(du -sm dist/ | cut -f1)
    echo "   └─ Total bundle size: ${DIST_SIZE}MB"
else
    echo "   ⚠️ dist/ not found - build may have failed"
    echo "dist/ not found" > "$REPORT_DIR/bundle-size.txt"
    DIST_SIZE=0
fi

# 3. Dependency Size
echo ""
echo "📚 [3/8] Analyzing dependency sizes..."
if command -v pnpm &> /dev/null; then
    pnpm list --depth=0 --json > "$REPORT_DIR/dependencies.json" 2>/dev/null || true
    
    {
        echo "=== Direct Dependencies ==="
        jq -r '.dependencies | to_entries | .[] | "\(.key): \(.value.version)"' "$REPORT_DIR/dependencies.json" 2>/dev/null || pnpm list --depth=0
        echo ""
        echo "=== Heavy Dependencies (>1MB) ==="
        du -sh node_modules/* 2>/dev/null | grep -E "[0-9]+M" | sort -hr | head -20 || echo "None found"
    } > "$REPORT_DIR/dependency-sizes.txt"
    
    NODE_MODULES_SIZE=$(du -sm node_modules/ 2>/dev/null | cut -f1 || echo "0")
    echo "   └─ node_modules size: ${NODE_MODULES_SIZE}MB"
else
    echo "   ⚠️ pnpm not found"
fi

# 4. Memory Usage Estimate
echo ""
echo "💾 [4/8] Estimating runtime memory..."
{
    echo "=== Runtime Memory Estimate ==="
    echo "Based on bundle size and typical Tauri overhead"
    echo ""
    if [ "$DIST_SIZE" -gt 0 ]; then
        ESTIMATED_MEMORY=$((DIST_SIZE * 3 + 50))
        echo "Base app: ~${DIST_SIZE}MB (loaded assets)"
        echo "Tauri runtime: ~50MB"
        echo "JavaScript heap: ~$((DIST_SIZE * 2))MB"
        echo ""
        echo "ESTIMATED TOTAL: ~${ESTIMATED_MEMORY}MB"
    else
        echo "Cannot estimate - build required"
    fi
    echo ""
    echo "=== Memory Recommendations ==="
    echo "- Minimum: 2GB RAM"
    echo "- Recommended: 4GB RAM"
    echo "- Optimal: 8GB+ RAM"
} > "$REPORT_DIR/memory-estimate.txt"

echo "   └─ Memory estimate generated"

# 5. IPC Performance
echo ""
echo "🔌 [5/8] Checking IPC patterns..."
{
    echo "=== Tauri Commands (IPC Endpoints) ==="
    grep -r "#\[tauri::command\]" src-tauri/src/ -A 2 | grep "^pub fn" | wc -l || echo "0"
    echo ""
    echo "=== Command Definitions ==="
    grep -r "#\[tauri::command\]" src-tauri/src/ -A 2 | grep "^pub fn" || echo "None found"
    echo ""
    echo "=== Frontend Invocations ==="
    grep -r "invoke(" src/ --include="*.ts" --include="*.tsx" | wc -l || echo "0"
    echo ""
    echo "=== Performance Considerations ==="
    echo "- Each invoke() has ~1-5ms overhead"
    echo "- Batch operations when possible"
    echo "- Use events for high-frequency updates"
} > "$REPORT_DIR/ipc-analysis.txt"

IPC_COMMANDS=$(grep -r "#\[tauri::command\]" src-tauri/src/ -A 2 | grep "^pub fn" | wc -l || echo "0")
IPC_CALLS=$(grep -r "invoke(" src/ --include="*.ts" --include="*.tsx" | wc -l || echo "0")
echo "   ├─ Tauri commands: $IPC_COMMANDS"
echo "   └─ Frontend calls: $IPC_CALLS"

# 6. Code Splitting Analysis
echo ""
echo "✂️ [6/8] Analyzing code splitting..."
{
    echo "=== Dynamic Imports ==="
    grep -r "import(" src/ --include="*.ts" --include="*.tsx" || echo "None found"
    echo ""
    echo "=== Lazy Components ==="
    grep -r "React.lazy" src/ --include="*.tsx" || echo "None found"
    echo ""
    echo "=== Route-based Splitting ==="
    grep -r "lazy.*import" src/ --include="*.tsx" || echo "None found"
} > "$REPORT_DIR/code-splitting.txt"

DYNAMIC_IMPORTS=$(grep -r "import(" src/ --include="*.ts" --include="*.tsx" | wc -l || echo "0")
LAZY_COMPONENTS=$(grep -r "React.lazy" src/ --include="*.tsx" | wc -l || echo "0")
echo "   ├─ Dynamic imports: $DYNAMIC_IMPORTS"
echo "   └─ Lazy components: $LAZY_COMPONENTS"

# 7. Asset Optimization
echo ""
echo "🖼️ [7/8] Checking asset optimization..."
{
    echo "=== Image Assets ==="
    find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" \) 2>/dev/null | while read img; do
        du -h "$img"
    done | sort -hr | head -20 || echo "No images found"
    echo ""
    echo "=== Large Assets (>100KB) ==="
    find src public -type f -size +100k 2>/dev/null | while read file; do
        du -h "$file"
    done || echo "None"
    echo ""
    echo "=== Recommendations ==="
    echo "- Compress images (WebP, AVIF)"
    echo "- Use SVG for icons"
    echo "- Lazy-load images"
    echo "- Consider CDN for large assets"
} > "$REPORT_DIR/asset-optimization.txt"

IMAGE_COUNT=$(find src public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" \) 2>/dev/null | wc -l || echo "0")
echo "   └─ Image assets: $IMAGE_COUNT"

# 8. Import Optimization Opportunities
echo ""
echo "📦 [8/8] Analyzing import optimization..."

# Some folders/files are excluded from TS compilation (see tsconfig.json exclude).
# Do not penalize import hygiene in code that is not part of the runtime surface.
WILDCARD_EXCLUDE_PATHS_RE='(src/modules/avatar/(camera|rendering|gesture|voice)/|src/modules/avatar/core/AudioVisualSyncEngine\.ts|src/modules/avatar/floating/(ThreeJSAvatarRenderer|appearanceFloatingIntegration)\.ts)'
{
    echo "=== Barrel Imports (potential tree-shaking issues) ==="
    grep -r "from.*index" src/ --include="*.ts" --include="*.tsx" | head -20 || echo "None"
    echo ""
    echo "=== Deep Imports ==="
    grep -r "from.*\.\./\.\./\.\." src/ --include="*.ts" --include="*.tsx" | head -20 || echo "None"
    echo ""
    echo "=== Wildcard Imports ==="
    grep -RInE '^[[:space:]]*import[[:space:]]+\*[[:space:]]+as[[:space:]]+' src/ \
        --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
        --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
        --include="*.ts" --include="*.tsx" \
        2>/dev/null | grep -vE "$WILDCARD_EXCLUDE_PATHS_RE" | head -20 || echo "None"
    echo ""
    echo "=== Optimization Opportunities ==="
    echo "1. Replace wildcard imports with named imports"
    echo "2. Use direct imports instead of barrel files"
    echo "3. Reduce import depth (max 3 levels)"
} > "$REPORT_DIR/import-optimization.txt"

# Exclude tests from import hygiene metrics (they should not affect runtime perf score).
WILDCARD_IMPORTS=$(grep -RInE '^[[:space:]]*import[[:space:]]+\*[[:space:]]+as[[:space:]]+' src/ \
    --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
    --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
    --exclude="*.d.ts" \
    --include="*.ts" --include="*.tsx" \
    2>/dev/null | grep -vE "$WILDCARD_EXCLUDE_PATHS_RE" | wc -l | xargs || echo "0")
DEEP_IMPORTS=$(grep -R "from.*\.\./\.\./\.\.\." src/ \
    --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
    --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
    --exclude="*.d.ts" \
    --include="*.ts" --include="*.tsx" \
    2>/dev/null | wc -l | xargs || echo "0")
echo "   ├─ Wildcard imports: $WILDCARD_IMPORTS"
echo "   └─ Deep imports: $DEEP_IMPORTS"

# Generate Summary
echo ""
echo "📊 Generating performance summary..."
cat > "$REPORT_DIR/PERFORMANCE_SUMMARY.md" << EOF
# ⚡ TITANE∞ Performance Report
**Date**: $(date)
**Build Time**: Not measured (production build forbidden by policy)

---

## 📊 Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Build Time | N/A | <60s | ℹ️ |
| Bundle Size | ${DIST_SIZE}MB | <10MB | $([ "$DIST_SIZE" -gt 0 ] && [ "$DIST_SIZE" -lt 10 ] && echo "✅" || echo "⚠️") |
| node_modules | ${NODE_MODULES_SIZE}MB | <500MB | $([ "$NODE_MODULES_SIZE" -lt 500 ] && echo "✅" || echo "⚠️") |
| IPC Commands | $IPC_COMMANDS | - | ℹ️ |
| IPC Calls | $IPC_CALLS | - | ℹ️ |
| Dynamic Imports | $DYNAMIC_IMPORTS | >10 | $([ "$DYNAMIC_IMPORTS" -gt 10 ] && echo "✅" || echo "⚠️") |
| Lazy Components | $LAZY_COMPONENTS | >5 | $([ "$LAZY_COMPONENTS" -gt 5 ] && echo "✅" || echo "⚠️") |
| Image Assets | $IMAGE_COUNT | - | ℹ️ |
| Wildcard Imports | $WILDCARD_IMPORTS | 0 | $([ "$WILDCARD_IMPORTS" -eq 0 ] && echo "✅" || echo "❌") |
| Deep Imports | $DEEP_IMPORTS | <10 | $([ "$DEEP_IMPORTS" -lt 10 ] && echo "✅" || echo "⚠️") |

---

## 🎯 Priority Optimizations

### P0 (Critical - Do First)
$([ "$DIST_SIZE" -eq 0 ] && echo "- ⚠️ **No bundle size baseline** - dist/ not present (build forbidden by policy)" || echo "- ✅ Bundle size baseline present")
$([ "$WILDCARD_IMPORTS" -gt 0 ] && echo "- ❌ **Replace wildcard imports** - $WILDCARD_IMPORTS found" || echo "- ✅ No wildcard imports")
$([ "$DYNAMIC_IMPORTS" -lt 10 ] && echo "- ⚠️ **Add code splitting** - Only $DYNAMIC_IMPORTS dynamic imports" || echo "- ✅ Code splitting present")

### P1 (High - This Week)
$([ "$DIST_SIZE" -gt 10 ] && echo "- ⚠️ **Reduce bundle size** - Currently ${DIST_SIZE}MB, target <10MB" || echo "- ✅ Bundle size acceptable")
$([ "$DEEP_IMPORTS" -gt 10 ] && echo "- ⚠️ **Fix deep imports** - $DEEP_IMPORTS found, refactor architecture" || echo "- ✅ Import depth OK")
- Implement lazy loading for heavy components
- Optimize image assets (WebP, compression)

### P2 (Medium - This Sprint)
- Add performance monitoring
- Implement bundle analyzer
- Setup lighthouse CI
- Add memory profiling

---

## 📁 Detailed Reports

- \`build-output.txt\` - Full build log
- \`bundle-size.txt\` - Bundle analysis
- \`dependency-sizes.txt\` - Dependency audit
- \`memory-estimate.txt\` - Runtime memory
- \`ipc-analysis.txt\` - IPC performance
- \`code-splitting.txt\` - Code splitting status
- \`asset-optimization.txt\` - Asset recommendations
- \`import-optimization.txt\` - Import patterns

---

## 🚀 Next Steps

1. Implement code splitting for routes
2. Replace wildcard imports
3. Add performance tests
4. Setup monitoring dashboard

---

## 📈 Tracking

Monitor these metrics weekly:
- Build time trend
- Bundle size evolution
- Memory usage in production
- IPC latency
- First contentful paint (FCP)
- Time to interactive (TTI)

**Target**: All metrics in green zone ✅
EOF

echo ""
echo "================================================"
echo "✅ Performance Measurement Complete!"
echo ""
echo "📊 Summary:"
echo "   ├─ Build Time: Not measured (policy)"
echo "   ├─ Bundle Size: ${DIST_SIZE}MB $([ "$DIST_SIZE" -lt 10 ] && echo "(✅)" || echo "(⚠️ >10MB)")"
echo "   ├─ Dependencies: ${NODE_MODULES_SIZE}MB"
echo "   ├─ IPC: $IPC_COMMANDS commands, $IPC_CALLS calls"
echo "   ├─ Code Splitting: $DYNAMIC_IMPORTS dynamic, $LAZY_COMPONENTS lazy"
echo "   └─ Imports: $WILDCARD_IMPORTS wildcard, $DEEP_IMPORTS deep"
echo ""
echo "📁 Full report: $REPORT_DIR/PERFORMANCE_SUMMARY.md"
echo ""

# Deterministic score (0-100)
PERF_SCORE=100

# Build metrics are unavailable by policy; do NOT penalize.
if [ "${BUILD_FORBIDDEN_BY_POLICY:-0}" -ne 1 ]; then
    PERF_SCORE=$((PERF_SCORE - 10))
fi

# Bundle size penalty
if [ "$DIST_SIZE" -gt 10 ]; then
    bs_penalty=$(((DIST_SIZE - 10) * 3))
    if [ "$bs_penalty" -gt 30 ]; then bs_penalty=30; fi
    PERF_SCORE=$((PERF_SCORE - bs_penalty))
fi

# If dist/ missing, we cannot assess bundle size; do NOT penalize when build is forbidden.
if [ "$DIST_SIZE" -eq 0 ] && [ "${BUILD_FORBIDDEN_BY_POLICY:-0}" -ne 1 ]; then
    PERF_SCORE=$((PERF_SCORE - 10))
fi

# Import hygiene penalties
if [ "${WILDCARD_IMPORTS:-0}" -gt 0 ]; then
    wi_penalty=$((WILDCARD_IMPORTS * 5))
    if [ "$wi_penalty" -gt 25 ]; then wi_penalty=25; fi
    PERF_SCORE=$((PERF_SCORE - wi_penalty))
fi

di_penalty=$(( (${DEEP_IMPORTS:-0}) * 1 ))
if [ "$di_penalty" -gt 15 ]; then di_penalty=15; fi
PERF_SCORE=$((PERF_SCORE - di_penalty))

# Code splitting: informative only (do not penalize; apps may intentionally avoid dynamic imports).

if [ "$PERF_SCORE" -lt 0 ]; then PERF_SCORE=0; fi
if [ "$PERF_SCORE" -gt 100 ]; then PERF_SCORE=100; fi

echo "Score: $PERF_SCORE"
