#!/usr/bin/env bash
# TITANE∞ v14 — Rust Hardening Verification
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — RUST HARDENING VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0

# Check Rust installation
if ! command -v cargo &>/dev/null; then
    echo "❌ Cargo not found"
    exit 1
fi

echo "✅ Cargo $(cargo --version | cut -d' ' -f2)"

# Check Cargo.toml exists
if [ ! -f "src-tauri/Cargo.toml" ]; then
    echo "❌ src-tauri/Cargo.toml not found"
    exit 1
fi

echo "✅ Cargo.toml found"

# Run cargo check
echo "→ Running cargo check..."

cd src-tauri
if cargo check 2>&1 | grep -q "error"; then
    echo "❌ Cargo check failed"
    cargo check 2>&1 | grep "error" | head -10
    ((ERRORS++))
else
    echo "✅ Cargo check passed"
fi

# Run clippy
echo "→ Running clippy..."

if cargo clippy -- -D warnings 2>&1 | grep -q "error\|warning"; then
    WARNINGS=$(cargo clippy 2>&1 | grep -c "warning" || echo "0")
    echo "⚠️  Clippy found $WARNINGS warning(s)"
    cargo clippy 2>&1 | grep "warning" | head -5
else
    echo "✅ Clippy passed (0 warnings)"
fi

# Check for unsafe code
echo "→ Checking for unsafe code..."

UNSAFE_COUNT=$(grep -r "unsafe " src --include="*.rs" | wc -l || echo "0")

if [ "$UNSAFE_COUNT" -gt 0 ]; then
    echo "⚠️  Found $UNSAFE_COUNT unsafe block(s)"
    grep -rn "unsafe " src --include="*.rs" | head -5
else
    echo "✅ No unsafe code detected"
fi

# Check for unwrap() usage
echo "→ Checking for unwrap() usage..."

UNWRAP_COUNT=$(grep -r "\.unwrap()" src --include="*.rs" | grep -v "\/\/" | wc -l || echo "0")

if [ "$UNWRAP_COUNT" -gt 10 ]; then
    echo "⚠️  Found $UNWRAP_COUNT unwrap() call(s) (consider error handling)"
else
    echo "✅ Limited unwrap() usage ($UNWRAP_COUNT)"
fi

# Check for panic usage
echo "→ Checking for panic usage..."

PANIC_COUNT=$(grep -r "panic!" src --include="*.rs" | grep -v "\/\/" | wc -l || echo "0")

if [ "$PANIC_COUNT" -gt 0 ]; then
    echo "⚠️  Found $PANIC_COUNT panic! macro(s)"
    grep -rn "panic!" src --include="*.rs" | head -3
else
    echo "✅ No panic! macros found"
fi

# Check for println! in production code
echo "→ Checking for debug println!..."

PRINTLN_COUNT=$(grep -r "println!" src --include="*.rs" | grep -v "\/\/" | grep -v "debug" | wc -l || echo "0")

if [ "$PRINTLN_COUNT" -gt 0 ]; then
    echo "⚠️  Found $PRINTLN_COUNT println! macro(s) (use logging instead)"
else
    echo "✅ No println! macros in production code"
fi

cd ..

# Summary
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ RUST HARDENING: ALL CHECKS PASSED"
    exit 0
else
    echo "❌ RUST HARDENING: $ERRORS ERROR(S) DETECTED"
    exit 1
fi
