#!/bin/bash
echo "════════════════════════════════════════"
echo "🚀 PUSH DES CORRECTIONS v26.3.0"
echo "════════════════════════════════════════"
echo ""

# Vérifier qu'on est sur MAIN
if [ "$(git branch --show-current)" != "MAIN" ]; then
    echo "❌ Erreur: Pas sur la branche MAIN"
    exit 1
fi

# Afficher les commits à pusher
echo "📦 Commits à pusher (6):"
git log --oneline origin/MAIN..HEAD
echo ""

# Vérifier qu'il n'y a pas de fichiers non commités
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Fichiers non commités détectés:"
    git status --short
    echo ""
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Push avec tags
echo "🔄 Push en cours..."
git push origin MAIN
git push origin --tags

echo ""
echo "✅ Push terminé!"
echo "════════════════════════════════════════"
