#!/usr/bin/env bash
#
# TITANE∞ — PHASE_5 : Health Check (BLOC A)
# Vérifie l'état de santé du système (< 2s, aucun effet de bord)
#
# Usage: bash scripts/health/health_check.sh [--format json|text|both]
#

set -euo pipefail

# Configuration
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
FORMAT="${1:---format}"
FORMAT="${2:-both}"

# Sorties
EVIDENCE_DIR="docs/_evidence/health"
mkdir -p "$EVIDENCE_DIR"
JSON_OUT="$EVIDENCE_DIR/latest.json"
TXT_OUT="$EVIDENCE_DIR/latest.txt"

# Accumulateurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0
declare -a RESULTS

# Couleurs (désactivables)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' NC=''
fi

# Fonction d'accumulation résultat
function log_check() {
    local status="$1"    # PASS / FAIL / WARN
    local category="$2"
    local check="$3"
    local details="$4"
    
    # Nettoyage ANSI pour JSON
    local details_clean=$(echo "$details" | sed 's/\x1b\[[0-9;]*m//g' | tr '\n' ' ' | sed 's/  */ /g')
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    case "$status" in
        PASS)
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            echo -e "${GREEN}✓${NC} [$category] $check"
            ;;
        FAIL)
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            echo -e "${RED}✗${NC} [$category] $check: $details"
            ;;
        WARN)
            WARNINGS=$((WARNINGS + 1))
            echo -e "${YELLOW}⚠${NC} [$category] $check: $details"
            ;;
    esac
    
    # Accumulation JSON
    RESULTS+=("{\"status\":\"$status\",\"category\":\"$category\",\"check\":\"$check\",\"details\":\"$details_clean\"}")
}

# ========================================
# CHECKS : TOOLCHAIN
# ========================================

echo -e "${BLUE}=== PHASE_5 Health Check ===${NC}"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check Node version
NODE_VERSION=$(node --version 2>/dev/null || echo "NOT_FOUND")
if [[ "$NODE_VERSION" =~ ^v2[0-9]\. ]]; then
    log_check "PASS" "Toolchain" "Node.js version" "$NODE_VERSION"
else
    log_check "FAIL" "Toolchain" "Node.js version" "Expected v20+, got $NODE_VERSION"
fi

