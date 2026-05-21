# TITANE Windows environment bootstrap
# Rollback: git restore -- scripts/windows/TitaneWindowsEnv.ps1

$ErrorActionPreference = 'Stop'

$titaneLocalAppData = if ($env:LOCALAPPDATA) {
    Join-Path $env:LOCALAPPDATA 'TITANE_INFINITY'
} else {
    Join-Path $HOME 'AppData\Local\TITANE_INFINITY'
}

$titaneCargoHome = Join-Path $titaneLocalAppData 'cargo-home'
New-Item -ItemType Directory -Force -Path $titaneCargoHome | Out-Null
$env:CARGO_HOME = $titaneCargoHome

if ([string]::IsNullOrWhiteSpace($env:HOME)) {
    if (-not [string]::IsNullOrWhiteSpace($env:USERPROFILE)) {
        $env:HOME = $env:USERPROFILE
    } else {
        $env:HOME = [Environment]::GetFolderPath('UserProfile')
    }
}

$titaneRoamingAppData = if ($env:APPDATA) {
    Join-Path $env:APPDATA 'TITANE_INFINITY'
} else {
    Join-Path $env:HOME 'AppData\Roaming\TITANE_INFINITY'
}

$titaneDevDir = Join-Path $titaneRoamingAppData 'dev'
New-Item -ItemType Directory -Force -Path $titaneDevDir | Out-Null

$env:TITANE_DEV_AUTO_TOKEN = '1'

if ([string]::IsNullOrWhiteSpace($env:TITANE_SECRETS_PASSPHRASE)) {
    $passphraseFile = Join-Path $titaneDevDir 'secrets-passphrase.txt'
    if (-not (Test-Path -LiteralPath $passphraseFile)) {
        $bytes = New-Object 'System.Byte[]' 32
        [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
        $passphrase = [Convert]::ToHexString($bytes)
        Set-Content -LiteralPath $passphraseFile -Value $passphrase -Encoding ASCII -NoNewline
    }
    $env:TITANE_SECRETS_PASSPHRASE = (Get-Content -LiteralPath $passphraseFile -Raw).Trim()
}

$pathCandidates = @(
    (Join-Path $env:ProgramFiles 'nodejs'),
    (Join-Path $env:ProgramFiles 'nodejs\node_modules\corepack\shims'),
    (Join-Path $env:ProgramFiles 'Git\bin'),
    (Join-Path $env:ProgramFiles 'Git\cmd'),
    (Join-Path $HOME '.cargo\bin'),
    (Join-Path $env:ProgramFiles 'Ollama'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Ollama'),
    (Join-Path $env:LOCALAPPDATA 'Ollama')
)

$currentPath = @()
if (-not [string]::IsNullOrWhiteSpace($env:Path)) {
    $currentPath = $env:Path -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
}

$normalizedCurrent = $currentPath | ForEach-Object { $_.TrimEnd('\') }
$prependPath = @()

foreach ($candidate in $pathCandidates) {
    if ([string]::IsNullOrWhiteSpace($candidate)) {
        continue
    }

    $normalizedCandidate = $candidate.TrimEnd('\')
    if ((Test-Path -LiteralPath $candidate) -and ($normalizedCurrent -notcontains $normalizedCandidate)) {
        $prependPath += $candidate
        $normalizedCurrent += $normalizedCandidate
    }
}

if ($prependPath.Count -gt 0) {
    $env:Path = (@($prependPath) + @($currentPath)) -join ';'
}
