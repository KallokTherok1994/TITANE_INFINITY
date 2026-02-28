#!/usr/bin/env bash
# scripts/lib/redact.sh — Redaction secrets depuis stdin
# Usage: cmd | bash scripts/lib/redact.sh
set -euo pipefail

sed -E \
  -e 's/(sk-[A-Za-z0-9_-]{20,})/[REDACTED_SK]/g' \
  -e 's/(api[_-]?key\s*[=:]\s*)["\x27]?[A-Za-z0-9_-]{8,}/\1[REDACTED]/gi' \
  -e 's/(bearer\s+)[A-Za-z0-9_.-]{20,}/\1[REDACTED]/gi' \
  -e 's/(OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY)=[^\s]*/\1=[REDACTED]/g'
