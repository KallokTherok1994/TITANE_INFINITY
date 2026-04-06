# checks/check_G3_UI_NO_NETWORK_DIRECT.ps1 — Gate G3: UI has zero direct network calls
# Ring: 4 — Status: STABLE
# Invariant: I2 — Online-first governed: UI => ZERO network direct; via backend/IPC only
# Rollback: git restore -- checks/check_G3_UI_NO_NETWORK_DIRECT.ps1

$ErrorActionPreference = "Stop"
$GATE = "G3_UI_NO_NETWORK_DIRECT"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$SrcDir = Join-Path $ROOT "src"
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Scanning UI sources for direct network calls..."

$Patterns = @('fetch\s*\(', 'new\s+XMLHttpRequest', 'axios\.', 'new\s+WebSocket\s*\(')
$Files = Get-ChildItem -Path $SrcDir -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue

$Violations = @()
foreach ($file in $Files) {
  if ($file.FullName -match "(__tests__|\.test\.|\.spec\.)") { continue }
  $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
  foreach ($pat in $Patterns) {
    if ($content -match $pat) {
      $line = "VIOLATION: $($file.FullName) matches pattern: $pat"
      if ($line -notmatch "GOVERNED|NetworkService|ApiClient") {
        $Violations += $line
      }
    }
  }
}

if ($Violations.Count -eq 0) {
  lib_pass $GATE "No direct network calls found in UI sources"
  exit 0
} else {
  foreach ($v in $Violations) {
    lib_log "VIOLATION" $v
    lib_log_jsonl $GATE "VIOLATION" $v
  }
  lib_fail $GATE "$($Violations.Count) direct network call(s) found — stop-the-line"
}
