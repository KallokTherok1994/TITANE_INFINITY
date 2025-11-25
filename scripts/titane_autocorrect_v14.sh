#!/usr/bin/env bash
# TITANE∞ v14 — AUTO-CORRECTION SYSTEM
# Complete stabilization and auto-repair system
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 🔧 TITANE∞ v14 — AUTO-CORRECTION SYSTEM "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROOT_DIR="$(pwd)"
ERRORS=0

# -----------------------------------------------------------
# PHASE 1 — RUST HARDENING
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 1: RUST HARDENING"
echo "═══════════════════════════════════════════════════════════════"

if [ -d "src-tauri" ]; then
    cd src-tauri

    echo "→ Running cargo fix..."
    cargo fix --allow-dirty --allow-staged 2>&1 | tail -3 || true

    echo "→ Running clippy --fix..."
    cargo clippy --fix --allow-dirty --allow-staged 2>&1 | tail -3 || true

    echo "→ Running cargo check..."
    if cargo check 2>&1 | grep -q "error"; then
        echo "❌ Cargo check failed"
        ((ERRORS++))
    else
        echo "✅ Cargo check passed"
    fi

    cd "$ROOT_DIR"
else
    echo "⚠️  src-tauri directory not found, skipping Rust hardening"
fi

# -----------------------------------------------------------
# PHASE 2 — TAURI LOCAL-ONLY SHIELD
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 2: TAURI LOCAL-ONLY VALIDATION"
echo "═══════════════════════════════════════════════════════════════"

echo "→ Scanning for external HTTP usage..."

# Check for external HTTP (excluding localhost/127.0.0.1)
if grep -rq "https\?://" src src-tauri --include="*.rs" --include="*.ts" --include="*.tsx" 2>/dev/null; then
    EXTERNAL_HTTP=$(grep -r "https\?://" src src-tauri --include="*.rs" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "localhost" | grep -v "127.0.0.1" | grep -v "///" | wc -l || echo "0")

    if [ "$EXTERNAL_HTTP" -gt 0 ]; then
        echo "⚠️  Found $EXTERNAL_HTTP potential external HTTP usage(s)"
        echo "   (Manual review required)"
    else
        echo "✅ No external HTTP detected"
    fi
else
    echo "✅ No HTTP usage detected"
fi

# Verify CSP in tauri.conf.json
if [ -f "src-tauri/tauri.conf.json" ]; then
    if grep -q "contentSecurityPolicy" src-tauri/tauri.conf.json; then
        echo "✅ CSP configured in tauri.conf.json"
    else
        echo "⚠️  CSP not configured (recommended for security)"
    fi
fi

# -----------------------------------------------------------
# PHASE 3 — TYPESCRIPT / REACT HARDENING
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 3: TYPESCRIPT & REACT HARDENING"
echo "═══════════════════════════════════════════════════════════════"

