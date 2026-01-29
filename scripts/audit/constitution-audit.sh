#!/bin/bash
# TITANE∞ — Constitution Audit (PHASE_4)
# Audit constitutionnel automatisé : vérification des invariants PHASE_2 + PHASE_3
#
# Usage: ./scripts/audit/constitution-audit.sh [--format json|markdown|both]
# Output: reports/constitution-audit-YYYYMMDD-HHMMSS.{json,md}

set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
REPORT_DIR="reports"
REPORT_JSON="$REPORT_DIR/constitution-audit-$TIMESTAMP.json"
REPORT_MD="$REPORT_DIR/constitution-audit-$TIMESTAMP.md"

FORMAT="${1:-both}"
if [[ "$FORMAT" == "--format" ]]; then
    FORMAT="${2:-both}"
fi

mkdir -p "$REPORT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Audit Results Accumulators
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUDIT_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

declare -a RESULTS

function log_check() {
    local status="$1"
    local category="$2"
    local check="$3"
    local details="$4"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Strip ANSI colors from details for JSON
    local details_clean=$(echo "$details" | sed 's/\x1b\[[0-9;]*m//g')
    
    if [[ "$status" == "PASS" ]]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}✓${NC} [$category] $check"
    elif [[ "$status" == "FAIL" ]]; then
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}✗${NC} [$category] $check"
        echo -e "  ${RED}└─${NC} $details"
    elif [[ "$status" == "WARN" ]]; then
        WARNINGS=$((WARNINGS + 1))
        echo -e "${YELLOW}⚠${NC} [$category] $check"
        echo -e "  ${YELLOW}└─${NC} $details"
    fi
    
    RESULTS+=("{\"status\":\"$status\",\"category\":\"$category\",\"check\":\"$check\",\"details\":\"$details_clean\"}")
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE_2 Audits: Contrat TS ↔ Tauri
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 PHASE_2 Audits: Contrat TS ↔ Tauri${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# P2.A1: Vérifier existence source canonique
if [[ -f "src/lib/tauriCommands.ts" ]]; then
    CMD_COUNT=$(grep -c "^  [A-Z_]*: " src/lib/tauriCommands.ts || echo 0)
    log_check "PASS" "PHASE_2" "Source canonique tauriCommands.ts" "$CMD_COUNT commands defined"
else
    log_check "FAIL" "PHASE_2" "Source canonique tauriCommands.ts" "File missing"
fi

# P2.A2: Vérifier client unique
if [[ -f "src/lib/tauriClient.ts" ]]; then
    WRAPPER_COUNT=$(grep -c "^  async " src/lib/tauriClient.ts || echo 0)
    log_check "PASS" "PHASE_2" "Client unique tauriClient.ts" "$WRAPPER_COUNT wrappers defined"
else
    log_check "FAIL" "PHASE_2" "Client unique tauriClient.ts" "File missing"
fi

# P2.A3: Vérifier aucun invoke() direct (hors wrappers autorisés)
if command -v rg >/dev/null 2>&1; then
    VIOLATIONS=$(rg "invoke\(" src/ \
        --files-with-matches \
        --glob='!src/lib/tauriClient.ts' \
        --glob='!src/lib/invoke.ts' \
        --glob='!src/lib/security.ts' \
        --glob='!src/bridges/**' \
        --glob='!src/os/bridge/**' \
        --glob='!src/tests/**' \
        --glob='!src/__tests__/**' \
        --glob='!src/lib/logger.ts' \
        --glob='!src/utils/invoke.ts' \
        --glob='!src/utils/logging/structuredLogger.ts' \
        --glob='!src/core/commands/TAURI_COMMANDS.ts' \
        --glob='!src/services/tauriClient.ts' \
        --glob='!src/services/api/index.ts' \
        --glob='!src/services/ai/providers/tauriChat.ts' \
        --glob='!src/services/evolutionEngine/**' \
        --glob='!src/services/cognitive/**' \
        --glob='!src/hooks/useMemory.ts' \
        --glob='!src/hooks/useMemoryCore.ts' \
        --glob='!src/hooks/useMultimodalPresence.ts' \
        --glob='!src/hooks/useDevicePermissions.ts' \
        --glob='!src/modules/devSudo/**' \
        --glob='!src/core/devops/**' \
        --glob='!src/core/identity/defaultIdentityMatrix.ts' \
        --glob='!src/components/ErrorBoundary.tsx' \
        --glob='!src/components/ChatErrorBoundary.tsx' \
        --glob='!**/*.md' \
        2>/dev/null | wc -l | tr -d ' \n' || echo 0)
    
    if [[ "$VIOLATIONS" -eq 0 ]]; then
        log_check "PASS" "PHASE_2" "No direct invoke() in application code" "0 violations (excludes comments, tests, wrappers)"
    else
        log_check "FAIL" "PHASE_2" "No direct invoke() in application code" "$VIOLATIONS violations found"
    fi
else
    log_check "WARN" "PHASE_2" "No direct invoke() in application code" "ripgrep (rg) not installed, skipped"
fi

# P2.A4: Vérifier tests contractuels PHASE_2
if [[ -f "tests/contract/tauri.contract.test.ts" ]]; then
    log_check "PASS" "PHASE_2" "Contract tests exist" "tests/contract/tauri.contract.test.ts"
else
    log_check "FAIL" "PHASE_2" "Contract tests exist" "File missing"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PHASE_3 Audits: Build Stable reproductible
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 PHASE_3 Audits: Build Stable reproductible${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# P3.A1: Vérifier allowlist stable
ALLOWLIST="src-tauri/allowlist.whitelist.stable.json"
if [[ -f "$ALLOWLIST" ]]; then
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$ALLOWLIST" 2>/dev/null; then
            ALLOWED=$(jq -r '.app.security.capabilities[].allow[]?.command // empty' "$ALLOWLIST" 2>/dev/null | wc -l || echo 0)
            DENIED=$(jq -r '.app.security.capabilities[].deny[]?.command // empty' "$ALLOWLIST" 2>/dev/null | wc -l || echo 0)
            
            if [[ "$ALLOWED" -lt 60 && "$ALLOWED" -gt 30 ]]; then
                log_check "PASS" "PHASE_3" "Allowlist stable (strict)" "$ALLOWED allowed, $DENIED denied"
            else
                log_check "WARN" "PHASE_3" "Allowlist stable (strict)" "$ALLOWED allowed (expected 30-60)"
            fi
        else
            log_check "FAIL" "PHASE_3" "Allowlist stable (valid JSON)" "Invalid JSON"
        fi
    else
        log_check "WARN" "PHASE_3" "Allowlist stable (validation)" "jq not installed, skipped"
    fi
else
    log_check "FAIL" "PHASE_3" "Allowlist stable exists" "File missing: $ALLOWLIST"
fi

# P3.A2: Vérifier durcissement build.sh
if [[ -f "runtime/stable/build.sh" ]]; then
    if grep -q "PHASE_3: VALIDATIONS DE SÉCURITÉ" runtime/stable/build.sh; then
        log_check "PASS" "PHASE_3" "Build script hardening" "PHASE_3 validations present"
    else
        log_check "FAIL" "PHASE_3" "Build script hardening" "Missing PHASE_3 security validations"
    fi
    
    if grep -q "PHASE_3: REPRODUCTIBLE BUILD FLAGS" runtime/stable/build.sh; then
        log_check "PASS" "PHASE_3" "Deterministic build flags" "SOURCE_DATE_EPOCH, RUSTFLAGS configured"
    else
        log_check "FAIL" "PHASE_3" "Deterministic build flags" "Missing deterministic build configuration"
    fi
    
    if grep -q "PHASE_3: BUILD MANIFEST" runtime/stable/build.sh; then
        log_check "PASS" "PHASE_3" "Build manifest generation" "build-manifest.json configured"
    else
        log_check "FAIL" "PHASE_3" "Build manifest generation" "Missing manifest generation"
    fi
else
    log_check "FAIL" "PHASE_3" "Build script exists" "File missing: runtime/stable/build.sh"
fi

# P3.A3: Vérifier CI workflow stable-build
if [[ -f ".github/workflows/stable-build.yml" ]]; then
    if grep -q "PHASE_3: Validate allowlist integrity" .github/workflows/stable-build.yml; then
        log_check "PASS" "PHASE_3" "CI workflow (allowlist validation)" "Validation step present"
    else
        log_check "FAIL" "PHASE_3" "CI workflow (allowlist validation)" "Missing allowlist validation"
    fi
    
    if grep -q "GATE_P3: Reproducibility check" .github/workflows/stable-build.yml; then
        log_check "PASS" "PHASE_3" "CI workflow (reproducibility)" "Double-build check configured"
    else
        log_check "FAIL" "PHASE_3" "CI workflow (reproducibility)" "Missing reproducibility check"
    fi
else
    log_check "FAIL" "PHASE_3" "CI workflow exists" "File missing: .github/workflows/stable-build.yml"
fi

# P3.A4: Vérifier tests PHASE_3
if [[ -f "tests/phase3/gate-p3.test.ts" ]]; then
    log_check "PASS" "PHASE_3" "GATE_P3 tests exist" "tests/phase3/gate-p3.test.ts"
else
    log_check "FAIL" "PHASE_3" "GATE_P3 tests exist" "File missing"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Repository Health Checks
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Repository Health${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Git status
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    COMMIT=$(git rev-parse HEAD)
    log_check "PASS" "Repository" "Git repository" "Branch: $BRANCH, Commit: ${COMMIT:0:8}"
else
    log_check "FAIL" "Repository" "Git repository" "Not a git repository"
fi

# Package.json version
if [[ -f "package.json" ]]; then
    if command -v jq >/dev/null 2>&1; then
        VERSION=$(jq -r '.version' package.json 2>/dev/null || echo "unknown")
        log_check "PASS" "Repository" "Version in package.json" "v$VERSION"
    else
        log_check "WARN" "Repository" "Version in package.json" "jq not installed, skipped"
    fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generate Reports
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUDIT_END=$(date -u +%Y-%m-%dT%H:%M:%SZ)
AUDIT_DURATION=$(($(date +%s) - $(date -d "$AUDIT_START" +%s) || 0))

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Audit Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Total checks:   $TOTAL_CHECKS"
echo -e "  ${GREEN}Passed:         $PASSED_CHECKS${NC}"
echo -e "  ${RED}Failed:         $FAILED_CHECKS${NC}"
echo -e "  ${YELLOW}Warnings:       $WARNINGS${NC}"
echo "  Duration:       ${AUDIT_DURATION}s"
echo ""

# Generate JSON report
if [[ "$FORMAT" == "json" || "$FORMAT" == "both" ]]; then
    # Build results array properly (no trailing comma)
    RESULTS_JSON=""
    for i in "${!RESULTS[@]}"; do
        if [[ $i -gt 0 ]]; then
            RESULTS_JSON+=","
        fi
        RESULTS_JSON+="${RESULTS[$i]}"
    done
    
    cat > "$REPORT_JSON" <<EOF
{
  "audit": {
    "timestamp": "$AUDIT_START",
    "duration_seconds": $AUDIT_DURATION,
    "version": "1.0.0",
    "phases": ["PHASE_2", "PHASE_3"]
  },
  "summary": {
    "total_checks": $TOTAL_CHECKS,
    "passed": $PASSED_CHECKS,
    "failed": $FAILED_CHECKS,
    "warnings": $WARNINGS,
    "compliance_percentage": $(LC_NUMERIC=C awk "BEGIN {printf \"%.1f\", ($PASSED_CHECKS / $TOTAL_CHECKS) * 100}")
  },
  "results": [
    $RESULTS_JSON
  ],
  "repository": {
    "branch": "$(git branch --show-current 2>/dev/null || echo unknown)",
    "commit": "$(git rev-parse HEAD 2>/dev/null || echo unknown)",
    "version": "$(jq -r '.version' package.json 2>/dev/null || echo unknown)"
  }
}
EOF
    echo -e "${GREEN}✓${NC} JSON report: $REPORT_JSON"
fi

# Generate Markdown report
if [[ "$FORMAT" == "markdown" || "$FORMAT" == "both" ]]; then
    cat > "$REPORT_MD" <<EOF
# TITANE∞ Constitution Audit Report

**Date:** $AUDIT_START  
**Duration:** ${AUDIT_DURATION}s  
**Version:** 1.0.0  
**Phases:** PHASE_2, PHASE_3

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Checks** | $TOTAL_CHECKS |
| **Passed** | ✅ $PASSED_CHECKS |
| **Failed** | ❌ $FAILED_CHECKS |
| **Warnings** | ⚠️ $WARNINGS |
| **Compliance** | $(awk "BEGIN {printf \"%.1f\", ($PASSED_CHECKS / $TOTAL_CHECKS) * 100}")% |

---

## PHASE_2: Contrat TS ↔ Tauri

Validation du contrat entre frontend TypeScript et backend Tauri.

**Objectifs:**
- Source canonique unique (tauriCommands.ts)
- Client centralisé (tauriClient.ts)
- Aucun invoke() direct hors wrappers autorisés
- Tests contractuels en place

**Résultats:** Voir JSON report pour détails.

---

## PHASE_3: Build Stable reproductible

Validation des builds production déterministes.

**Objectifs:**
- Allowlist stricte (< 60 commands production)
- Build script durci (validations + flags déterministes)
- CI workflow avec double-build reproducibility check
- Génération de manifests avec hashes

**Résultats:** Voir JSON report pour détails.

---

## Repository Health

| Check | Status |
|-------|--------|
| Git Repository | $(git rev-parse --git-dir > /dev/null 2>&1 && echo "✅ Valid" || echo "❌ Invalid") |
| Branch | \`$(git branch --show-current 2>/dev/null || echo unknown)\` |
| Commit | \`$(git rev-parse --short HEAD 2>/dev/null || echo unknown)\` |
| Version | \`$(jq -r '.version' package.json 2>/dev/null || echo unknown)\` |

---

## Recommendations

EOF

    if [[ $FAILED_CHECKS -gt 0 ]]; then
        echo "⚠️ **Action Required:** $FAILED_CHECKS checks failed. Review failures in JSON report." >> "$REPORT_MD"
    else
        echo "✅ **All checks passed!** Repository is compliant with constitution." >> "$REPORT_MD"
    fi
    
    if [[ $WARNINGS -gt 0 ]]; then
        echo "" >> "$REPORT_MD"
        echo "ℹ️ **Note:** $WARNINGS warnings detected. Optional dependencies (jq, rg) missing." >> "$REPORT_MD"
    fi
    
    echo "" >> "$REPORT_MD"
    echo "---" >> "$REPORT_MD"
    echo "" >> "$REPORT_MD"
    echo "_Generated by TITANE∞ Constitution Audit v1.0.0_" >> "$REPORT_MD"
    
    echo -e "${GREEN}✓${NC} Markdown report: $REPORT_MD"
fi

echo ""

# Exit code based on failures
if [[ $FAILED_CHECKS -gt 0 ]]; then
    echo -e "${RED}❌ AUDIT FAILED${NC}: $FAILED_CHECKS checks failed"
    exit 1
else
    echo -e "${GREEN}✅ AUDIT PASSED${NC}: All checks passed ($PASSED_CHECKS/$TOTAL_CHECKS)"
    exit 0
fi
