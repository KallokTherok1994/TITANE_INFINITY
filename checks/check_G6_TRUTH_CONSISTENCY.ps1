# checks/check_G6_TRUTH_CONSISTENCY.ps1 — Gate G6: Version truth consistency across files
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G6_TRUTH_CONSISTENCY.ps1

$ErrorActionPreference = "Stop"
$GATE = "G6_TRUTH_CONSISTENCY"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Checking version consistency across canonical files..."

$pkgJson = Get-Content (Join-Path $ROOT "package.json") -Raw | ConvertFrom-Json
$PkgVersion = $pkgJson.version

$CargoContent = Get-Content (Join-Path $ROOT "src-tauri/Cargo.toml") -ErrorAction SilentlyContinue
$CargoVersion = ($CargoContent | Where-Object { $_ -match '^version\s*=' } | Select-Object -First 1) -replace 'version\s*=\s*"([^"]+)"','$1'

$TauriConf = Get-Content (Join-Path $ROOT "src-tauri/tauri.conf.json") -Raw | ConvertFrom-Json
$TauriVersion = if ($TauriConf.version) { $TauriConf.version } elseif ($TauriConf.package.version) { $TauriConf.package.version } else { "MISSING" }

lib_log "INFO" "[$GATE] package.json: $PkgVersion"
lib_log "INFO" "[$GATE] Cargo.toml:   $CargoVersion"
lib_log "INFO" "[$GATE] tauri.conf:   $TauriVersion"
lib_log_jsonl $GATE "INFO" "package.json=$PkgVersion Cargo.toml=$CargoVersion tauri.conf=$TauriVersion"

$Fail = $false
if ($PkgVersion -and $CargoVersion -and $PkgVersion -ne $CargoVersion.Trim()) {
  lib_log "FAIL" "[$GATE] Version mismatch: package.json=$PkgVersion vs Cargo.toml=$CargoVersion"
  lib_log_jsonl $GATE "FAIL" "mismatch: package.json=$PkgVersion vs Cargo.toml=$CargoVersion"
  $Fail = $true
}
if ($PkgVersion -and $TauriVersion -ne "MISSING" -and $PkgVersion -ne $TauriVersion) {
  lib_log "FAIL" "[$GATE] Version mismatch: package.json=$PkgVersion vs tauri.conf=$TauriVersion"
  lib_log_jsonl $GATE "FAIL" "mismatch: package.json=$PkgVersion vs tauri.conf=$TauriVersion"
  $Fail = $true
}

if (-not $Fail) {
  lib_pass $GATE "Version consistency: $PkgVersion"
  exit 0
} else {
  throw "G6 FAIL: version mismatch"
}
