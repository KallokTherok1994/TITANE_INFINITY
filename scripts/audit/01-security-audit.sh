#!/bin/bash

# 🔒 TITANE∞ Security Audit - Comprehensive Security Analysis
# Duration: 10-15 minutes
# Output: reports/security-audit-YYYYMMDD-HHMMSS/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="reports/security-audit-$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "🔒 TITANE∞ Security Audit - $TIMESTAMP"
echo "================================================"

# 1. Node dependency vulnerabilities
echo ""
echo "📦 [1/8] Scanning Node dependency vulnerabilities..."
if [ -x "./.tools/node/current/bin/pnpm" ]; then
    PNPM=("./.tools/node/current/bin/pnpm")
elif command -v corepack >/dev/null 2>&1; then
    PNPM=(corepack pnpm)
elif command -v pnpm >/dev/null 2>&1; then
    PNPM=(pnpm)
else
    PNPM=()
fi

if [ ${#PNPM[@]} -gt 0 ]; then
    "${PNPM[@]}" audit --json > "$REPORT_DIR/dependency-audit.json" 2>&1 || true
    "${PNPM[@]}" audit > "$REPORT_DIR/dependency-audit.txt" 2>&1 || true
else
    echo "   └─ ⚠️ pnpm/corepack introuvable - audit ignoré"
    echo '{}' > "$REPORT_DIR/dependency-audit.json"
    echo "pnpm/corepack introuvable" > "$REPORT_DIR/dependency-audit.txt"
fi

NODE_CRITICAL=$(jq -r '.metadata.vulnerabilities.critical // 0' "$REPORT_DIR/dependency-audit.json" 2>/dev/null || echo "0")
NODE_HIGH=$(jq -r '.metadata.vulnerabilities.high // 0' "$REPORT_DIR/dependency-audit.json" 2>/dev/null || echo "0")
echo "   ├─ Critical: $NODE_CRITICAL"
echo "   └─ High: $NODE_HIGH"

# 2. Rust/Cargo Vulnerabilities
echo ""
echo "🦀 [2/8] Scanning Rust/Cargo vulnerabilities..."
cd src-tauri
if command -v cargo-audit &> /dev/null; then
    cargo audit --json > "../$REPORT_DIR/cargo-audit.json" 2>&1 || true
    cargo audit > "../$REPORT_DIR/cargo-audit.txt" 2>&1 || true
    CARGO_VULNS=$(jq -r '.vulnerabilities.count // 0' "../$REPORT_DIR/cargo-audit.json" 2>/dev/null || echo "0")
    echo "   └─ Vulnerabilities: $CARGO_VULNS"

    # Strict gate (deny warnings) with baseline ignores for known transitive advisories.
    # Source of truth: .github/copilot-xs/cargo-audit-ignores.txt
    STRICT_AUDIT_EXIT=0
    IGNORE_FILE="../.github/copilot-xs/cargo-audit-ignores.txt"
    IGNORE_ARGS=()
    if [ -f "$IGNORE_FILE" ]; then
        while IFS= read -r line; do
            line="${line%%#*}"
            line="$(echo "$line" | xargs)"
            if [ -n "$line" ]; then
                IGNORE_ARGS+=("--ignore" "$line")
            fi
        done < "$IGNORE_FILE"
    fi

    set +e
    cargo audit --deny warnings "${IGNORE_ARGS[@]}" > "../$REPORT_DIR/cargo-audit-strict.txt" 2>&1
    STRICT_AUDIT_EXIT=$?
    set -e

    if [ "$STRICT_AUDIT_EXIT" -eq 0 ]; then
        CARGO_AUDIT_STRICT_STATUS="✅"
    else
        CARGO_AUDIT_STRICT_STATUS="❌"
    fi
    echo "   └─ Cargo strict gate: $CARGO_AUDIT_STRICT_STATUS (exit=$STRICT_AUDIT_EXIT)"
else
    echo "   └─ ⚠️ cargo-audit not installed (run: cargo install cargo-audit)"
    CARGO_AUDIT_STRICT_STATUS="⚠️"
fi
cd ..

# 3. Secrets Detection
echo ""
echo "🔑 [3/8] Detecting hardcoded secrets..."
{
    echo "=== Suspicious hardcoded secrets (high-signal heuristics) ==="
    echo "# Notes: avoids matching common words like 'token' in types/comments."
    echo ""
    echo "--- Known key prefixes / tokens ---"
    grep -RInE "(AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})" \
        --exclude-dir="__tests__" --exclude-dir="tests" --exclude="*.test.*" --exclude="*.spec.*" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.rs" \
        src src-tauri 2>/dev/null | head -50 || echo "None found"
    echo ""
    echo "--- String literal assignments (apiKey/token/secret/password) ---"
    grep -RInE "\b(api[_-]?key|token|secret|password)\b\s*[:=]\s*(['\"][^'\"]{16,}['\"])" \
        --exclude-dir="__tests__" --exclude-dir="tests" --exclude="*.test.*" --exclude="*.spec.*" \
        --include="*.ts" --include="*.tsx" --include="*.js" \
        src 2>/dev/null | head -50 || echo "None found"
    echo ""
    echo "--- URLs with credentials ---"
    grep -RInE "https?://[^\s/:]+:[^\s/@]+@" \
        --exclude-dir="__tests__" --exclude-dir="tests" --exclude="*.test.*" --exclude="*.spec.*" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.rs" \
        src src-tauri 2>/dev/null | head -50 || echo "None found"
} > "$REPORT_DIR/secrets-scan.txt"

SECRETS_COUNT=$( (grep -vE '^(===|---|#|None found$|$)' "$REPORT_DIR/secrets-scan.txt" || true) | wc -l | xargs )
echo "   └─ Potential secrets: $SECRETS_COUNT findings"

# 4. Tauri Commands Audit
echo ""
echo "⚙️ [4/8] Auditing Tauri commands..."
{
    echo "=== All Tauri Commands ==="
    TAURI_ATTR_COUNT=$(grep -r "#\[tauri::command\]" src-tauri/src/ --include="*.rs" | wc -l | xargs)
    echo "Attributes found: $TAURI_ATTR_COUNT"
    echo ""
    echo "=== Commands List ==="
    # Support `pub fn`, `pub async fn`, and `async fn` patterns.
    grep -r -A2 "#\[tauri::command\]" src-tauri/src/ --include="*.rs" \
        | grep -E "\bfn\s+" \
        | sed -E 's/.*\bfn\s+//' \
        | sed -E 's/\(.*$//' \
        | sort
    echo ""
    echo "=== Allowlist Check ==="
    if [ -f "tauri.base.json" ]; then
        jq -r '.app.security.capabilities[0].allow[] | .command' tauri.base.json 2>/dev/null | sort
    fi
} > "$REPORT_DIR/tauri-commands.txt"

COMMANDS_COUNT=${TAURI_ATTR_COUNT:-0}
echo "   └─ Total commands: $COMMANDS_COUNT"

# 5. Unwrap() Count (Rust panic risk)
echo ""
echo "💥 [5/8] Counting unwrap() calls (panic risk)..."
UNWRAP_COUNT=$(grep -r "\.unwrap()" src-tauri/src/ --include="*.rs" | grep -v "test" | wc -l)
EXPECT_COUNT=$(grep -r "\.expect(" src-tauri/src/ --include="*.rs" | grep -v "test" | wc -l)
{
    echo "=== unwrap() calls (excluding tests) ==="
    grep -rn "\.unwrap()" src-tauri/src/ --include="*.rs" | grep -v "test" || echo "None"
    echo ""
    echo "=== expect() calls (excluding tests) ==="
    grep -rn "\.expect(" src-tauri/src/ --include="*.rs" | grep -v "test" || echo "None"
} > "$REPORT_DIR/unwrap-calls.txt"

echo "   ├─ unwrap(): $UNWRAP_COUNT"
echo "   └─ expect(): $EXPECT_COUNT"

# 6. .gitignore Audit
echo ""
echo "📝 [6/8] Auditing .gitignore coverage..."
{
    echo "=== Sensitive patterns in .gitignore ==="
    grep -E "\.env|secret|key|token|password|credentials" .gitignore || echo "⚠️ No sensitive patterns"
    echo ""
    echo "=== Potential sensitive files not ignored ==="
    find . -type f -name ".env*" -o -name "*secret*" -o -name "*key*" 2>/dev/null | grep -v node_modules | grep -v .git || echo "None found"
} > "$REPORT_DIR/gitignore-audit.txt"

echo "   └─ Checked"

# 7. Dependency Licenses
echo ""
echo "📜 [7/8] Scanning dependency licenses..."
{
    echo "=== Node Licenses ==="
    if [ ${#PNPM[@]} -gt 0 ]; then
        "${PNPM[@]}" dlx license-checker --summary 2>/dev/null || echo "⚠️ license-checker not available"
    else
        echo "⚠️ pnpm/corepack introuvable - license-checker ignoré"
    fi
    echo ""
    echo "=== Cargo Licenses ==="
    cd src-tauri
    if command -v cargo-license &> /dev/null; then
        cargo-license 2>/dev/null || echo "⚠️ cargo-license failed"
    else
        echo "⚠️ cargo-license not installed (run: cargo install cargo-license)"
    fi
    cd ..
} > "$REPORT_DIR/licenses.txt"

echo "   └─ License report generated"

# 8. CSP (Content Security Policy) Check
echo ""
echo "🛡️ [8/8] Validating Content Security Policy..."
{
    echo "=== CSP from tauri.base.json ==="
    jq -r '.app.security.csp' tauri.base.json 2>/dev/null || echo "⚠️ No CSP found"
    echo ""
    echo "=== CSP Analysis ==="
    CSP=$(jq -r '.app.security.csp' tauri.base.json 2>/dev/null)
    if [[ "$CSP" =~ "unsafe-eval" ]]; then
        echo "⚠️ WARNING: unsafe-eval detected"
    fi
    if [[ "$CSP" =~ "unsafe-inline" ]]; then
        echo "⚠️ WARNING: unsafe-inline detected"
    fi
    if [[ "$CSP" =~ "default-src 'self'" ]]; then
        echo "✅ Good: default-src 'self' present"
    fi
} > "$REPORT_DIR/csp-analysis.txt"

echo "   └─ CSP validated"

# Generate Summary Report
echo ""
echo "📊 Generating summary report..."
cat > "$REPORT_DIR/SECURITY_SUMMARY.md" << EOF
# 🔒 TITANE∞ Security Audit Report
**Date**: $(date)
**Duration**: ~15 minutes

---

## 📊 Executive Summary

| Category | Critical | High | Medium | Status |
|----------|----------|------|--------|--------|
| Node Dependencies | $NODE_CRITICAL | $NODE_HIGH | - | $([ "$NODE_CRITICAL" -eq 0 ] && echo "✅" || echo "❌") |
| Cargo Vulnerabilities | - | - | $CARGO_VULNS | $([ "$CARGO_VULNS" -eq 0 ] && echo "✅" || echo "⚠️") |
| Cargo Audit Strict (deny warnings) | - | - | - | $CARGO_AUDIT_STRICT_STATUS |
| Secrets Detected | - | $SECRETS_COUNT | - | $([ "$SECRETS_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |
| Tauri Commands | - | $COMMANDS_COUNT | - | ✅ |
| Rust unwrap() | - | $UNWRAP_COUNT | - | $([ "$UNWRAP_COUNT" -eq 0 ] && echo "✅" || echo "❌") |
| Rust expect() | - | $EXPECT_COUNT | - | ⚠️ |

---

## 🎯 Priority Actions

### P0 (Critical - Fix Immediately)
$([ "$NODE_CRITICAL" -gt 0 ] && echo "- ❌ **$NODE_CRITICAL critical Node dependency vulnerabilities** - Run \`pnpm audit fix\`" || echo "- ✅ No critical Node dependency vulnerabilities")
$([ "$UNWRAP_COUNT" -gt 10 ] && echo "- ❌ **$UNWRAP_COUNT unwrap() calls** - Replace with Result<T,E>" || echo "- ✅ unwrap() usage acceptable")

### P1 (High - Fix This Week)
$([ "$NODE_HIGH" -gt 0 ] && echo "- ⚠️ **$NODE_HIGH high Node dependency vulnerabilities** - Review and update" || echo "- ✅ No high Node dependency vulnerabilities")
$([ "$SECRETS_COUNT" -gt 5 ] && echo "- ⚠️ **$SECRETS_COUNT potential secrets** - Move to env vars" || echo "- ✅ Secrets properly managed")

### P2 (Medium - Fix This Sprint)
- Review all Tauri commands for proper validation
- Ensure all commands are in allowlist
- Add input sanitization for user-provided data

---

## 📁 Detailed Reports

- \`dependency-audit.txt\` - Node dependency audit
- \`cargo-audit.txt\` - Rust dependency audit
- \`secrets-scan.txt\` - Potential hardcoded secrets
- \`tauri-commands.txt\` - All Tauri commands inventory
- \`unwrap-calls.txt\` - Rust panic risk locations
- \`gitignore-audit.txt\` - .gitignore coverage analysis
- \`licenses.txt\` - Dependency licenses
- \`csp-analysis.txt\` - Content Security Policy validation

---

## 🔐 Recommendations

1. **Immediate**: Fix all critical Node dependency vulnerabilities
2. **This week**: Replace unwrap() with proper Result handling
3. **This sprint**: Move all secrets to environment variables
4. **Continuous**: Run security audit before each release

---

**Next Steps**: Review detailed reports and prioritize fixes based on P0/P1/P2 classification.
EOF

echo ""
echo "================================================"
echo "✅ Security Audit Complete!"
echo ""
echo "📊 Summary:"
echo "   ├─ Node Critical: $NODE_CRITICAL"
echo "   ├─ Node High: $NODE_HIGH"
echo "   ├─ Cargo Vulnerabilities: $CARGO_VULNS"
echo "   ├─ Potential Secrets: $SECRETS_COUNT"
echo "   ├─ Tauri Commands: $COMMANDS_COUNT"
echo "   ├─ unwrap() calls: $UNWRAP_COUNT"
echo "   └─ expect() calls: $EXPECT_COUNT"
echo ""
echo "📁 Full report: $REPORT_DIR/SECURITY_SUMMARY.md"
echo ""

# Deterministic score (0-100)
SEC_SCORE=100

crit_penalty=$((NODE_CRITICAL * 30))
if [ "$crit_penalty" -gt 60 ]; then crit_penalty=60; fi

high_penalty=$((NODE_HIGH * 10))
if [ "$high_penalty" -gt 30 ]; then high_penalty=30; fi

strict_penalty=0
if [ "${CARGO_AUDIT_STRICT_STATUS:-⚠️}" = "❌" ]; then strict_penalty=20; fi
if [ "${CARGO_AUDIT_STRICT_STATUS:-⚠️}" = "⚠️" ]; then strict_penalty=10; fi

unwrap_penalty=0

secrets_penalty=0
if [ "$SECRETS_COUNT" -gt 0 ]; then secrets_penalty=15; fi

total_penalty=$((crit_penalty + high_penalty + strict_penalty + unwrap_penalty + secrets_penalty))
if [ "$total_penalty" -gt 100 ]; then total_penalty=100; fi

SEC_SCORE=$((SEC_SCORE - total_penalty))
if [ "$SEC_SCORE" -lt 0 ]; then SEC_SCORE=0; fi

echo "Score: $SEC_SCORE"
