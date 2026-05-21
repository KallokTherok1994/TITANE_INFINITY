#!/usr/bin/env bash
# TITANE∞ — Frontend Runtime Pre-BUILD Certifier
# Orchestrates all frontend/runtime/launcher truth lanes before any build.
# EXIT 0 = FRONTEND_RUNTIME_PREBUILD=PASS / BUILD_ALLOWED=YES
# EXIT 1 = FRONTEND_RUNTIME_PREBUILD=FAIL|BLOCKED / BUILD_ALLOWED=NO
#
# Lane ordering rationale:
#   Timestamp-sensitive lanes (STABLE_ARTIFACT, INSTRUCTIONS_VERIFICATION) run BEFORE
#   the Vite build step, because the Vite build freshens dist/ timestamps, which would
#   make the stable AppImage appear stale even when it is genuinely current.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

# ── Recursion guard ─────────────────────────────────────────────────────────
if [[ "${TITANE_FRONTEND_PREBUILD_ACTIVE:-0}" == "1" ]]; then
  echo "INFO: prebuild certifier already running (TITANE_FRONTEND_PREBUILD_ACTIVE=1) — skip inner invocation"
  exit 0
fi
export TITANE_FRONTEND_PREBUILD_ACTIVE=1

# ── Fast-path mode ───────────────────────────────────────────────────────────
# --fast or TITANE_CERTIFIER_FAST_MODE=1: run only lanes 1-8.5 (static pre-build checks).
# Skips Vite build (Lane 9-10) and all post-build/runtime gates (Lane 11-22).
# Use for quick feedback during development. Not a substitute for full certification.
FAST_MODE=0
if [[ "${1:-}" == "--fast" || "${TITANE_CERTIFIER_FAST_MODE:-0}" == "1" ]]; then
  FAST_MODE=1
  echo "INFO: Fast mode enabled (lanes 1-8.5 only — skipping Vite build and post-build gates)"
fi

HOST_OS="$(uname -s 2>/dev/null || echo unknown)"
IS_WINDOWS=0
case "$HOST_OS" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;;
esac
if [[ "${OS:-}" == "Windows_NT" ]]; then
  IS_WINDOWS=1
fi

CERTIFIER_RAIL="${TITANE_CERTIFIER_RAIL:-}"
if [[ -z "$CERTIFIER_RAIL" ]]; then
  if [[ "$IS_WINDOWS" -eq 1 ]]; then
    CERTIFIER_RAIL="dev"
  else
    CERTIFIER_RAIL="stable"
  fi
fi

if [[ "$CERTIFIER_RAIL" != "dev" && "$CERTIFIER_RAIL" != "stable" ]]; then
  echo "ERROR: TITANE_CERTIFIER_RAIL must be dev or stable (got '$CERTIFIER_RAIL')" >&2
  exit 1
fi
echo "INFO: Certifier rail: $CERTIFIER_RAIL"

PNPM_CMD=()
if command -v pnpm >/dev/null 2>&1; then
  PNPM_CMD=(pnpm)
elif command -v corepack >/dev/null 2>&1; then
  PNPM_CMD=(corepack pnpm)
else
  echo "ERROR: pnpm unavailable and corepack unavailable" >&2
  exit 1
fi
echo "INFO: Package manager: ${PNPM_CMD[*]}"

# ── Proof directory ─────────────────────────────────────────────────────────
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
PROOF_DIR="artifacts/frontend-runtime-prebuild/$RUN_ID"
mkdir -p "$PROOF_DIR"
echo "PROOF_DIR=$PROOF_DIR"

# ── Counters ─────────────────────────────────────────────────────────────────
PASS=0; FAIL=0; BLOCKED=0; WARN=0; NOT_APPLICABLE=0
FAIL_REASONS=()
BLOCKED_REASONS=()

