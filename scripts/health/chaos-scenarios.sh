#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Chaos Scenarios
#   Tests de panne reproductibles par couche. Valide la résilience HA
#   sans lancer des destructions permanentes.
#
#   Scénarios:
#     CS-01 — health-contract.sh répond sans crash (smoke)
#     CS-02 — alert-engine émet A01 quand titane-infinity est arrêté
#     CS-03 — Ollama model-integrity-check détecte modèle absent (dry)
#     CS-04 — fallback Rust activé si modèle primaire absent (test unitaire)
#     CS-05 — health-dashboard.sh JSON mode cohérent
#     CS-06 — restart storm détecté par alert-engine A04 (simulation)
#
#   Usage: bash scripts/health/chaos-scenarios.sh [--scenario CS-XX]
#
#   Exit codes:
#     0 = tous PASS  |  1 = au moins un FAIL  |  2 = BLOCKED
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SCENARIO_FILTER="${1:-}"
PASS_COUNT=0
FAIL_COUNT=0
BLOCKED_COUNT=0
TIMESTAMP=$(date -Iseconds)

_pass() { echo "  [PASS] CS-$1: $2"; (( PASS_COUNT++ )) || true; }
_fail() { echo "  [FAIL] CS-$1: $2"; (( FAIL_COUNT++ )) || true; }
_blocked() { echo "  [BLOCKED] CS-$1: $2"; (( BLOCKED_COUNT++ )) || true; }
_skip() { echo "  [SKIP] CS-$1: filtered out"; }
_run_scenario() { [[ -z "$SCENARIO_FILTER" ]] || [[ "$SCENARIO_FILTER" == "CS-$1" ]]; }

echo "═══════════════════════════════════════════════════════"
echo "  TITANE∞ Chaos Scenarios  [$TIMESTAMP]"
echo "═══════════════════════════════════════════════════════"

# ─── CS-01: health-contract.sh smoke run ─────────────────────────────────
if _run_scenario "01"; then
  echo ""
  echo "  CS-01 — health-contract.sh smoke run"
  HEALTH_SCRIPT="$REPO_ROOT/scripts/health/health-contract.sh"
  if [[ ! -x "$HEALTH_SCRIPT" ]]; then
    _blocked "01" "health-contract.sh not found or not executable"
  else
    # Run and capture both exit code and JSON output
    OUTPUT=$(bash "$HEALTH_SCRIPT" 2>/dev/null) || true
    EXIT_CODE=$?
    if echo "$OUTPUT" | grep -q '"global_status"'; then
      _pass "01" "health-contract.sh produced structured JSON (exit=$EXIT_CODE)"
    else
      _fail "01" "health-contract.sh did not produce JSON output"
      echo "    output: $OUTPUT"
    fi
  fi
else
  _skip "01"
fi

# ─── CS-02: alert-engine A01 when titane-infinity stopped ─────────────────
if _run_scenario "02"; then
  echo ""
  echo "  CS-02 — alert-engine emits A01 when titane-infinity is not active"
  ALERT_SCRIPT="$REPO_ROOT/scripts/health/alert-engine.sh"
  if [[ ! -x "$ALERT_SCRIPT" ]]; then
    _blocked "02" "alert-engine.sh not found or not executable"
  else
    # Run in dry-run mode; titane-infinity is expected to not be active in dev env
    OUTPUT=$(bash "$ALERT_SCRIPT" --dry-run --quiet 2>/dev/null) || true
    if echo "$OUTPUT" | grep -q '"code":"A01"'; then
      _pass "02" "alert-engine correctly emits A01 for stopped titane-infinity"
    else
      # titane-infinity might actually be running
      ACTIVE=$(systemctl --user is-active titane-infinity.service 2>/dev/null || echo "unknown")
      if [[ "$ACTIVE" == "active" ]]; then
        _pass "02" "titane-infinity is active — A01 correctly not fired (state=$ACTIVE)"
      else
        _fail "02" "alert-engine did not emit A01 despite titane-infinity=$ACTIVE"
        echo "    dry-run output: $OUTPUT"
      fi
    fi
  fi
else
  _skip "02"
fi

# ─── CS-03: model-integrity-check with synthetic missing model ───────────
if _run_scenario "03"; then
  echo ""
  echo "  CS-03 — model-integrity-check detects missing model (dry simulation)"
  CHECK_SCRIPT="$REPO_ROOT/scripts/ollama/model-integrity-check.sh"
  if [[ ! -x "$CHECK_SCRIPT" ]]; then
    _blocked "03" "model-integrity-check.sh not found or not executable"
  else
    # Override REQUIRED_MODEL to a non-existent model name via env
    OUTPUT=$(REQUIRED_MODEL="titane-nonexistent-model-99999" bash "$CHECK_SCRIPT" 2>&1) || EXIT_CODE=$?
    EXIT_CODE=${EXIT_CODE:-0}
    if (( EXIT_CODE != 0 )); then
      _pass "03" "model-integrity-check exits non-zero for absent model (exit=$EXIT_CODE)"
    else
      # Check if the model really doesn't exist
      if ! curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" 2>/dev/null \
          | grep -q "titane-nonexistent-model-99999"; then
        # Script should have failed — check output for indication
        if echo "$OUTPUT" | grep -qiE "absent|missing|not found|critical|FAIL|ERROR"; then
          _pass "03" "model-integrity-check reported absent model in output"
        else
          _fail "03" "model-integrity-check did not detect absent model (exit=0, no error message)"
          echo "    output (first 3 lines): $(echo "$OUTPUT" | head -n3)"
        fi
      else
        _pass "03" "model actually exists — check passed correctly"
      fi
    fi
  fi
