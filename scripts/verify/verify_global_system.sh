#!/usr/bin/env bash
# TITANE∞ v14 — Global System Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — GLOBAL SYSTEM VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo "✅ Node.js v$(node --version) (>= 18)"
    else
        echo "❌ Node.js version too old: $(node --version)"
        ((ERRORS++))
    fi
else
    echo "❌ Node.js not found"
    ((ERRORS++))
fi

# Check Rust
if command -v rustc &> /dev/null; then
    echo "✅ Rust $(rustc --version | cut -d' ' -f2)"
else
    echo "❌ Rust not found"
    ((ERRORS++))
fi

# Check Tauri CLI
if command -v cargo-tauri &> /dev/null; then
    echo "✅ Tauri CLI installed"
else
    echo "⚠️  Tauri CLI not found (install with: cargo install tauri-cli)"
fi

# Check package.json
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing"
    ((ERRORS++))
fi

# Check Cargo.toml
if [ -f "src-tauri/Cargo.toml" ]; then
    echo "✅ src-tauri/Cargo.toml found"
else
    echo "❌ src-tauri/Cargo.toml missing"
    ((ERRORS++))
fi

# Check tauri.conf.json
if [ -f "src-tauri/tauri.conf.json" ]; then
    echo "✅ src-tauri/tauri.conf.json found"
else
    echo "❌ src-tauri/tauri.conf.json missing"
    ((ERRORS++))
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules installed"
else
    echo "⚠️  node_modules missing (run: pnpm install)"
fi

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ GLOBAL SYSTEM: ALL CHECKS PASSED"
    exit 0
else
    echo "❌ GLOBAL SYSTEM: $ERRORS ERROR(S) DETECTED"
    exit 1
fi
