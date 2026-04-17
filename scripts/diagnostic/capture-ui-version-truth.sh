#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORTS_DIR="${ROOT}/reports"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STAMP_SLUG="$(date -u +"%Y%m%d_%H%M%S")"

VERSION_LABEL="unspecified"
ARTIFACT_PATH=""
OUTPUT_PATH="${REPORTS_DIR}/UI_VERSION_TRUTH_SNAPSHOT_${STAMP_SLUG}.md"

usage() {
  cat <<'EOF'
Usage: scripts/diagnostic/capture-ui-version-truth.sh [--version-label VERSION] [--artifact-path PATH] [--output PATH]

Capture the current TITANE artifact, host install, launcher, and repo/runtime truths into a markdown snapshot.

Examples:
  scripts/diagnostic/capture-ui-version-truth.sh --version-label 30.1.23
  scripts/diagnostic/capture-ui-version-truth.sh --version-label 30.1.27 --artifact-path deployment/latest/TITANE Infinity_30.1.27_amd64.AppImage
  scripts/diagnostic/capture-ui-version-truth.sh --output reports/UI_VERSION_TRUTH_SMOKE.md
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version-label)
      [[ $# -ge 2 ]] || {
        echo "ERROR: --version-label requires a value" >&2
        exit 1
      }
      VERSION_LABEL="$2"
      shift 2
      ;;
    --artifact-path)
      [[ $# -ge 2 ]] || {
        echo "ERROR: --artifact-path requires a path" >&2
        exit 1
      }
      ARTIFACT_PATH="$2"
      shift 2
      ;;
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
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

mkdir -p "$(dirname "${OUTPUT_PATH}")"

extract_version_from_text() {
  local source_text="$1"
  if [[ "$source_text" =~ ([0-9]+\.[0-9]+\.[0-9]+) ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
  fi
}

read_json_version_line() {
  local target_file="$1"
  if [[ -f "$target_file" ]]; then
    grep -m1 '"version"' "$target_file" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/'
  else
    printf 'MISSING'
  fi
}

artifact_status="NOT_PROVIDED"
artifact_name="N/A"
artifact_size="N/A"
artifact_sha="N/A"
artifact_version="N/A"

if [[ -n "$ARTIFACT_PATH" ]]; then
  if [[ -e "$ARTIFACT_PATH" ]]; then
    artifact_status="PRESENT"
    artifact_name="$(basename "$ARTIFACT_PATH")"
    artifact_size="$(stat -c '%s' "$ARTIFACT_PATH")"
    artifact_sha="$(sha256sum "$ARTIFACT_PATH" | awk '{print $1}')"
    artifact_version="$(extract_version_from_text "$artifact_name")"
    if [[ -z "$artifact_version" ]]; then
      artifact_version="UNKNOWN_FROM_NAME"
    fi
  else
    artifact_status="MISSING"
    artifact_name="$(basename "$ARTIFACT_PATH")"
    artifact_version="UNKNOWN_FROM_NAME"
  fi
fi

if command -v which >/dev/null 2>&1; then
  binary_candidates="$(which -a titane-infinity 2>/dev/null || true)"
else
  binary_candidates=""
fi
if [[ -z "$binary_candidates" ]]; then
  binary_candidates="NOT_FOUND"
fi

if command -v dpkg-query >/dev/null 2>&1; then
  host_package_version="$(dpkg-query -W -f='${Version}\n' titane-infinity 2>/dev/null | head -n 1 || true)"
else
  host_package_version=""
fi
if [[ -z "$host_package_version" ]]; then
  host_package_version="NOT_INSTALLED"
fi

read_launcher_fields() {
  local launcher_path="$1"
  if [[ -f "$launcher_path" ]]; then
    grep -E '^(Name|Exec|Icon|StartupWMClass)=' "$launcher_path" || true
  else
    printf 'MISSING\n'
  fi
}

user_launcher_path="$HOME/.local/share/applications/titane-infinity.desktop"
system_launcher_path="/usr/share/applications/titane-infinity.desktop"
user_launcher_fields="$(read_launcher_fields "$user_launcher_path")"
system_launcher_fields="$(read_launcher_fields "$system_launcher_path")"

repo_package_version="$(read_json_version_line "$ROOT/package.json")"
repo_tauri_version="$(read_json_version_line "$ROOT/src-tauri/tauri.conf.json")"
runtime_stable_manifest_version="$(read_json_version_line "$ROOT/runtime/stable/manifest.json")"

{
  printf '# UI VERSION TRUTH SNAPSHOT\n\n'
  printf 'Generated: %s\n' "$TIMESTAMP"
  printf 'Version label: %s\n\n' "$VERSION_LABEL"
  printf '## Artifact Truth\n\n'
  printf -- '- Status: %s\n' "$artifact_status"
  printf -- '- Path: %s\n' "${ARTIFACT_PATH:-N/A}"
  printf -- '- Name: %s\n' "$artifact_name"
  printf -- '- Version from artifact name: %s\n' "$artifact_version"
  printf -- '- Size bytes: %s\n' "$artifact_size"
  printf -- '- SHA256: %s\n\n' "$artifact_sha"
  printf '## Host Install Truth\n\n'
  printf -- '- Installed package version: %s\n' "$host_package_version"
  printf -- '- Binary candidates:\n\n'
  printf '```text\n%s\n```\n\n' "$binary_candidates"
  printf '## Launcher Truth\n\n'
  printf '### User launcher\n\n'
  printf 'Path: %s\n\n' "$user_launcher_path"
  printf '```text\n%s\n```\n\n' "$user_launcher_fields"
  printf '### System launcher\n\n'
  printf 'Path: %s\n\n' "$system_launcher_path"
  printf '```text\n%s\n```\n\n' "$system_launcher_fields"
  printf '## Repo Runtime Truth\n\n'
  printf -- '- package.json: %s\n' "$repo_package_version"
  printf -- '- src-tauri/tauri.conf.json: %s\n' "$repo_tauri_version"
  printf -- '- runtime/stable/manifest.json: %s\n\n' "$runtime_stable_manifest_version"
  printf '## Suggested Next Step\n\n'
  printf 'Copy the artifact, host, launcher, and repo/runtime findings into the bisect matrix row for %s before assigning any UI verdict.\n' "$VERSION_LABEL"
} > "$OUTPUT_PATH"

echo "UI version truth snapshot generated: ${OUTPUT_PATH}"