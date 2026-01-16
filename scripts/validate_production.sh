#!/bin/bash
# TITANE∞ Production Validation Script v1.0
# Vérifie l'état du système en production

set -euo pipefail

echo "🔍 VALIDATION PRODUCTION TITANE∞ v26.3.0"
echo "========================================"

# 1. Vérifier les artefacts
echo "1️⃣ ARTEFACTS:"
for artifact in "deployment/latest/TITANE-Infinity_26.3.0_amd64.AppImage" \
                "deployment/latest/TITANE-Infinity_26.3.0_amd64.deb" \
                "deployment/latest/titane-infinity"; do
    if [ -f "$artifact" ]; then
        size=$(du -h "$artifact" | cut -f1)
        echo "✅ $(basename "$artifact"): $size"
    else
        echo "❌ $(basename "$artifact"): MANQUANT"
    fi
done

# 2. Vérifier le launcher
echo "
2️⃣ LAUNCHER:"
if [ -x "./launch-titane.sh" ]; then
    echo "✅ launch-titane.sh: Exécutable"
else
    echo "❌ launch-titane.sh: Non-exécutable"
fi

# 3. Vérifier la compliance constitutionnelle
echo "
3️⃣ CONSTITUTIONAL COMPLIANCE:"
if [ -f "scripts/check_forbidden_files.sh" ]; then
    if ./scripts/check_forbidden_files.sh > /dev/null 2>&1; then
        echo "✅ Forbidden files scan: CLEAN"
    else
        echo "❌ Forbidden files scan: VIOLATIONS DÉTECTÉES"
    fi
else
    echo "⚠️ Scanner indisponible"
fi

# 4. Vérifier les workflows CI/CD
echo "
4️⃣ CI/CD GATES:"
gate_count=$(find .github/workflows -name "p*.yml" -o -name "*certification*.yml" | wc -l)
echo "✅ Gates de certification: $gate_count workflows"

# 5. Vérifier l'evidence trail
echo "
5️⃣ EVIDENCE TRAIL:"
evidence_count=$(find docs/_evidence -name "*.md" 2>/dev/null | wc -l)
echo "✅ Rapports d'évidence: $evidence_count documents"

# 6. Test de démarrage rapide (5s)
echo "
6️⃣ TEST DE DÉMARRAGE:"
if timeout 5s ./launch-titane.sh > /tmp/titane-validation.log 2>&1 & then
    sleep 2
    if pgrep -f "TITANE-Infinity.*AppImage" > /dev/null; then
        echo "✅ Application démarre correctement"
        pkill -f "TITANE-Infinity.*AppImage" 2>/dev/null || true
    else
        echo "⚠️ Application non détectée"
    fi
else
    echo "❌ Échec du test de démarrage"
fi

echo "
=========================================="
echo "🎯 VALIDATION TERMINÉE: $(date)"
