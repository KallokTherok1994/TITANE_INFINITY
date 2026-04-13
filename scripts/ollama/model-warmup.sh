#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Ollama Model Warmup
#   Déclenche un ping de chargement sur chaque modèle requis après démarrage
#   du service Ollama. Prevents first-request cold start.
#
#   Usage: bash scripts/ollama/model-warmup.sh
#   Exit 0 = au moins un modèle prêt, Exit 1 = aucun modèle disponible
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
REQUIRED_MODELS=("gemma2:2b")
FALLBACK_MODELS=("llama3.2" "llama3.1")
MAX_WAIT_SECS=60
WARMUP_PROMPT="hello"

log()  { echo "[ollama-warmup] $(date -Iseconds) $*"; }
ok()   { echo "[ollama-warmup] OK: $*"; }
warn() { echo "[ollama-warmup] WARN: $*"; }
err()  { echo "[ollama-warmup] ERROR: $*" >&2; }

# ─── Wait for Ollama to be reachable ─────────────────────────────────────
wait_for_ollama() {
    local waited=0
    log "Attente disponibilité Ollama ($OLLAMA_HOST)…"
    while ! curl -sf --max-time 3 "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; do
        if [[ $waited -ge $MAX_WAIT_SECS ]]; then
            err "Ollama non disponible après ${MAX_WAIT_SECS}s — abandon warmup"
            return 1
        fi
        sleep 3
        waited=$((waited + 3))
    done
    ok "Ollama disponible (attendu ${waited}s)"
    return 0
}

# ─── List available models ────────────────────────────────────────────────
list_available_models() {
    curl -sf --max-time 10 "$OLLAMA_HOST/api/tags" 2>/dev/null \
        | grep -o '"name":"[^"]*"' \
        | cut -d'"' -f4 \
        || true
}

# ─── Warm up one model with a lightweight ping ───────────────────────────
warmup_model() {
    local model="$1"
    log "Warmup: $model…"

    local payload
    payload=$(printf '{"model":"%s","prompt":"%s","stream":false}' "$model" "$WARMUP_PROMPT")

    local http_code
    http_code=$(curl -sf --max-time 30 \
        -X POST "$OLLAMA_HOST/api/generate" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        -o /dev/null \
        -w "%{http_code}" 2>/dev/null || echo "000")

    if [[ "$http_code" == "200" ]]; then
        ok "Modèle $model chargé en mémoire (HTTP $http_code)"
        return 0
    else
        warn "Warmup $model: HTTP $http_code"
        return 1
    fi
}

# ─── main ─────────────────────────────────────────────────────────────────
main() {
    log "Démarrage warmup modèles TITANE∞"

    wait_for_ollama || exit 1

    local available_models
    available_models=$(list_available_models)
    log "Modèles disponibles: $(echo "$available_models" | tr '\n' ' ')"

    local warmed=0

    # Warmup required models
    for model in "${REQUIRED_MODELS[@]}"; do
        if echo "$available_models" | grep -q "$model"; then
            warmup_model "$model" && warmed=$((warmed + 1)) || true
        else
            warn "Modèle requis absent: $model"
        fi
    done

    # Warmup fallbacks if no required model warmed
    if [[ $warmed -eq 0 ]]; then
        log "Aucun modèle requis disponible — tentative sur fallbacks…"
        for model in "${FALLBACK_MODELS[@]}"; do
            if echo "$available_models" | grep -q "$model"; then
                warmup_model "$model" && warmed=$((warmed + 1)) && break || true
            fi
        done
    fi

    if [[ $warmed -gt 0 ]]; then
        ok "Warmup terminé: $warmed modèle(s) chargé(s)"
        return 0
    else
        err "Aucun modèle n'a pu être warmé — Ollama démarré mais aucun modèle installé?"
        return 1
    fi
}

main "$@"
