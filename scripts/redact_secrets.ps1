# scripts/redact_secrets.ps1 — Redact secrets from files before export
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/redact_secrets.ps1

param(
  [Parameter(Mandatory=$true)]
  [string]$TargetDir
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $TargetDir)) {
  Write-Host "ERROR: Target directory does not exist: $TargetDir"
  exit 1
}

Write-Host "======================================================================"
Write-Host " redact_secrets.ps1 — Redacting secrets in: $TargetDir"
Write-Host " $((Get-Date).ToUniversalTime().ToString('o'))"
Write-Host "======================================================================"

$Patterns = @(
  @{ Pattern = 'sk-[A-Za-z0-9_-]{20,}'; Replace = '[REDACTED_SK]' },
  @{ Pattern = 'ghp_[A-Za-z0-9]{36,}'; Replace = '[REDACTED_GHP]' },
  @{ Pattern = 'github_pat_[A-Za-z0-9_]{20,}'; Replace = '[REDACTED_PAT]' },
  @{ Pattern = '(?i)api[_-]?key\s*=\s*[''"][^''"]{8,}[''"]'; Replace = 'API_KEY=[REDACTED]' },
  @{ Pattern = '(?i)password\s*=\s*[''"][^''"]{6,}[''"]'; Replace = 'PASSWORD=[REDACTED]' },
  @{ Pattern = '(?i)token\s*=\s*[''"][^''"]{8,}[''"]'; Replace = 'TOKEN=[REDACTED]' }
)

$Extensions = @("*.json","*.jsonl","*.md","*.txt","*.log")
$Files = Get-ChildItem -Path $TargetDir -Recurse -Include $Extensions -ErrorAction SilentlyContinue
$Redacted = 0

foreach ($f in $Files) {
  $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }
  $modified = $content
  foreach ($p in $Patterns) {
    $modified = [regex]::Replace($modified, $p.Pattern, $p.Replace)
  }
  if ($modified -ne $content) {
    Set-Content -Path $f.FullName -Value $modified -NoNewline
    $Redacted++
  }
}

Write-Host "Processed $($Files.Count) file(s), modified $Redacted file(s) in $TargetDir"
Write-Host "Redaction complete"
exit 0
