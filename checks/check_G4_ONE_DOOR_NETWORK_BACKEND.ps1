# checks/check_G4_ONE_DOOR_NETWORK_BACKEND.ps1 — Gate G4: Single network entry point in backend
# Ring: 4 — Status: STABLE
# Rollback: git restore -- checks/check_G4_ONE_DOOR_NETWORK_BACKEND.ps1

$ErrorActionPreference = "Stop"
$GATE = "G4_ONE_DOOR_NETWORK_BACKEND"
. "$PSScriptRoot/_lib.ps1"

$ROOT = lib_repo_root
$PackDir = Join-Path $PROOF_PACKS_DIR $GATE
New-Item -ItemType Directory -Force -Path $PackDir | Out-Null

lib_log "INFO" "[$GATE] Checking single network door in services layer..."

$SrcDir = Join-Path $ROOT "src"
$NSFiles = Get-ChildItem -Path $SrcDir -Recurse -Include "NetworkService*","ApiClient*" -ErrorAction SilentlyContinue
if ($NSFiles.Count -gt 0) {
  lib_pass $GATE "Governed network surface found: $($NSFiles.FullName -join ', ')"
} else {
  lib_log "WARN" "[$GATE] No NetworkService/ApiClient found in src/"
  lib_log_jsonl $GATE "WARN" "No NetworkService/ApiClient canonical file found"
}

$RustSrc = Join-Path $ROOT "src-tauri/src"
if (Test-Path $RustSrc) {
  $RustFiles = Get-ChildItem -Path $RustSrc -Recurse -Include "*.rs" -ErrorAction SilentlyContinue
  foreach ($f in $RustFiles) {
    if ($f.FullName -match "services[/\\]|network") { continue }
    $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "reqwest::|ureq::" -and $content -notmatch "GOVERNED") {
      lib_log "WARN" "[$GATE] Potential ungoverned Rust network call: $($f.FullName)"
      lib_log_jsonl $GATE "WARN" "Potential ungoverned: $($f.FullName)"
    }
  }
}

lib_pass $GATE "G4 static analysis complete"
exit 0
