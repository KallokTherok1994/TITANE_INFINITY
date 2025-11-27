#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TITANE∞ v16.2.2 — APPLICATION OPTIMISATIONS VS CODE
# Script d'installation automatique
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="/home/titane/Documents/TITANE_INFINITY"
BACKUP_DIR="$PROJECT_DIR/.vscode/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  TITANE∞ — OPTIMISATION VS CODE v16.2.2                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 1: BACKUP
# ─────────────────────────────────────────────────────────────────
echo "📦 Backup configurations..."
mkdir -p "$BACKUP_DIR"
cp "$PROJECT_DIR/.vscode/settings.json" "$BACKUP_DIR/settings_$TIMESTAMP.json" 2>/dev/null || true
cp "$PROJECT_DIR/.vscode/argv.json" "$BACKUP_DIR/argv_$TIMESTAMP.json" 2>/dev/null || true
cp "$PROJECT_DIR/.vscode/extensions.json" "$BACKUP_DIR/extensions_$TIMESTAMP.json" 2>/dev/null || true
echo "✅ Backup créé: $BACKUP_DIR"
echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 2: VÉRIFIER WATCHERS SYSTÈME
# ─────────────────────────────────────────────────────────────────
echo "👀 Vérification watchers système..."
CURRENT_WATCHERS=$(cat /proc/sys/fs/inotify/max_user_watches)
REQUIRED_WATCHERS=524288

if [ "$CURRENT_WATCHERS" -lt "$REQUIRED_WATCHERS" ]; then
  echo "⚠️  Watchers actuels: $CURRENT_WATCHERS (insuffisant)"
  echo "🔧 Augmentation à $REQUIRED_WATCHERS..."

  # Vérifier si déjà dans sysctl.conf
  if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf 2>/dev/null; then
    echo "fs.inotify.max_user_watches=$REQUIRED_WATCHERS" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "✅ Watchers augmentés à $REQUIRED_WATCHERS"
  else
    echo "✅ Watchers déjà configurés (redémarrage peut être requis)"
  fi
else
  echo "✅ Watchers OK: $CURRENT_WATCHERS"
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 3: VÉRIFIER GPU SUPPORT
# ─────────────────────────────────────────────────────────────────
echo "🎮 Vérification support GPU..."

# Check drivers iGPU
if lspci | grep -qi 'intel.*graphics'; then
  echo "✅ iGPU Intel détecté"
  if dpkg -l | grep -q intel-media-va-driver; then
    echo "✅ Drivers Intel installés"
  else
    echo "⚠️  Drivers Intel manquants"
    echo "   Installer avec: sudo apt install intel-media-va-driver mesa-va-drivers"
  fi
elif lspci | grep -qi 'amd.*vga'; then
  echo "✅ iGPU AMD détecté"
  if dpkg -l | grep -q mesa-va-drivers; then
    echo "✅ Drivers AMD installés"
  else
    echo "⚠️  Drivers AMD manquants"
    echo "   Installer avec: sudo apt install mesa-va-drivers"
  fi
else
  echo "⚠️  Pas d'iGPU détecté (GPU discret?)"
fi
echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 4: NETTOYER CACHES
# ─────────────────────────────────────────────────────────────────
echo "🧹 Nettoyage caches VS Code..."

# Cache VS Code
CACHE_SIZE=$(du -sh ~/.config/Code/Cache 2>/dev/null | cut -f1 || echo "0")
echo "   Cache actuel: $CACHE_SIZE"