# Check pnpm
PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "NOT_FOUND")
if [[ "$PNPM_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_check "PASS" "Toolchain" "pnpm available" "$PNPM_VERSION"
else
    log_check "FAIL" "Toolchain" "pnpm available" "pnpm not found"
fi

# Check Rust
RUST_VERSION=$(rustc --version 2>/dev/null | awk '{print $2}' || echo "NOT_FOUND")
if [[ "$RUST_VERSION" != "NOT_FOUND" ]]; then
    log_check "PASS" "Toolchain" "Rust available" "$RUST_VERSION"
else
    log_check "FAIL" "Toolchain" "Rust available" "rustc not found"
fi

# ========================================
# CHECKS : FICHIERS CRITIQUES
# ========================================

# Configs Tauri (structure réelle du repo)
CRITICAL_FILES=(
    "src-tauri/tauri.conf.json"
    "runtime/stable/tauri.stable.conf.json"
    "runtime/dev/tauri.dev.conf.json"
    "src-tauri/allowlist.whitelist.stable.json"
    "runtime/stable/build.sh"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log_check "PASS" "Critical Files" "$file exists" "$(stat -c %s "$file") bytes"
    else
        log_check "FAIL" "Critical Files" "$file exists" "File missing"
    fi
done

# Build manifest (si build stable déjà fait)
if [[ -f "runtime/stable/build-manifest.json" ]]; then
    log_check "PASS" "Critical Files" "build-manifest.json" "Present"
else
    log_check "WARN" "Critical Files" "build-manifest.json" "Not present (no stable build yet)"
fi

# ========================================
# CHECKS : FICHIERS INTERDITS
# ========================================

# .env avec secrets réels (API keys, tokens, passwords)
# Cherche clés non-vides pour variables sensibles
FORBIDDEN_ENV=0
SECRET_PATTERNS="(API_KEY|TOKEN|PASSWORD|SECRET|PRIVATE_KEY)="
while IFS= read -r envfile; do
    [[ -f "$envfile" ]] || continue
    # Compter lignes avec secrets réels (key=valeur non-vide, non localhost/example)
    REAL_SECRETS=$(grep -vE '^#|^[[:space:]]*$' "$envfile" | \
                   grep -E "$SECRET_PATTERNS" | \
                   grep -vE '(=\s*$|=http://localhost|=example|=test|=YOUR_)' | \
                   wc -l | tr -d ' \n' || echo "0")
    if [[ "$REAL_SECRETS" -gt 0 ]]; then
        FORBIDDEN_ENV=$((FORBIDDEN_ENV + 1))
    fi
done < <(find . -maxdepth 3 -type f -name '.env' ! -name '*.example' ! -path './actions-runner/*' 2>/dev/null || true)

if [[ "$FORBIDDEN_ENV" -eq 0 ]]; then
    log_check "PASS" "Security" "No .env secrets" "0 files with real API keys/tokens"
else
    log_check "FAIL" "Security" "No .env secrets" "$FORBIDDEN_ENV files with real secrets"
fi

# Tunnels dans stable (cloudflared, ngrok, etc.)
TUNNEL_MARKERS=$(grep -r "cloudflared\|ngrok\|tunnel" runtime/stable/ 2>/dev/null | wc -l | tr -d ' \n' || echo "0")
if [[ "$TUNNEL_MARKERS" -eq 0 ]]; then
    log_check "PASS" "Security" "No tunnels in stable" "0 markers"
else
    log_check "WARN" "Security" "No tunnels in stable" "$TUNNEL_MARKERS markers found"
fi

# ========================================
# CHECKS : CI WORKFLOWS
# ========================================

CI_WORKFLOWS=(
    ".github/workflows/stable-build.yml"
    ".github/workflows/constitution-audit.yml"
)

for workflow in "${CI_WORKFLOWS[@]}"; do
    if [[ -f "$workflow" ]]; then
        log_check "PASS" "CI/CD" "$(basename "$workflow")" "Present"
    else
        log_check "FAIL" "CI/CD" "$(basename "$workflow")" "Workflow missing"
    fi
done

# ========================================
# CHECKS : TESTS CONTRACTUELS
# ========================================

CONTRACT_TESTS=(
    "tests/contract/tauri.contract.test.ts"
    "tests/phase3/gate-p3.test.ts"
    "tests/phase4/gate-p4.test.ts"
)

for test in "${CONTRACT_TESTS[@]}"; do
    if [[ -f "$test" ]]; then
        log_check "PASS" "Tests" "$(basename "$test")" "Present"
    else
        log_check "FAIL" "Tests" "$(basename "$test")" "Test file missing"
    fi
done

# ========================================
# GÉNÉRATION RAPPORTS
# ========================================

# Calcul compliance
if [[ "$TOTAL_CHECKS" -gt 0 ]]; then
    COMPLIANCE=$(LC_NUMERIC=C awk "BEGIN {printf \"%.1f\", ($PASSED_CHECKS / $TOTAL_CHECKS) * 100}")
else
    COMPLIANCE="0.0"
fi

# Status global
if [[ "$FAILED_CHECKS" -eq 0 ]]; then
    OVERALL_STATUS="HEALTHY"
    STATUS_COLOR="$GREEN"
else
    OVERALL_STATUS="UNHEALTHY"
    STATUS_COLOR="$RED"
fi

# Affichage résumé
echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Total checks:   $TOTAL_CHECKS"
echo -e "Passed:         ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:         ${RED}$FAILED_CHECKS${NC}"
echo -e "Warnings:       ${YELLOW}$WARNINGS${NC}"
echo -e "Compliance:     ${COMPLIANCE}%"
echo -e "Status:         ${STATUS_COLOR}${OVERALL_STATUS}${NC}"

# ========================================
# GÉNÉRATION JSON
# ========================================

if [[ "$FORMAT" == "json" || "$FORMAT" == "both" ]]; then
    # Construction array results
    RESULTS_JSON=""
    for i in "${!RESULTS[@]}"; do
        [[ $i -gt 0 ]] && RESULTS_JSON+=","
        RESULTS_JSON+="${RESULTS[$i]}"
    done
    
    cat > "$JSON_OUT" <<EOF
{
  "health": {
    "timestamp": "$TIMESTAMP",
    "status": "$OVERALL_STATUS",
    "version": "1.0.0"
  },
  "summary": {
    "total_checks": $TOTAL_CHECKS,
    "passed": $PASSED_CHECKS,
    "failed": $FAILED_CHECKS,
    "warnings": $WARNINGS,
    "compliance_percentage": $COMPLIANCE
  },
  "results": [$RESULTS_JSON],
  "system": {
    "node_version": "$NODE_VERSION",
    "pnpm_version": "$PNPM_VERSION",
    "rust_version": "$RUST_VERSION"
  }
}
EOF
    echo ""
    echo "JSON report: $JSON_OUT"
fi

# ========================================
# GÉNÉRATION TEXT
# ========================================

if [[ "$FORMAT" == "text" || "$FORMAT" == "both" ]]; then
    cat > "$TXT_OUT" <<EOF
TITANE∞ — PHASE_5 Health Check Report
======================================

Timestamp: $TIMESTAMP
Status:    $OVERALL_STATUS

Summary
-------
Total checks:   $TOTAL_CHECKS
Passed:         $PASSED_CHECKS
Failed:         $FAILED_CHECKS
Warnings:       $WARNINGS
Compliance:     ${COMPLIANCE}%

System Info
-----------
Node.js:  $NODE_VERSION
pnpm:     $PNPM_VERSION
Rust:     $RUST_VERSION

Detailed Results
----------------
EOF
    
    # Append results
    for i in "${!RESULTS[@]}"; do
        RESULT="${RESULTS[$i]}"
        STATUS=$(echo "$RESULT" | jq -r '.status')
        CATEGORY=$(echo "$RESULT" | jq -r '.category')
        CHECK=$(echo "$RESULT" | jq -r '.check')
        DETAILS=$(echo "$RESULT" | jq -r '.details')
        
        case "$STATUS" in
            PASS) SYMBOL="✓" ;;
            FAIL) SYMBOL="✗" ;;
            WARN) SYMBOL="⚠" ;;
        esac
        
        echo "$SYMBOL [$CATEGORY] $CHECK: $DETAILS" >> "$TXT_OUT"
    done
    
    echo "" >> "$TXT_OUT"
    echo "Generated: $TIMESTAMP" >> "$TXT_OUT"
    
    echo "Text report: $TXT_OUT"
fi

# Exit code
if [[ "$FAILED_CHECKS" -eq 0 ]]; then
    exit 0
else
    exit 1
fi
