#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v19.2.0 — Post-Migration Validation Script
# Vérification complète après migration Flatpak → VS Code natif
# © 2025 Humain Total / Kevin Thibault
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════"
echo "🔧 TITANE∞ — Validation Post-Migration (Flatpak → Natif)"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 1. Vérification environnement système
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [1/8] Vérification environnement système..."
echo ""

echo "Node.js:"
which node && node --version || echo "❌ Node.js non trouvé"
echo ""

echo "npm:"
which npm && npm --version || echo "❌ npm non trouvé"
echo ""

echo "Cargo:"
which cargo && cargo --version || echo "❌ Cargo non trouvé"
echo ""

echo "Rust:"
which rustc && rustc --version || echo "❌ Rust non trouvé"
echo ""

echo "Tauri CLI:"
cargo tauri --version 2>/dev/null || echo "❌ Tauri CLI non trouvé"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 2. Vérification PATH
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [2/8] Vérification PATH..."
echo ""

if echo "$PATH" | grep -q "flatpak"; then
    echo "⚠️  Références Flatpak détectées dans PATH:"
    echo "$PATH" | tr ':' '\n' | grep flatpak
else
    echo "✅ Aucune référence Flatpak dans PATH"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 3. Vérification résidus Flatpak
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [3/8] Vérification résidus Flatpak..."
echo ""

if [ -f ".flatpak-warning" ]; then
    echo "⚠️  Fichier .flatpak-warning encore présent"
else
    echo "✅ .flatpak-warning supprimé"
fi

if grep -q "flatpak" .cargo/config.toml 2>/dev/null; then
    echo "⚠️  Références Flatpak dans .cargo/config.toml"
else
    echo "✅ .cargo/config.toml nettoyé"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 4. Vérification dépendances WebKit
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [4/8] Vérification dépendances système (WebKitGTK)..."
echo ""

if pkg-config --exists webkit2gtk-4.1; then
    echo "✅ webkit2gtk-4.1 installé"
    pkg-config --modversion webkit2gtk-4.1
else
    echo "❌ webkit2gtk-4.1 NON installé"
    echo "   Installez avec: sudo apt install libwebkit2gtk-4.1-dev"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 5. Vérification configuration VS Code
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [5/8] Vérification configuration VS Code..."
echo ""

if [ -f ".vscode/settings.json" ]; then
    echo "✅ .vscode/settings.json présent"
else
    echo "⚠️  .vscode/settings.json manquant"
fi

if [ -f ".vscode/extensions.json" ]; then
    echo "✅ .vscode/extensions.json présent"
else
    echo "⚠️  .vscode/extensions.json manquant"
fi

if [ -f ".vscode/tasks.json" ]; then
    echo "✅ .vscode/tasks.json présent"
else
    echo "⚠️  .vscode/tasks.json manquant"
fi

if [ -f ".vscode/launch.json" ]; then
    echo "✅ .vscode/launch.json présent"
else
    echo "⚠️  .vscode/launch.json manquant"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 6. Vérification artefacts de build
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [6/8] Vérification artefacts de build..."
echo ""

if [ -d "node_modules" ]; then
    echo "✅ node_modules présent ($(du -sh node_modules | cut -f1))"
else
    echo "⚠️  node_modules manquant - Exécutez: npm install"
fi

if [ -d "dist" ]; then
    echo "✅ dist/ présent (build frontend OK)"
else
    echo "⚠️  dist/ manquant - Exécutez: npm run build"
fi

if [ -d "src-tauri/target" ]; then
    echo "✅ src-tauri/target présent (build backend OK)"
else
    echo "ℹ️  src-tauri/target absent (normal si jamais compilé)"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 7. Tests de configuration
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [7/8] Tests de configuration..."
echo ""

echo "Type-check TypeScript:"
if npm run type-check 2>&1 | grep -q "error"; then
    echo "❌ Erreurs TypeScript détectées"
else
    echo "✅ Type-check OK"
fi
echo ""

echo "Cargo check:"
if cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | grep -q "error"; then
    echo "❌ Erreurs Rust détectées"
else
    echo "✅ Cargo check OK"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 8. Optimisation inotify watchers
# ───────────────────────────────────────────────────────────────────────────
echo "📋 [8/8] Vérification watchers (inotify)..."
echo ""

CURRENT_WATCHES=$(cat /proc/sys/fs/inotify/max_user_watches)
RECOMMENDED_WATCHES=524288

echo "Watchers actuels: $CURRENT_WATCHES"
echo "Recommandé: $RECOMMENDED_WATCHES"

if [ "$CURRENT_WATCHES" -lt "$RECOMMENDED_WATCHES" ]; then
    echo "⚠️  Watchers insuffisants pour grand projet"
    echo "   Augmentez avec:"
    echo "   echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf"
    echo "   sudo sysctl -p"
else
    echo "✅ Watchers optimaux"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Résumé final
# ───────────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════════════"
echo "✅ VALIDATION POST-MIGRATION TERMINÉE"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes recommandées:"
echo ""
echo "1. Redémarrer VS Code pour appliquer toutes les configurations"
echo "2. Installer les extensions recommandées (.vscode/extensions.json)"
echo "3. Tester: npm run tauri:dev"
echo "4. Tester: npm run tauri:build"
echo ""
echo "Documentation:"
echo "- TAURI_SETUP_INSTRUCTIONS.md"
echo "- QUICK_START_v17.3.0.md"
echo ""
echo "════════════════════════════════════════════════════════════════════"
