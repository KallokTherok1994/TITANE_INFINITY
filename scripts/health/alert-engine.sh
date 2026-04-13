#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Alert Engine
#   Évalue les conditions d'alerte minimales du contrat HA et émet des
#   alertes structurées JSON dans ~/.titane/logs/alerts.log.
#
#   Alertes couvertes:
#     A01 — service_down          : titane-infinity non actif
#     A02 — ollama_down           : Ollama API inaccessible
#     A03 — model_absent          : aucun modèle AI disponible
#     A04 — restart_storm         : > MAX_RESTARTS redémarrages sur fenêtre
#     A05 — autoheal_timer_down   : timer auto-heal inactif
#     A06 — ollama_high_latency   : latence Ollama > seuil
#
#   Usage: bash scripts/health/alert-engine.sh [--dry-run] [--quiet]
#
#   Exit codes:
#     0 = aucune alerte
#     1 = alertes WARNING (dégradé)
#     2 = alertes CRITICAL
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date -Iseconds)
ALERTS_DIR="$HOME/.titane/logs"
ALERTS_LOG="$ALERTS_DIR/alerts.log"
DRY_RUN=false
QUIET=false

# SLO thresholds (alignés avec services-matrix.yaml)
MAX_RESTARTS=5
RESTART_WINDOW_SECS=300
OLLAMA_LATENCY_WARN_MS=500
OLLAMA_LATENCY_CRIT_MS=2000

for arg in "${@:-}"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --quiet)   QUIET=true ;;
  esac
done

# ─── helpers ──────────────────────────────────────────────────────────────
log()  { [[ "$QUIET" == "true" ]] || echo "[alert-engine] $*" >&2; }
warn() { [[ "$QUIET" == "true" ]] || echo "[alert-engine] WARN: $*" >&2; }

_emit_alert() {
  local code="$1" severity="$2" service="$3" message="$4" detail="${5:-}"
  local entry
  entry="{\"timestamp\":\"$TIMESTAMP\",\"code\":\"$code\",\"severity\":\"$severity\",\"service\":\"$service\",\"message\":\"$message\",\"detail\":\"$detail\"}"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY-RUN ALERT: $entry"
  else
    mkdir -p "$ALERTS_DIR"
    echo "$entry" >> "$ALERTS_LOG"
    # Desktop notification (non-blocking, optional)
    if command -v notify-send >/dev/null 2>&1; then
      notify-send -u critical "TITANE∞ Alert [$code]" "$message" 2>/dev/null || true
    fi
  fi
  log "EMIT [$severity] $code — $message"
}

_systemd_is_active() {
  local unit="$1"
  local status
  status=$(systemctl --user is-active "$unit" 2>/dev/null) || true
  echo "${status:-unknown}"
}

_systemd_restart_count() {
  systemctl --user show "$1" --property=NRestarts 2>/dev/null \
    | cut -d= -f2 || echo "0"
}

_ollama_latency_ms() {
  local start end
  start=$(date +%s%3N)
  if curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
    end=$(date +%s%3N)
    echo $(( end - start ))
  else
    echo "-1"
  fi
}