pass()  { echo "PASS:  $1" | tee -a "$PROOF_DIR/LANES.txt"; ((PASS++))    || true; }
fail()  { echo "FAIL:  $1" | tee -a "$PROOF_DIR/LANES.txt"; ((FAIL++))    || true; FAIL_REASONS+=("$1"); }
block() { echo "BLOCK: $1" | tee -a "$PROOF_DIR/LANES.txt"; ((BLOCKED++)) || true; BLOCKED_REASONS+=("$1"); }
warn()  { echo "WARN:  $1" | tee -a "$PROOF_DIR/LANES.txt"; ((WARN++))    || true; }
na()    { echo "N/A:   $1" | tee -a "$PROOF_DIR/LANES.txt"; ((NOT_APPLICABLE++)) || true; }
na_proof() { na "N/A_WITH_PROOF: $1"; }

run_gate() {
  local id="$1"; local script="$2"
  if [[ ! -f "$script" ]]; then
    block "$id — script missing: $script"
    return
  fi
  if bash "$script" >> "$PROOF_DIR/${id}.log" 2>&1; then
    pass "$id"
  else
    local exit_code=$?
    echo "exit_code=$exit_code" >> "$PROOF_DIR/${id}.log"
    fail "$id (exit $exit_code — see $PROOF_DIR/${id}.log)"
  fi
}

run_windows_dev_shortcut_gate() {
  local id="WINDOWS_DEV_SHORTCUT"
  if [[ "$IS_WINDOWS" -ne 1 ]]; then
    na_proof "$id — not Windows"
    return
  fi
  if ! command -v powershell.exe >/dev/null 2>&1; then
    block "$id — powershell.exe missing"
    return
  fi
  if powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '
    $ErrorActionPreference = "Stop"
    $root = (Resolve-Path ".").Path
    $launcher = Join-Path $root "scripts\launch\launch-titane.ps1"
    $shell = New-Object -ComObject WScript.Shell
    $paths = @(
      (Join-Path ([Environment]::GetFolderPath("Desktop")) "Titan-Dev.lnk"),
      (Join-Path ([Environment]::GetFolderPath("Programs")) "TITANE_INFINITY\Titan-Dev.lnk")
    )
    foreach ($path in $paths) {
      if (-not (Test-Path -LiteralPath $path)) { throw "missing shortcut: $path" }
      $shortcut = $shell.CreateShortcut($path)
      if ($shortcut.TargetPath -notmatch "powershell(\.exe)?$") { throw "unexpected target: $($shortcut.TargetPath)" }
      if ($shortcut.Arguments -notlike "*$launcher*" -or $shortcut.Arguments -notlike "*-Mode dev*") {
        throw "unexpected arguments: $($shortcut.Arguments)"
      }
      if ($shortcut.Arguments -match "stable|production|prod") { throw "shortcut points to non-dev rail: $($shortcut.Arguments)" }
      Write-Output "PASS: $path -> $($shortcut.TargetPath) $($shortcut.Arguments)"
    }
  ' >> "$PROOF_DIR/${id}.log" 2>&1; then
    pass "$id"
  else
    local exit_code=$?
    echo "exit_code=$exit_code" >> "$PROOF_DIR/${id}.log"
    fail "$id (exit $exit_code — see $PROOF_DIR/${id}.log)"
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " TITANE∞ Frontend Runtime Pre-BUILD Certifier"
echo " RUN_ID=$RUN_ID"
echo " RAIL=$CERTIFIER_RAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─────────────────────────────────────────────────────────────────────────────
# PRE-BUILD STATIC LANES (timestamp-sensitive — run BEFORE Vite build)
# ─────────────────────────────────────────────────────────────────────────────

# ── Lane 1 — Package version ─────────────────────────────────────────────────
echo "--- Lane 1: Package version"
PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "UNKNOWN")
echo "PKG_VERSION=$PKG_VERSION" | tee -a "$PROOF_DIR/LANES.txt"
if [[ "$PKG_VERSION" != "UNKNOWN" && "$PKG_VERSION" != "" ]]; then
  pass "PACKAGE_VERSION ($PKG_VERSION)"
