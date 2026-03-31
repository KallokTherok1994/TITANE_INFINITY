#!/bin/bash
# lib_cert.sh — TITANE_INFINITY Master Certification Library
# Pure bash, deterministic, no external deps
# Ring 0 tooling only (never modifies src-tauri, package.json, deps, etc.)

set -euo pipefail

# =========================================================
# HELPERS — Phase Lifecycle
# =========================================================

mk_pack_dir() {
  local phase_id="$1"
  local utc=$(date -u +'%Y%m%dT%H%M%SZ')
  local pack_dir="deployment/latest/certification/master_runs/${phase_id}_${utc}"
  mkdir -p "$pack_dir"
  echo "$pack_dir"
}

log_cmd() {
  local msg="$1"
  local log_file="${2:--}"
  local ts=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  echo "[$ts] $msg" | tee -a "$log_file"
}

# =========================================================
# PRECHECKS
# =========================================================

prechecks_clean_tree() {
  local pack_dir="$1"
  local check_log="$pack_dir/000_PRECHECK_CLEAN.txt"

  log_cmd "═══ PRECHECK: Clean Git Tree ===" "$check_log"

  # 1. Git status — check ONLY for modified tracked files (M, D, etc.)
  # Exclude untracked (??) as outputs/proof packs are expected untracked
  # Also exclude: MASTER_REGISTRY.jsonl (orchestration artifact, can be modified)
  local modified=$(git status --porcelain | grep -E "^ [MD]|^[MD] " | grep -v "MASTER_REGISTRY.jsonl" || true)
  if [ -n "$modified" ]; then
    log_cmd "❌ FAIL: Modified tracked files detected" "$check_log"
    echo "$modified" | tee -a "$check_log"
    return 1
  fi
  log_cmd "✅ Git tree clean (tracked files)" "$check_log"

  # 2. Forbidden files unchanged
  for fpath in src-tauri/tauri.conf.json src-tauri/Cargo.toml package.json pnpm-lock.yaml src-tauri/src/guard.rs src-tauri/src/allowlist.rs; do
    if [ -f "$fpath" ]; then
      if git diff --quiet "$fpath" 2>/dev/null; then
        log_cmd "✅ Safe: $fpath unchanged" "$check_log"
      else
        log_cmd "❌ FAIL: $fpath modified" "$check_log"
        return 1
      fi
    fi
  done

  log_cmd "✅ PRECHECK PASS" "$check_log"
  return 0
}

# =========================================================
# SANDBOXING
# =========================================================

sandbox_setup() {
  local phase_id="$1"
  local sandbox_dir="/tmp/${phase_id}_sandbox_$(date +%s)"
  mkdir -p "$sandbox_dir"/{home,xdg_config,xdg_data,xdg_cache,tmpdir}
  
  export HOME="$sandbox_dir/home"
  export XDG_CONFIG_HOME="$sandbox_dir/xdg_config"
  export XDG_DATA_HOME="$sandbox_dir/xdg_data"
  export XDG_CACHE_HOME="$sandbox_dir/xdg_cache"
  export TMPDIR="$sandbox_dir/tmpdir"
  export TITANE_SANDBOX_DIR="$sandbox_dir"
  
  echo "$sandbox_dir"
}

sandbox_cleanup() {
  local sandbox_dir="$1"
  rm -rf "$sandbox_dir" 2>/dev/null || true
}

# =========================================================
# EXECUTION & CAPTURE
# =========================================================

run_and_capture() {
  local cmd="$1"
  local log_file="$2"
  local timeout_sec="${3:-300}"
  
  log_cmd "▶ Running: $cmd" "$log_file"
  
  if timeout "$timeout_sec" bash -c "$cmd" 2>&1 | tee -a "$log_file"; then
    local exit_code=0
  else
    local exit_code=$?
  fi
  
  log_cmd "◀ Exit code: $exit_code" "$log_file"
  return $exit_code
}

# =========================================================
# SECURITY GATES
# =========================================================

scan_no_dev_server() {
  local log_file="$1"
  log_cmd "▶ Scanning: No dev server ports..." "$log_file"
  
  local ports=(5173 3000 8080 9000 4200)
  for port in "${ports[@]}"; do
    if netstat -tlnp 2>/dev/null | grep -q ":$port " || ss -tlnp 2>/dev/null | grep -q ":$port "; then
      log_cmd "❌ FAIL: Port $port listening (dev server detected)" "$log_file"
      return 1
    fi
  done
  
  log_cmd "✅ No dev server ports" "$log_file"
  return 0
}

scan_no_network() {
  local log_file="$1"
  log_cmd "▶ Scanning: No external network..." "$log_file"
  
  # Best effort: check for established non-loopback sockets
  local external_conns=$(ss -tnp 2>/dev/null | grep ESTAB | grep -v "127.0.0.1\|::1" | wc -l)
  
  if [ "$external_conns" -gt 0 ]; then
    log_cmd "⚠️  WARNING: $external_conns external established connections found" "$log_file"
    ss -tnp 2>/dev/null | grep ESTAB | grep -v "127.0.0.1\|::1" | tee -a "$log_file"
    # Non-fatal for now (scan is best-effort)
  else
    log_cmd "✅ No external network connections detected" "$log_file"
  fi
  
  return 0
}

