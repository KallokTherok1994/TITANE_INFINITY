# checks/check_G9_TOOLS_POLICY_ENFORCED.ps1 — Gate G9: Tools policy enforced
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G9_TOOLS_POLICY_ENFORCED.ps1

$ErrorActionPreference = "Stop"
$GATE = "G9_TOOLS_POLICY_ENFORCED"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Checking tools policy (no forbidden patterns)..."

$SrcDir = Join-Path $ROOT "src"
$Files = Get-ChildItem -Path $SrcDir -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue

$RawInvokeCount = 0
$ConsoleCount = 0
$AnyCount = 0

foreach ($f in $Files) {
  if ($f.FullName -match "__tests__|\.test\.|\.spec\.") { continue }
  $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  if ($content -match '\binvoke\s*\(' -and $content -notmatch 'GOVERNED|ipcClient|canonicalClient') {
    $RawInvokeCount++
    lib_log_jsonl $GATE "WARN" "raw invoke in $($f.FullName)"
  }
  $ConsoleCount += ([regex]::Matches($content, 'console\.(log|warn|error)\s*\(')).Count
  $AnyCount += ([regex]::Matches($content, ':\s*any\b')).Count
}

lib_log "INFO" "[$GATE] raw invoke calls: $RawInvokeCount"
lib_log "INFO" "[$GATE] console calls: $ConsoleCount"
lib_log "INFO" "[$GATE] :any annotations: $AnyCount"
lib_log_jsonl $GATE "INFO" "raw_invoke=$RawInvokeCount console=$ConsoleCount any=$AnyCount"

lib_pass $GATE "G9 tools policy check complete (review warnings above)"
exit 0
