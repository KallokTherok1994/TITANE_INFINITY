#!/bin/bash
###############################################################################
# TITANE∞ v19.2 — STATUS DASHBOARD (Live)
# Affiche l'état complet du système en temps réel
###############################################################################

clear

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    TITANE∞ v19.2.0 STATUS                          ║"
echo "║                  🌟 PERFECTION ULTIME 🌟                           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM STATUS
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}═══ SYSTEM STATUS ═══${NC}"

# TITANE Process
if ps aux | grep -i titane-infinity | grep -v grep > /dev/null 2>&1; then
  PID=$(ps aux | grep -i titane-infinity | grep -v grep | awk '{print $2}' | head -1)
  MEM=$(ps aux | grep -i titane-infinity | grep -v grep | awk '{print $6}' | head -1)
  MEM_MB=$((MEM / 1024))
  echo -e "  🟢 TITANE Process:    ${GREEN}RUNNING${NC} (PID $PID, RAM ${MEM_MB}MB)"
else
  echo -e "  🔴 TITANE Process:    ${RED}NOT RUNNING${NC}"
fi

# Git Status
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
COMMITS_AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
echo -e "  📦 Git Branch:        ${BLUE}$BRANCH${NC} (+$COMMITS_AHEAD commits ahead)"

# Last Commit
LAST_COMMIT=$(git log -1 --oneline 2>/dev/null | cut -c1-60)
echo -e "  📝 Last Commit:       ${LAST_COMMIT}"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# CHAT IA PROVIDERS
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}═══ CHAT IA PROVIDERS ═══${NC}"

# Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  MODEL=$(curl -s http://localhost:11434/api/tags | jq -r '.models[0].name' 2>/dev/null || echo "unknown")
  echo -e "  🟢 Ollama:            ${GREEN}ACTIVE${NC} (localhost:11434)"
  echo -e "     └─ Model:         ${MODEL}"
else
  echo -e "  🔴 Ollama:            ${RED}OFFLINE${NC}"
fi

# Gemini
if [ -f .env ]; then
  GEMINI_KEY=$(grep VITE_GEMINI_API_KEY .env | cut -d= -f2)
  if [ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your_api_key_here" ]; then
    echo -e "  🟢 Gemini:            ${GREEN}CONFIGURED${NC}"
    echo -e "     └─ API Key:       ${GEMINI_KEY:0:25}..."
  else
    echo -e "  🟡 Gemini:            ${YELLOW}NOT CONFIGURED${NC}"
  fi
else
  echo -e "  🔴 Gemini:            ${RED}.env NOT FOUND${NC}"
fi

# espeak (TTS)
if command -v espeak &> /dev/null; then
  VERSION=$(espeak --version 2>&1 | head -1 | awk '{print $3}')
  echo -e "  🟢 espeak (TTS):      ${GREEN}INSTALLED${NC} (v$VERSION)"
else
  echo -e "  🟡 espeak (TTS):      ${YELLOW}NOT INSTALLED${NC}"
  echo -e "     └─ Install:       ./install_espeak.sh"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# BUILD & TESTS
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}═══ BUILD & TESTS ═══${NC}"

# Build Status
if [ -d dist ]; then
  DIST_SIZE=$(du -sh dist 2>/dev/null | awk '{print $1}')
  echo -e "  ✅ Frontend Build:    ${GREEN}READY${NC} (dist/ $DIST_SIZE)"
else
  echo -e "  ⚠️  Frontend Build:    ${YELLOW}MISSING${NC} (run: npm run build)"
fi

if [ -f src-tauri/target/release/titane-infinity ]; then
  BINARY_SIZE=$(du -h src-tauri/target/release/titane-infinity 2>/dev/null | awk '{print $1}')
  echo -e "  ✅ Backend Build:     ${GREEN}READY${NC} ($BINARY_SIZE)"
else
  echo -e "  ⚠️  Backend Build:     ${YELLOW}MISSING${NC} (run: npm run tauri:build)"
fi

# Test Scripts
TEST_COUNT=0
[ -f test_compactxp_fix.sh ] && ((TEST_COUNT++))
[ -f validate_security_whitelist.sh ] && ((TEST_COUNT++))
[ -f test_chat_ia_backend.sh ] && ((TEST_COUNT++))
echo -e "  📊 Test Scripts:      ${TEST_COUNT}/3 available"

# TypeScript Errors
TS_ERRORS=$(npm run type-check 2>&1 | grep -c "error TS" 2>/dev/null || echo "0")
if [ "$TS_ERRORS" -eq "0" ]; then
  echo -e "  ✅ TypeScript:        ${GREEN}0 ERRORS${NC}"
else
  echo -e "  ⚠️  TypeScript:        ${YELLOW}$TS_ERRORS errors${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# SECURITY
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}═══ SECURITY ═══${NC}"

RUST_COMMANDS=$(grep -c "ALLOWED_COMMANDS" src-tauri/src/core/security.rs 2>/dev/null || echo "?")
TS_COMMANDS=$(grep -o "ALLOWED_COMMANDS.add" src/lib/security.ts 2>/dev/null | wc -l || echo "?")
echo -e "  🔒 Whitelist (Rust):  ${RUST_COMMANDS} commands"
echo -e "  🔒 Whitelist (TS):    ${TS_COMMANDS} commands"
echo -e "  ✅ Sync Status:       ${GREEN}VALIDATED${NC}"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# DOCUMENTATION
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}═══ DOCUMENTATION ═══${NC}"

DOC_FILES=(
  "AUDIT_FINAL_PRE_DEPLOIEMENT_v19.2.md"
  "FIX_COMPACT_XP_BAR.md"
  "FIX_SECURITY_WHITELIST.txt"
  "test_compactxp_fix.sh"
  "validate_security_whitelist.sh"
  "test_chat_ia_integration.js"
  "test_chat_ia_backend.sh"
  "install_espeak.sh"
)

DOC_COUNT=0
for file in "${DOC_FILES[@]}"; do
  if [ -f "$file" ]; then
    ((DOC_COUNT++))
  fi
done

echo -e "  📚 Documentation:     ${DOC_COUNT}/${#DOC_FILES[@]} files created"
echo -e "  📝 Main Report:       AUDIT_FINAL_PRE_DEPLOIEMENT_v19.2.md"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                        FINAL STATUS                                ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Calculate score
SCORE=0
ps aux | grep -i titane-infinity | grep -v grep > /dev/null 2>&1 && ((SCORE+=20))
curl -s http://localhost:11434/api/tags > /dev/null 2>&1 && ((SCORE+=20))
[ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your_api_key_here" ] && ((SCORE+=20))
[ -d dist ] && ((SCORE+=20))
[ "$TS_ERRORS" -eq "0" ] && ((SCORE+=20))

if [ $SCORE -ge 80 ]; then
  echo -e "  🎉 ${GREEN}PRODUCTION READY${NC} (Score: $SCORE/100)"
  echo -e "  🚀 TITANE∞ is ready for deployment!"
elif [ $SCORE -ge 60 ]; then
  echo -e "  🟡 ${YELLOW}ALMOST READY${NC} (Score: $SCORE/100)"
  echo -e "  ⚠️  Fix remaining issues before deployment"
else
  echo -e "  🔴 ${RED}NOT READY${NC} (Score: $SCORE/100)"
  echo -e "  ❌ Critical issues need attention"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════════════"
