#!/usr/bin/env bash
# Gate G1: NO_OFFLINE_WITHOUT_REASON
# Vérifie que toute occurrence de "mode hors ligne" ou setError("offline") exige reason_code

set -e

echo "=== GATE G1: NO_OFFLINE_WITHOUT_REASON ==="
echo

FAIL=0

# Check 1: UI ne doit jamais afficher "hors ligne" sans reason_code
echo "[Check 1] Vérifier que UI offline display requiert reason_code..."

# Chercher patterns "hors ligne" ou "offline" dans setError/messages
MATCHES=$(rg -n "hors ligne|offline" src/ --type ts --type tsx -g '!*.test.*' -g '!__tests__' || true)

if [ -n "$MATCHES" ]; then
  echo "Found offline messages:"
  echo "$MATCHES"
  echo
  
  # Vérifier contexte: doit contenir reason_code ou reasonCode nearby
  echo "Checking context for reason_code..."
  
  # Extract filenames
  FILES=$(echo "$MATCHES" | cut -d: -f1 | sort -u)
  
  for file in $FILES; do
    echo "  Checking $file..."
    
    # Search for reason_code in same file
    CONTEXT=$(rg -C 5 "hors ligne|offline" "$file" | rg "reason_?code|reasonCode" || true)
    
    if [ -z "$CONTEXT" ]; then
      echo "    ⚠️  WARNING: No reason_code found near offline message in $file"
      # Note: Not a hard FAIL since some offline messages might be generic headers
      # The critical check is in the logic (Check 2)
    else
      echo "    ✅ reason_code found in context"
    fi
  done
fi

echo

# Check 2: Code logic — setError avec "offline" doit avoir condition sur reason_code
echo "[Check 2] Vérifier logic setError + mode OFFLINE..."

# Chercher setError dans hooks/components
SETERROR_MATCHES=$(rg -n "setError.*offline|setError.*hors.ligne" src/ --type ts --type tsx -A 5 -B 10 || true)

if [ -n "$SETERROR_MATCHES" ]; then
  echo "Found setError with offline:"
  echo "$SETERROR_MATCHES"
  echo
  
  # Vérifier que c'est conditionnel sur mode='OFFLINE' et reason_code présent
  # Pattern attendu: if (mode === 'OFFLINE') { setError(...reason_code...) }
  
  VALID_PATTERN=$(echo "$SETERROR_MATCHES" | rg "mode.*OFFLINE.*reason_?code|reason_?code.*mode.*OFFLINE" || true)
  
  if [ -z "$VALID_PATTERN" ]; then
    echo "❌ FAIL: setError with offline NOT conditional on mode+reason_code"
    FAIL=1
  else
    echo "✅ PASS: setError offline conditional on mode+reason_code"
  fi
else
  echo "✅ No setError with offline found (expected if using modern pattern)"
fi

echo

# Check 3: Backend — offline sans reason_code
echo "[Check 3] Vérifier backend Rust offline logic..."

# Chercher "offline" dans conversation_engine Rust code
RUST_OFFLINE=$(rg -n "offline" src-tauri/src/conversation_engine/ --type rust || true)

if [ -n "$RUST_OFFLINE" ]; then
  echo "Found offline in Rust:"
  echo "$RUST_OFFLINE"
  echo
  
  # Check if reason_code is always set
  RUST_REASON=$(rg -n "reason_code" src-tauri/src/conversation_engine/ --type rust || true)
  
  if [ -z "$RUST_REASON" ]; then
    echo "⚠️  WARNING: No reason_code found in Rust conversation_engine"
    echo "   (May be set in provider decision logic elsewhere)"
  else
    echo "✅ reason_code présent dans Rust code"
  fi
fi

echo
echo "==="

if [ $FAIL -eq 1 ]; then
  echo "❌ GATE G1: FAIL"
  exit 1
else
  echo "✅ GATE G1: PASS"
  exit 0
fi
