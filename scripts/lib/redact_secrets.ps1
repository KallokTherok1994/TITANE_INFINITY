$input | ForEach-Object {
  $_ -replace 'sk-[A-Za-z0-9_-]{20,}', '[REDACTED_SK]' `
     -replace '(?i)(api[_-]?key\s*[=:]\s*)["'']?[A-Za-z0-9_-]{8,}', '$1[REDACTED]' `
     -replace '(?i)(bearer\s+)[A-Za-z0-9_.-]{20,}', '$1[REDACTED]'
}
