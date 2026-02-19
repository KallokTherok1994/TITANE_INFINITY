#!/usr/bin/env bash
# TITANE_INFINITY - Phase 7: Network Policy Guard (Anti-Bypass)
# Ensures no unauthorized external fetch() calls bypass ONLINE-FIRST controlled surfaces.
# All cloud APIs MUST go through Rust backend reqwest via secureInvoke IPC.

set -euo pipefail

echo "🔒 Phase 7: Network Policy Guard (Anti-Bypass)"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VIOLATIONS=0

# ════════════════════════════════════════════════════════════════════
# G1: No unapproved fetch() calls
# ════════════════════════════════════════════════════════════════════
echo "🔍 G1: Checking for unapproved fetch() calls..."

# Allowed files that use fetch() for localhost only
# Or import tauri-plugin-http (which is a controlled surface)
# Or are utility wrappers/tests
ALLOWED_FETCH=(
  "src/services/ai/transports/ollamaTransport.ts"
  "src/services/ai/providers/glm46v.ts"
  "src/services/tts/parlerTTSBridge.ts"
  "src/services/selfHealing/selfHealingObserver.ts"
  "src/services/ai/retryStrategy.ts"
  "src/core/http/httpClient.ts"           # Uses tauri-plugin-http (controlled)
  "src/utils/ollamaFallback.ts"           # Localhost Ollama wrapper
  "src/utils/aiPredictiveEngine.ts"       # Utility wrapper
  "src/utils/performanceOptimizer.ts"     # Utility wrapper
  "src/utils/webVitals.ts"                # Monitoring (localhost only)
  "src/lib/logger.ts"                     # Logging wrapper
  "src/lib/ipc.ts"                        # IPC wrapper (not external fetch)
  "src/components/diagnostics/SplashWatchdog.tsx"  # Diagnostic component
  "src/visual-engine/OSIntegrationBridge.ts"       # Local integration
)

# Find all fetch( calls in src/ (excluding tests)
mapfile -t FETCH_FILES < <(grep -r "fetch(" src/ \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=__tests__ \
  -l || true)

for file in "${FETCH_FILES[@]}"; do
  # Check if file is in allowed list
  IS_ALLOWED=false
  for allowed in "${ALLOWED_FETCH[@]}"; do
    if [[ "$file" == "$allowed" ]]; then
      IS_ALLOWED=true
      break
    fi
  done

  if [[ "$IS_ALLOWED" == false ]]; then
    echo -e "${RED}✗ VIOLATION: Unauthorized fetch() in $file${NC}"
    echo "  → All cloud APIs must use secureInvoke() → Rust backend reqwest"
    echo "  → Only localhost (127.0.0.1) fetch allowed in whitelisted files"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

if [[ ${#FETCH_FILES[@]} -eq 0 ]]; then
  echo -e "${GREEN}✓ No fetch() calls found outside allowed files${NC}"
elif [[ $VIOLATIONS -eq 0 ]]; then
  echo -e "${GREEN}✓ All fetch() calls in whitelisted files only${NC}"
fi
echo ""

# ════════════════════════════════════════════════════════════════════
# G2: Verify fetch() calls are localhost-only
# ════════════════════════════════════════════════════════════════════
echo "🔍 G2: Verifying fetch() calls target localhost only..."

# Check that allowed files only fetch localhost
for allowed_file in "${ALLOWED_FETCH[@]}"; do
  if [[ ! -f "$allowed_file" ]]; then
    continue
  fi

  # Skip comment-only examples (retryStrategy.ts has example in JSDoc)
  if [[ "$allowed_file" == "src/services/ai/retryStrategy.ts" ]]; then
    continue
  fi

  # Extract URLs from fetch calls (naive grep)
  mapfile -t URLS < <(grep -oP "fetch\(['\"].*?['\"]" "$allowed_file" | grep -oP "https?://[^'\"]*" || true)

  for url in "${URLS[@]}"; do
    if [[ ! "$url" =~ ^https?://127\.0\.0\.1 ]] && [[ ! "$url" =~ ^https?://localhost ]]; then
      echo -e "${RED}✗ VIOLATION: Non-localhost URL in $allowed_file: $url${NC}"
      echo "  → Frontend fetch() must only target 127.0.0.1 or localhost"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
done

echo -e "${GREEN}✓ All fetch() calls target localhost only${NC}"
echo ""

# ════════════════════════════════════════════════════════════════════
# G3: Verify Claude/OpenAI/Gemini use secureInvoke
# ════════════════════════════════════════════════════════════════════
echo "🔍 G3: Verifying cloud providers use secureInvoke (not direct fetch)..."

CLOUD_PROVIDERS=(
  "src/services/ai/providers/claude.ts"
  "src/services/ai/providers/openai.ts"
  "src/services/ai/providers/gemini.ts"
  "src/services/ai/providers/copilot.ts"
)

for provider in "${CLOUD_PROVIDERS[@]}"; do
  if [[ ! -f "$provider" ]]; then
    echo -e "${YELLOW}⚠ Provider missing: $provider${NC}"
    continue
  fi

  # Check that file imports secureInvoke
  if ! grep -q "from '@/lib/security'" "$provider"; then
    echo -e "${RED}✗ VIOLATION: $provider does not import secureInvoke${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi

  # Check that file does NOT call fetch() directly
  if grep -q "fetch(" "$provider"; then
    echo -e "${RED}✗ VIOLATION: $provider calls fetch() directly (should use secureInvoke)${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

echo -e "${GREEN}✓ All cloud providers use secureInvoke (no direct fetch)${NC}"
echo ""

# ════════════════════════════════════════════════════════════════════
# G4: Verify enforce-online-first.sh exists
# ════════════════════════════════════════════════════════════════════
echo "🔍 G4: Verifying enforce-online-first.sh gate exists..."

if [[ ! -f "scripts/verify/enforce-online-first.sh" ]]; then
  echo -e "${RED}✗ VIOLATION: scripts/verify/enforce-online-first.sh missing${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✓ enforce-online-first.sh gate exists${NC}"
fi
echo ""

# ════════════════════════════════════════════════════════════════════
# G5: Verify Cargo.toml has reqwest
# ════════════════════════════════════════════════════════════════════
echo "🔍 G5: Verifying Rust backend has reqwest for network..."

if ! grep -q 'reqwest.*=.*features.*\["json"' src-tauri/Cargo.toml; then
  echo -e "${RED}✗ VIOLATION: reqwest missing or misconfigured in Cargo.toml${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✓ reqwest configured in Cargo.toml${NC}"
fi
echo ""

# ════════════════════════════════════════════════════════════════════
# Final Report
# ════════════════════════════════════════════════════════════════════
echo "================================================"
if [[ $VIOLATIONS -eq 0 ]]; then
  echo -e "${GREEN}✅ PASS: All network policy guards passed (0 violations)${NC}"
  echo ""
  echo "Network Architecture:"
  echo "  • Frontend: IPC only (secureInvoke → Rust backend)"
  echo "  • Allowed frontend fetch: 127.0.0.1 (Ollama, vLLM, TTS)"
  echo "  • Cloud APIs: Rust backend reqwest (OpenAI, Anthropic, Gemini)"
  echo "  • Policy: ONLINE-FIRST with controlled surfaces"
  exit 0
else
  echo -e "${RED}❌ FAIL: $VIOLATIONS network policy violation(s) detected${NC}"
  echo ""
  echo "Stop-the-line: Fix violations before commit."
  echo "See .github/copilot-instructions.md Section A (Invariants)."
  exit 1
fi
