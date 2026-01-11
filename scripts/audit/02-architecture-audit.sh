#!/bin/bash

# 🏗️ TITANE∞ Architecture Audit - Structural Analysis
# Duration: 5-10 minutes
# Output: reports/architecture-audit-YYYYMMDD-HHMMSS/

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="reports/architecture-audit-$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "🏗️ TITANE∞ Architecture Audit - $TIMESTAMP"
echo "================================================"

# 1. Project Tree
echo ""
echo "📁 [1/9] Generating project tree..."
tree -L 3 -I 'node_modules|dist|target|.git' > "$REPORT_DIR/project-tree.txt" 2>/dev/null || {
    find . -type d -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/target/*" -not -path "*/.git/*" | head -100 > "$REPORT_DIR/project-tree.txt"
}
echo "   └─ Tree generated"

# 2. Component Count
echo ""
echo "🧩 [2/9] Counting components and services..."
{
    echo "=== TypeScript/React Components ==="
    find src -type f -name "*.tsx" -o -name "*.ts" | wc -l
    echo ""
    echo "=== Services ==="
    find src/services -type f -name "*.ts" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "=== Engines ==="
    find src/engines -type f -name "*.ts" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "=== Hooks ==="
    find src/hooks -type f -name "*.ts" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "=== Components ==="
    find src/components -type f -name "*.tsx" 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "=== Modules ==="
    find src/modules -type f -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l || echo "0"
} > "$REPORT_DIR/component-count.txt"

TS_FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l)
echo "   └─ Total TS/TSX files: $TS_FILES"

# 3. Detect Duplications
echo ""
echo "🔍 [3/9] Detecting module duplications..."
{
    echo "=== DevTools Duplication ==="
    find src -type d -iname "*devtools*" 2>/dev/null || echo "None"
    echo ""
    echo "=== Chat Duplication ==="
    find src -type d -iname "*chat*" 2>/dev/null || echo "None"
    echo ""
    echo "=== Audio Duplication ==="
    find src -type d -iname "*audio*" -o -iname "*voice*" -o -iname "*tts*" 2>/dev/null || echo "None"
    echo ""
    echo "=== AI Services Duplication ==="
    find src -type d -iname "*ai*" -o -iname "*openai*" -o -iname "*gemini*" 2>/dev/null || echo "None"
} > "$REPORT_DIR/duplications.txt"

DEVTOOLS_COUNT=$(find src -type d -iname "*devtools*" 2>/dev/null | wc -l)
CHAT_COUNT=$(find src -type d -iname "*chat*" 2>/dev/null | wc -l)
echo "   ├─ DevTools directories: $DEVTOOLS_COUNT"
echo "   └─ Chat directories: $CHAT_COUNT"

# 4. Naming Inconsistencies
echo ""
echo "📝 [4/9] Checking naming inconsistencies..."
{
    echo "=== Case Sensitivity Issues ==="
    find src -type d | sort | uniq -i -D || echo "None"
    echo ""
    echo "=== Mixed Naming Conventions ==="
    find src -type f -name "*-*" | head -10
    find src -type f -name "*_*" | head -10
} > "$REPORT_DIR/naming-issues.txt"

echo "   └─ Analysis complete"

# 5. Circular Dependencies
echo ""
echo "🔄 [5/9] Detecting circular dependencies..."
if command -v madge &> /dev/null; then
    madge --circular --extensions ts,tsx src/ > "$REPORT_DIR/circular-deps.txt" 2>&1 || echo "No circular dependencies" > "$REPORT_DIR/circular-deps.txt"
    CIRCULAR_COUNT=$(grep -c "✖" "$REPORT_DIR/circular-deps.txt" 2>/dev/null || echo "0")
    echo "   └─ Circular dependencies: $CIRCULAR_COUNT"
else
    echo "   └─ ⚠️ madge not installed (run: pnpm install -g madge)"
    echo "⚠️ madge not installed" > "$REPORT_DIR/circular-deps.txt"
fi

# 6. Import Patterns
echo ""
echo "📦 [6/9] Analyzing import patterns..."

# Some folders/files are excluded from TS compilation (see tsconfig.json exclude).
# Do not penalize import hygiene in code that is not part of the runtime surface.
WILDCARD_EXCLUDE_PATHS_RE='(src/modules/avatar/(camera|rendering|gesture|voice)/|src/modules/avatar/core/AudioVisualSyncEngine\.ts|src/modules/avatar/floating/(ThreeJSAvatarRenderer|appearanceFloatingIntegration)\.ts)'
{
    echo "=== Global Imports (to optimize) ==="
    grep -RInE '^[[:space:]]*import[[:space:]]+\*[[:space:]]+as[[:space:]]+' src/ \
        --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
        --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
        --include="*.ts" --include="*.tsx" \
        2>/dev/null | grep -vE "$WILDCARD_EXCLUDE_PATHS_RE" | head -20 || echo "None"
    echo ""
    echo "=== Deep Imports (potential coupling) ==="
    grep -R "from.*\.\./\.\./\.\.\." src/ \
        --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
        --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
        --include="*.ts" --include="*.tsx" \
        2>/dev/null | head -20 || echo "None"
    echo ""
    echo "=== Absolute Imports ==="
    grep -r "from '@/" src/ --include="*.ts" --include="*.tsx" | wc -l
} > "$REPORT_DIR/import-patterns.txt"

GLOBAL_IMPORTS=$(grep -RInE '^[[:space:]]*import[[:space:]]+\*[[:space:]]+as[[:space:]]+' src/ \
    --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
    --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
    --exclude="*.d.ts" \
    --include="*.ts" --include="*.tsx" \
    2>/dev/null | grep -vE "$WILDCARD_EXCLUDE_PATHS_RE" | wc -l | xargs || echo "0")
echo "   └─ Global imports: $GLOBAL_IMPORTS"

# 7. Code Complexity
echo ""
echo "📊 [7/9] Measuring code complexity..."
if command -v cloc &> /dev/null; then
    cloc src/ --json > "$REPORT_DIR/code-stats.json" 2>/dev/null || true
    cloc src/ > "$REPORT_DIR/code-stats.txt" 2>/dev/null || true
    echo "   └─ Code statistics generated"
else
    {
        echo "Lines of code:"
        find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
        echo ""
        echo "Files:"
        find src -name "*.ts" -o -name "*.tsx" | wc -l
    } > "$REPORT_DIR/code-stats.txt"
    echo "   └─ ⚠️ cloc not installed (basic stats generated)"
fi

# 8. Dead Code Detection
echo ""
echo "💀 [8/9] Detecting potentially dead code..."

# Only count real TODO/FIXME markers in comments (avoid false positives in strings/regex).
TODO_COMMENT_RE='^[[:space:]]*(//|/\*|\*)[[:space:]]*(TODO|FIXME|XXX|HACK)\b'
{
    echo "=== Unused Exports ==="
    if command -v ts-prune &> /dev/null; then
        ts-prune | head -50 || echo "ts-prune failed"
    else
        echo "⚠️ ts-prune not installed (run: pnpm install -g ts-prune)"
    fi
    echo ""
    echo "=== TODO/FIXME Comments ==="
    grep -RInE "$TODO_COMMENT_RE" src/ \
        --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
        --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
        --include="*.ts" --include="*.tsx" \
        2>/dev/null | wc -l
} > "$REPORT_DIR/dead-code.txt"

TODO_COUNT=$(grep -RInE "$TODO_COMMENT_RE" src/ \
    --exclude-dir="__tests__" --exclude-dir="test" --exclude-dir="tests" \
    --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.perf.test.*" \
    --include="*.ts" --include="*.tsx" \
    2>/dev/null | wc -l | xargs || echo "0")
echo "   └─ TODO/FIXME comments: $TODO_COUNT"

# 9. Generate Consolidation Plan
echo ""
echo "📋 [9/9] Generating consolidation plan (14→9 components)..."
cat > "$REPORT_DIR/CONSOLIDATION_PLAN.md" << 'EOF'
# 🏗️ TITANE∞ Architecture Consolidation Plan
**Target**: Reduce from 14-20 components to 9 unified modules

---

## 🎯 Target Architecture (9 Modules)

### Ring 0: Core (3 modules)
1. **Singularity Kernel** - src/core/kernel/
   - State management, invariants
   - Consolidate: core/, kernel/, state/

2. **Cognitive Engine** - src/core/engines/
   - All cognitive engines unified
   - Consolidate: engines/, cognitive/

3. **Memory OS** - src/core/memory/
   - Unified memory persistence
   - Consolidate: memory/, storage/, persistence/

### Ring 1: Services (3 modules)
4. **AI Services** - src/services/ai/
   - Multi-provider AI (OpenAI, Gemini, Ollama)
   - Consolidate: openai/, gemini/, ollama/, ai-config/

5. **Voice Services** - src/services/voice/
   - TTS, STT, prosody
   - Consolidate: tts/, voice/, audio/, parler-tts/

6. **Visual Engine** - src/services/visual/
   - Avatar, halo, visual semantics
   - Consolidate: avatar/, visual/, halo/, three-js/

### Ring 2: Interface (3 modules)
7. **Chat UI** - src/modules/chat/
   - Unified chat interface
   - Consolidate: components/chat/, features/chat/, hooks/chat-related/

8. **DevTools** - src/modules/devtools/
   - Single DevTools module (case-sensitive fix)
   - Consolidate: devtools/, DevTools/, apps/devtools/

9. **Presence OS** - src/modules/presence/
   - HoloPresence, embodiment
   - Consolidate: presence/, holopresence/, embodiment/

---

## 🔧 Consolidation Steps

### Phase 1: DevTools (P0 - Critical)
**Problem**: Duplicate directories `devtools/` and `DevTools/`
**Solution**:
1. Compare implementations
2. Keep best code in `src/modules/devtools/`
3. Update all imports
4. Delete duplicate

**Estimated Time**: 2 hours
**Impact**: High (build errors, confusion)

### Phase 2: Chat (P0 - Critical)
**Problem**: Chat scattered across `components/chat/`, `features/chat/`, multiple hooks
**Solution**:
1. Create `src/modules/chat/` structure:
   ```
   chat/
   ├── ui/           # React components
   ├── services/     # Business logic
   ├── hooks/        # Custom hooks
   └── store/        # State management
   ```
2. Move all chat-related code
3. Update imports globally

**Estimated Time**: 3 hours
**Impact**: High (central feature)

### Phase 3: Audio/Voice (P1 - High)
**Problem**: Multiple audio/voice/tts directories
**Solution**:
1. Consolidate to `src/services/voice/`
2. Clear API: `VoiceService.speak()`, `VoiceService.listen()`

**Estimated Time**: 2 hours
**Impact**: Medium

### Phase 4: AI Services (P1 - High)
**Problem**: OpenAI, Gemini, Ollama in separate directories
**Solution**:
1. Create `src/services/ai/providers/`
2. Unified interface: `AIService.chat()`, `AIService.stream()`

**Estimated Time**: 2 hours
**Impact**: Medium

### Phase 5: Engines Consolidation (P2 - Medium)
**Problem**: Engines scattered
**Solution**:
1. Move all to `src/core/engines/`
2. Clear namespace

**Estimated Time**: 3 hours
**Impact**: Low (well isolated)

---

## 📊 Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Components | 14-20 | 9 | -40% |
| Duplications | 5+ | 0 | -100% |
| Import depth | 4-5 levels | 2-3 levels | -40% |
| Circular deps | TBD | 0 | -100% |

---

## ✅ Success Criteria

- [ ] All duplications eliminated
- [ ] 9 clear modules (3 per ring)
- [ ] No circular dependencies
- [ ] Import depth ≤ 3 levels
- [ ] 100% tests passing after consolidation
- [ ] Build time < 60s
- [ ] Documentation updated

---

**Start with DevTools and Chat (P0) - These are causing immediate issues.**
EOF

echo "   └─ Consolidation plan generated"

# Generate Summary
echo ""
echo "📊 Generating summary report..."
cat > "$REPORT_DIR/ARCHITECTURE_SUMMARY.md" << EOF
# 🏗️ TITANE∞ Architecture Audit Report
**Date**: $(date)
**Duration**: ~10 minutes

---

## 📊 Current State

| Metric | Count | Status |
|--------|-------|--------|
| Total TS/TSX Files | $TS_FILES | - |
| DevTools Directories | $DEVTOOLS_COUNT | $([ "$DEVTOOLS_COUNT" -gt 1 ] && echo "❌ Duplication" || echo "✅") |
| Chat Directories | $CHAT_COUNT | $([ "$CHAT_COUNT" -gt 2 ] && echo "❌ Scattered" || echo "✅") |
| Global Imports | $GLOBAL_IMPORTS | $([ "$GLOBAL_IMPORTS" -gt 10 ] && echo "⚠️ To optimize" || echo "✅") |
| Circular Dependencies | TBD | ⚠️ |
| TODO/FIXME | $TODO_COUNT | $([ "$TODO_COUNT" -gt 50 ] && echo "⚠️ Many" || echo "✅") |

---

## 🎯 Priority Actions

### P0 (Critical - Start Today)
- ❌ **Fix DevTools duplication** - Merge devtools/ and DevTools/
- ❌ **Consolidate Chat** - Unify components/chat/ and features/chat/

### P1 (High - This Week)
- ⚠️ **Audio/Voice consolidation** - Single voice service
- ⚠️ **AI Services unification** - Common interface for all providers

### P2 (Medium - This Sprint)
- Reduce global imports (import * as)
- Fix circular dependencies
- Clean up TODO/FIXME comments
- Enforce 4-Ring architecture

---

## 📁 Detailed Reports

- \`project-tree.txt\` - Full project structure
- \`component-count.txt\` - Files per category
- \`duplications.txt\` - Duplicate modules detected
- \`naming-issues.txt\` - Naming inconsistencies
- \`circular-deps.txt\` - Circular dependencies
- \`import-patterns.txt\` - Import analysis
- \`code-stats.txt\` - Lines of code statistics
- \`dead-code.txt\` - Unused code detection
- \`CONSOLIDATION_PLAN.md\` - **14→9 consolidation roadmap**

---

## 🚀 Next Steps

1. Review CONSOLIDATION_PLAN.md
2. Start with DevTools consolidation (2h)
3. Continue with Chat consolidation (3h)
4. Execute Phase 3-5 (7h total)

**Total Estimated Time**: 12 hours over 2-3 days

---

**Target**: 9 unified modules following 4-Ring architecture
EOF

echo ""
echo "================================================"
echo "✅ Architecture Audit Complete!"
echo ""
echo "📊 Summary:"
echo "   ├─ Total Files: $TS_FILES"
echo "   ├─ DevTools Dirs: $DEVTOOLS_COUNT $([ "$DEVTOOLS_COUNT" -gt 1 ] && echo "(❌ Duplication!)" || echo "")"
echo "   ├─ Chat Dirs: $CHAT_COUNT $([ "$CHAT_COUNT" -gt 2 ] && echo "(⚠️ Scattered)" || echo "")"
echo "   ├─ Global Imports: $GLOBAL_IMPORTS"
echo "   └─ TODO/FIXME: $TODO_COUNT"
echo ""
echo "📁 Full report: $REPORT_DIR/ARCHITECTURE_SUMMARY.md"
echo "📋 Consolidation plan: $REPORT_DIR/CONSOLIDATION_PLAN.md"
echo ""

# Deterministic score (0-100)
ARCH_SCORE=100

# Duplication penalties
dup_penalty=0
if [ "${DEVTOOLS_COUNT:-0}" -gt 1 ]; then dup_penalty=$((dup_penalty + 20)); fi
if [ "${CHAT_COUNT:-0}" -gt 2 ]; then dup_penalty=$((dup_penalty + 15)); fi

# Circular deps penalty (only when detected)
circular_penalty=0
if [ -n "${CIRCULAR_COUNT:-}" ]; then
    circular_penalty=$((CIRCULAR_COUNT * 10))
    if [ "$circular_penalty" -gt 30 ]; then circular_penalty=30; fi
fi

# Import / hygiene penalties
global_penalty=$(( (${GLOBAL_IMPORTS:-0}) * 2 ))
if [ "$global_penalty" -gt 20 ]; then global_penalty=20; fi

todo_penalty=$(( (${TODO_COUNT:-0}) / 10 ))
if [ "$todo_penalty" -gt 20 ]; then todo_penalty=20; fi

total_penalty=$((dup_penalty + circular_penalty + global_penalty + todo_penalty))
if [ "$total_penalty" -gt 100 ]; then total_penalty=100; fi

ARCH_SCORE=$((ARCH_SCORE - total_penalty))
if [ "$ARCH_SCORE" -lt 0 ]; then ARCH_SCORE=0; fi

echo "Score: $ARCH_SCORE"
