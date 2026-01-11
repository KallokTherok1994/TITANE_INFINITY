#!/bin/bash

# 🧪 TITANE∞ Test Coverage Audit - Gap Analysis
# Duration: 5-10 minutes
# Output: reports/test-coverage-YYYYMMDD-HHMMSS/

set -e

# Some toolchains occasionally emit numeric-only noise lines to stdout (observed under master/orchestrated runs).
# They are not part of the intended audit output and make logs harder to read.
# Filter them out while preserving all meaningful lines.
exec > >(awk '!/^[0-9]+$/' )

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="reports/test-coverage-$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "🧪 TITANE∞ Test Coverage Audit - $TIMESTAMP"
echo "================================================"

# 1. Inventory Test Files
echo ""
echo "📋 [1/7] Inventorying test files..."
{
    echo "=== Unit Tests ==="
    find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | sort
    echo ""
    echo "=== E2E Tests ==="
    find . -path "*/e2e/*" -name "*.test.ts" -o -path "*/e2e/*" -name "*.spec.ts" 2>/dev/null | sort || echo "None found"
    echo ""
    echo "=== Rust Tests ==="
    grep -r "#\[test\]" src-tauri/src/ -B 1 | grep "^fn " || echo "None found"
    echo ""
    echo "=== Integration Tests ==="
    find . -path "*/integration/*" -name "*.test.ts" 2>/dev/null | sort || echo "None found"
} > "$REPORT_DIR/test-inventory.txt"

UNIT_TESTS=$(find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | wc -l)
E2E_TESTS=$(find . -path "*/e2e/*" -name "*.test.ts" -o -path "*/e2e/*" -name "*.spec.ts" 2>/dev/null | wc -l || echo "0")
RUST_TESTS=$(grep -r "#\[test\]" src-tauri/src/ | wc -l || echo "0")

echo "   ├─ Unit tests: $UNIT_TESTS"
echo "   ├─ E2E tests: $E2E_TESTS"
echo "   └─ Rust tests: $RUST_TESTS"

