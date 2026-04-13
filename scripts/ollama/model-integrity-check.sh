#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Ollama Model Integrity Check
#   Vérifie la présence et la cohérence des modèles requis.
#   Exit 0 = tous les modèles requis présents (ou au moins un fallback)
#   Exit 1 = aucun modèle AI disponible (état critique)
#
#   Usage: bash scripts/ollama/model-integrity-check.sh
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
REQUIRED_MODELS=("gemma2:2b")
FALLBACK_MODELS=("llama3.2" "llama3.1")

log()  { echo "[model-integrity] $(date -Iseconds) $*"; }
ok()   { echo "[model-integrity] OK: $*"; }
warn() { echo "[model-integrity] WARN: $*"; }
err()  { echo "[model-integrity] ERROR: $*" >&2; }

check_api() {
    if ! curl -sf --max-time 5 "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
        err "Ollama API inaccessible ($OLLAMA_HOST)"
        return 1
    fi
    ok "Ollama API accessible"
    return 0
}

get_installed_models() {
    curl -sf --max-time 10 "$OLLAMA_HOST/api/tags" 2>/dev/null \
        | grep -o '"name":"[^"]*"' \
        | cut -d'"' -f4 \
        || true
}

main() {
    log "Vérification intégrité modèles TITANE∞"

    check_api || exit 1

    local installed
    installed=$(get_installed_models)

    if [[ -z "$installed" ]]; then
        err "Aucun modèle installé dans Ollama"
        echo ""
        echo "  Pour installer le modèle requis:"
        echo "    ollama pull gemma2:2b"
        exit 1
    fi

    log "Modèles installés: $(echo "$installed" | tr '\n' ' ')"

    local required_ok=0
    local missing_required=()

    for model in "${REQUIRED_MODELS[@]}"; do
        if echo "$installed" | grep -q "^${model}$"; then
            ok "Requis présent: $model"
            required_ok=$((required_ok + 1))
        else
            warn "Requis absent: $model"
            missing_required+=("$model")
        fi
    done

    if [[ $required_ok -eq ${#REQUIRED_MODELS[@]} ]]; then
        ok "Tous les modèles requis sont présents"
        return 0
    fi

    # Check fallbacks
    local fallback_ok=0
    for model in "${FALLBACK_MODELS[@]}"; do
        if echo "$installed" | grep -q "^${model}$"; then
            ok "Fallback disponible: $model"
            fallback_ok=$((fallback_ok + 1))
        fi
    done

    if [[ $fallback_ok -gt 0 ]]; then
        warn "Modèles requis manquants: ${missing_required[*]} — mais fallback disponible"
        warn "État: DEGRADED (fonctionnel mais non optimal)"
        echo ""
        echo "  Pour restaurer l'état nominal:"
        for m in "${missing_required[@]}"; do
            echo "    ollama pull $m"
        done
        return 0  # degraded but not critical
    else
        err "Aucun modèle requis ni fallback disponible"
        err "Modèles manquants: ${missing_required[*]}"
        echo ""
        echo "  Action requise:"
        echo "    ollama pull gemma2:2b"
        return 1  # critical
    fi
}

main "$@"
