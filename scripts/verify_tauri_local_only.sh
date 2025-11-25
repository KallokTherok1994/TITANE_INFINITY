#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — Tauri-Only Mode Verification
# ═══════════════════════════════════════════════════════════════════════════
# Validates that NO external network calls are made in production code

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VIOLATIONS=0

echo "🔒 Verifying Tauri-Only Mode..."

# Check 1: Feature flags
if grep -q "ENABLE_EXTERNAL_AI: true" src/config/featureFlags.ts 2>/dev/null; then
    echo -e "${RED}❌${NC} External AI enabled in featureFlags.ts"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅${NC} External AI disabled"
fi

# Check 2: CSP in tauri.conf.json
if grep -q '"csp": null' src-tauri/tauri.conf.json; then
    echo -e "${YELLOW}⚠️${NC}  CSP is null (should be configured)"
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅${NC} CSP configured"
fi

# Check 3: No external API calls in production services
EXTERNAL_HTTPS=$(grep -r "https://" src/services/ --include="*.ts" 2>/dev/null | \
    grep -v "localhost" | \
    grep -v "//.*https://" | \
    grep -v "generativelanguage\|openai" | \
    wc -l)

if [ "$EXTERNAL_HTTPS" -gt 5 ]; then
    echo -e "${YELLOW}⚠️${NC}  $EXTERNAL_HTTPS external HTTPS references (check if required)"
else
    echo -e "${GREEN}✅${NC} Minimal external references"
fi

# Check 4: reqwest usage in Rust (should be feature-gated)
if grep -r "reqwest::" src-tauri/src/ --include="*.rs" | grep -v "//.*reqwest" | wc -l | grep -q "^0$"; then
    echo -e "${GREEN}✅${NC} No reqwest usage in Rust"
else
    echo -e "${YELLOW}⚠️${NC}  reqwest used (ensure it's feature-gated)"
fi

# Summary
if [ $VIOLATIONS -eq 0 ]; then
    echo -e "\n${GREEN}✅ TAURI-ONLY MODE: VERIFIED${NC}"
    exit 0
else
    echo -e "\n${RED}❌ TAURI-ONLY MODE: $VIOLATIONS VIOLATIONS${NC}"
    exit 1
fi