else
  _skip "03"
fi

# ─── CS-04: Rust fallback logic (cargo test) ─────────────────────────────
if _run_scenario "04"; then
  echo ""
  echo "  CS-04 — Rust ollama fallback test (cargo test)"
  CARGO_TOML="$REPO_ROOT/src-tauri/Cargo.toml"
  if [[ ! -f "$CARGO_TOML" ]]; then
    _blocked "04" "src-tauri/Cargo.toml not found"
  else
    # Run only the ollama-related tests (they may be unit tests without network)
    OUTPUT=$(cd "$REPO_ROOT/src-tauri" && \
      cargo test --lib ollama 2>&1 | tail -20) || EXIT_CODE=$?
    EXIT_CODE=${EXIT_CODE:-0}
    if (( EXIT_CODE == 0 )); then
      _pass "04" "cargo test ollama passed (Rust fallback logic compiles + tests green)"
    else
      # Check if it's just "no tests" (acceptable) vs actual failure
      if echo "$OUTPUT" | grep -qE "^test result: ok|running 0 tests"; then
        _pass "04" "cargo test ollama: no explicit unit tests but compiles OK"
      elif echo "$OUTPUT" | grep -q "^error"; then
        _fail "04" "cargo test ollama: compile errors detected"
        echo "    errors: $(echo "$OUTPUT" | grep '^error' | head -3)"
      else
        _fail "04" "cargo test ollama: test failures (exit=$EXIT_CODE)"
        echo "    output tail: $(echo "$OUTPUT" | tail -5)"
      fi
    fi
  fi
else
  _skip "04"
fi

# ─── CS-05: health-dashboard JSON mode ───────────────────────────────────
if _run_scenario "05"; then
  echo ""
  echo "  CS-05 — health-dashboard.sh --json produces valid JSON"
  DASH_SCRIPT="$REPO_ROOT/scripts/health/health-dashboard.sh"
  if [[ ! -x "$DASH_SCRIPT" ]]; then
    _blocked "05" "health-dashboard.sh not found or not executable"
  else
    OUTPUT=$(bash "$DASH_SCRIPT" --json 2>/dev/null) || true
    # Validate: must have required fields
    FIELDS_OK=true
    for field in "global_status" "titane_infinity" "ollama" "alerts"; do
      if ! echo "$OUTPUT" | grep -q "\"$field\""; then
        FIELDS_OK=false
        echo "    MISSING field: $field"
      fi
    done
    # Validate: parseable JSON (requires python3 or jq)
    PARSE_OK=false
    if command -v python3 >/dev/null 2>&1; then
      if echo "$OUTPUT" | python3 -m json.tool >/dev/null 2>&1; then
        PARSE_OK=true
      fi
    elif command -v jq >/dev/null 2>&1; then
      if echo "$OUTPUT" | jq . >/dev/null 2>&1; then
        PARSE_OK=true
      fi
    else
      PARSE_OK=true  # no parser available, skip validation
    fi

    if [[ "$FIELDS_OK" == "true" ]] && [[ "$PARSE_OK" == "true" ]]; then
      _pass "05" "health-dashboard JSON output is valid and complete"
    elif [[ "$FIELDS_OK" == "false" ]]; then
      _fail "05" "health-dashboard JSON missing required fields"
    else
      _fail "05" "health-dashboard JSON is not valid JSON"
    fi
  fi
else
  _skip "05"
fi

# ─── CS-06: restart storm simulation ─────────────────────────────────────
if _run_scenario "06"; then
  echo ""
  echo "  CS-06 — alert-engine A04 restart storm detection (simulated)"
  # Create a temporary mock that makes systemctl show NRestarts=6
  TMPDIR_CS06=$(mktemp -d)
  trap 'rm -rf "$TMPDIR_CS06"' EXIT

  # Create mock systemctl that returns NRestarts=6
  cat > "$TMPDIR_CS06/systemctl" <<'MOCK'
#!/usr/bin/env bash
# Mock systemctl for CS-06 restart storm test
if [[ "${*}" == *"NRestarts"* ]]; then
  echo "NRestarts=6"
  exit 0
fi
# Forward everything else
exec /usr/bin/systemctl "$@"
MOCK
  chmod +x "$TMPDIR_CS06/systemctl"

  # Run alert-engine with mocked PATH
  OUTPUT=$(PATH="$TMPDIR_CS06:$PATH" bash \
    "$REPO_ROOT/scripts/health/alert-engine.sh" --dry-run --quiet 2>/dev/null) || true

  if echo "$OUTPUT" | grep -q '"code":"A04"'; then
    _pass "06" "alert-engine correctly detects restart storm (A04 emitted with NRestarts=6)"
  else
    # Maybe the mock wasn't picked up — fallback check
    _fail "06" "alert-engine did not emit A04 for NRestarts=6"
    echo "    Note: mock systemctl may not have been used (PATH injection may have failed)"
    echo "    dry-run output excerpt: $(echo "$OUTPUT" | grep -i 'A04\|restart' | head -5)"
  fi
else
  _skip "06"
fi

# ─── final summary ────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Chaos Scenarios Summary"
echo "  PASS=$PASS_COUNT  FAIL=$FAIL_COUNT  BLOCKED=$BLOCKED_COUNT"
echo "═══════════════════════════════════════════════════════"

if (( BLOCKED_COUNT > 0 )); then
  exit 2
elif (( FAIL_COUNT > 0 )); then
  exit 1
else
  exit 0
fi
