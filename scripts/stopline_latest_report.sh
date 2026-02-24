#!/usr/bin/env bash
# stopline_latest_report.sh
# Helper: Display path to latest stopline rebuild proof report
#
# Usage:
#   pnpm run stopline:latest
#   cat "$(pnpm run -s stopline:latest)/STATUS.md"

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$REPO_ROOT/reports"

if [[ ! -d "$REPORTS_DIR" ]]; then
  echo "No reports directory found: $REPORTS_DIR" >&2
  exit 1
fi

# Find latest FRESH_BUILD_PROOF report by sorting timestamped directories
LATEST=$(find "$REPORTS_DIR" -maxdepth 1 -type d -name "FRESH_BUILD_PROOF_*" -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -n1 | cut -d' ' -f2-)

if [[ -z "$LATEST" ]]; then
  echo "No FRESH_BUILD_PROOF reports found in $REPORTS_DIR" >&2
  exit 1
fi

echo "$LATEST"