# 2. Run Test Suite
echo ""
echo "🏃 [2/7] Running test suite..."
if [ -f "package.json" ]; then
  # Ensure deterministic coverage measurement: remove previous artifacts
  # so we only report coverage produced by this run.
  rm -rf coverage/unit coverage/.tmp coverage/coverage-summary.json 2>/dev/null || true

  if [ -x "./.tools/node/current/bin/pnpm" ]; then
    PNPM=("./.tools/node/current/bin/pnpm")
  elif command -v corepack >/dev/null 2>&1; then
    PNPM=(corepack pnpm)
  elif command -v pnpm >/dev/null 2>&1; then
    PNPM=(pnpm)
  else
    PNPM=()
  fi

  NODE_BIN=""
  if [ -x "./.tools/node/current/bin/node" ]; then
    NODE_BIN="./.tools/node/current/bin/node"
  elif command -v node >/dev/null 2>&1; then
    NODE_BIN="$(command -v node)"
  fi

  if [ ${#PNPM[@]} -gt 0 ]; then
    set +e
    # Use the unit coverage config, which emits coverage/unit/coverage-summary.json.
    "${PNPM[@]}" run test:coverage:unit > "$REPORT_DIR/test-output.txt" 2>&1
    TEST_EXIT=$?
    set -e

    if [ "$TEST_EXIT" -ne 0 ]; then
      echo "   ⚠️ Tests/coverage failed (exit=$TEST_EXIT)"
    fi
  else
    echo "   ⚠️ pnpm/corepack introuvable - tests ignorés"
    echo "pnpm/corepack introuvable" > "$REPORT_DIR/test-output.txt"
  fi

  # Coverage detection (deterministic):
  # 1) Prefer the JSON summary if produced by the unit coverage config.
  # 2) Otherwise, compute from V8 raw fragments in coverage/unit/.tmp.
  # 3) Otherwise, report 0.
  COVERAGE="0"
  COVERAGE_NOTE=""

  if [ -f "coverage/unit/coverage-summary.json" ]; then
    cp "coverage/unit/coverage-summary.json" "$REPORT_DIR/coverage-summary.json"
    if command -v jq >/dev/null 2>&1; then
      COVERAGE=$(jq -r '(.total.lines.pct // 0) | floor' "$REPORT_DIR/coverage-summary.json" 2>/dev/null || echo "0")
    elif [ -n "${NODE_BIN:-}" ]; then
      set +e
      COVERAGE=$("$NODE_BIN" <<'NODE'
const fs = require('fs');
try {
  const p = process.argv[1];
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const v = (data && data.total && data.total.lines && typeof data.total.lines.pct === 'number') ? data.total.lines.pct : 0;
  process.stdout.write(String(Math.floor(v)));
} catch {
  process.stdout.write('0');
}
NODE
"$REPORT_DIR/coverage-summary.json")
      set -e
    fi
    if [[ "${COVERAGE:-}" =~ ^[0-9]+$ ]]; then
      COVERAGE_NOTE="(from coverage/unit/coverage-summary.json)"
      echo "   └─ Coverage: ${COVERAGE}% ${COVERAGE_NOTE}"
    else
      COVERAGE="0"
      echo "   └─ Coverage: 0% (invalid coverage-summary.json)"
    fi
  elif [ -d "coverage/unit/.tmp" ] && ls coverage/unit/.tmp/coverage-*.json >/dev/null 2>&1; then
    # Fallback: Vitest v8 provider may only emit raw V8 coverage fragments in coverage/unit/.tmp.
    # Compute an approximate % based on uncovered byte ranges (count==0) within src/ (excluding tests).
    RAW_TMP_DIR="coverage/unit/.tmp"
    if [ -n "${NODE_BIN:-}" ]; then
      export TITANE_V8_COVERAGE_TMP_DIR="$RAW_TMP_DIR"
      set +e
      V8_OUT=$("$NODE_BIN" <<'NODE'
const fs = require('fs');
const path = require('path');

function listCoverageFiles(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter(f => /^coverage-\d+\.json$/.test(f))
      .map(f => path.join(dir, f));
  } catch {
    return [];
  }
}

function parseJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeFileUrl(url) {
  // Expect file:///...; return decoded path.
  if (typeof url !== 'string') return null;
  if (!url.startsWith('file://')) return null;
  try {
    // file:///home/... => /home/...
    return decodeURIComponent(url.replace(/^file:\/\//, ''));
  } catch {
    return url.replace(/^file:\/\//, '');
  }
}

function unionIntervals(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = [];
  let [cs, ce] = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    if (s <= ce) {
      ce = Math.max(ce, e);
    } else {
      out.push([cs, ce]);
      cs = s;
      ce = e;
    }
  }
  out.push([cs, ce]);
  return out;
}

function sumIntervals(intervals) {
  let sum = 0;
  for (const [s, e] of intervals) {
    if (e > s) sum += (e - s);
  }
  return sum;
}

const tmpDir = process.env.TITANE_V8_COVERAGE_TMP_DIR || path.join(process.cwd(), 'coverage', 'unit', '.tmp');
const files = listCoverageFiles(tmpDir);

// Aggregate by source file path.
const byFile = new Map();

for (const f of files) {
  const data = parseJsonFile(f);
  if (!data || !Array.isArray(data.result)) continue;
  for (const entry of data.result) {
    const p = normalizeFileUrl(entry.url);
    if (!p) continue;
    // Focus on src/ and ignore tests.
    if (!p.includes('/src/')) continue;
    if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(p)) continue;
    if (p.includes('/src/test/') || p.includes('/src/test-utils/')) continue;
    const functions = Array.isArray(entry.functions) ? entry.functions : [];
    let fileLen = 0;
    const uncovered = [];
    for (const fn of functions) {
      const ranges = Array.isArray(fn.ranges) ? fn.ranges : [];
      for (const r of ranges) {
        if (typeof r.startOffset !== 'number' || typeof r.endOffset !== 'number') continue;
        if (r.endOffset > fileLen) fileLen = r.endOffset;
        // count==0 ranges are treated as uncovered spans
        if (r.count === 0) {
          uncovered.push([Math.max(0, r.startOffset), Math.max(0, r.endOffset)]);
        }
      }
    }
    if (fileLen <= 0) continue;
    const prev = byFile.get(p);
    if (!prev) {
      byFile.set(p, { fileLen, uncovered });
    } else {
      // Keep max fileLen, concat uncovered.
      prev.fileLen = Math.max(prev.fileLen, fileLen);
      prev.uncovered.push(...uncovered);
    }
  }
}

let totalBytes = 0;
let coveredBytes = 0;

for (const { fileLen, uncovered } of byFile.values()) {
  const u = unionIntervals(uncovered.filter(([s, e]) => e > s && s < fileLen).map(([s, e]) => [s, Math.min(e, fileLen)]));
  const uncoveredBytes = Math.min(fileLen, sumIntervals(u));
  const covered = Math.max(0, fileLen - uncoveredBytes);
  totalBytes += fileLen;
  coveredBytes += covered;
}

if (totalBytes <= 0) {
  process.stdout.write('0');
} else {
  const pct = Math.max(0, Math.min(100, Math.round((coveredBytes * 100) / totalBytes)));
  process.stdout.write(String(pct));
}
NODE
)
      V8_EC=$?
      set -e
      if [ "$V8_EC" -eq 0 ] && [[ "${V8_OUT:-}" =~ ^[0-9]+$ ]]; then
        COVERAGE="$V8_OUT"
        COVERAGE_NOTE="(computed from V8 raw fragments in ${RAW_TMP_DIR})"
        echo "   └─ Coverage: ${COVERAGE}% ${COVERAGE_NOTE}"
      else
        COVERAGE="0"
        echo "   └─ Coverage: 0% (no usable V8 fragments)"
      fi
    else
      echo "   └─ Coverage: 0% (node introuvable pour calcul V8)"
    fi
  else
    echo "   └─ Coverage: 0% (no coverage files generated)"
  fi
else
  COVERAGE="0"
  echo "   ⚠️ package.json not found"
fi

# 3. Rust Test Coverage
echo ""
echo "🦀 [3/7] Checking Rust test coverage..."
if [ -f "src-tauri/Cargo.toml" ]; then
    cd src-tauri
  set +e
  cargo test > "../$REPORT_DIR/rust-test-output.txt" 2>&1
  RUST_TEST_EXIT=$?
  set -e
  if [ "$RUST_TEST_EXIT" -ne 0 ]; then
    echo "   ⚠️ Rust tests failed (exit=$RUST_TEST_EXIT)"
    echo "   └─ Tail (last 40 lines):"
    tail -n 40 "../$REPORT_DIR/rust-test-output.txt" | sed 's/^/      /'
  fi
    cd ..
    
    RUST_TEST_COUNT=$(grep "test result:" "$REPORT_DIR/rust-test-output.txt" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
    echo "   └─ Rust tests passed: $RUST_TEST_COUNT"
else
    RUST_TEST_COUNT="0"
    echo "   ⚠️ Cargo.toml not found"
fi

# 4. Coverage Matrix (P0/P1/P2)
echo ""
echo "📊 [4/7] Generating coverage matrix..."
cat > "$REPORT_DIR/COVERAGE_MATRIX.md" << 'EOF'
# 🎯 TITANE∞ Test Coverage Matrix

---

## P0 (Critical - Must Have 100% Coverage)

### Security
- [ ] Authentication
- [ ] Authorization
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure storage

### Data Integrity
- [ ] ConversationManager save/load
- [ ] State persistence
- [ ] Memory synchronization
- [ ] Config validation

### IPC (Tauri Commands)
- [ ] All #[tauri::command] functions
- [ ] Error handling
- [ ] Type safety
- [ ] Rate limiting

### Core Kernel
- [ ] Invariant enforcement
- [ ] State transitions
- [ ] Event handling

**Current P0 Coverage**: TBD
**Target**: 100%

---

## P1 (High - Should Have 80% Coverage)

### UI Components
- [ ] Chat interface
- [ ] DevTools
- [ ] Settings
- [ ] Avatar
- [ ] Halo

### Services
- [ ] AI services (OpenAI, Gemini, Ollama)
- [ ] Voice services (TTS, STT)
- [ ] Memory services
- [ ] Storage services

### Engines
- [ ] Cognitive engines
- [ ] Harmonic OS
- [ ] Presence engine

**Current P1 Coverage**: TBD
**Target**: 80%

---

## P2 (Medium - Nice to Have 60% Coverage)

### Visual
- [ ] Animations
- [ ] Themes
- [ ] Visual effects
- [ ] Three.js scenes

### Utilities
- [ ] Helper functions
- [ ] Formatters
- [ ] Validators

### Documentation
- [ ] Code examples
- [ ] Inline documentation

**Current P2 Coverage**: TBD
**Target**: 60%

---

## 🧪 Test Types Needed

### Unit Tests
- Core functions (pure logic)
- Utility functions
- Validators
- Formatters

### Integration Tests
- Service interactions
- Engine coordination
- State management flows
- Event propagation

### E2E Tests
- User workflows
- Critical paths
- Error scenarios
- Performance benchmarks

### Rust Tests
- All Tauri commands
- File operations
- IPC layer
- OS integrations

---

## 📋 Test Checklist

### Immediate (P0)
- [ ] ConversationManager.save()
- [ ] ConversationManager.load()
- [ ] ConversationManager.get()
- [ ] State persistence
- [ ] All Tauri commands
- [ ] Input sanitization

### Short-term (P1)
- [ ] AI service fallback
- [ ] Voice service error handling
- [ ] Memory service integration
- [ ] Chat UI interactions
- [ ] DevTools functionality

### Medium-term (P2)
- [ ] Visual effects
- [ ] Animation timings
- [ ] Theme switching
- [ ] Performance benchmarks

---

**Start with P0 tests - these are critical for stability.**
EOF

echo "   └─ Coverage matrix generated"

# 5. Missing Tests Detection
echo ""
echo "🔍 [5/7] Detecting untested code..."
{
    echo "=== Files Without Tests ==="
    echo ""
    echo "TypeScript/React:"
    find src -name "*.ts" -o -name "*.tsx" | while read file; do
        base=$(basename "$file" .ts)
        base=$(basename "$base" .tsx)
        dir=$(dirname "$file")
        
        if ! find "$dir" -name "${base}.test.ts" -o -name "${base}.test.tsx" -o -name "${base}.spec.ts" -o -name "${base}.spec.tsx" 2>/dev/null | grep -q .; then
            echo "$file"
        fi
    done | head -50
    
    echo ""
    echo "=== Rust Files Without Tests ==="
    find src-tauri/src -name "*.rs" | while read file; do
        if ! grep -q "#\[test\]" "$file" 2>/dev/null && ! grep -q "#\[cfg(test)\]" "$file" 2>/dev/null; then
            echo "$file"
        fi
    done | head -20
} > "$REPORT_DIR/missing-tests.txt"

UNTESTED_TS=$(find src -name "*.ts" -o -name "*.tsx" | wc -l || echo "0")
echo "   └─ Files analyzed"

# 6. Test Quality Metrics
echo ""
echo "📈 [6/7] Analyzing test quality..."
{
    echo "=== Test Assertions ==="
    grep -r "expect(" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0"
    echo ""
    echo "=== Mock Usage ==="
    grep -r "jest.mock\|vi.mock" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0"
    echo ""
    echo "=== Async Tests ==="
    grep -r "async.*test\|async.*it" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0"
    echo ""
    echo "=== Snapshot Tests ==="
    grep -r "toMatchSnapshot" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0"
    echo ""
    echo "=== Test Hooks ==="
    echo "beforeEach: $(grep -r "beforeEach" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0")"
    echo "afterEach: $(grep -r "afterEach" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0")"
    echo "beforeAll: $(grep -r "beforeAll" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0")"
    echo "afterAll: $(grep -r "afterAll" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0")"
} > "$REPORT_DIR/test-quality.txt"

