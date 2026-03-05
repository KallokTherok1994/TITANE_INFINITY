param(
  [Parameter(Mandatory=$true)][string]$LogFile,
  [Parameter(Mandatory=$true)][string]$Command
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path (Split-Path -Parent $LogFile) -Force | Out-Null

"=== run_x3 START $(Get-Date -Format o) ===" | Tee-Object -FilePath $LogFile -Append
"CMD: $Command" | Tee-Object -FilePath $LogFile -Append

for ($i = 1; $i -le 3; $i++) {
  "--- RUN $i/3 ---" | Tee-Object -FilePath $LogFile -Append
  cmd /c $Command 2>&1 | & "$PSScriptRoot/redact_secrets.ps1" | Tee-Object -FilePath $LogFile -Append
  if ($LASTEXITCODE -ne 0) {
    "VERDICT: FAIL (run $i)" | Tee-Object -FilePath $LogFile -Append
    exit $LASTEXITCODE
  }
}

"VERDICT: PASS (3/3)" | Tee-Object -FilePath $LogFile -Append
