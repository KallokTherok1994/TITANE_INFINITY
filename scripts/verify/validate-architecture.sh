#!/bin/bash
###############################################################################
# 🏛️ TITANE∞ Architecture Validation Script
# 
# Vérifie la conformité architecturale (4-Ring Model):
# - Core (Ring 1): Types, contrats
# - Engines (Ring 2): Pure functions, zero I/O
# - Services (Ring 3): Orchestration, I/O
# - OS (Ring 4): Tauri backend
#
# Règle d'or: Inner rings NEVER import outer rings
###############################################################################

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🏛️ TITANE∞ Architecture Validation"
echo "======================================"
echo ""

ERRORS=0

# 1️⃣ Vérifier que les engines n'importent PAS de services
echo "📍 Ring 2 (Engines) isolation check..."
if grep -r "from ['\"]@/services" src/engines/ 2>/dev/null; then
    echo "❌ VIOLATION: Engines importing Services detected"
    echo "   Fix: Extract types to @/types, move I/O to Services layer"
    ((ERRORS++))
else
    echo "✅ Engines are pure (no Services imports)"
fi

# 2️⃣ Vérifier que les engines n'importent PAS Tauri
echo "📍 Ring 2 (Engines) Tauri isolation check..."
if grep -r "@tauri-apps" src/engines/ 2>/dev/null | grep -v ".test.ts"; then
    echo "❌ VIOLATION: Engines importing Tauri APIs detected"
    echo "   Fix: Move Tauri calls to Services layer"
    ((ERRORS++))
else
    echo "✅ Engines don't use Tauri APIs"
fi

# 3️⃣ Vérifier que Core n'importe rien (sauf libs externes)
echo "📍 Ring 1 (Core/Types) purity check..."
if grep -r "from ['\"]@/" src/types/ 2>/dev/null | grep -v "from ['\"]@/types"; then
    echo "⚠️  WARNING: Core importing other layers (should be self-contained)"
    echo "   Review: Core should only define contracts"
else
    echo "✅ Core is self-contained"
fi

# 4️⃣ Vérifier ESLint config pour architecture rules
echo "📍 ESLint architecture rules check..."
if grep -q "no-restricted-imports.*@/services" .eslintrc.json; then
    echo "✅ ESLint enforces architecture rules"
else
    echo "⚠️  WARNING: Missing ESLint architecture enforcement"
    echo "   Add no-restricted-imports rules in .eslintrc.json"
fi

# 5️⃣ Lancer les tests d'architecture
echo "📍 Running architecture tests..."
if npm run test -- src/__tests__/architecture/ --run 2>&1 | grep -q "PASS"; then
    echo "✅ Architecture tests passed"
else
    echo "⚠️  WARNING: Architecture tests failed or missing"
    ((ERRORS++))
fi

echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Architecture validation: PASSED"
    exit 0
else
    echo "❌ Architecture validation: FAILED ($ERRORS errors)"
    exit 1
fi