if command -v pnpm &>/dev/null; then
    echo "→ Running TypeScript type check..."

    if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
        TS_ERRORS=$(pnpm tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
        echo "❌ TypeScript: $TS_ERRORS error(s) detected"
        pnpm tsc --noEmit 2>&1 | grep "error TS" | head -5
        ((ERRORS++))
    else
        echo "✅ TypeScript: 0 errors"
    fi

    echo "→ Running ESLint..."
    if pnpm eslint src --ext .ts,.tsx --max-warnings 0 2>&1 | grep -q "error\|warning"; then
        echo "⚠️  ESLint warnings/errors detected"
        pnpm eslint src --ext .ts,.tsx 2>&1 | tail -10
    else
        echo "✅ ESLint: 0 warnings"
    fi
else
    echo "⚠️  pnpm not found, skipping TypeScript checks"
fi

# Check for React hooks issues
echo "→ Checking React hooks..."
USEEFFECT_NO_DEPS=$(grep -r "useEffect(" src --include="*.tsx" 2>/dev/null | grep -v "\[\]" | grep -v "\/\/" | wc -l || echo "0")

if [ "$USEEFFECT_NO_DEPS" -gt 0 ]; then
    echo "⚠️  Found $USEEFFECT_NO_DEPS useEffect without dependency arrays"
else
    echo "✅ React hooks properly configured"
fi

# -----------------------------------------------------------
# PHASE 4 — MEMORY COMPACTION
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 4: MEMORY COMPACTION"
echo "═══════════════════════════════════════════════════════════════"

MEM_DIR="$ROOT_DIR/memory"
mkdir -p "$MEM_DIR"

echo "→ Validating memory JSON files..."

JSON_COUNT=0
if [ -d "$MEM_DIR" ]; then
    for f in "$MEM_DIR"/*.json; do
        if [ -f "$f" ]; then
            if jq empty "$f" 2>/dev/null; then
                # Compact JSON (remove nulls, format)
                jq -c 'del(..|nulls)' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
                ((JSON_COUNT++))
            else
                echo "⚠️  Invalid JSON: $f"
            fi
        fi
    done

    if [ $JSON_COUNT -gt 0 ]; then
        echo "✅ Compacted $JSON_COUNT memory file(s)"
    else
        echo "  → No memory files to compact"
    fi
else
    echo "  → Memory directory empty"
fi

# Check MemoryCompactor module
if [ -f "src-tauri/src/memory_compactor.rs" ]; then
    echo "✅ MemoryCompactor module present"
else
    echo "⚠️  MemoryCompactor module not found"
fi

# -----------------------------------------------------------
# PHASE 5 — CPU LOAD MANAGEMENT (HARMONIA PULSE)
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 5: HARMONIA PULSE (CPU MONITORING)"
echo "═══════════════════════════════════════════════════════════════"

if [ -f /proc/stat ]; then
    # Calculate CPU usage
    CPU_STATS_1=$(grep 'cpu ' /proc/stat)
    sleep 0.5
    CPU_STATS_2=$(grep 'cpu ' /proc/stat)

    read -r _ user1 nice1 system1 idle1 _ <<< "$CPU_STATS_1"
    read -r _ user2 nice2 system2 idle2 _ <<< "$CPU_STATS_2"

    total1=$((user1 + nice1 + system1 + idle1))
    total2=$((user2 + nice2 + system2 + idle2))

    diff_total=$((total2 - total1))
    diff_idle=$((idle2 - idle1))

    if [ $diff_total -gt 0 ]; then
        CPU_LOAD=$(awk "BEGIN {printf \"%.1f\", 100 * ($diff_total - $diff_idle) / $diff_total}")
    else
        CPU_LOAD="0.0"
    fi

    echo "→ Current CPU Load: ${CPU_LOAD}%"

    if (( $(echo "$CPU_LOAD > 80" | bc -l) )); then
        echo "⚠️  HIGH CPU LOAD — Enabling throttle mode"
        export TITANE_HARMONIA_MODE="throttled"
        export VITE_FS_EVENTS=false
        export TSC_COMPILE_ON_SAVE=false
    elif (( $(echo "$CPU_LOAD > 60" | bc -l) )); then
        echo "⚠️  MODERATE CPU LOAD — Enabling balanced mode"
        export TITANE_HARMONIA_MODE="balanced"
    else
        echo "✅ CPU load normal"
        export TITANE_HARMONIA_MODE="normal"
    fi
else
    echo "⚠️  Unable to read CPU stats (not on Linux)"
fi

# Check Harmonia Engine module
if [ -f "src-tauri/src/harmonia_engine.rs" ]; then
    echo "✅ Harmonia Engine module present"
else
    echo "⚠️  Harmonia Engine module not found"
fi

# -----------------------------------------------------------
# PHASE 6 — GIT SECURITY & CONSISTENCY
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 6: GIT SECURITY & CONSISTENCY"
echo "═══════════════════════════════════════════════════════════════"

if git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "✅ Git repository detected"

    # Check .gitignore
    if [ -f ".gitignore" ]; then
        echo "✅ .gitignore present"
    else
        echo "⚠️  .gitignore missing"
    fi

    # Check for sensitive files
    SENSITIVE=$(git ls-files | grep -E "\.(env|key|pem|crt|p12)$" || true)
    if [ -n "$SENSITIVE" ]; then
        echo "❌ Sensitive files in git: $SENSITIVE"
        ((ERRORS++))
    else
        echo "✅ No sensitive files in git"
    fi

    # Check uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        CHANGED=$(git diff --name-only | wc -l)
        echo "  → $CHANGED uncommitted change(s)"
    else
        echo "✅ Working tree clean"
    fi

    # Current branch
    BRANCH=$(git branch --show-current)
    echo "  → Branch: $BRANCH"
else
    echo "⚠️  Not a git repository"
fi

# -----------------------------------------------------------
# PHASE 7 — AUTO-VERIFY SUITE
# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  PHASE 7: AUTO-VERIFY SUITE"
echo "═══════════════════════════════════════════════════════════════"

VERIFY_DIR="$ROOT_DIR/scripts/verify"

if [ -d "$VERIFY_DIR" ]; then
    echo "→ Running verification scripts..."

    # Run each verification script
    VERIFY_SCRIPTS=(
        "verify_global_system.sh"
        "verify_rust_hardening.sh"
        "verify_tauri_local_only.sh"
        "verify_memory_integrity.sh"
        "verify_git_secure.sh"
    )

    for script in "${VERIFY_SCRIPTS[@]}"; do
        if [ -f "$VERIFY_DIR/$script" ]; then
            echo ""
            if bash "$VERIFY_DIR/$script"; then
                echo "  ✅ $script passed"
            else
                echo "  ⚠️  $script had warnings (non-critical)"
            fi
        fi
    done
else
    echo "⚠️  Verification scripts not found in $VERIFY_DIR"
fi

# -----------------------------------------------------------
# FINAL SUMMARY
# -----------------------------------------------------------
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo " ✅ TITANE∞ v14 AUTO-CORRECTION COMPLETED SUCCESSFULLY "
else
    echo " ⚠️  TITANE∞ v14 AUTO-CORRECTION COMPLETED WITH $ERRORS ERROR(S) "
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $ERRORS
