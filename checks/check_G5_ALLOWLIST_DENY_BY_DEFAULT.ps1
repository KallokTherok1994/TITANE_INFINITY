# checks/check_G5_ALLOWLIST_DENY_BY_DEFAULT.ps1 — Gate G5: Tauri allowlist deny-by-default
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G5_ALLOWLIST_DENY_BY_DEFAULT.ps1

$ErrorActionPreference = "Stop"
$GATE = "G5_ALLOWLIST_DENY_BY_DEFAULT"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

$TauriConf = Join-Path $ROOT "src-tauri/tauri.conf.json"
lib_require_file $GATE $TauriConf

lib_log "INFO" "[$GATE] Checking Tauri allowlist/capabilities configuration..."

$CapDir = Join-Path $ROOT "src-tauri/capabilities"
if (Test-Path $CapDir) {
  lib_pass $GATE "Tauri v2 capabilities directory present: $CapDir"
  $wildcards = Get-ChildItem -Path $CapDir -Recurse -Include "*.json" | ForEach-Object {
    Select-String -Path $_.FullName -Pattern '"allow":\s*true' -ErrorAction SilentlyContinue
  }
  if ($wildcards) {
    foreach ($w in $wildcards) {
      lib_log "WARN" "[$GATE] Broad allow pattern: $($w.Line.Trim())"
      lib_log_jsonl $GATE "WARN" "Broad allow pattern: $($w.Line.Trim())"
    }
  } else {
    lib_pass $GATE "No wildcard allow-all patterns found in capabilities"
  }
} else {
  $conf = Get-Content $TauriConf -Raw | ConvertFrom-Json
  $allowAll = $conf.tauri.allowlist.all
  if ($allowAll -eq $true) {
    lib_fail $GATE "tauri.conf.json allowlist.all=true — violates deny-by-default"
  } else {
    lib_pass $GATE "Tauri allowlist.all not set to true (deny-by-default satisfied)"
  }
}

lib_pass $GATE "G5 allowlist check complete"
exit 0
