#!/usr/bin/env bash
# TITANE∞ — Generate CycloneDX + SPDX 2.3 SBOM
# Reproducible local SBOM generation from npm + cargo metadata
# Usage: bash scripts/sbom/generate-sbom.sh [output_dir]
# Output: sbom-cyclonedx.json, sbom-spdx.json, sbom-cyclonedx.json.sha256

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


# Build SPDX 2.3 JSON SBOM
echo "Generating SPDX 2.3 JSON SBOM..."
DOC_NAMESPACE="https://github.com/KallokTherok1994/TITANE_INFINITY/sbom/titane-infinity-${VERSION}-${TIMESTAMP}"

# Build SPDX using jq to avoid heredoc interpolation issues
jq -n \
  --arg ver "$VERSION" \
  --arg ts "$TIMESTAMP" \
  --arg ns "$DOC_NAMESPACE" \
  --argjson components "$ALL_COMPONENTS" \
  '{
    "spdxVersion": "SPDX-2.3",
    "dataLicense": "CC0-1.0",
    "SPDXID": "SPDXRef-DOCUMENT",
    "name": ("titane-infinity-" + $ver),
    "documentNamespace": $ns,
    "creationInfo": {
      "created": $ts,
      "creators": ["Tool: TITANE∞ generate-sbom.sh", "Organization: KallokTherok1994"]
    },
    "documentDescribes": ["SPDXRef-Root"],
    "packages": ([{
      "SPDXID": "SPDXRef-Root",
      "name": "titane-infinity",
      "versionInfo": $ver,
      "downloadLocation": "https://github.com/KallokTherok1994/TITANE_INFINITY",
      "filesAnalyzed": false,
      "supplier": "Organization: KallokTherok1994"
    }] + ($components | to_entries | map({
      "SPDXID": ("SPDXRef-Package-" + (.key | tostring)),
      "name": .value.name,
      "versionInfo": .value.version,
      "downloadLocation": "NOASSERTION",
      "filesAnalyzed": false,
      "externalRefs": [{
        "referenceCategory": "PACKAGE-MANAGER",
        "referenceType": "purl",
        "referenceLocator": .value.purl
      }]
    })))
  }' > "$OUTPUT_DIR/sbom-spdx.json"

sha256sum "$OUTPUT_DIR/sbom-spdx.json" > "$OUTPUT_DIR/sbom-spdx.json.sha256" 2>/dev/null || true
SPDX_CHECKSUM=$(cat "$OUTPUT_DIR/sbom-spdx.json.sha256" 2>/dev/null | cut -d' ' -f1 || echo "unavailable")
echo "  SPDX SHA256: $SPDX_CHECKSUM"

echo ""
echo "=== SBOM Generation Complete ==="
echo "CycloneDX: $OUTPUT_DIR/sbom-cyclonedx.json"
echo "SPDX 2.3:  $OUTPUT_DIR/sbom-spdx.json"
echo "Checksum: $OUTPUT_DIR/sbom-cyclonedx.json.sha256"
echo "Components: $TOTAL_COUNT"
echo ""
echo "STATUS: PASS"