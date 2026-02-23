#!/usr/bin/env bash
# Gate G2: NO_FORCE_LOCAL_PROVIDER_IN_PROD
# Vérifie que FORCE_LOCAL_PROVIDER n'est pas set en production

set -e

echo "=== GATE G2: NO_FORCE_LOCAL_PROVIDER_IN_PROD ==="
echo

FAIL=0

# Check 1: Vérifier que l'env var n'est pas set actuellement
echo "[Check 1] Vérifier FORCE_LOCAL_PROVIDER not set..."

if [ -n "$FORCE_LOCAL_PROVIDER" ]; then
  echo "❌ FAIL: FORCE_LOCAL_PROVIDER is SET in current environment"
  echo "   Value: $FORCE_LOCAL_PROVIDER"
  FAIL=1
else
  echo "✅ PASS: FORCE_LOCAL_PROVIDER not set in current env"
fi

echo

# Check 2: Vérifier scripts de prod/deploy ne setdefaultent pas cette var
echo "[Check 2] Vérifier scripts prod/deploy..."

DEPLOY_SCRIPTS=$(find scripts deployment -type f \( -name "*.sh" -o -name "*.bash" \) 2>/dev/null || true)

if [ -n "$DEPLOY_SCRIPTS" ]; then
  FORCE_IN_SCRIPTS=$(grep -r "FORCE_LOCAL_PROVIDER" $DEPLOY_SCRIPTS || true)
  
  if [ -n "$FORCE_IN_SCRIPTS" ]; then
    echo "⚠️  WARNING: FORCE_LOCAL_PROVIDER found in scripts:"
    echo "$FORCE_IN_SCRIPTS"
    echo
    echo "   Vérifier que c'est seulement dans tests/dev, pas prod."
  else
    echo "✅ PASS: FORCE_LOCAL_PROVIDER not in deploy scripts"
  fi
else
  echo "ℹ️  No deploy scripts found in scripts/ or deployment/"
fi

echo

# Check 3: Vérifier .env* files
echo "[Check 3] Vérifier fichiers .env*..."

ENV_FILES=$(find . -maxdepth 2 -name ".env*" -not -name ".env*.example" 2>/dev/null || true)

if [ -n "$ENV_FILES" ]; then
  FORCE_IN_ENV=$(grep -h "^FORCE_LOCAL_PROVIDER=" $ENV_FILES 2>/dev/null || true)
  
  if [ -n "$FORCE_IN_ENV" ]; then
    echo "⚠️  WARNING: FORCE_LOCAL_PROVIDER found in .env files:"
    echo "$FORCE_IN_ENV"
    echo
    echo "   Vérifier que ce n'est pas dans .env.production"
    
    # Check specifically .env.production
    if [ -f ".env.production" ]; then
      PROD_FORCE=$(grep "^FORCE_LOCAL_PROVIDER=" .env.production || true)
      if [ -n "$PROD_FORCE" ]; then
        echo "❌ FAIL: FORCE_LOCAL_PROVIDER SET in .env.production"
        FAIL=1
      else
        echo "✅ PASS: Not in .env.production"
      fi
    fi
  else
    echo "✅ PASS: FORCE_LOCAL_PROVIDER not in .env files"
  fi
else
  echo "ℹ️  No .env files found"
fi

echo

# Check 4: Backend Rust — vérifier log si var active
echo "[Check 4] Vérifier backend log FORCE_LOCAL_PROVIDER..."

RUST_WARN=$(rg -n "FORCE_LOCAL_PROVIDER.*WARN" src-tauri/src/ --type rust || true)

if [ -n "$RUST_WARN" ]; then
  echo "✅ PASS: Backend logs WARN if FORCE_LOCAL_PROVIDER active"
  echo "   Found at:"
  echo "$RUST_WARN"
else
  echo "⚠️  INFO: No explicit WARN for FORCE_LOCAL_PROVIDER in Rust"
  echo "   (May be implicit in logic)"
fi

echo
echo "==="

if [ $FAIL -eq 1 ]; then
  echo "❌ GATE G2: FAIL"
  exit 1
else
  echo "✅ GATE G2: PASS"
  exit 0
fi
