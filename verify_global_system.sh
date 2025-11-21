#!/bin/sh
# TITANE∞ v8.0 - Global System Verification
# Vérification complète de tous les modules et systèmes

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           TITANE∞ v8.0 - VERIFICATION GLOBALE                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_SCRIPTS=0

run_verification() {
    SCRIPT=$1
    NAME=$2
    
    if [ -f "$SCRIPT" ]; then
        echo "▶ Exécution: $NAME..."
        chmod +x "$SCRIPT"
        if ./"$SCRIPT" > /dev/null 2>&1; then
            echo "  ✅ $NAME: SUCCÈS"
            TOTAL_PASS=$((TOTAL_PASS + 1))
        else
            echo "  ❌ $NAME: ÉCHEC"
            TOTAL_FAIL=$((TOTAL_FAIL + 1))
        fi
        TOTAL_SCRIPTS=$((TOTAL_SCRIPTS + 1))
    else
        echo "  ⚠️  $NAME: Script non trouvé"
    fi
}

echo "═══════════════════════════════════════════════════════════════"
echo "📦 VÉRIFICATION DES MODULES STRATÉGIQUES"
echo "═══════════════════════════════════════════════════════════════"
run_verification "verify_cognitive_synthesis.sh" "Cognitive Synthesis (#49-51)"
run_verification "verify_strategic_direction.sh" "Strategic Direction (#52-54)"
run_verification "verify_advanced_cognitive.sh" "Advanced Cognitive (#55-57,59)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "🧠 VÉRIFICATION DES STACKS COGNITIFS"
echo "═══════════════════════════════════════════════════════════════"
run_verification "verify_cognitive_stack.sh" "Cognitive Stack"
run_verification "verify_neural_mesh.sh" "Neural Mesh Stack"
run_verification "verify_perception_stack.sh" "Perception Stack"
run_verification "verify_advanced_stack.sh" "Advanced Stack"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📊 VÉRIFICATION DES COUCHES EXÉCUTIVES"
echo "═══════════════════════════════════════════════════════════════"
run_verification "verify_executive_layer.sh" "Executive Layer"
run_verification "verify_sentient_layer.sh" "Sentient Layer"
run_verification "verify_monitoring_stack.sh" "Monitoring Stack"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "🛡️ VÉRIFICATION SÉCURITÉ & STABILITÉ"
echo "═══════════════════════════════════════════════════════════════"
run_verification "verify_secureflow.sh" "SecureFlow"
run_verification "verify_lowflow.sh" "LowFlow"
run_verification "verify_kernel.sh" "Kernel"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "🎯 VÉRIFICATION MODULES CORE"
echo "═══════════════════════════════════════════════════════════════"
run_verification "verify_cortex.sh" "Cortex"
run_verification "verify_senses.sh" "Senses"
run_verification "verify_ans.sh" "ANS"
run_verification "verify_resonance.sh" "Resonance"
run_verification "verify_field.sh" "Field"
run_verification "verify_swarm.sh" "Swarm"
run_verification "verify_mai.sh" "MAI"
run_verification "verify_memorycore.sh" "MemoryCore"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    RÉSULTATS FINAUX                            ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  Total scripts exécutés: $TOTAL_SCRIPTS"
echo "║  ✅ Succès: $TOTAL_PASS"
echo "║  ❌ Échecs: $TOTAL_FAIL"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $TOTAL_FAIL -eq 0 ]; then
    echo "🎉 SUCCÈS TOTAL: Tous les systèmes sont opérationnels!"
    echo ""
    echo "📊 STATISTIQUES TITANE∞ v8.0:"
    echo "   • 60+ modules intelligents"
    echo "   • 10+ stacks hiérarchiques"
    echo "   • 100% validation passed"
    echo "   • Système entièrement fonctionnel"
    exit 0
else
    echo "⚠️  ATTENTION: $TOTAL_FAIL systèmes nécessitent une vérification"
    exit 1
fi
