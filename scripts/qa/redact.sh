#!/usr/bin/env bash
set -euo pipefail

# REDACT filters sensitive tokens from stdin/stdout logs.
REDACT() {
  sed -E \
    -e 's/sk-[A-Za-z0-9_-]{8,}/[REDACTED_SK]/g' \
    -e 's/[Bb]earer[[:space:]]+[A-Za-z0-9._-]+/[REDACTED_BEARER]/g' \
    -e 's/(Authorization:[[:space:]]*)([^[:space:]]+)/\1[REDACTED]/Ig' \
    -e 's/([Aa][Pp][Ii]_?[Kk][Ee][Yy][=:][[:space:]]*)([^[:space:]]+)/\1[REDACTED]/g' \
    -e 's/([Tt][Oo][Kk][Ee][Nn][=:][[:space:]]*)([^[:space:]]+)/\1[REDACTED]/g' \
    -e 's/([Ss][Ee][Cc][Rr][Ee][Tt][=:][[:space:]]*)([^[:space:]]+)/\1[REDACTED]/g'
}

if [[ "${1:-}" == "--selftest" ]]; then
  printf '%s\n' 'sk-test_ABC123456789' 'Bearer abc.def' 'Authorization: foo' 'api_key=xyz' 'token: qqq' 'secret=hhh' | REDACT
  exit 0
fi

REDACT