else
  fail "PACKAGE_VERSION — could not read package.json version"
fi

# ── Lane 2 — Touched scope detection ─────────────────────────────────────────
echo "--- Lane 2: Touched scope detection"
GIT_STATUS=$(git status --short 2>/dev/null || echo "")
echo "$GIT_STATUS" > "$PROOF_DIR/git_status.txt"
if echo "$GIT_STATUS" | grep -qE "^.M (src/|index\.html|tailwind|postcss|vite\.config|public/|runtime/stable/)"; then
  warn "TOUCHED_SCOPE — frontend/runtime files modified in worktree"
else
  na "TOUCHED_SCOPE — no tracked frontend changes in worktree (all lanes still run as guard)"
fi

# ── Lane 3 — TypeScript check ────────────────────────────────────────────────
echo "--- Lane 3: TypeScript"
if "${PNPM_CMD[@]}" run check >> "$PROOF_DIR/typescript.log" 2>&1; then
  pass "TYPESCRIPT"
else
  fail "TYPESCRIPT — see $PROOF_DIR/typescript.log"
fi

# ── Lane 4 — Lint ────────────────────────────────────────────────────────────
echo "--- Lane 4: Lint"
if "${PNPM_CMD[@]}" run lint >> "$PROOF_DIR/lint.log" 2>&1; then
  pass "LINT"
else
  fail "LINT — see $PROOF_DIR/lint.log"
fi

# ── Lane 5 — Stale runtime visible version scan (pre-build) ──────────────────
echo "--- Lane 5: Stale visible version scan (pre-build)"
run_gate "STALE_VERSION_SCAN_PRE" "scripts/verify/gate-no-stale-visible-version.sh"

# ── Lane 6 — Stable artifact freshness (PRE-BUILD — before Vite refreshes dist/) ──
# Run BEFORE the Vite build because the Vite build freshens dist/ timestamps,
# making the stable AppImage appear stale even when it was built from the current dist/.
echo "--- Lane 6: Stable artifact freshness (pre-build timestamp check)"
if [[ "$CERTIFIER_RAIL" == "dev" ]]; then
  na_proof "STABLE_ARTIFACT_PRE — dev rail does not require stable artifact"
elif [[ ! -f dist/index.html ]]; then
  na "STABLE_ARTIFACT_PRE — no dist/ yet (first run — will be created by Vite build)"
else
  run_gate "STABLE_ARTIFACT_PRE" "scripts/verify/gate-stable-artifact-freshness.sh"
fi

# ── Lane 7 — Instructions verification (PRE-BUILD — before dist/ timestamps change) ──
echo "--- Lane 7: Instructions verification (pre-build)"
if [[ "$CERTIFIER_RAIL" == "dev" ]]; then
  if bash scripts/verify/verify-copilot-instructions.sh >> "$PROOF_DIR/instructions.log" 2>&1; then
    pass "INSTRUCTIONS_DEV_VERIFICATION"
    na_proof "INSTRUCTIONS_VERIFICATION_FULL — dev rail skips stable/prod subgates"
  else
    fail "INSTRUCTIONS_DEV_VERIFICATION — see $PROOF_DIR/instructions.log"
  fi
elif [[ -f "scripts/verify_instructions.sh" ]]; then
  if bash scripts/verify_instructions.sh >> "$PROOF_DIR/instructions.log" 2>&1; then
    pass "INSTRUCTIONS_VERIFICATION"
  else
    fail "INSTRUCTIONS_VERIFICATION — see $PROOF_DIR/instructions.log"
  fi
else
  block "INSTRUCTIONS_VERIFICATION — scripts/verify_instructions.sh missing"
fi

