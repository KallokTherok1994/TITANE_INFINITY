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

# Optional auto-restart after heal
AUTO_HEAL_RESTART=${AUTO_HEAL_RESTART:-0}
RELEASE_BIN_PATH="$REPO_ROOT/src-tauri/target/release/titane-infinity"

# Small helper for safe in-place file edits
safe_inplace_edit() {
  # usage: safe_inplace_edit <file> <tmp_suffix>
  local file="$1"; shift
  local tmp="$file.$(date +%s).tmp"
  cat > "$tmp" && mv "$tmp" "$file"
}

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

# Function: active monitoring for rapid restart toggles
monitor_restarts() {
  echo
  echo "📡 Mode monitor: détection de toggles de process pendant 15s..."
  local toggles=0
  local prev_state="unknown"
  for i in $(seq 1 15); do
    local running
    if pgrep -x "titane-infinity" >/dev/null 2>&1; then
      running="on"
    else
      running="off"
    fi
    if [[ "$prev_state" != "unknown" && "$running" != "$prev_state" ]]; then
      toggles=$((toggles + 1))
    fi
    prev_state="$running"
    sleep 1
  done
  echo "Toggles détectés: $toggles"
  if [[ "$toggles" -ge 2 ]]; then
    echo -e "${RED}❌ Boucle de reboot détectée via monitor (toggles=$toggles)${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    return 1
  fi
  echo -e "${GREEN}✅ Aucun toggle anormal détecté (monitor)${NC}"
  return 0
}

# Function: detect dev processes that can cause HMR reload loops and optionally kill them
detect_and_handle_dev_processes() {
  echo
  echo "🔍 Détection des processus dev (vite/tauri)..."

  local dev_pids
  dev_pids=$(ps aux | grep -E "vite dev|tauri dev|pnpm run dev" | grep -v grep | awk '{print $2}')

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

# Function: fix entrypoint (ensure main.tsx and remove debug boot.ts)
fix_entrypoint() {
  echo
  echo "🔧 Vérification/Correction de l'entrypoint index.html..."
  local idx="$REPO_ROOT/index.html"
  if [[ -f "$idx" ]]; then
    if grep -q "/src/boot.ts" "$idx"; then
      echo -e "${YELLOW}⚠️  index.html charge boot.ts → correction vers main.tsx${NC}"
      # Replace only the exact script line
      sed -i 's|/src/boot.ts|/src/main.tsx|g' "$idx"
      ISSUES_FIXED=$((ISSUES_FIXED + 1))
      echo -e "${GREEN}✅ index.html corrigé (main.tsx)${NC}"
    else
      echo -e "${GREEN}✅ index.html OK (main.tsx)${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️  index.html introuvable${NC}"
  fi

  # Remove debug boot.ts if present
  local boot_ts="$REPO_ROOT/src/boot.ts"
  if [[ -f "$boot_ts" ]]; then
    echo -e "${YELLOW}⚠️  Suppression du fichier debug src/boot.ts${NC}"
    rm -f "$boot_ts"
    ISSUES_FIXED=$((ISSUES_FIXED + 1))
    echo -e "${GREEN}✅ src/boot.ts supprimé${NC}"
  fi
}

# Function: fix duplicate default_task_timeout_ms in Rust config
fix_rust_duplicate_timeout() {
  echo
  echo "🔧 Vérification/Correction duplication default_task_timeout_ms (Rust)..."
  local cfg="$REPO_ROOT/src-tauri/src/agent_system/config.rs"
  if [[ -f "$cfg" ]]; then
    local count
    count=$(grep -n "default_task_timeout_ms:" "$cfg" | wc -l | tr -d ' ')
    if [[ "$count" -gt 1 ]]; then
      echo -e "${YELLOW}⚠️  ${count} occurrences détectées → suppression des duplications${NC}"
      # Keep first occurrence, remove subsequent duplicates
      awk 'BEGIN{seen=0} /default_task_timeout_ms:/{if(seen++){next}} {print}' "$cfg" > "$cfg.fixed" && mv "$cfg.fixed" "$cfg"
      ISSUES_FIXED=$((ISSUES_FIXED + 1))
      echo -e "${GREEN}✅ Duplication supprimée${NC}"
    else
      echo -e "${GREEN}✅ Aucun doublon détecté${NC}"
    fi
  else
    echo -e "${YELLOW}ℹ️  Fichier config.rs introuvable${NC}"
  fi
}

# Function: controlled restart with backoff
controlled_restart() {
  if [[ "$AUTO_HEAL_RESTART" != "1" ]]; then
    echo -e "${YELLOW}ℹ️  AUTO_HEAL_RESTART=1 non défini → pas de relance automatique${NC}"
    return 0
  fi
  echo
  echo "🔄 Relance contrôlée avec backoff..."
  # Stop dev processes and app
  detect_and_handle_dev_processes
  pkill -x titane-infinity 2>/dev/null || true
  sleep 2
  # Build binary if missing
  if [[ ! -x "$RELEASE_BIN_PATH" ]]; then
    echo -e "${YELLOW}⚠️  Binaire manquant → compilation release${NC}"
    (cd "$REPO_ROOT/src-tauri" && cargo build --release) || {
      echo -e "${RED}❌ Échec compilation release${NC}"; return 1;
    }
  fi
  echo "⏳ Backoff 5s avant relance..."
  sleep 5
  nohup "$RELEASE_BIN_PATH" >/dev/null 2>&1 &
  echo -e "${GREEN}✅ Processus relancé (release)${NC}"
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

# Function: check AppImage runtime prerequisites and fallback
check_appimage_runtime() {
  echo
  echo "🔍 Vérification AppImage (FUSE / fallback extraction)..."

  # Locate AppImage artifact
  local appimg
  appimg=$(find "$REPO_ROOT/src-tauri" -maxdepth 6 -type f -name "*.AppImage" 2>/dev/null | head -n 1 || true)

  if [[ -z "$appimg" ]]; then
    echo -e "${YELLOW}ℹ️  Aucun AppImage trouvé (skip). Construisez avec: npm run build ou tauri build${NC}"
  else
    echo "AppImage: $appimg"
    # Check FUSE availability
    if command -v fusermount3 >/dev/null 2>&1 || command -v fusermount >/dev/null 2>&1; then
      echo -e "${GREEN}✅ FUSE détecté (montage AppImage possible)${NC}"
    else
      echo -e "${YELLOW}⚠️  FUSE non détecté → AppImage peut échouer au montage${NC}"
      echo -e "${YELLOW}   ➜ Ubuntu/Debian: sudo apt install -y fuse3${NC}"
      echo -e "${YELLOW}   ➜ Anciennes AppImage: sudo apt install -y libfuse2${NC}"
      echo -e "${YELLOW}   ➜ Fallback extraction: ${NC}"
      echo "       cd $(dirname \"$appimg\") && \"$appimg\" --appimage-extract && ./squashfs-root/AppRun"
    fi
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
check_appimage_runtime

# Heal known issues proactively
fix_entrypoint
fix_rust_duplicate_timeout

# Detect reboot loop and dev processes
if ! detect_reboot_loop; then
  # If reboot loop detected, handle dev processes and create disable marker
  detect_and_handle_dev_processes
  write_disable_autorestart_marker
  controlled_restart
fi

# Optional: monitor mode via CLI flag
if [[ "${1:-}" == "--monitor" ]]; then
  if ! monitor_restarts; then
    detect_and_handle_dev_processes
    write_disable_autorestart_marker
    controlled_restart
  fi
fi

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