_ollama_has_model() {
  local tags
  tags=$(curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" 2>/dev/null || echo "{}")
  for m in "gemma2:2b" "llama3.2" "llama3.1" "mistral"; do
    if echo "$tags" | grep -q "$m"; then
      echo "$m"
      return 0
    fi
  done
  echo ""
}

# ─── alert evaluations ────────────────────────────────────────────────────
CRITICAL_COUNT=0
WARNING_COUNT=0

# A01 — titane-infinity service down
TITANE_ACTIVE=$(_systemd_is_active "titane-infinity.service")
if [[ "$TITANE_ACTIVE" != "active" ]]; then
  # Distinguish: unit doesn't exist vs unit failed vs inactive
  if [[ "$TITANE_ACTIVE" == "failed" ]]; then
    _emit_alert "A01" "CRITICAL" "titane-infinity" \
      "titane-infinity service is FAILED" "systemd_state=failed"
    (( CRITICAL_COUNT++ )) || true
  elif [[ "$TITANE_ACTIVE" == "unknown" ]]; then
    warn "titane-infinity.service unit not installed — skipping A01"
  else
    _emit_alert "A01" "WARNING" "titane-infinity" \
      "titane-infinity service is not active (state=$TITANE_ACTIVE)" \
      "systemd_state=$TITANE_ACTIVE"
    (( WARNING_COUNT++ )) || true
  fi
else
  log "A01 PASS — titane-infinity active"
fi

# A02 — Ollama API down
OLLAMA_LATENCY=$(_ollama_latency_ms)
if [[ "$OLLAMA_LATENCY" == "-1" ]]; then
  _emit_alert "A02" "CRITICAL" "ollama" \
    "Ollama API unreachable on port 11434" "url=http://127.0.0.1:11434/api/tags"
  (( CRITICAL_COUNT++ )) || true
else
  log "A02 PASS — Ollama API reachable (${OLLAMA_LATENCY}ms)"

  # A03 — model absent (only if Ollama is up)
  AVAILABLE_MODEL=$(_ollama_has_model)
  if [[ -z "$AVAILABLE_MODEL" ]]; then
    _emit_alert "A03" "CRITICAL" "ollama" \
      "No AI model available (gemma2:2b and all fallbacks absent)" \
      "checked=gemma2:2b,llama3.2,llama3.1,mistral"
    (( CRITICAL_COUNT++ )) || true
  else
    log "A03 PASS — model available: $AVAILABLE_MODEL"
  fi

  # A06 — high Ollama latency
  if (( OLLAMA_LATENCY >= OLLAMA_LATENCY_CRIT_MS )); then
    _emit_alert "A06" "CRITICAL" "ollama" \
      "Ollama API latency critical: ${OLLAMA_LATENCY}ms (threshold=${OLLAMA_LATENCY_CRIT_MS}ms)" \
      "latency_ms=$OLLAMA_LATENCY"
    (( CRITICAL_COUNT++ )) || true
  elif (( OLLAMA_LATENCY >= OLLAMA_LATENCY_WARN_MS )); then
    _emit_alert "A06" "WARNING" "ollama" \
      "Ollama API latency elevated: ${OLLAMA_LATENCY}ms (threshold=${OLLAMA_LATENCY_WARN_MS}ms)" \
      "latency_ms=$OLLAMA_LATENCY"
    (( WARNING_COUNT++ )) || true
  else
    log "A06 PASS — Ollama latency OK (${OLLAMA_LATENCY}ms)"
  fi
fi

# A04 — restart storm (titane-infinity + ollama)
for unit in "titane-infinity.service" "ollama.service"; do
  RESTARTS=$(_systemd_restart_count "$unit")
  if [[ "$RESTARTS" =~ ^[0-9]+$ ]] && (( RESTARTS >= MAX_RESTARTS )); then
    _emit_alert "A04" "CRITICAL" "$unit" \
      "Restart storm on $unit: NRestarts=$RESTARTS (max=$MAX_RESTARTS)" \
      "nrestarts=$RESTARTS,window_secs=$RESTART_WINDOW_SECS"
    (( CRITICAL_COUNT++ )) || true
  else
    log "A04 PASS — $unit restarts=$RESTARTS"
  fi
done

# A05 — autoheal timer down
AUTOHEAL_ACTIVE=$(_systemd_is_active "titane-auto-heal.timer")
if [[ "$AUTOHEAL_ACTIVE" != "active" ]]; then
  if [[ "$AUTOHEAL_ACTIVE" != "unknown" ]]; then
    _emit_alert "A05" "WARNING" "titane-auto-heal.timer" \
      "Auto-heal timer is not active (state=$AUTOHEAL_ACTIVE)" \
      "systemd_state=$AUTOHEAL_ACTIVE"
    (( WARNING_COUNT++ )) || true
  else
    warn "titane-auto-heal.timer unit not installed — skipping A05"
  fi
else
  log "A05 PASS — autoheal timer active"
fi

# ─── summary ──────────────────────────────────────────────────────────────
log "Alert summary: CRITICAL=$CRITICAL_COUNT WARNING=$WARNING_COUNT"

if (( CRITICAL_COUNT > 0 )); then
  exit 2
elif (( WARNING_COUNT > 0 )); then
  exit 1
else
  exit 0
fi
