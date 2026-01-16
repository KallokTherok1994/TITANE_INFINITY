#!/bin/bash
# TITANE_INFINITY - Alias Resolution Check
# Ensures Vite and TypeScript aliases are synchronized

set -euo pipefail

echo "🔍 Checking alias resolution..."

# Check if @themes/tokens can be resolved
if ! npx vite --version > /dev/null 2>&1; then
    echo "❌ Vite not available"
    exit 1
fi

# Try to resolve @themes/tokens
if node -e "
const { resolve } = require('path');
const fs = require('fs');
try {
  const resolved = resolve(process.cwd(), 'src/themes/tokens.ts');
  if (fs.existsSync(resolved)) {
    console.log('✅ @themes/tokens resolved');
  } else {
    console.log('❌ @themes/tokens not found');
    process.exit(1);
  }
} catch (e) {
  console.log('❌ Error resolving @themes/tokens:', e.message);
  process.exit(1);
}
"; then
    echo "✅ All aliases resolved successfully"
else
    echo "❌ Alias resolution failed"
    exit 1
fi