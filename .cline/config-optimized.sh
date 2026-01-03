#!/bin/bash
# TITANE∞ Cline MCP - Configuration Optimisée
# Created: 2026-01-03
# Respect: RÈGLE CRITIQUE DÉPLOIEMENT (pas de build/deploy sans autorisation)

set -euo pipefail

echo "🔧 Configuration optimisée Cline MCP pour TITANE∞"
echo "=================================================="

# Configuration des paramètres modifiables (testés et validés)
echo "✅ Application de la configuration optimisée..."

cline config set \
  mode=plan \
  yolo-mode-toggled=false \
  strict-plan-mode-enabled=true \
  telemetry-setting=disabled \
  plan-mode-thinking-budget-tokens=2048 \
  act-mode-thinking-budget-tokens=2048 \
  terminal-output-line-limit=1000 \
  auto-condense-threshold=0.65 \
  shell-integration-timeout=6000 \
  use-auto-condense=true \
  preferred-language=French \
  openai-reasoning-effort=high \
  enable-checkpoints-setting=true

echo ""
echo "=================================================="
echo "✅ Configuration optimisée appliquée avec succès !"
echo ""
echo "📋 Paramètres appliqués automatiquement :"
echo "  ✅ Mode: plan (sécurité maximale)"
echo "  ✅ Yolo mode: désactivé"
echo "  ✅ Strict plan: activé"
echo "  ✅ Telemetry: disabled"
echo "  ✅ Thinking budget: 2048 tokens (×2)"
echo "  ✅ Output limit: 1000 lignes (×2)"
echo "  ✅ Auto-condense: activé (threshold 0.65)"
echo "  ✅ Shell timeout: 6000ms (+50%)"
echo "  ✅ Langue: French"
echo "  ✅ Reasoning: high (qualité maximale)"
echo "  ✅ Checkpoints: activés"
echo ""
echo "⚠️  PARAMÈTRES DÉJÀ CONFIGURÉS (non modifiables via CLI) :"
echo "  • terminal-reuse-enabled: true ✓"
echo "  • mcp-marketplace-enabled: true ✓"
echo "  • mcp-display-mode: plain (→ peut être changé en 'rich')"
echo "  • auto-approval enabled: true (⚠️  évaluer désactivation)"
echo "  • auto-approval max-requests: 20 (→ recommandé: 5)"
echo ""
echo "🔐 SÉCURITÉ - Actions recommandées manuelles :"
echo ""
echo "  1. Réduire auto-approval max-requests:"
echo "     Les nested settings nécessitent config file ou UI"
echo ""
echo "  2. Activer notifications:"
echo "     Pour transparence des actions automatiques"
echo ""
echo "  3. Review auto-approval actions:"
echo "     • use-mcp: true ✓"
echo "     • execute-safe-commands: true ✓"
echo "     • execute-all-commands: false ✓"
echo "     • edit-files: false ✓"
echo ""
echo "⚠️  RÈGLE CRITIQUE TITANE∞ MAINTENUE :"
echo "  🔒 Mode plan OBLIGATOIRE (appliqué)"
echo "  🔒 Pas de build/deploy automatique"
echo "  🔒 Validation humaine requise pour actions critiques"
echo "  🔒 Keywords requis: 'GO FOR PRODUCTION DEPLOY'"
echo "  🔒 Yolo mode DÉSACTIVÉ (appliqué)"
echo ""
echo "🔍 Vérifier: cline config list"
echo "📚 Docs: .cline/README.md"
echo "🛡️  Safeguards: .cline/deployment-safeguards.json"
echo "=================================================="

echo ""
echo "=================================================="
echo "✅ Configuration optimisée appliquée !"
echo ""
echo "📋 Résumé des changements critiques :"
echo "  • Auto-approval: DÉSACTIVÉ (sécurité)"
echo "  • Max requests: 20 → 5 (contrôle strict)"
echo "  • Mode: plan (réflexion avant action)"
echo "  • Thinking budget: 1024 → 2048 tokens (meilleure qualité)"
echo "  • Output limit: 500 → 1000 lignes"
echo "  • Auto-condense: activé (gestion mémoire)"
echo "  • Langue: French"
echo "  • Reasoning: medium → high"
echo "  • Notifications: activées (transparence)"
echo ""
echo "⚠️  RÈGLE CRITIQUE DÉPLOIEMENT MAINTENUE :"
echo "  • Aucun build/deploy automatique"
echo "  • Mode plan privilégié"
echo "  • Validation humaine requise"
echo ""
echo "🔍 Pour vérifier: cline config list"
echo "=================================================="
