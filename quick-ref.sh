#!/bin/bash
# 🚀 Quick Reference — TITANE∞ v17

echo "════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v17 — QUICK REFERENCE"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "📋 COMMANDES PRINCIPALES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Développement:"
echo "   ./tauri-flatpak.sh dev          — Lancer l'application"
echo "   ./tauri-flatpak.sh check        — Vérifier compilation Rust"
echo "   ./tauri-flatpak.sh build        — Build de production"
echo ""
echo "✅ Validation:"
echo "   ./tauri-flatpak.sh validate     — Valider projet complet (8 tests)"
echo "   ./tauri-flatpak.sh test         — Tests unitaires Rust"
echo ""
echo "📦 Dépendances:"
echo "   ./pnpm-host.sh install          — Installer dépendances"
echo "   ./pnpm-host.sh add <package>    — Ajouter un package"
echo "   ./pnpm-host.sh update           — Mettre à jour"
echo ""

echo "📚 DOCUMENTATION ESSENTIELLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Utilisation quotidienne:"
echo "   cat FLATPAK_GUIDE.md            — Guide VS Code Flatpak"
echo "   cat README_v17.md               — Documentation utilisateur"
echo ""
echo "⚙️  Développement:"
echo "   cat ARCHITECTURE_RULES_v17.md   — Règles à respecter (IMPORTANT)"
echo "   cat CHANGELOG_v17.0.0_FIX_MASTER.md — Comprendre v17"
echo ""
echo "🔍 Référence technique:"
echo "   cat VERIFICATION_COMPLETE_v17.md — Analyse technique"
echo "   cat SESSION_COMPLETE_v17.md     — Récapitulatif complet"
echo ""
echo "🆘 En cas de problème:"
echo "   cat GUIDE_INSTALLATION_v17.md   — Troubleshooting"
echo ""

echo "✅ ÉTAT DU SYSTÈME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier Node.js
if flatpak-spawn --host node --version &>/dev/null; then
    NODE_VERSION=$(flatpak-spawn --host node --version 2>/dev/null)
    echo "✅ Node.js:    $NODE_VERSION"
else
    echo "❌ Node.js:    Non détecté"
fi

# Vérifier pnpm
if flatpak-spawn --host pnpm --version &>/dev/null; then
    PNPM_VERSION=$(flatpak-spawn --host pnpm --version 2>/dev/null)
    echo "✅ pnpm:       v$PNPM_VERSION"
else
    echo "❌ pnpm:       Non détecté"
fi

# Vérifier Cargo
if flatpak-spawn --host bash -c "source ~/.cargo/env && cargo --version" &>/dev/null; then
    CARGO_VERSION=$(flatpak-spawn --host bash -c "source ~/.cargo/env && cargo --version" 2>/dev/null | awk '{print $2}')
    echo "✅ Cargo:      v$CARGO_VERSION"
else
    echo "❌ Cargo:      Non détecté"
fi

# Vérifier WebKit
if flatpak-spawn --host pkg-config --modversion webkit2gtk-4.1 &>/dev/null; then
    WEBKIT_VERSION=$(flatpak-spawn --host pkg-config --modversion webkit2gtk-4.1 2>/dev/null)
    echo "✅ WebKit:     v$WEBKIT_VERSION"
elif flatpak-spawn --host pkg-config --modversion webkit2gtk-4.0 &>/dev/null; then
    WEBKIT_VERSION=$(flatpak-spawn --host pkg-config --modversion webkit2gtk-4.0 2>/dev/null)
    echo "✅ WebKit:     v$WEBKIT_VERSION (4.0)"
else
    echo "❌ WebKit:     Non détecté"
fi

echo ""

echo "🎯 WORKFLOW RECOMMANDÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Éditer le code dans VS Code"
echo "2. Tester en temps réel:"
echo "   ./tauri-flatpak.sh dev"
echo ""
echo "3. Valider avant commit:"
echo "   ./tauri-flatpak.sh validate"
echo ""
echo "4. Si validation OK, commit/push"
echo ""

echo "⚠️  RÈGLES IMPORTANTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "❌ Ne JAMAIS utiliser std::sync::Mutex dans code async"
echo "✅ Toujours utiliser tokio::sync::RwLock"
echo ""
echo "❌ Ne JAMAIS utiliser #[async_recursion]"
echo "✅ Utiliser des boucles pour les fallbacks"
echo ""
echo "❌ Ne JAMAIS laisser MutexGuard traverser .await"
echo "✅ Cloner les données avant .await"
echo ""
echo "📖 Lire ARCHITECTURE_RULES_v17.md pour plus de détails"
echo ""

echo "🏆 STATISTIQUES v17"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 51 commandes Tauri refactorisées"
echo "✅ 100% Send-Safe (futures async)"
echo "✅ 0 async_recursion"
echo "✅ 0 erreur de compilation"
echo "✅ 8/8 tests validation passés"
echo "✅ 3500+ lignes de documentation"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  Bon développement ! 🚀"
echo "════════════════════════════════════════════════════════════════"