ASSERTIONS=$(grep -r "expect(" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0")
MOCKS=$(grep -r "jest.mock\|vi.mock" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l || echo "0")
echo "   ├─ Assertions: $ASSERTIONS"
echo "   └─ Mocks: $MOCKS"

# 7. Generate CI/CD Test Config
echo ""
echo "⚙️ [7/7] Generating CI/CD test configuration..."
cat > "$REPORT_DIR/github-actions-test.yml" << 'EOF'
name: Tests & Coverage

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
          
  test-rust:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: cd src-tauri && cargo test --verbose
      
  coverage-gate:
    needs: [test-frontend, test-rust]
    runs-on: ubuntu-latest
    steps:
      - name: Check Coverage
        run: |
          if [ "${{ steps.coverage.outputs.coverage }}" -lt "80" ]; then
            echo "Coverage below 80%"
            exit 1
          fi
EOF

echo "   └─ CI config generated"

# Generate Summary
echo ""
echo "📊 Generating test coverage summary..."
cat > "$REPORT_DIR/TEST_COVERAGE_SUMMARY.md" << EOF
# 🧪 TITANE∞ Test Coverage Report
**Date**: $(date)
**Overall Coverage**: ${COVERAGE}%

---

## 📊 Current State

| Category | Count | Coverage | Target | Status |
|----------|-------|----------|--------|--------|
| Unit Tests | $UNIT_TESTS | ${COVERAGE}% | 80% | $([ "${COVERAGE%.*}" -ge 80 ] 2>/dev/null && echo "✅" || echo "❌") |
| E2E Tests | $E2E_TESTS | - | 10+ | $([ "$E2E_TESTS" -ge 10 ] && echo "✅" || echo "❌") |
| Rust Tests | $RUST_TESTS | - | 50+ | $([ "$RUST_TESTS" -ge 50 ] && echo "✅" || echo "❌") |
| Assertions | $ASSERTIONS | - | 200+ | $([ "$ASSERTIONS" -ge 200 ] && echo "✅" || echo "⚠️") |
| Mocks | $MOCKS | - | - | ℹ️ |

---

## 🎯 Priority Actions

### P0 (Critical - Add Immediately)
$([ "${COVERAGE%.*}" -lt 50 ] 2>/dev/null && echo "- ❌ **Coverage below 50%** - Add basic tests for core modules" || echo "- ✅ Basic coverage present")
- ❌ **ConversationManager tests** - save/load/get operations
- ❌ **Tauri command tests** - All IPC endpoints
- ❌ **Security tests** - Input validation, XSS prevention
- ❌ **State persistence tests** - Data integrity

### P1 (High - This Week)
$([ "$E2E_TESTS" -lt 5 ] && echo "- ⚠️ **Add E2E tests** - Currently $E2E_TESTS, need 10+" || echo "- ✅ E2E tests present")
$([ "$RUST_TESTS" -lt 30 ] && echo "- ⚠️ **Add Rust tests** - Currently $RUST_TESTS, need 50+" || echo "- ✅ Rust tests present")
- Add integration tests for services
- Add error scenario tests
- Setup coverage CI gate (80%)

### P2 (Medium - This Sprint)
- Add visual regression tests
- Add performance benchmarks
- Add snapshot tests
- Complete coverage matrix

---

## 📁 Detailed Reports

- \`test-inventory.txt\` - All test files
- \`test-output.txt\` - Test run results
- \`rust-test-output.txt\` - Rust test results
- \`coverage-summary.json\` - Coverage data
- \`COVERAGE_MATRIX.md\` - **P0/P1/P2 test requirements**
- \`missing-tests.txt\` - Untested files
- \`test-quality.txt\` - Quality metrics
- \`github-actions-test.yml\` - CI/CD config

---

## 🚀 Next Steps

1. Review COVERAGE_MATRIX.md - Start with P0 tests
2. Add ConversationManager tests (2h)
3. Add Tauri command tests (3h)
4. Add security tests (2h)
5. Setup CI/CD pipeline (1h)
6. Run coverage gate on every PR

**Total Estimated Time**: 8 hours

---

## 📈 Target Milestones

- **Week 1**: P0 tests → 50% coverage
- **Week 2**: P1 tests → 80% coverage
- **Week 3**: CI/CD + gates
- **Week 4**: 100% P0, 80% overall

**Final Goal**: 80% overall coverage, 100% P0 coverage
EOF

echo ""
echo "================================================"
echo "✅ Test Coverage Audit Complete!"
echo ""
echo "📊 Summary:"
PASS_MARK="(❌ <80%)"
COVERAGE_INT_MARK="${COVERAGE%.*}"
if [[ "${COVERAGE_INT_MARK:-}" =~ ^[0-9]+$ ]] && [ "$COVERAGE_INT_MARK" -ge 80 ]; then
  PASS_MARK="(✅)"
fi
echo "   ├─ Overall Coverage: ${COVERAGE}% ${PASS_MARK}"
echo "   ├─ Unit Tests: $UNIT_TESTS"
echo "   ├─ E2E Tests: $E2E_TESTS $([ "$E2E_TESTS" -ge 10 ] && echo "(✅)" || echo "(⚠️ <10)")"
echo "   ├─ Rust Tests: $RUST_TESTS $([ "$RUST_TESTS" -ge 50 ] && echo "(✅)" || echo "(⚠️ <50)")"
echo "   ├─ Assertions: $ASSERTIONS"
echo "   └─ Mocks: $MOCKS"
echo ""
echo "📁 Full report: $REPORT_DIR/TEST_COVERAGE_SUMMARY.md"
echo "📋 Coverage matrix: $REPORT_DIR/COVERAGE_MATRIX.md"
echo ""

# Deterministic score (0-100)
COVERAGE_INT="${COVERAGE%.*}"
if [ -z "${COVERAGE_INT:-}" ]; then COVERAGE_INT=0; fi

RUST_COMPONENT=$((RUST_TESTS >= 50 ? 10 : (RUST_TESTS * 10 / 50)))
E2E_COMPONENT=$((E2E_TESTS >= 10 ? 10 : E2E_TESTS))
ASSERT_COMPONENT=$((ASSERTIONS >= 200 ? 10 : (ASSERTIONS * 10 / 200)))

# Coverage is the largest component (70%). Align scoring with the stated target (>=80% coverage).
# - >= 80% coverage earns full 70 points
# - < 80% scales linearly down to 0
COVERAGE_COMPONENT=0
if [[ "${COVERAGE_INT:-}" =~ ^[0-9]+$ ]]; then
  if [ "$COVERAGE_INT" -ge 80 ]; then
    COVERAGE_COMPONENT=70
  elif [ "$COVERAGE_INT" -gt 0 ]; then
    COVERAGE_COMPONENT=$(( COVERAGE_INT * 70 / 80 ))
  fi
fi

SCORE=$(( COVERAGE_COMPONENT + RUST_COMPONENT + E2E_COMPONENT + ASSERT_COMPONENT ))
if [ "$SCORE" -gt 100 ]; then SCORE=100; fi
if [ "$SCORE" -lt 0 ]; then SCORE=0; fi

echo "Score: $SCORE"
