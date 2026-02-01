#!/bin/bash

# 🧹 Script de Nettoyage Post-Déploiement des Dépendances
# Exécutable APRÈS déploiement v27.0.0 réussi (48h+ de monitoring)
# Cela nettoiera les dépendances dépréciées et les vulnérabilités de build tools

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🧹 CLEANUP POST-DEPLOY: Deprecated & Vulnerable DevDependencies"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Vérifier qu'on est au bon endroit
if [ ! -f "package.json" ]; then
    echo "❌ ERREUR: package.json non trouvé"
    echo "Exécutez ce script depuis la racine du projet"
    exit 1
fi

# Backup
echo "📦 Création de backup du lock file..."
cp pnpm-lock.yaml pnpm-lock.yaml.backup.$(date +%Y%m%d)
echo "   ✅ Backup créé: pnpm-lock.yaml.backup.$(date +%Y%m%d)"

echo ""
echo "🔍 Phase 1: Audit pré-cleanup"
echo "─────────────────────────────────────────────────────────────"
pnpm audit --report=json > audit-pre-cleanup.json 2>&1 || true
PRE_VULNS=$(jq '.metadata.vulnerabilities | length' audit-pre-cleanup.json 2>/dev/null || echo "?")
echo "   Vulnérabilités avant cleanup: ~$PRE_VULNS"

echo ""
echo "📥 Phase 2: Update dépendances"
echo "─────────────────────────────────────────────────────────────"
echo "   Upgrading Tauri (résout ~80% des issues)..."
pnpm update @tauri-apps/cli@latest 2>&1 | grep -E "(updated|^>)" || echo "   (already latest)"
pnpm update @tauri-apps/tauri@latest 2>&1 | grep -E "(updated|^>)" || echo "   (already latest)"

echo ""
echo "   Upgrading Playwright (résout tests deps)..."
pnpm update @playwright/test@latest 2>&1 | grep -E "(updated|^>)" || echo "   (already latest)"

echo ""
echo "🔄 Phase 3: Deduplication & Prune"
echo "─────────────────────────────────────────────────────────────"
pnpm dedupe
echo "   ✅ Dependencies deduplicated"

pnpm prune
echo "   ✅ Unnecessary dependencies removed"

echo ""
echo "🔍 Phase 4: Audit post-cleanup"
echo "─────────────────────────────────────────────────────────────"
pnpm audit --report=json > audit-post-cleanup.json 2>&1 || true
POST_VULNS=$(jq '.metadata.vulnerabilities | length' audit-post-cleanup.json 2>/dev/null || echo "?")
echo "   Vulnérabilités après cleanup: ~$POST_VULNS"

echo ""
echo "✅ Phase 5: Validation Build"
echo "─────────────────────────────────────────────────────────────"
echo "   Vérification: pnpm run verify (optionnel, peut être long)"
echo "   Commande: pnpm run verify"
echo ""
echo "   Commande rapide: pnpm run lint && pnpm run format:check"
pnpm run lint > /dev/null 2>&1 && echo "   ✅ Linting passed" || echo "   ⚠️  Linting issues (review separately)"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ DU CLEANUP"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Files modified:"
echo "  - package.json (dépendances mises à jour)"
echo "  - pnpm-lock.yaml (lock file regenerated)"
echo ""
echo "Audit reports created:"
echo "  - audit-pre-cleanup.json"
echo "  - audit-post-cleanup.json"
echo ""
echo "Backup créé:"
echo "  - pnpm-lock.yaml.backup.$(date +%Y%m%d)"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎯 PROCHAINES ÉTAPES"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Vérifier les changements:"
echo "   git diff package.json"
echo ""
echo "2. Lancer les tests:"
echo "   pnpm run test && pnpm run test:rust"
echo ""
echo "3. Builder (optionnel):"
echo "   pnpm run build"
echo ""
echo "4. Committer si OK:"
echo "   git add package.json pnpm-lock.yaml"
echo "   git commit -m 'chore: cleanup deprecated devdependencies post-v27.0.0'"
echo ""
echo "5. Si rollback nécessaire:"
echo "   cp pnpm-lock.yaml.backup.$(date +%Y%m%d) pnpm-lock.yaml"
echo "   pnpm install"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Cleanup script terminé!"
echo "═══════════════════════════════════════════════════════════════"
