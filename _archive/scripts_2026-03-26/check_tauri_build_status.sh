#!/bin/bash

echo "🔍 Checking Tauri build prerequisites..."
echo ""

# 1. Check if src-tauri exists
echo "1️⃣  src-tauri directory:"
ls -d src-tauri 2>/dev/null && echo "   ✅ EXISTS" || echo "   ❌ MISSING"

# 2. Check Cargo.toml
echo ""
echo "2️⃣  Cargo.toml in src-tauri:"
ls src-tauri/Cargo.toml 2>/dev/null && echo "   ✅ EXISTS" || echo "   ❌ MISSING"

# 3. Check Rust version
echo ""
echo "3️⃣  Rust toolchain:"
rustc --version 2>/dev/null || echo "   ❌ rustc not found"
cargo --version 2>/dev/null || echo "   ❌ cargo not found"

# 4. Check if build artifacts exist
echo ""
echo "4️⃣  Build artifacts (src-tauri/target):"
if [ -d "src-tauri/target" ]; then
    SIZE=$(du -sh src-tauri/target 2>/dev/null | cut -f1)
    echo "   ✅ EXISTS (size: $SIZE)"
else
    echo "   ⚠️  Not cached (first build will be slow)"
fi

# 5. Check Node/pnpm versions
echo ""
echo "5️⃣  Node & pnpm:"
node --version 2>/dev/null || echo "   ❌ node not found"
pnpm --version 2>/dev/null || echo "   ❌ pnpm not found"

# 6. Check if build dependencies installed
echo ""
echo "6️⃣  Frontend build check:"
pnpm run build 2>&1 | grep -E "✓ built in|error" | head -1

# 7. Summary
echo ""
echo "📊 Summary:"
echo "   - Tauri binary compilation will be slow first run"
echo "   - Timeout 120s is likely too short for Rust compilation"
echo "   - Recommended: 300-600 seconds for full build"
