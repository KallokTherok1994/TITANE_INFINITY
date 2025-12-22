#!/usr/bin/env bash
# TITANE_INFINITY - Auto-Heal Script
# Auto-détection et correction des problèmes courants

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 TITANE Auto-Heal - Diagnostic et réparation automatique"
echo "=================================================="
echo

# Export toolchain path
export PATH="$REPO_ROOT/.tools/node/current/bin:$PATH"

ISSUES_FOUND=0
ISSUES_FIXED=0

# Function: detect and fix merge conflicts
detect_merge_conflicts() {
  echo "🔍 Recherche de conflits de merge..."
  
  if git_files=$(git ls-files -u 2>/dev/null) && [[ -n "$git_files" ]]; then
    echo -e "${RED}❌ Conflits de merge détectés${NC}"
    git ls-files -u | awk '{print $4}' | sort -u
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    return 1
  fi
  
  # Check for conflict markers in tracked files
  if conflict_markers=$(git grep -n '^<<<<<<<' 2>/dev/null || true); then
    echo -e "${RED}❌ Marqueurs de conflit trouvés dans les fichiers${NC}"
    echo "$conflict_markers"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    return 1
  fi
  
  echo -e "${GREEN}✅ Aucun conflit de merge${NC}"
  return 0
}

# Function: check and fix lint issues
check_lint() {
  echo
  echo "🔍 Vérification ESLint..."
  
  if npm run lint -- --max-warnings=0 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Lint OK (0 warnings)${NC}"
  else
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo -e "${YELLOW}⚠️  Warnings lint détectés, application des fixes automatiques...${NC}"
    
    if npm run lint -- --fix; then
      ISSUES_FIXED=$((ISSUES_FIXED + 1))
      echo -e "${GREEN}✅ Lint fixes appliqués${NC}"
    else
      echo -e "${RED}❌ Certains warnings lint nécessitent une intervention manuelle${NC}"
    fi
  fi
}

# Function: check TypeScript
check_typescript() {
  echo
  echo "🔍 Vérification TypeScript..."
  
  if npm run check >/dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript OK (0 errors)${NC}"
  else
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo -e "${RED}❌ Erreurs TypeScript détectées${NC}"
    npm run check 2>&1 | tail -n 20
    echo
    echo -e "${YELLOW}💡 Suggestion: Vérifiez les types et corrigez manuellement${NC}"
  fi
}

# Function: check missing dependencies
check_dependencies() {
  echo
  echo "🔍 Vérification des dépendances..."
  
  if [[ ! -d "node_modules" ]] || [[ ! -f "node_modules/.package-lock.json" ]]; then
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo -e "${YELLOW}⚠️  node_modules manquant ou incomplet, installation...${NC}"
    
    if corepack pnpm install; then
      ISSUES_FIXED=$((ISSUES_FIXED + 1))
      echo -e "${GREEN}✅ Dépendances installées${NC}"
    else
      echo -e "${RED}❌ Échec de l'installation des dépendances${NC}"
    fi
  else
    echo -e "${GREEN}✅ Dépendances OK${NC}"
  fi
}

# Function: check git state
check_git_state() {
  echo
  echo "🔍 Vérification de l'état Git..."
  
  if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✅ Working tree propre${NC}"
  else
    echo -e "${YELLOW}⚠️  Modifications non commitées détectées${NC}"
    git status --short
  fi
}

# Function: check Rust compilation (quick check)
check_rust() {
  echo
  echo "🔍 Vérification rapide Rust..."
  
  if cd src-tauri && cargo check --quiet 2>/dev/null; then
    echo -e "${GREEN}✅ Rust OK${NC}"
    cd "$REPO_ROOT"
  else
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo -e "${YELLOW}⚠️  Erreurs Rust détectées (cargo check)${NC}"
    cd "$REPO_ROOT"
    echo -e "${YELLOW}💡 Suggestion: Exécutez 'cd src-tauri && cargo check' pour details${NC}"
  fi
}

# Function: clean build artifacts if corrupted
clean_if_corrupted() {
  echo
  echo "🔍 Vérification des artifacts de build..."
  
  if [[ -d "dist" ]] && [[ ! -f "dist/index.html" ]]; then
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo -e "${YELLOW}⚠️  dist/ corrompu, nettoyage...${NC}"
    rm -rf dist
    ISSUES_FIXED=$((ISSUES_FIXED + 1))
    echo -e "${GREEN}✅ dist/ nettoyé${NC}"
  else
    echo -e "${GREEN}✅ Build artifacts OK${NC}"
  fi
}

# Run all checks
detect_merge_conflicts || true
check_dependencies
check_lint
check_typescript
check_rust
check_git_state
clean_if_corrupted

# Summary
echo
echo "=================================================="
echo "📊 Résumé Auto-Heal"
echo "=================================================="
echo -e "Problèmes détectés: ${ISSUES_FOUND}"
echo -e "Problèmes corrigés: ${ISSUES_FIXED}"

if [[ $ISSUES_FOUND -eq 0 ]]; then
  echo -e "${GREEN}✅ Système sain - aucun problème détecté${NC}"
  exit 0
elif [[ $ISSUES_FIXED -eq $ISSUES_FOUND ]]; then
  echo -e "${GREEN}✅ Tous les problèmes ont été corrigés automatiquement${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Certains problèmes nécessitent une intervention manuelle${NC}"
  exit 1
fi
