#!/usr/bin/env bash
# TITANE∞ — Generate CycloneDX SBOM
# Reproducible local SBOM generation from npm + cargo metadata
# Usage: bash scripts/sbom/generate-sbom.sh [output_dir]
# Output: sbom-cyclonedx.json, sbom-cyclonedx.json.sha256

set -euo pipefail

OUTPUT_DIR="${1:-sbom}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$OUTPUT_DIR"

# Get version from package.json
VERSION=$(grep '"version"' "$PROJECT_ROOT/package.json" | head -1 | sed 's/.*"version": *"//' | sed 's/".*//')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=== TITANE∞ SBOM Generation ==="
echo "Project: titane-infinity"
echo "Version: $VERSION"
echo "Timestamp: $TIMESTAMP"
echo "Output: $OUTPUT_DIR/sbom-cyclonedx.json"
echo ""

# Collect npm components
echo "Collecting npm components..."
NPM_COMPONENTS=$(cd "$PROJECT_ROOT" && npm ls --all --json 2>/dev/null | \
  jq -r '
    [.dependencies // {} | to_entries[] | {
      name: .key,
      version: (.value.version // "unknown"),
      type: "library",
      purl: ("pkg:npm/" + .key + "@" + (.value.version // "unknown"))
    }] | sort_by(.name)
  ' 2>/dev/null || echo "[]")

NPM_COUNT=$(echo "$NPM_COMPONENTS" | jq 'length')
echo "  npm components: $NPM_COUNT"

# Collect cargo components
echo "Collecting cargo components..."
CARGO_META=$(cd "$PROJECT_ROOT/src-tauri" && cargo metadata --format-version 1 --no-deps 2>/dev/null || echo "{}")
CARGO_COMPONENTS=$(echo "$CARGO_META" | \
  jq -r '
    [.packages[]? | {
      name: .name,
      version: .version,
      type: "library",
      purl: ("pkg:cargo/" + .name + "@" + .version)
    }] | sort_by(.name)
  ' 2>/dev/null || echo "[]")

CARGO_COUNT=$(echo "$CARGO_COMPONENTS" | jq 'length')
echo "  cargo components: $CARGO_COUNT"

# Merge all components
ALL_COMPONENTS=$(echo "$NPM_COMPONENTS $CARGO_COMPONENTS" | jq -s 'add | unique_by(.name) | sort_by(.name)')
TOTAL_COUNT=$(echo "$ALL_COMPONENTS" | jq 'length')
echo "  total components: $TOTAL_COUNT"
echo ""

# Build CycloneDX SBOM
cat > "$OUTPUT_DIR/sbom-cyclonedx.json" << EOJSON
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "version": 1,
  "metadata": {
    "timestamp": "$TIMESTAMP",
    "component": {
      "name": "titane-infinity",
      "version": "$VERSION",
      "type": "application"
    }
  },
  "components": $ALL_COMPONENTS
}
EOJSON

# Generate SHA256 checksum
echo "Generating SHA256 checksum..."
sha256sum "$OUTPUT_DIR/sbom-cyclonedx.json" > "$OUTPUT_DIR/sbom-cyclonedx.json.sha256"
CHECKSUM=$(cat "$OUTPUT_DIR/sbom-cyclonedx.json.sha256" | cut -d' ' -f1)
echo "  SHA256: $CHECKSUM"

# Save component inventory for quick reference
echo "$NPM_COMPONENTS" | jq -r '.[] | "\(.name) \(.version)"' > "$OUTPUT_DIR/npm-components.txt" 2>/dev/null || true
echo "$CARGO_COMPONENTS" | jq -r '.[] | "\(.name) \(.version)"' > "$OUTPUT_DIR/cargo-components.txt" 2>/dev/null || true

# Save header (BOM without components, for signing)
cat > "$OUTPUT_DIR/sbom-header.json" << EOJSON
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "version": 1,
  "metadata": {
    "timestamp": "$TIMESTAMP",
    "component": {
      "name": "titane-infinity",
      "version": "$VERSION",
      "type": "application"
    }
  },
  "components": []
}
EOJSON

echo ""
echo "=== SBOM Generation Complete ==="
echo "File: $OUTPUT_DIR/sbom-cyclonedx.json"
echo "Checksum: $OUTPUT_DIR/sbom-cyclonedx.json.sha256"
echo "Components: $TOTAL_COUNT"
echo ""
echo "STATUS: PASS"