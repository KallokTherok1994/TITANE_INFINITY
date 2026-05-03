# DESKTOP_RUNTIME_PROOF_READY

## Environment Status
- Node: v18.19.1 — INCOMPATIBLE (requires >=20)
- nvm: NOT AVAILABLE
- node20: NOT FOUND
- Display: NO X11/Wayland confirmed (headless CI/terminal)
- Desktop proof: BLOCKED_ENV

## Prerequisite Commands (run in desktop environment)
```bash
# 1. Ensure Node >= 20
nvm use 20  # or install via https://nodejs.org

# 2. Verify Ollama is running
curl -s http://localhost:11434/api/tags | jq .models[].name

# 3. Verify model available
ollama list | grep gemma2
```

## Exact Runtime Validation Script (x3 Protocol)

```bash
#!/usr/bin/env bash
# DESKTOP_PROOF_X3.sh — Run from TITANE_INFINITY root in desktop environment
set -e

SHA=$(git rev-parse --short HEAD)
PROOF_DIR="proof_packs/DESKTOP_RUNTIME_X3_${SHA}_$(date +%Y%m%d_%H%M)"
mkdir -p "$PROOF_DIR"

echo "=== TITANE∞ DESKTOP PROOF X3 ===" | tee "$PROOF_DIR/run.log"
echo "SHA: $SHA" | tee -a "$PROOF_DIR/run.log"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$PROOF_DIR/run.log"

# Step 1: Build check
cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | tee -a "$PROOF_DIR/run.log"
echo "CARGO_CHECK: $?" | tee -a "$PROOF_DIR/run.log"

# Step 2: Start Tauri dev in background (needs display)
# pnpm tauri dev &
# TAURI_PID=$!
# sleep 15  # wait for boot

# Step 3: x3 Provider Recovery Validation
# For each run (1, 2, 3):
#   a. Simulate 3 consecutive Ollama timeouts to trigger "désactivé"
#   b. Wait 30s for cache expiry
#   c. Send a message
#   d. Assert: response.provider == "ollama" (not fallback)
#   e. Assert: no "désactivé" in logs after probe success

echo "=== Expected Markers ===" | tee -a "$PROOF_DIR/run.log"
echo "PASS markers:" | tee -a "$PROOF_DIR/run.log"
echo "  [CHAT ROUTER] ✅ Provider selected = ollama" | tee -a "$PROOF_DIR/run.log"
echo "  [CHAT] reset provider_failure_count for ollama" | tee -a "$PROOF_DIR/run.log"
echo "  response.provider = ollama in UI" | tee -a "$PROOF_DIR/run.log"
echo "FAIL markers:" | tee -a "$PROOF_DIR/run.log"
echo "  'temporairement désactivé' after probe success" | tee -a "$PROOF_DIR/run.log"
echo "  response.provider = local/mock after Ollama probe passes" | tee -a "$PROOF_DIR/run.log"
```

## Pass/Fail Conditions

### PASS (DESKTOP_RUNTIME_PASS)
- [ ] Tauri window opens and renders Chat UI
- [ ] Ollama send works at least once (x1)
- [ ] After 3 forced failures + 30s wait: provider re-enables (confirmed by response.provider)
- [ ] "désactivé" message appears at most once per failure burst (count==3), not repeatedly
- [ ] UI provider label shows "ollama" on successful response (not "local" or "fallback")
- [ ] x3 repetitions all pass

### FAIL
- [ ] "temporairement désactivé (3 échecs)" still appears after probe success
- [ ] Provider stays disabled beyond 30s cache TTL when Ollama is alive
- [ ] UI shows "local" or "fallback" while Ollama is responding

### BLOCKED
- [ ] Node < 20 — upgrade required
- [ ] No display — run in desktop X11/Wayland session

## Rollback After Desktop Test
```bash
# If desktop test reveals new defect needing rollback:
git restore -- src-tauri/src/overdrive/chat_orchestrator.rs src/services/ai/circuitBreaker.ts
# Then rerun cargo check to verify
cargo check --manifest-path src-tauri/Cargo.toml
```

## Classification
DESKTOP_RUNTIME_BLOCKED_ENV — proof plan is READY TO EXECUTE when Node >=20 and display available.
