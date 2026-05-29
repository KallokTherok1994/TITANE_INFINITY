$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\..\

$ProofDir = "docs\nexus-v36\proofs"
New-Item -ItemType Directory -Force -Path $ProofDir | Out-Null

$guards = @(
  @{ script = "guard-scope.mjs"; args = ""; name = "SCOPE_GUARD" },
  @{ script = "guard-secrets.mjs"; args = ""; name = "SECRETS_GUARD" },
  @{ script = "guard-agent-os.mjs"; args = ""; name = "AGENT_OS_GUARD" },
  @{ script = "guard-model-boundary.mjs"; args = ""; name = "MODEL_BOUNDARY_GUARD" },
  @{ script = "guard-mcp-config.mjs"; args = ""; name = "MCP_CONFIG_GUARD" },
  @{ script = "guard-phase-lock.mjs"; args = "--phase GATE_5"; name = "PHASE_LOCK_GUARD" },
  @{ script = "guard-surface-matrix.mjs"; args = "--phase GATE_5"; name = "SURFACE_MATRIX_GUARD" },
  @{ script = "guard-runtime-adapter-scan.mjs"; args = "--phase GATE_5"; name = "RUNTIME_ADAPTER_SCAN" },
  @{ script = "guard-gate-ledger.mjs"; args = "--phase GATE_5"; name = "GATE_LEDGER_GUARD" }
)

$results = @{}
$allPass = $true

foreach ($g in $guards) {
  Write-Host "--- $($g.name) ---"
  try {
    if ($g.args) {
      $output = node "scripts\titane-dev\$($g.script)" $g.args.Split(" ") 2>&1
    } else {
      $output = node "scripts\titane-dev\$($g.script)" 2>&1
    }
    $exitCode = $LASTEXITCODE
    $output | ForEach-Object { Write-Host $_ }
    $pass = ($exitCode -eq 0)
    $results[$g.name] = if ($pass) { "PASS" } else { "FAIL" }
    if (-not $pass) { $allPass = $false }
  } catch {
    Write-Host "ERROR: $_"
    $results[$g.name] = "ERROR"
    $allPass = $false
  }
}

Write-Host ""
Write-Host "=== AGENT OS SEAL SUMMARY ==="
foreach ($key in $results.Keys) {
  Write-Host "$key=$($results[$key])"
}

if ($allPass) {
  Write-Host "AGENT_OS_SEAL=PASS"
} else {
  Write-Host "AGENT_OS_SEAL=FAIL"
}
