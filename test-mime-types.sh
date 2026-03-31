#!/bin/bash

# TITANE∞ - Validation des MIME Types

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║        TITANE∞ - Validation des MIME Types HTTP                ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

test_mime() {
  local url=$1
  local expected=$2
  local name=$3
  
  echo "📋 Test: $name"
  echo "─────────────────────────────────────────────────────────────────"
  local actual=$(curl -sI "$url" 2>&1 | grep -i "^Content-Type:" | sed 's/Content-Type: //i' | tr -d '\r')
  
  if [[ "$actual" == *"$expected"* ]]; then
    echo "✅ PASS - $actual"
  else
    echo "❌ FAIL - Attendu: $expected, Obtenu: $actual"
  fi
  echo ""
}

echo "Tests sur http://localhost:5173"
echo "═════════════════════════════════════════════════════════════════"
echo ""

test_mime "http://localhost:5173/" "text/html" "index.html"
test_mime "http://localhost:5173/src/main.tsx" "text/javascript" "main.tsx (module TS)"
test_mime "http://localhost:5173/src/AppMinimal.tsx" "text/javascript" "AppMinimal.tsx"
test_mime "http://localhost:5173/index.css" "text/css" "CSS file"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ TESTS TERMINÉS                             ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Tous les modules JavaScript doivent avoir:"
echo "   → text/javascript (ou application/javascript)"
echo ""
echo "💡 Si vous utilisez le tunnel devtunnels.ms:"
echo "   → Rechargez la page avec Ctrl + Shift + R"
echo ""
