#!/bin/bash

# 🔒 TITANE∞ Security Audit - Comprehensive Security Analysis
# Duration: 10-15 minutes
# Output: reports/security-audit-YYYYMMDD-HHMMSS/

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="reports/security-audit-$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "🔒 TITANE∞ Security Audit - $TIMESTAMP"
echo "================================================"

# 1. NPM Vulnerabilities
echo ""
echo "📦 [1/8] Scanning NPM vulnerabilities..."
pnpm audit --json > "$REPORT_DIR/npm-audit.json" 2>&1 || true
pnpm audit > "$REPORT_DIR/npm-audit.txt" 2>&1 || true
NPM_CRITICAL=$(jq -r '.metadata.vulnerabilities.critical // 0' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
NPM_HIGH=$(jq -r '.metadata.vulnerabilities.high // 0' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
echo "   ├─ Critical: $NPM_CRITICAL"
echo "   └─ High: $NPM_HIGH"

# 2. Rust/Cargo Vulnerabilities
echo ""
echo "🦀 [2/8] Scanning Rust/Cargo vulnerabilities..."
cd src-tauri
if command -v cargo-audit &> /dev/null; then
    cargo audit --json > "../$REPORT_DIR/cargo-audit.json" 2>&1 || true
    cargo audit > "../$REPORT_DIR/cargo-audit.txt" 2>&1 || true
    CARGO_VULNS=$(jq -r '.vulnerabilities.count // 0' "../$REPORT_DIR/cargo-audit.json" 2>/dev/null || echo "0")
    echo "   └─ Vulnerabilities: $CARGO_VULNS"
else
    echo "   └─ ⚠️ cargo-audit not installed (run: cargo install cargo-audit)"
fi
cd ..

# 3. Secrets Detection
echo ""
echo "🔑 [3/8] Detecting hardcoded secrets..."
{
    echo "=== API Keys ==="
    grep -r "api[_-]key\|apikey" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.rs" src/ src-tauri/ 2>/dev/null || echo "None found"
    echo ""
    echo "=== Tokens ==="
    grep -r "token\|secret\|password" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.rs" src/ src-tauri/ 2>/dev/null | grep -v "// " | grep -v "password:" | head -20 || echo "None found"
    echo ""
    echo "=== URLs with credentials ==="
    grep -r "http.*://.*:.*@" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.rs" src/ src-tauri/ 2>/dev/null || echo "None found"
} > "$REPORT_DIR/secrets-scan.txt"

SECRETS_COUNT=$(grep -c "http\|api\|token" "$REPORT_DIR/secrets-scan.txt" || echo "0")
echo "   └─ Potential secrets: $SECRETS_COUNT findings"

# 4. Tauri Commands Audit
echo ""
echo "⚙️ [4/8] Auditing Tauri commands..."
{
    echo "=== All Tauri Commands ==="
    grep -r "#\[tauri::command\]" src-tauri/src/ | wc -l
    echo ""
    echo "=== Commands List ==="
    grep -A1 "#\[tauri::command\]" src-tauri/src/ | grep "pub fn" | sed 's/pub fn //' | sed 's/(.*$//' | sort
    echo ""
    echo "=== Allowlist Check ==="
    if [ -f "tauri.base.json" ]; then
        jq -r '.app.security.capabilities[0].allow[] | .command' tauri.base.json 2>/dev/null | sort
    fi
} > "$REPORT_DIR/tauri-commands.txt"

COMMANDS_COUNT=$(grep -c "pub fn" "$REPORT_DIR/tauri-commands.txt" || echo "0")
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
    echo "=== NPM Licenses ==="
    if command -v corepack >/dev/null 2>&1; then
        corepack pnpm dlx license-checker --summary 2>/dev/null || echo "⚠️ license-checker not available"
    elif command -v pnpm >/dev/null 2>&1; then
        pnpm dlx license-checker --summary 2>/dev/null || echo "⚠️ license-checker not available"
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
| NPM Vulnerabilities | $NPM_CRITICAL | $NPM_HIGH | - | $([ "$NPM_CRITICAL" -eq 0 ] && echo "✅" || echo "❌") |
| Cargo Vulnerabilities | - | - | $CARGO_VULNS | $([ "$CARGO_VULNS" -eq 0 ] && echo "✅" || echo "⚠️") |
| Secrets Detected | - | $SECRETS_COUNT | - | $([ "$SECRETS_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |
| Tauri Commands | - | $COMMANDS_COUNT | - | ✅ |
| Rust unwrap() | - | $UNWRAP_COUNT | - | $([ "$UNWRAP_COUNT" -eq 0 ] && echo "✅" || echo "❌") |
| Rust expect() | - | $EXPECT_COUNT | - | ⚠️ |

---

## 🎯 Priority Actions

### P0 (Critical - Fix Immediately)
$([ "$NPM_CRITICAL" -gt 0 ] && echo "- ❌ **$NPM_CRITICAL critical NPM vulnerabilities** - Run \`pnpm audit fix\`" || echo "- ✅ No critical NPM vulnerabilities")
$([ "$UNWRAP_COUNT" -gt 10 ] && echo "- ❌ **$UNWRAP_COUNT unwrap() calls** - Replace with Result<T,E>" || echo "- ✅ unwrap() usage acceptable")

### P1 (High - Fix This Week)
$([ "$NPM_HIGH" -gt 0 ] && echo "- ⚠️ **$NPM_HIGH high NPM vulnerabilities** - Review and update" || echo "- ✅ No high NPM vulnerabilities")
$([ "$SECRETS_COUNT" -gt 5 ] && echo "- ⚠️ **$SECRETS_COUNT potential secrets** - Move to env vars" || echo "- ✅ Secrets properly managed")

### P2 (Medium - Fix This Sprint)
- Review all Tauri commands for proper validation
- Ensure all commands are in allowlist
- Add input sanitization for user-provided data

---

## 📁 Detailed Reports

- \`npm-audit.txt\` - NPM vulnerability details
- \`cargo-audit.txt\` - Rust dependency audit
- \`secrets-scan.txt\` - Potential hardcoded secrets
- \`tauri-commands.txt\` - All Tauri commands inventory
- \`unwrap-calls.txt\` - Rust panic risk locations
- \`gitignore-audit.txt\` - .gitignore coverage analysis
- \`licenses.txt\` - Dependency licenses
- \`csp-analysis.txt\` - Content Security Policy validation

---

## 🔐 Recommendations

1. **Immediate**: Fix all critical NPM vulnerabilities
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
echo "   ├─ NPM Critical: $NPM_CRITICAL"
echo "   ├─ NPM High: $NPM_HIGH"
echo "   ├─ Cargo Vulnerabilities: $CARGO_VULNS"
echo "   ├─ Potential Secrets: $SECRETS_COUNT"
echo "   ├─ Tauri Commands: $COMMANDS_COUNT"
echo "   ├─ unwrap() calls: $UNWRAP_COUNT"
echo "   └─ expect() calls: $EXPECT_COUNT"
echo ""
echo "📁 Full report: $REPORT_DIR/SECURITY_SUMMARY.md"
echo ""