# ── Lane 8 — Pre-build certifier agent verification (pre-build) ───────────────
echo "--- Lane 8: Pre-build certifier agent check"
run_gate "PREBUILD_AGENT_CHECK" "scripts/verify/verify-pre-build-certifier-agent.sh"

# ── Lane 8.5 — Test conformance check (pre-build) ────────────────────────────
echo "--- Lane 8.5: Test conformance"
run_gate "TEST_CONFORMANCE" "scripts/verify/verify-test-conformance.sh"

# ── Lane 8.6 — IPC whitelist completeness (pre-build) ────────────────────────
echo "--- Lane 8.6: IPC whitelist completeness"
run_gate "IPC_WHITELIST_COMPLETENESS" "scripts/verify/gate-ipc-whitelist-completeness.sh"

# ─────────────────────────────────────────────────────────────────────────────
# BUILD + POST-BUILD LANES (skipped in --fast mode)
# ─────────────────────────────────────────────────────────────────────────────

if [[ $FAST_MODE -eq 1 ]]; then
  echo ""
  echo "INFO: Fast mode — skipping Vite build and post-build gates (lanes 9-22+)"
  na "VITE_CACHE_CLEAN (fast mode)"
  na "VITE_BUILD (fast mode)"
  na "BUILD_TRUTH (fast mode)"
  na "VERSION_TRUTH (fast mode)"
  na "SURFACE_ROOT (fast mode)"
  na "NO_STALE_VISIBLE_VERSION (fast mode)"
  na "CSS_GENERATED (fast mode)"
  na "RUNTIME_VISIBILITY_PROTOCOL_INFRA (fast mode)"
  na "LAUNCHER_TRUTH (fast mode)"
  na "RUNTIME_IDENTITY (fast mode)"
  na "STABLE_WINDOW (fast mode)"
  na "CONSOLE_RUNTIME_NOISE (fast mode)"
  na "AUTOHEAL_RECURRENCE (fast mode)"
  na "DOM_SURFACETRUTH (fast mode)"
else

# ── Lane 9 — Clean Vite cache ────────────────────────────────────────────────
echo "--- Lane 9: Vite cache clean"
if "${PNPM_CMD[@]}" run clean:vite >> "$PROOF_DIR/clean_vite.log" 2>&1; then
  pass "VITE_CACHE_CLEAN"
else
  warn "VITE_CACHE_CLEAN — clean:vite failed (non-blocking, continuing)"
fi

# ── Lane 10 — Vite build ──────────────────────────────────────────────────────
# Use pnpm exec vite build directly to avoid triggering the prebuild lifecycle again.
# pnpm run build would re-invoke the prebuild hook (which the recursion guard catches),
# but pnpm exec vite build is explicit and avoids the double-lifecycle entirely.
echo "--- Lane 10: Vite build"
if "${PNPM_CMD[@]}" exec vite build >> "$PROOF_DIR/vite_build.log" 2>&1; then
  pass "VITE_BUILD"
else
  fail "VITE_BUILD — see $PROOF_DIR/vite_build.log"
fi

# ─────────────────────────────────────────────────────────────────────────────
# POST-BUILD VERIFICATION LANES
# ─────────────────────────────────────────────────────────────────────────────

# ── Lane 11 — Build truth gate ───────────────────────────────────────────────
echo "--- Lane 11: Build truth"
run_gate "BUILD_TRUTH" "scripts/verify/gate-build-truth.sh"

# ── Lane 12 — Version truth gate ─────────────────────────────────────────────
echo "--- Lane 12: Version truth"
run_gate "VERSION_TRUTH" "scripts/verify/gate-version-truth.sh"

# ── Lane 13 — Surface root gate ──────────────────────────────────────────────
echo "--- Lane 13: Surface root"
run_gate "SURFACE_ROOT" "scripts/verify/gate-surface-root.sh"

# ── Lane 14 — No stale visible version (post-build) ──────────────────────────
echo "--- Lane 14: No stale visible version (post-build)"
run_gate "NO_STALE_VISIBLE_VERSION" "scripts/verify/gate-no-stale-visible-version.sh"

