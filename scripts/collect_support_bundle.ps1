# scripts/collect_support_bundle.ps1 — Collect support bundle (redacted) for export
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/collect_support_bundle.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ROOT = Split-Path $ScriptDir -Parent
$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$BundleDir = Join-Path $env:TEMP "titane_support_bundle_$Timestamp"
$ProofPacksDir = if ($env:PROOF_PACKS_DIR) { $env:PROOF_PACKS_DIR } else { Join-Path $ROOT "proof_packs" }

Write-Host "======================================================================"
Write-Host " collect_support_bundle.ps1 — $((Get-Date).ToUniversalTime().ToString('o'))"
Write-Host " Bundle dir: $BundleDir"
Write-Host "======================================================================"

New-Item -ItemType Directory -Force -Path $BundleDir | Out-Null

# Collect versions
$versionFile = Join-Path $BundleDir "versions.txt"
"--- Versions ---" | Set-Content $versionFile
try { node --version | Add-Content $versionFile } catch { Add-Content $versionFile "node: N/A" }
try { pnpm --version | Add-Content $versionFile } catch { Add-Content $versionFile "pnpm: N/A" }
try { rustc --version | Add-Content $versionFile } catch { Add-Content $versionFile "rustc: N/A" }
$pkgVersion = (Get-Content (Join-Path $ROOT "package.json") -Raw | ConvertFrom-Json).version
Add-Content $versionFile "app: $pkgVersion"

# Collect proof packs
if (Test-Path $ProofPacksDir) {
  Copy-Item -Recurse -Force $ProofPacksDir (Join-Path $BundleDir "proof_packs") -ErrorAction SilentlyContinue
}

# Redact secrets
try {
  & (Join-Path $ScriptDir "redact_secrets.ps1") -TargetDir $BundleDir
} catch {
  Write-Host "WARN: Redaction had an issue: $_"
}

# Create archive
$Archive = Join-Path $ROOT "titane_support_bundle_$Timestamp.zip"
Compress-Archive -Path $BundleDir -DestinationPath $Archive -Force

Write-Host "`nSupport bundle created: $Archive"

$ts = (Get-Date).ToUniversalTime().ToString("o")
New-Item -ItemType Directory -Force -Path $ProofPacksDir | Out-Null
Add-Content -Path (Join-Path $ProofPacksDir "support_bundle.jsonl") `
  -Value "{`"ts`":`"$ts`",`"event`":`"support_bundle`",`"archive`":`"$Archive`"}"

exit 0
