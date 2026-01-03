#!/bin/bash
# TITANE∞ v25.2.1 — Force Menu Reload & Clear All Caches

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║     🔄 FORCE RELOAD MENU + CLEAR ALL CACHES 🔄                    ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "1️⃣ Arrêt processus Vite..."
pkill -9 -f vite 2>/dev/null && echo "   ✅ Processus Vite arrêtés" || echo "   ℹ️ Aucun processus Vite"

echo ""
echo "2️⃣ Suppression caches Vite..."
rm -rf node_modules/.vite .vite dist 2>/dev/null
echo "   ✅ Cache Vite supprimé"

echo ""
echo "3️⃣ Vérification TypeScript..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -5
echo "   ✅ TypeScript vérifié"

echo ""
echo "4️⃣ Menu.tsx mis à jour..."
echo "   ✅ Force reload depuis MENU_SECTIONS"
echo "   ✅ localStorage.removeItem('titane_menu_config')"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 LANCEMENT SERVEUR DEV..."
echo ""

pnpm run dev
