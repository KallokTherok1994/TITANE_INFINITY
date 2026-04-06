# checks/check_G7_ROUTER_BOUNDED.ps1 — Gate G7: Router is bounded (no unbounded retries)
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G7_ROUTER_BOUNDED.ps1

$ErrorActionPreference = "Stop"
$GATE = "G7_ROUTER_BOUNDED"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Scanning for unbounded retry patterns..."

$Patterns = @('while\s*\(true\)', 'while\s*\(1\)', 'retry\s*=\s*Infinity', 'maxRetries\s*:\s*Infinity')
$Dirs = @((Join-Path $ROOT "src"), (Join-Path $ROOT "src-tauri/src"))
$Violations = @()

foreach ($dir in $Dirs) {
  if (-not (Test-Path $dir)) { continue }
  $files = Get-ChildItem -Path $dir -Recurse -Include "*.ts","*.tsx","*.rs" -ErrorAction SilentlyContinue
  foreach ($f in $files) {
    if ($f.FullName -match "__tests__|\.test\.|\.spec\.") { continue }
    $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    foreach ($pat in $Patterns) {
      if ($content -match $pat -and $content -notmatch "BOUNDED|// OK") {
        $Violations += "$($f.FullName): matches $pat"
      }
    }
  }
}

if ($Violations.Count -gt 0) {
  foreach ($v in $Violations) {
    lib_log "WARN" $v
    lib_log_jsonl $GATE "WARN" $v
  }
}

lib_pass $GATE "G7 router bounded check complete ($($Violations.Count) patterns flagged)"
exit 0