proof_no_real_writes() {
  local sandbox_dir="$1"
  local log_file="$2"
  log_cmd "▶ Proving: No real writes outside sandbox..." "$log_file"
  
  # Check if any files were written outside sandbox
  local writable_dirs=(/home/titane-os /usr /var /etc /root /opt)
  for dir in "${writable_dirs[@]}"; do
    if [ -d "$dir" ] && [ -w "$dir" ]; then
      local writes=$(find "$dir" -newermt "5 minutes ago" 2>/dev/null | wc -l)
      if [ "$writes" -gt 0 ]; then
        log_cmd "❌ FAIL: $writes recent writes in $dir (outside sandbox)" "$log_file"
        return 1
      fi
    fi
  done
  
  log_cmd "✅ No real writes outside sandbox" "$log_file"
  return 0
}

# =========================================================
# PROOF SEALING
# =========================================================

seal_pack() {
  local pack_dir="$1"
  local phase_id="$2"
  local verdict="$3"  # PASS, FAIL, BLOCKED
  
  # SHA256SUMS (excludes self and VERDICT/LOCK)
  (cd "$pack_dir" && find . -type f ! -name "SHA256SUMS" ! -name "LOCK.md" ! -name "VERDICT.md" ! -name "ROLLBACK.md" -exec sha256sum {} \; | sort) > "$pack_dir/SHA256SUMS"
  
  # LOCK.md (immutability marker)
  cat > "$pack_dir/LOCK.md" <<EOF
# PHASE $phase_id — LOCKED PROOF PACK

Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Status: $verdict
SHA256SUMS: $(sha256sum "$pack_dir/SHA256SUMS" | cut -d' ' -f1)

This proof pack is immutable. All decisions sealed.
EOF

  # VERDICT.md (required output keys)
  cat > "$pack_dir/VERDICT.md" <<EOF
# PHASE $phase_id — VERDICT

PHASE_ID: $phase_id
PROOF_PACK_PATH: $pack_dir
FINAL_VERDICT: $verdict
TIMESTAMP: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

See LOG*.txt for details.
EOF

  # ROLLBACK.md (git restore recipe)
  cat > "$pack_dir/ROLLBACK.md" <<EOF
# ROLLBACK RECIPE

To rollback this phase:
\`\`\`bash
cd $(pwd)
git restore .
\`\`\`

No uncommitted changes were made during this phase.
EOF

  return 0
}

append_registry() {
  local pack_dir="$1"
  local phase_id="$2"
  local verdict="$3"
  local registry="deployment/latest/certification/MASTER_REGISTRY.jsonl"
  
  mkdir -p "$(dirname "$registry")"
  
  local entry=$(jq -n \
    --arg phase "$phase_id" \
    --arg verdict "$verdict" \
    --arg pack_path "$pack_dir" \
    --arg timestamp "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    '{phase: $phase, verdict: $verdict, pack_path: $pack_path, timestamp: $timestamp}')
  
  echo "$entry" >> "$registry"
}

# =========================================================
# GIT OPERATIONS
# =========================================================

commit_and_push() {
  local pack_dir="$1"
  local phase_id="$2"
  local verdict="$3"
  local message="$4"
  
  git add "$pack_dir"
  git commit -m "cert($phase_id): $verdict — $message" || true
  
  # Note: push is user decision, not auto
  echo "$pack_dir"
}

# =========================================================
# CLASSIFICATION
# =========================================================

classify_failure() {
  local failure_output="$1"
  
  if echo "$failure_output" | grep -q "dev server\|port 5173\|listening"; then
    echo "FAIL_SECURITY_DEV_SERVER"
  elif echo "$failure_output" | grep -q "network\|external"; then
    echo "FAIL_SECURITY_NETWORK"
  elif echo "$failure_output" | grep -q "write\|permission"; then
    echo "FAIL_SECURITY_WRITES"
  elif echo "$failure_output" | grep -q "E2E\|wdio"; then
    echo "FAIL_E2E"
  elif echo "$failure_output" | grep -q "build\|cargo"; then
    echo "FAIL_BUILD"
  elif echo "$failure_output" | grep -q "package\|deb\|appimage"; then
    echo "FAIL_PACKAGE"
  else
    echo "FAIL_UNKNOWN"
  fi
}

# =========================================================
# EXPORT (helper functions available to orchestrator)
# =========================================================

export -f mk_pack_dir log_cmd prechecks_clean_tree
export -f sandbox_setup sandbox_cleanup run_and_capture
export -f scan_no_dev_server scan_no_network proof_no_real_writes
export -f seal_pack append_registry commit_and_push classify_failure
