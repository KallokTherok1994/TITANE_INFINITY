$ErrorActionPreference = "Stop"

$OLLAMA_HOST = if ($env:OLLAMA_HOST) { $env:OLLAMA_HOST } else { "http://127.0.0.1:11434" }
$DEV_MODEL   = if ($env:TITANE_OLLAMA_DEV_MODEL) { $env:TITANE_OLLAMA_DEV_MODEL } else { "qwen3.5:9b" }
$WRAPPER     = "scripts\titane-dev\start-ollama-dev-mcp.ps1"
$MCP_PACKAGE = "ollama-mcp@2.1.0"

$results = @()
$failed  = $false

function Check {
  param([string]$Name, [bool]$Pass, [string]$Detail)
  $status = if ($Pass) { "PASS" } else { "FAIL" }
  $line = "${status}: ${Name} :: ${Detail}"
  Write-Host $line
  $script:results += $line
  if (-not $Pass) { $script:failed = $true }
}

# 1. Ollama API /api/version
try {
  Invoke-RestMethod -Uri ($OLLAMA_HOST + "/api/version") -Method Get -TimeoutSec 5 | Out-Null
  Check "OLLAMA_API_VERSION" $true ($OLLAMA_HOST + "/api/version reachable")
} catch {
  Check "OLLAMA_API_VERSION" $false ("not reachable: " + $_.ToString())
}

# 2. qwen3.5:9b in ollama list
try {
  $modelList = ollama list
  $modelPresent = ($modelList | Out-String) -match [regex]::Escape($DEV_MODEL)
  Check "MODEL_INSTALLED" $modelPresent ($DEV_MODEL + " in ollama list: " + $modelPresent)
} catch {
  Check "MODEL_INSTALLED" $false ("ollama list failed: " + $_.ToString())
}

# 3. corepack pnpm version
try {
  $pnpmVer = corepack pnpm --version 2>&1 | Out-String
  Check "PNPM_COREPACK" $true ("pnpm version: " + $pnpmVer.Trim())
} catch {
  Check "PNPM_COREPACK" $false ("corepack pnpm --version failed: " + $_.ToString())
}

# 4. Wrapper file exists
$wrapperExists = Test-Path $WRAPPER
Check "WRAPPER_FILE_EXISTS" $wrapperExists ("path: " + $WRAPPER)

# 5. Wrapper contains pinned MCP package
if ($wrapperExists) {
  $content = Get-Content $WRAPPER -Raw
  $hasPkg = $content -match [regex]::Escape($MCP_PACKAGE)
  Check "WRAPPER_PINNED_PACKAGE" $hasPkg ("contains " + $MCP_PACKAGE + ": " + $hasPkg)
} else {
  Check "WRAPPER_PINNED_PACKAGE" $false "wrapper not found - skipped"
}

# 6. No secret patterns in wrapper
$secretPatterns = @("API_KEY","SECRET","PASSWORD","TOKEN","PRIVATE_KEY","ACCESS_KEY","VITE_OPENAI","VITE_GEMINI","VITE_ANTHROPIC")
if ($wrapperExists) {
  $content = Get-Content $WRAPPER -Raw
  $secretFound = $false
  foreach ($pat in $secretPatterns) {
    if ($content -match $pat) { $secretFound = $true; break }
  }
  $scanResult = if ($secretFound) { "SUSPECT_FOUND" } else { "CLEAN" }
  Check "WRAPPER_NO_SECRETS" (-not $secretFound) ("secret scan: " + $scanResult)
} else {
  Check "WRAPPER_NO_SECRETS" $false "wrapper not found - skipped"
}

# Summary
Write-Host ""
Write-Host "=== PREFLIGHT SUMMARY ==="
$results | ForEach-Object { Write-Host $_ }
Write-Host ""

if ($failed) {
  Write-Host "MCP_PREFLIGHT=FAIL"
  exit 1
} else {
  Write-Host "MCP_PREFLIGHT=PASS"
  exit 0
}
