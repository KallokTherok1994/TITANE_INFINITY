$ErrorActionPreference = "Stop"

if (-not $env:OLLAMA_HOST -or $env:OLLAMA_HOST.Trim() -eq "") {
  $env:OLLAMA_HOST = "http://127.0.0.1:11434"
}

if (-not $env:TITANE_OLLAMA_DEV_MODEL -or $env:TITANE_OLLAMA_DEV_MODEL.Trim() -eq "") {
  $env:TITANE_OLLAMA_DEV_MODEL = "qwen3.5:9b"
}

$env:OLLAMA_MODEL = $env:TITANE_OLLAMA_DEV_MODEL

function Write-Stderr {
  param([string]$Message)
  [Console]::Error.WriteLine($Message)
}

try {
  Invoke-RestMethod -Uri "$($env:OLLAMA_HOST)/api/version" -Method Get -TimeoutSec 5 | Out-Null
} catch {
  Write-Stderr "FAIL: Ollama not reachable at $($env:OLLAMA_HOST)"
  Write-Stderr "Recovery: start Ollama with: ollama serve"
  exit 1
}

try {
  $models = ollama list
} catch {
  Write-Stderr "FAIL: ollama list failed"
  Write-Stderr "Recovery: verify Ollama CLI is installed and available in PATH"
  exit 1
}

if ($models -notmatch [regex]::Escape($env:TITANE_OLLAMA_DEV_MODEL)) {
  Write-Stderr "FAIL: model not installed: $($env:TITANE_OLLAMA_DEV_MODEL)"
  Write-Stderr "Recovery: ollama pull $($env:TITANE_OLLAMA_DEV_MODEL)"
  exit 1
}

# StdIO hygiene:
# MCP JSON-RPC must stay on stdout.
# Diagnostics must stay on stderr.
Write-Stderr "PASS: Ollama Dev MCP preflight OK — host=$($env:OLLAMA_HOST), model=$($env:TITANE_OLLAMA_DEV_MODEL)"

corepack pnpm dlx ollama-mcp@2.1.0
