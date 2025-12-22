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
REBOOT_EVENTS=0

# Params
MAX_RESTARTS_IN_WINDOW=${MAX_RESTARTS_IN_WINDOW:-3}
RESTART_WINDOW_SECONDS=${RESTART_WINDOW_SECONDS:-60}
AUTO_HEAL_KILL_DEV=${AUTO_HEAL_KILL_DEV:-1}
STATE_DIR="$HOME/.titane/auto-heal"
mkdir -p "$STATE_DIR" 2>/dev/null || true

# Function: detect rapid reboot loop (based on recent logs)
detect_reboot_loop() {
  echo
  echo "🔍 Détection de boucles de reboot rapides..."

  local log_file="$HOME/.titane/logs/titane.log"
  if [[ ! -f "$log_file" ]]; then
    echo -e "${YELLOW}ℹ️  Aucun log trouvé (skip)${NC}"
    return 0
  fi

  # Count recent window show events in the time window
  local now_epoch
  now_epoch=$(date +%s)
  local recent_count=0

  # Grep last 500 lines and count occurrences of successful window show events
  recent_count=$(tail -n 500 "$log_file" | grep -E "Main window shown successfully" | tail -n 200 | wc -l || echo 0)
  REBOOT_EVENTS=$recent_count

  if [[ "$recent_count" -ge "$MAX_RESTARTS_IN_WINDOW" ]]; then
    echo -e "${RED}❌ Boucle de reboot détectée (${recent_count} événements récents)${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo "$(date -Iseconds) reboot_loop count=$recent_count" >> "$STATE_DIR/reboot-history.log"
    return 1
  fi

  echo -e "${GREEN}✅ Aucun pattern de reboot rapide détecté${NC}"
  return 0
}

# Function: detect dev processes that can cause HMR reload loops and optionally kill them
detect_and_handle_dev_processes() {
  echo
  echo "🔍 Détection des processus dev (vite/tauri)..."

  local dev_pids
  dev_pids=$(ps aux | grep -E "(vite dev|tauri dev|pnpm run dev)" | grep -v grep | awk '{print $2}')

  if [[ -n "$dev_pids" ]]; then
    echo -e "${YELLOW}⚠️  Processus dev actifs détectés (peuvent provoquer des reloads rapides):${NC}"
    ps -o pid,cmd -p $dev_pids 2>/dev/null || true

    if [[ "$AUTO_HEAL_KILL_DEV" == "1" ]]; then
      echo -e "${YELLOW}🛑 Arrêt automatique des processus dev (AUTO_HEAL_KILL_DEV=1)${NC}"
      # Kill gently then force if needed
      kill $dev_pids 2>/dev/null || true
      sleep 1
      kill -9 $dev_pids 2>/dev/null || true
      ISSUES_FIXED=$((ISSUES_FIXED + 1))
      echo -e "${GREEN}✅ Processus dev arrêtés${NC}"
    else
      echo -e "${YELLOW}ℹ️  Laissez AUTO_HEAL_KILL_DEV=1 pour stopper automatiquement${NC}"
    fi
  else
    echo -e "${GREEN}✅ Aucun processus dev actif${NC}"
  fi
}

# Function: write disable-autorestart marker to prevent crashguard restarts
write_disable_autorestart_marker() {
  echo
  echo "🔧 Protection anti-redémarrage: création d'un marqueur..."
  local marker="$STATE_DIR/disable-autorestart"
  echo "created: $(date -Iseconds) reason=reboot_loop events=$REBOOT_EVENTS" > "$marker"
  echo -e "${GREEN}✅ Marqueur anti-redémarrage créé: $marker${NC}"
}

# Function: detect and fix merge conflicts
detect_merge_conflicts() {
  echo "🔍 Recherche de conflits de merge..."
  
  # 1) Conflits non résolus (index) via git ls-files -u
  local unmerged
  unmerged=$(git ls-files -u 2>/dev/null | awk '{print $4}' | sort -u || true)
  if [[ -n "$unmerged" ]]; then
    echo -e "${RED}❌ Conflits de merge détectés (index)${NC}"
    echo "$unmerged" | sed 's/^/ - /'
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    return 1
  fi

  # 2) Marqueurs de conflit dans fichiers texte suivis
  # Limiter aux racines pertinentes et ignorer les binaires
  local roots markers
  IFS=',' read -r -a roots <<< "${COPILOT_XS_ROOTS:-src,src-tauri/src,tests}"
  markers=""
  for root in "${roots[@]}"; do
    # git grep -I: ignore fichiers binaires, -n: lignes, -E: regex, -- "$root": limiter au dossier
    local found
    found=$(git grep -nI -E '^(<<<<<<< |=======|>>>>>>> )' -- "$root" 2>/dev/null || true)
    if [[ -n "$found" ]]; then
      markers+="$found\n"
    fi
  done

  if [[ -n "$markers" ]]; then
    echo -e "${RED}❌ Marqueurs de conflit trouvés dans les fichiers texte${NC}"
    echo -e "$markers" | sed 's/^/ - /'
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
    # Validation additionnelle: vérifier présence des fichiers compressés si plugin actif
    if [[ -d "dist" ]] && [[ -f "dist/stats.html" ]]; then
      local have_brotli have_gzip
      have_brotli=$(ls dist/*.br dist/*/*.br 2>/dev/null | wc -l | tr -d ' ')
      have_gzip=$(ls dist/*.gz dist/*/*.gz 2>/dev/null | wc -l | tr -d ' ')
      if [[ "$have_brotli" == "0" && "$have_gzip" == "0" ]]; then
        echo -e "${YELLOW}ℹ️  Fichiers compressés (.br/.gz) absents — re-génération via build recommandée${NC}"
        echo -e "${YELLOW}   ➜ Exécutez: npm run build${NC}"
      fi
    fi
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

# Detect reboot loop and dev processes
detect_reboot_loop || {
  # If reboot loop detected, handle dev processes and create disable marker
  detect_and_handle_dev_processes
  write_disable_autorestart_marker
}

# Summary
echo
echo "=================================================="
echo "📊 Résumé Auto-Heal"
echo "=================================================="
echo -e "Problèmes détectés: ${ISSUES_FOUND}"
echo -e "Problèmes corrigés: ${ISSUES_FIXED}"
echo -e "Événements reboot (récents): ${REBOOT_EVENTS}"

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
