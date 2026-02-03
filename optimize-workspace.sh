#!/bin/bash
# optimize-workspace.sh - Nettoyage et optimisation workspace TITANE∞

set -e

echo "🧹 TITANE∞ Workspace Optimization"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# Fonction pour calculer la taille
get_size() {
  du -sh "$1" 2>/dev/null | awk '{print $1}' || echo "0"
}

# Afficher l'état actuel
echo "📊 État actuel du workspace:"
echo ""
RUST_TARGET_SIZE=$(get_size "src-tauri/target")
NODE_MODULES_SIZE=$(get_size "node_modules")
DIST_SIZE=$(get_size "dist")
SRC_SIZE=$(get_size "src")

echo "  • Rust target/:      $RUST_TARGET_SIZE"
echo "  • node_modules/:     $NODE_MODULES_SIZE"
echo "  • dist/:             $DIST_SIZE"
echo "  • src/:              $SRC_SIZE"
echo ""

# Confirmation
read -p "🤔 Nettoyer les artefacts de build ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  info "Opération annulée"
  exit 0
fi

echo ""
echo "🧹 Nettoyage en cours..."
echo ""

# 1. Nettoyage Rust (target/)
if [ -d "src-tauri/target" ]; then
  info "Nettoyage Rust target/ (conserve seulement debug/titane-infinity)..."
  
  # Sauvegarder le binaire de dev
  if [ -f "src-tauri/target/debug/titane-infinity" ]; then
    cp src-tauri/target/debug/titane-infinity /tmp/titane-infinity-backup 2>/dev/null || true
  fi
  
  # Nettoyage cargo
  cd src-tauri
  cargo clean
  cd ..
  
  # Restaurer le binaire
  if [ -f "/tmp/titane-infinity-backup" ]; then
    mkdir -p src-tauri/target/debug
    mv /tmp/titane-infinity-backup src-tauri/target/debug/titane-infinity
  fi
  
  NEW_RUST_SIZE=$(get_size "src-tauri/target")
  success "Rust target/ nettoyé: $RUST_TARGET_SIZE → $NEW_RUST_SIZE"
else
  warn "Répertoire src-tauri/target/ introuvable"
fi

echo ""

# 2. Nettoyage node_modules (optionnel)
read -p "🤔 Réinstaller node_modules proprement ? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  info "Suppression node_modules/..."
  rm -rf node_modules/
  
  info "Réinstallation avec pnpm install..."
  pnpm install --frozen-lockfile
  
  NEW_NODE_SIZE=$(get_size "node_modules")
  success "node_modules/ réinstallé: $NODE_MODULES_SIZE → $NEW_NODE_SIZE"
fi

echo ""

# 3. Nettoyage dist/ et cache Vite
if [ -d "dist" ]; then
  info "Nettoyage dist/..."
  rm -rf dist/
  success "dist/ supprimé"
fi

if [ -d "node_modules/.vite" ]; then
  info "Nettoyage cache Vite..."
  rm -rf node_modules/.vite
  success "Cache Vite supprimé"
fi

echo ""

# 4. Nettoyage logs anciens
info "Nettoyage logs anciens (>7 jours)..."
LOGS_DELETED=$(find /tmp -name "titan-*.log" -mtime +7 -delete -print 2>/dev/null | wc -l)
success "$LOGS_DELETED logs supprimés"

echo ""

# 5. Résumé final
echo "======================================"
echo "✅ Optimisation terminée !"
echo ""
echo "📊 Nouvel état:"
RUST_TARGET_SIZE_NEW=$(get_size "src-tauri/target")
NODE_MODULES_SIZE_NEW=$(get_size "node_modules")
DIST_SIZE_NEW=$(get_size "dist")

echo "  • Rust target/:      $RUST_TARGET_SIZE_NEW"
echo "  • node_modules/:     $NODE_MODULES_SIZE_NEW"
echo "  • dist/:             $DIST_SIZE_NEW"
echo ""

echo "💡 Commandes utiles:"
echo "  pnpm run dev:tauri          # Relancer dev"
echo "  cargo build --release       # Build optimisé"
echo "  du -sh src-tauri/target/    # Vérifier taille"
echo ""

# 6. Vérification TypeScript
info "Vérification TypeScript..."
TS_ERRORS=$(pnpm exec tsc --noEmit 2>&1 | grep -E "^(src|error TS)" | wc -l)
if [ "$TS_ERRORS" -eq 0 ]; then
  success "TypeScript: 0 erreurs"
else
  warn "TypeScript: $TS_ERRORS erreurs détectées"
fi

echo ""
echo "🎉 Workspace optimisé ! Prêt pour développement."