# ── Lane 15 — Generated CSS proof ────────────────────────────────────────────
echo "--- Lane 15: Generated CSS proof"
CSS_COUNT=$(ls dist/assets/*.css 2>/dev/null | wc -l || echo "0")
if [[ "$CSS_COUNT" -gt 0 ]]; then
  ls -la dist/assets/*.css 2>/dev/null >> "$PROOF_DIR/css_proof.txt" || true
  wc -l dist/assets/*.css 2>/dev/null >> "$PROOF_DIR/css_proof.txt" || true
  pass "CSS_GENERATED ($CSS_COUNT file(s) in dist/assets/)"
else
  if [[ $FAIL -gt 0 ]]; then
    block "CSS_GENERATED — no dist/assets/*.css (Vite build may have failed above)"
  else
    fail "CSS_GENERATED — no dist/assets/*.css found after Vite build"
  fi
fi

# ── Lane 16 — Visible change protocol infrastructure ─────────────────────────
echo "--- Lane 16: Visible change protocol infra"
run_gate "RUNTIME_VISIBILITY_PROTOCOL_INFRA" "scripts/verify/verify_frontend_ui_visible_change_protocol.sh"

# ── Lane 17 — Launcher truth ─────────────────────────────────────────────────
echo "--- Lane 17: Launcher truth"
if [[ "$CERTIFIER_RAIL" == "dev" ]]; then
  run_windows_dev_shortcut_gate
  na_proof "LAUNCHER_TRUTH_STABLE — dev rail uses Titan-Dev.lnk"
else
  run_gate "LAUNCHER_TRUTH" "scripts/verify/gate-stable-launcher-truth.sh"
fi

# ── Lane 18 — Runtime identity truth ─────────────────────────────────────────
echo "--- Lane 18: Runtime identity truth"
run_gate "RUNTIME_IDENTITY" "scripts/verify/gate-runtime-identity-truth.sh"

# ── Lane 19 — Stable window truth (display required) ─────────────────────────
echo "--- Lane 19: Stable window truth"
if [[ "$CERTIFIER_RAIL" == "dev" ]]; then
  na_proof "STABLE_WINDOW — dev rail validated by dev smoke launch"
elif [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
  block "STABLE_WINDOW — BLOCKED_ENV: no display available (DISPLAY/WAYLAND_DISPLAY unset)"
else
  run_gate "STABLE_WINDOW" "scripts/verify/gate-stable-window-truth.sh"
fi

# ── Lane 20 — Console runtime noise (display required) ───────────────────────
echo "--- Lane 20: Console runtime noise"
if [[ "$CERTIFIER_RAIL" == "dev" ]]; then
  na_proof "CONSOLE_RUNTIME_NOISE — dev rail validated by TAURI_MONITOR warn/error counts"
elif [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
  block "CONSOLE_RUNTIME_NOISE — BLOCKED_ENV: no display available"
else
  run_gate "CONSOLE_RUNTIME_NOISE" "scripts/verify/gate-console-runtime-noise.sh"
fi

# ── Lane 21 — AutoHeal recurrence ────────────────────────────────────────────
echo "--- Lane 21: AutoHeal recurrence"
if [[ -f "scripts/autoheal/detect_recurrence.sh" ]]; then
  if bash scripts/autoheal/detect_recurrence.sh >> "$PROOF_DIR/autoheal.log" 2>&1; then
    pass "AUTOHEAL_RECURRENCE"
  else
    fail "AUTOHEAL_RECURRENCE — see $PROOF_DIR/autoheal.log"
  fi
else
  block "AUTOHEAL_RECURRENCE — scripts/autoheal/detect_recurrence.sh missing"
fi

# ── Lane 22 — DOM SurfaceTruth (BLOCKED_ENV if no display) ───────────────────
echo "--- Lane 22: DOM SurfaceTruth"
if [[ "$CERTIFIER_RAIL" == "dev" ]]; then
  na_proof "DOM_SURFACETRUTH — dev rail launch proof is smoke-based"
elif [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
  block "DOM_SURFACETRUTH — BLOCKED_ENV: no display available for Tauri window inspection"
else
  na "DOM_SURFACETRUTH — requires manual DevTools verification in running Tauri window"
fi

fi # end: if [[ $FAST_MODE -eq 0 ]]

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " SUMMARY"
echo "  PASS=$PASS  FAIL=$FAIL  BLOCKED=$BLOCKED  WARN=$WARN  N/A=$NOT_APPLICABLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ ${#FAIL_REASONS[@]} -gt 0 ]]; then
  echo "FAILURES:"
  for r in "${FAIL_REASONS[@]}"; do echo "  FAIL: $r"; done
fi
if [[ ${#BLOCKED_REASONS[@]} -gt 0 ]]; then
  echo "BLOCKERS:"
  for r in "${BLOCKED_REASONS[@]}"; do echo "  BLOCK: $r"; done
fi

# ── Final verdict ─────────────────────────────────────────────────────────────
VERDICT="PASS"
if [[ $FAIL -gt 0 ]]; then
  VERDICT="FAIL"
elif [[ $BLOCKED -gt 0 ]]; then
  VERDICT="BLOCKED"
fi

{
  echo "RUN_ID=$RUN_ID"
  echo "PKG_VERSION=$PKG_VERSION"
  echo "PASS=$PASS"
  echo "FAIL=$FAIL"
  echo "BLOCKED=$BLOCKED"
  echo "WARN=$WARN"
  echo "FAST_MODE=$FAST_MODE"
  echo "CERTIFIER_RAIL=$CERTIFIER_RAIL"
} > "$PROOF_DIR/SUMMARY.txt"

# Emit SUMMARY.json for CI integration without requiring Python on Windows hosts.
node - << NODEEOF
const fs = require('node:fs');
const data = {
  run_id: "$RUN_ID",
  pkg_version: "$PKG_VERSION",
  verdict: "$VERDICT",
  build_allowed: "$VERDICT" === "PASS",
  fast_mode: "$FAST_MODE" === "1",
  certifier_rail: "$CERTIFIER_RAIL",
  counters: { pass: $PASS, fail: $FAIL, blocked: $BLOCKED, warn: $WARN, na: $NOT_APPLICABLE },
};
fs.writeFileSync("$PROOF_DIR/SUMMARY.json", JSON.stringify(data, null, 2) + "\\n");
console.log("SUMMARY.json written to $PROOF_DIR/SUMMARY.json");
NODEEOF

if [[ $FAIL -gt 0 || $BLOCKED -gt 0 ]]; then
  echo ""
  echo "FRONTEND_RUNTIME_PREBUILD=$VERDICT"
  echo "BUILD_ALLOWED=NO"
  echo "PROOF_DIR=$PROOF_DIR"
  echo "FAIL=$FAIL BLOCKED=$BLOCKED"
  {
    echo "FRONTEND_RUNTIME_PREBUILD=$VERDICT"
    echo "BUILD_ALLOWED=NO"
    echo "FAIL_REASONS=${FAIL_REASONS[*]:-}"
    echo "BLOCKED_REASONS=${BLOCKED_REASONS[*]:-}"
  } >> "$PROOF_DIR/SUMMARY.txt"
  exit 1
fi

echo ""
echo "FRONTEND_RUNTIME_PREBUILD=PASS"
echo "BUILD_ALLOWED=YES"
echo "PROOF_DIR=$PROOF_DIR"
echo "PASS=$PASS BLOCKED=$BLOCKED"
{
  echo "FRONTEND_RUNTIME_PREBUILD=PASS"
  echo "BUILD_ALLOWED=YES"
} >> "$PROOF_DIR/SUMMARY.txt"
exit 0