if [ -d ~/.config/Code/Cache ]; then
  rm -rf ~/.config/Code/Cache/*
  echo "✅ Cache VS Code nettoyé"
fi

if [ -d ~/.config/Code/CachedData ]; then
  rm -rf ~/.config/Code/CachedData/*
  echo "✅ CachedData nettoyé"
fi

if [ -d ~/.config/Code/logs ]; then
  rm -rf ~/.config/Code/logs/*
  echo "✅ Logs nettoyés"
fi

# Cache node_modules (seulement .cache, pas node_modules entier)
if [ -d "$PROJECT_DIR/node_modules/.cache" ]; then
  rm -rf "$PROJECT_DIR/node_modules/.cache"
  echo "✅ node_modules/.cache nettoyé"
fi

if [ -d "$PROJECT_DIR/node_modules/.vite" ]; then
  rm -rf "$PROJECT_DIR/node_modules/.vite"
  echo "✅ .vite cache nettoyé"
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 5: VÉRIFIER CONFIGURATIONS
# ─────────────────────────────────────────────────────────────────
echo "📋 Vérification configurations..."

# settings.json
if grep -q "typescript.tsserver.maxTsServerMemory.*8192" "$PROJECT_DIR/.vscode/settings.json"; then
  echo "✅ TypeScript memory: 8GB"
else
  echo "⚠️  TypeScript memory: 4GB (à mettre à jour)"
fi

if grep -q "terminal.integrated.gpuAcceleration.*on" "$PROJECT_DIR/.vscode/settings.json"; then
  echo "✅ Terminal GPU acceleration: ON"
else
  echo "⚠️  Terminal GPU acceleration: OFF (à activer)"
fi

if grep -q "workbench.editor.limit.enabled.*true" "$PROJECT_DIR/.vscode/settings.json"; then
  echo "✅ Editor limits: Activés"
else
  echo "⚠️  Editor limits: Désactivés (à activer)"
fi

# argv.json
if [ -f "$PROJECT_DIR/.vscode/argv.json" ]; then
  if grep -q "enable-gpu-rasterization" "$PROJECT_DIR/.vscode/argv.json"; then
    echo "✅ argv.json GPU flags: OK"
  else
    echo "⚠️  argv.json GPU flags: Manquants"
  fi
else
  echo "⚠️  argv.json: Fichier manquant"
fi

echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 6: DIAGNOSTIC EXTENSIONS
# ─────────────────────────────────────────────────────────────────
echo "🔌 Extensions VS Code..."

# Extensions critiques
CRITICAL_EXTS=(
  "rust-lang.rust-analyzer"
  "tauri-apps.tauri-vscode"
  "dbaeumer.vscode-eslint"
  "esbenp.prettier-vscode"
  "bradlc.vscode-tailwindcss"
)

for ext in "${CRITICAL_EXTS[@]}"; do
  if code --list-extensions | grep -q "$ext"; then
    echo "✅ $ext"
  else
    echo "⚠️  $ext (MANQUANT - installer avec: code --install-extension $ext)"
  fi
done

# Extensions gourmandes (optionnel avertissement)
HEAVY_EXTS=(
  "eamodio.gitlens"
  "usernamehw.errorlens"
  "ms-vscode.live-server"
)

echo ""
echo "📊 Extensions gourmandes installées (considérer désactivation):"
for ext in "${HEAVY_EXTS[@]}"; do
  if code --list-extensions | grep -q "$ext"; then
    echo "⚠️  $ext (GOURMAND - désactiver avec: code --disable-extension $ext)"
  fi
done

echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 7: RÉSUMÉ
# ─────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  RÉSUMÉ OPTIMISATION                                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Ressources Système:"
echo "   CPU: $(nproc) cores"
echo "   RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "   Watchers: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo ""
echo "📂 Projet TITANE:"
echo "   Rust target: $(du -sh $PROJECT_DIR/src-tauri/target 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   node_modules: $(du -sh $PROJECT_DIR/node_modules 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   dist: $(du -sh $PROJECT_DIR/dist 2>/dev/null | cut -f1 || echo 'N/A')"
echo ""
echo "🎯 Prochaines Étapes:"
echo "   1. Relancer VS Code: code $PROJECT_DIR"
echo "   2. Vérifier GPU: code --verbose 2>&1 | grep -i gpu"
echo "   3. Monitorer: watch -n 2 'ps aux | grep [c]ode | wc -l'"
echo "   4. Tests Chat IA: npm run tauri:dev"
echo ""
echo "✅ Optimisation terminée!"
echo ""
