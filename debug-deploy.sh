#!/bin/bash
# Debug deploy_auto.sh - Version simplifiée

set -euo pipefail

echo "=== DEBUG DEPLOY AUTO ==="
echo ""

# Test GLIBC
echo "1. Test GLIBC..."
if command -v ldd &>/dev/null; then
    GLIBC_VERSION=$(ldd --version 2>&1 | head -n1 | awk '{print $NF}')
    echo "   GLIBC: $GLIBC_VERSION"
    GLIBC_MAJOR=$(echo "$GLIBC_VERSION" | cut -d. -f1)
    GLIBC_MINOR=$(echo "$GLIBC_VERSION" | cut -d. -f2)
    echo "   Major: $GLIBC_MAJOR, Minor: $GLIBC_MINOR"
    
    if [[ "$GLIBC_MAJOR" -lt 2 ]] || [[ "$GLIBC_MAJOR" -eq 2 && "$GLIBC_MINOR" -lt 39 ]]; then
        echo "   ✗ GLIBC < 2.39"
    else
        echo "   ✓ GLIBC >= 2.39"
    fi
else
    echo "   ✗ ldd non disponible"
fi

# Test Node
echo ""
echo "2. Test Node.js..."
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo "   ✓ Node: $NODE_VERSION"
else
    echo "   ✗ Node non trouvé"
fi

# Test npm
echo ""
echo "3. Test npm..."
if command -v npm &>/dev/null; then
    NPM_VERSION=$(npm --version 2>&1)
    echo "   ✓ npm: $NPM_VERSION"
else
    echo "   ✗ npm non trouvé"
fi

# Test Rust
echo ""
echo "4. Test Rust..."
if command -v rustc &>/dev/null; then
    RUST_VERSION=$(rustc --version 2>&1)
    echo "   ✓ Rust: $RUST_VERSION"
else
    echo "   ⚠ Rust non trouvé (OK en frontend-only)"
fi

# Test Cargo
echo ""
echo "5. Test Cargo..."
if command -v cargo &>/dev/null; then
    CARGO_VERSION=$(cargo --version 2>&1)
    echo "   ✓ Cargo: $CARGO_VERSION"
else
    echo "   ⚠ Cargo non trouvé (OK en frontend-only)"
fi

echo ""
echo "=== DEBUG TERMINÉ ==="
echo "✓ Tous les tests exécutés sans blocage"
