#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v14 — MASTER VERIFICATION SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
# Lance tous les scripts de vérification v14 et génère rapport complet
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  TITANE∞ v14 — MASTER VERIFICATION"
echo "  Super-Prompt: Correction Complète API / Modules (9 Phases)"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

TOTAL_TESTS=6
PASSED=0
FAILED=0
WARNINGS=0

# ─────────────────────────────────────────────────────────────────────────────
# FONCTION: Run Test
# ─────────────────────────────────────────────────────────────────────────────

run_test() {
    local test_name="$1"
    local script="$2"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 TEST: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if ./"$script"; then
        echo "✅ PASSED: $test_name"
        PASSED=$((PASSED + 1))
    else
        echo "❌ FAILED: $test_name"
        FAILED=$((FAILED + 1))
    fi

    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# TESTS
# ─────────────────────────────────────────────────────────────────────────────

run_test "API Consistency" "scripts/verify_api_consistency_v14.sh"
run_test "Tauri Invoke" "scripts/verify_tauri_invoke_v14.sh"
run_test "Engines Overdrive" "scripts/verify_engines_overdrive_v14.sh"
run_test "Provider Status" "scripts/verify_provider_status_v14.sh"
run_test "Singularity State" "scripts/verify_singularity_state_v14.sh"
run_test "Conformité Tauri-Local" "scripts/verify_conformite_tauri_local_v14.sh"

# ─────────────────────────────────────────────────────────────────────────────
# RAPPORT FINAL
# ─────────────────────────────────────────────────────────────────────────────

echo "════════════════════════════════════════════════════════════════════════"
echo "  RAPPORT FINAL"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Statistiques:"
echo "   Total Tests: $TOTAL_TESTS"
echo "   ✅ Passed:   $PASSED"
echo "   ❌ Failed:   $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo "🎉 SUCCESS: Tous les tests sont passés ($PASSED/$TOTAL_TESTS)"
    echo ""
    echo "✅ TITANE∞ v14 - Super-Prompt 9 Phases: 100% COMPLÉTÉ"
    echo ""
    echo "Architecture validée:"
    echo "  Components → Hooks v14 → tauriClient → Tauri Backend (TAPIError)"
    echo ""
    echo "Phases complétées:"
    echo "  [x] Phase 1: Backend Hardening (TAPIError)"
    echo "  [x] Phase 2: API Tauri Streaming"
    echo "  [x] Phase 3: Services Frontend TypeScript"
    echo "  [x] Phase 4: Hooks & State React"
    echo "  [x] Phase 5: Engines Overdrive"
    echo "  [x] Phase 6: Memory System TOTAL"
    echo "  [x] Phase 7: Sentinel & SelfHeal++"
    echo "  [x] Phase 8: Auto-Verify v14 (6 scripts)"
    echo "  [x] Phase 9: Conformité Tauri-local"
    echo ""
    echo "════════════════════════════════════════════════════════════════════════"
    exit 0
else
    PERCENT=$((PASSED * 100 / TOTAL_TESTS))
    echo "⚠️  INCOMPLETE: $PASSED/$TOTAL_TESTS tests passés ($PERCENT%)"
    echo ""
    echo "Tests en échec à corriger:"
    echo "  - Exécutez les scripts individuels pour détails"
    echo "  - Voir SUPER_PROMPT_v14_COMPLETION_REPORT.md"
    echo ""
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
