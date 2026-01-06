#!/usr/bin/env bash
# Script d'installation et vérification de Cline CLI + Hooks
# TITANE∞ Project

set -euo pipefail

echo "🔧 TITANE∞ - Installation Cline CLI + Hooks"
echo "============================================"
echo ""

# Vérifier si Cline CLI est installé
echo "📦 Vérification de Cline CLI..."
if ! command -v cline &> /dev/null; then
    echo "❌ Cline CLI n'est pas installé"
    echo "Installation..."
    if command -v corepack >/dev/null 2>&1; then
        corepack pnpm add -g cline
    elif command -v pnpm >/dev/null 2>&1; then
        pnpm add -g cline
    else
        echo "❌ pnpm requis (corepack/pnpm introuvable)." >&2
        exit 1
    fi
    echo "✅ Cline CLI installé"
else
    echo "✅ Cline CLI déjà installé"
    cline version
fi
echo ""

# Vérifier la configuration
echo "⚙️ Configuration actuelle..."
cline config list | head -n 20
echo ""

# Vérifier les hooks
echo "🎣 Vérification des hooks projet..."
HOOKS_DIR=".clinerules/hooks"

if [[ ! -d "$HOOKS_DIR" ]]; then
    echo "❌ Répertoire hooks manquant: $HOOKS_DIR"
    exit 1
fi

hook_count=0
for hook in TaskStart PreToolUse PostToolUse UserPromptSubmit; do
    if [[ -f "$HOOKS_DIR/$hook" ]]; then
        if [[ -x "$HOOKS_DIR/$hook" ]]; then
            echo "✅ $hook (exécutable)"
            ((hook_count++))
        else
            echo "⚠️ $hook (non exécutable, correction...)"
            chmod +x "$HOOKS_DIR/$hook"
            echo "✅ $hook (exécutable)"
            ((hook_count++))
        fi
    else
        echo "❌ $hook (manquant)"
    fi
done
echo ""

echo "📊 Résumé: $hook_count/4 hooks installés"
echo ""

# Créer le répertoire de logs
LOGS_DIR=".clinerules/logs"
mkdir -p "$LOGS_DIR"
echo "✅ Répertoire de logs créé: $LOGS_DIR"
echo ""

# Test de hook simple
echo "🧪 Test rapide du hook TaskStart..."
TEST_INPUT='{"clineVersion":"3.39.2","hookName":"TaskStart","timestamp":"2026-01-02T23:00:00Z","taskId":"test","workspaceRoots":["/test"],"userId":"test","taskStart":{"taskMetadata":{"taskId":"test","ulid":"test","initialTask":"test"}}}'

if echo "$TEST_INPUT" | "$HOOKS_DIR/TaskStart" > /dev/null 2>&1; then
    echo "✅ Hook TaskStart fonctionne correctement"
else
    echo "❌ Hook TaskStart a échoué"
    exit 1
fi
echo ""

# Afficher l'aide pour utilisation
echo "📚 Utilisation avec Cline CLI:"
echo ""
echo "  # Activer les hooks pour une tâche"
echo "  cline \"Votre question\" -s hooks_enabled=true"
echo ""
echo "  # Mode interactif avec hooks"
echo "  cline -s hooks_enabled=true"
echo ""
echo "  # Mode autonome (yolo) avec hooks"
echo "  cline \"Votre tâche\" -s hooks_enabled=true --yolo"
echo ""

echo "✨ Installation complète!"
echo ""
echo "📖 Documentation: .clinerules/hooks/README.md"
echo "📊 Logs: .clinerules/logs/"
