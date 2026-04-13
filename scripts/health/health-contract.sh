#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Health Contract
#   Contrat de santé unifié: états healthy/degraded/critical avec champs
#   de diagnostic exploitables par auto-heal, watchdog et observabilité.
#
#   Exit codes:
#     0 = healthy
#     1 = degraded (au moins un service dégradé mais non critique)
#     2 = critical (service critique indisponible)
#
#   Sortie JSON sur stdout, logs sur stderr.
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date -Iseconds)

# ─── helpers ──────────────────────────────────────────────────────────────
log()  { echo "[health-contract] $*" >&2; }
ok()   { echo "[health-contract] OK: $*" >&2; }
warn() { echo "[health-contract] WARN: $*" >&2; }
err()  { echo "[health-contract] ERROR: $*" >&2; }

# ─── check Ollama API ─────────────────────────────────────────────────────
check_ollama() {
    local status="healthy"
    local detail=""
    local models_ok=false

    if curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
        ok "Ollama API répondante"
        # Check required model
        if curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" 2>/dev/null \
            | grep -q "gemma2:2b"; then
            models_ok=true
            ok "Modèle gemma2:2b présent"
        else
            warn "Modèle gemma2:2b absent — recherche fallback"
            status="degraded"
            detail="gemma2:2b absent"
            # Check fallback models
            local fallback
            for fallback in "llama3.2" "llama3.1"; do
                if curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" 2>/dev/null \
                    | grep -q "$fallback"; then
                    ok "Fallback $fallback disponible"
                    models_ok=true
                    break
                fi
            done
            if [[ "$models_ok" == "false" ]]; then
                err "Aucun modèle AI disponible"
                status="critical"
                detail="no_model_available"
            fi
        fi
    else
        err "Ollama API inaccessible (port 11434)"
        status="critical"
        detail="ollama_api_unreachable"
    fi

    echo "{\"service\":\"ollama\",\"status\":\"$status\",\"detail\":\"$detail\",\"models_ok\":$models_ok}"
}

# ─── check TITANE process ─────────────────────────────────────────────────
check_titane_process() {
    local status="healthy"
    local detail=""
    local pid=""

    pid=$(pgrep -x titane-infinity 2>/dev/null | head -n1 || true)

    if [[ -n "$pid" ]]; then
        ok "titane-infinity en cours (PID $pid)"
        detail="pid=$pid"
    else
        # Not running — not necessarily critical in dev mode; check if systemd unit active
        local unit_state
        unit_state=$(systemctl --user is-active titane-infinity.service 2>/dev/null || echo "unknown")
        if [[ "$unit_state" == "active" ]]; then
            warn "systemd unit active mais PID non trouvé — état transitoire"
            status="degraded"
            detail="pid_not_found,unit_state=active"
        else
            warn "titane-infinity non running (unit: $unit_state)"
            status="degraded"  # degraded, not critical — may be intentional stop
            detail="not_running,unit_state=$unit_state"
        fi
    fi

    echo "{\"service\":\"titane\",\"status\":\"$status\",\"detail\":\"$detail\",\"pid\":\"$pid\"}"
}

# ─── check auto-heal timer ────────────────────────────────────────────────
check_autoheal_timer() {
    local status="healthy"
    local detail=""

    local timer_state
    timer_state=$(systemctl --user is-active titane-auto-heal.timer 2>/dev/null || echo "unknown")

    if [[ "$timer_state" == "active" ]]; then
        ok "titane-auto-heal.timer actif"
        detail="timer_active"
    else
        warn "titane-auto-heal.timer inactif ($timer_state)"
        status="degraded"
        detail="timer_state=$timer_state"
    fi

    echo "{\"service\":\"autoheal\",\"status\":\"$status\",\"detail\":\"$detail\"}"
}

# ─── aggregate verdict ────────────────────────────────────────────────────
aggregate() {
    local ollama_result="$1"
    local titane_result="$2"
    local autoheal_result="$3"

    local global_status="healthy"
    local exit_code=0

    # Escalate to most severe
    for result in "$ollama_result" "$titane_result" "$autoheal_result"; do
        local svc_status
        svc_status=$(echo "$result" | grep -o '"status":"[^"]*"' | head -n1 | cut -d'"' -f4)
        if [[ "$svc_status" == "critical" ]]; then
            global_status="critical"; exit_code=2
        elif [[ "$svc_status" == "degraded" && "$global_status" != "critical" ]]; then
            global_status="degraded"; exit_code=1
        fi
    done

    cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "global_status": "$global_status",
  "services": [
    $ollama_result,
    $titane_result,
    $autoheal_result
  ]
}
EOF
    return $exit_code
}

# ─── main ─────────────────────────────────────────────────────────────────
main() {
    log "Contrat de santé TITANE∞ — $TIMESTAMP"

    local ollama_result titane_result autoheal_result

    ollama_result=$(check_ollama)
    titane_result=$(check_titane_process)
    autoheal_result=$(check_autoheal_timer)

    aggregate "$ollama_result" "$titane_result" "$autoheal_result"
    local rc=$?

    log "Verdict global: $(echo "$ollama_result $titane_result $autoheal_result" \
        | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | sort -u | tr '\n' ' ')"

    return $rc
}

main "$@"
