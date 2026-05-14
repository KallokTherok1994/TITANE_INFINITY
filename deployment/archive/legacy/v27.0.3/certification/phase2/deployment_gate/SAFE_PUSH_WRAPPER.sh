#!/usr/bin/env bash
set -euo pipefail
for arg in "$@"; do
  if [[ "$arg" == "--follow-tags" ]]; then
    echo "BLOCKED: --follow-tags is forbidden by governance."
    exit 2
  fi
done
git push "$@"
