#!/bin/bash
# Guard script to prevent tauri@0.15.0 from being added back
# This is an obsolete package that only brings deprecated subdependencies

set -e

PACKAGE_JSON="package.json"
LOCK_FILE="pnpm-lock.yaml"

if grep -q '"tauri":\s*".*0\.15' "$PACKAGE_JSON"; then
    echo "❌ ERROR: tauri@0.15.0 found in package.json"
    echo "   This is an obsolete package that brings deprecated subdependencies."
    echo "   We use @tauri-apps/api@2.9.1 instead."
    echo "   To fix: Remove \"tauri\": \"^0.15.0\" from package.json"
    exit 1
fi

echo "✅ tauri@0.15.0 guard check passed"
exit 0
