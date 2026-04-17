#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORTS_DIR="${ROOT}/reports"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STAMP_SLUG="$(date -u +"%Y%m%d_%H%M%S")"

DEFAULT_VERSIONS=(
  "30.1.22"
  "30.1.23"
  "30.1.24"
  "30.1.25"
  "30.1.26"
  "30.1.27"
  "30.1.28"
  "30.1.31"
  "30.1.33"
)

usage() {
  cat <<'EOF'
Usage: scripts/diagnostic/init-ui-version-bisect.sh [--output PATH] [version...]

Generate a markdown matrix for manual UI bisect across TITANE 30.1.x versions.

Use scripts/diagnostic/capture-ui-version-truth.sh to automate the artifact, host, launcher, and repo/runtime truth capture per version.

Examples:
  scripts/diagnostic/init-ui-version-bisect.sh
  scripts/diagnostic/init-ui-version-bisect.sh 30.1.23 30.1.26 30.1.27
  scripts/diagnostic/init-ui-version-bisect.sh --output reports/UI_BISECT_CUSTOM.md 30.1.22 30.1.23
EOF
}

OUTPUT_PATH="${REPORTS_DIR}/UI_VERSION_BISECT_MATRIX_${STAMP_SLUG}.md"
VERSIONS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      [[ $# -ge 2 ]] || {
        echo "ERROR: --output requires a path" >&2
        exit 1
      }
      OUTPUT_PATH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      VERSIONS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#VERSIONS[@]} -eq 0 ]]; then
  VERSIONS=("${DEFAULT_VERSIONS[@]}")
fi

mkdir -p "$(dirname "${OUTPUT_PATH}")"

cat > "${OUTPUT_PATH}" <<'EOF'
# UI VERSION BISECT MATRIX

Generated: __TIMESTAMP__

## Goal

Isolate the first 30.1.x version where the TITANE conversation UI becomes observably regressive.

## Truth Capture Rules

Record these four truths separately for every tested version before assigning any UI verdict:

1. Artifact under test
2. Installed host package truth
3. Launcher truth
4. Repo/runtime truth

Recommended probes:

- `dpkg -s titane-infinity | rg '^Version:'`
- `which -a titane-infinity`
- `grep -E '^(Name|Exec)=' ~/.local/share/applications/titane-infinity.desktop /usr/share/applications/titane-infinity.desktop`
- `rg '"version": "30\.1\.' package.json src-tauri/tauri.conf.json runtime/stable/manifest.json`
- `bash scripts/diagnostic/capture-ui-version-truth.sh --version-label 30.1.27 --artifact-path "deployment/latest/TITANE Infinity_30.1.27_amd64.AppImage" --output reports/UI_VERSION_TRUTH_30.1.27.md`

## Test Checklist

Mark PASS or FAIL per symptom, not just a global feeling.

- Route truth: /chat and /titane?tab=conversation align to the same visible surface
- TopNav zoom: controls visible, label stable, no broken layout
- Fullscreen shell: header stays visible, no double offset, no clipped shell
- Internal scroll: messages area keeps its own scroll region
- Composer visibility: input stays visible in fullscreen and compact viewports
- Mobile/browser send: simple message sends and user bubble appears
- Return-to-bottom CTA: appears when needed and restores latest view
- Long-message visibility: long assistant reply remains visible, not silently truncated

## Version Matrix

| Version | Artifact Truth | Host Truth | Launcher Truth | Repo Runtime Truth | Route Truth | TopNav Zoom | Fullscreen Shell | Internal Scroll | Composer Visibility | Mobile Send | Return-To-Bottom | Long Message | Verdict | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
EOF

python3 - <<'PY' "${OUTPUT_PATH}" "${TIMESTAMP}"
from pathlib import Path
import sys

output_path = Path(sys.argv[1])
timestamp = sys.argv[2]
output_path.write_text(
    output_path.read_text(encoding="utf-8").replace("__TIMESTAMP__", timestamp),
    encoding="utf-8",
)
PY

for version in "${VERSIONS[@]}"; do
  printf '| %s | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | |\n' "${version}" >> "${OUTPUT_PATH}"
done

cat >> "${OUTPUT_PATH}" <<'EOF'

## Decision Rules

1. Stop once you have a minimal interval: one version still sane and the next one clearly regressive.
2. Treat 30.1.29 as non-authoritative for product regression: the repo explicitly documents no honest desktop artifact for that attempt.
3. Prefer 30.1.23 as the stable reference, 30.1.26 as the pivot, and 30.1.27 as the first high-suspicion version.
4. If the goal is immediate rollback and not archaeology, stop as soon as 30.1.23 or 30.1.22 is confirmed visually healthy.

## Suggested Execution Order

1. 30.1.23
2. 30.1.26
3. 30.1.27
4. 30.1.24
5. 30.1.25
6. 30.1.28
7. 30.1.31
8. 30.1.33

## Source References

- RELEASE_SURFACE_INVENTORY.md
- RELEASE_v30.1.22.md
- RELEASE_v30.1.23.md
- RELEASE_v30.1.27.md
- RELEASE_v30.1.28.md
- RELEASE_v30.1.31.md
- UI_SURFACE_MAP.md
- reports/BUILD_ALL_2026-04-15_v30.1.22.md
- reports/BUILD_ALL_2026-04-15_v30.1.23.md
- reports/LOCAL_UI_BUILD_REFRESH_2026-04-15_v30.1.27.md
- reports/UI_ANDROID_BROWSER_MOBILE_FIX_2026-04-15.md
- reports/UI_TOPNAV_ZOOM_AUDIT_2026-04-15.md
- reports/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15.md
- reports/CHAT_LONG_MESSAGE_VISIBILITY_2026-04-16.md
EOF

echo "UI bisect matrix generated: ${OUTPUT_PATH}"