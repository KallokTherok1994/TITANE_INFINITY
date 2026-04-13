#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — Health Dashboard
#   Rapport de disponibilité agrégé: uptime services, restart_count_24h,
#   latence provider, mémoire, dernière alerte.
#
#   Usage: bash scripts/health/health-dashboard.sh [--json] [--compact]
#
#   Exit codes:
#     0 = healthy  |  1 = degraded  |  2 = critical
#
#   Sortie: tableau lisible (défaut) ou JSON (--json)
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date -Iseconds)
ALERTS_LOG="$HOME/.titane/logs/alerts.log"
JSON_MODE=false
COMPACT_MODE=false

for arg in "${@:-}"; do
  case "$arg" in
    --json)    JSON_MODE=true ;;
    --compact) COMPACT_MODE=true ;;
  esac
done

# ─── helpers ──────────────────────────────────────────────────────────────
_uptime_seconds() {
  local unit="$1"
  # systemd user unit
  local since
  since=$(systemctl --user show "$unit" --property=ActiveEnterTimestamp 2>/dev/null \
    | cut -d= -f2)
  if [[ -z "$since" || "$since" == "n/a" ]]; then
    echo "0"
    return
  fi
  local since_epoch
  since_epoch=$(date -d "$since" +%s 2>/dev/null || echo "0")
  local now_epoch
  now_epoch=$(date +%s)
  echo $(( now_epoch - since_epoch ))
}

_seconds_to_human() {
  local s=$1
  if (( s < 60 )); then echo "${s}s"
  elif (( s < 3600 )); then echo "$(( s/60 ))m$(( s%60 ))s"
  elif (( s < 86400 )); then echo "$(( s/3600 ))h$(( (s%3600)/60 ))m"
  else echo "$(( s/86400 ))d$(( (s%86400)/3600 ))h"
  fi
}

_systemd_restart_count() {
  local unit="$1"
  systemctl --user show "$unit" --property=NRestarts 2>/dev/null \
    | cut -d= -f2 || echo "?"
}

_systemd_is_active() {
  local unit="$1"
  local status
  status=$(systemctl --user is-active "$unit" 2>/dev/null) || true
  echo "${status:-unknown}"
}

_systemd_unit_state() {
  local unit="$1"
  local active
  active=$(_systemd_is_active "$unit")
  case "$active" in
    active)   echo "UP" ;;
    failed)   echo "FAILED" ;;
    inactive) echo "STOPPED" ;;
    *)        echo "$active" ;;
  esac
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

_ollama_models_present() {
  local tags
  tags=$(curl -sf --max-time 5 "http://127.0.0.1:11434/api/tags" 2>/dev/null || echo "{}")
  local found=()
  for m in "gemma2:2b" "llama3.2" "llama3.1" "mistral"; do
    if echo "$tags" | grep -q "$m"; then
      found+=("$m")
    fi
  done
  if [[ ${#found[@]} -gt 0 ]]; then
    printf "%s" "${found[*]}"
  else
    echo "none"
  fi
}

_titane_process_state() {
  local pid
  pid=$(pgrep -x titane-infinity 2>/dev/null | head -n1 || true)
  if [[ -n "$pid" ]]; then
    # Memory usage (RSS in kB → MiB)
    local rss_kb
    rss_kb=$(ps -o rss= -p "$pid" 2>/dev/null | tr -d ' ' || echo "0")
    local mem_mib=$(( rss_kb / 1024 ))
    echo "{\"pid\":$pid,\"mem_mib\":$mem_mib}"
  else
    echo "{\"pid\":null,\"mem_mib\":0}"
  fi
}

_last_alert() {
  if [[ -f "$ALERTS_LOG" ]]; then
    tail -n1 "$ALERTS_LOG" 2>/dev/null || echo "none"
  else
    echo "none"
  fi
}

_alert_count_24h() {
  if [[ -f "$ALERTS_LOG" ]]; then
    local since_24h
    since_24h=$(date -d "24 hours ago" +%s 2>/dev/null || echo "0")
    local count=0
    while IFS= read -r line; do
      local ts
      ts=$(echo "$line" | grep -oP '\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}' | head -n1 || true)
      if [[ -n "$ts" ]]; then
        local line_epoch
        line_epoch=$(date -d "$ts" +%s 2>/dev/null || echo "0")
        if (( line_epoch >= since_24h )); then
          (( count++ )) || true
        fi
      fi
    done < "$ALERTS_LOG"
    echo "$count"
  else
    echo "0"
  fi
}

_autoheal_timer_state() {
  _systemd_unit_state "titane-auto-heal.timer"
}

_global_status() {
  local titane_state=$1 ollama_latency=$2 ollama_models=$3 alert_24h=$4
  if [[ "$titane_state" == "FAILED" ]] || [[ "$ollama_latency" == "-1" && "$ollama_models" == "none" ]]; then
    echo "critical"
  elif [[ "$titane_state" != "UP" ]] || [[ "$ollama_latency" == "-1" ]] || [[ "$ollama_models" == "none" ]]; then
    echo "degraded"
  elif (( alert_24h >= 3 )); then
    echo "degraded"
  else
    echo "healthy"
  fi
}

# ─── collect ──────────────────────────────────────────────────────────────
TITANE_STATE=$(_systemd_unit_state "titane-infinity.service" 2>/dev/null || echo "NO_UNIT")
TITANE_RESTARTS=$(_systemd_restart_count "titane-infinity.service" 2>/dev/null || echo "?")
TITANE_UPTIME_S=$(_uptime_seconds "titane-infinity.service" 2>/dev/null || echo "0")
TITANE_UPTIME_H=$(_seconds_to_human "$TITANE_UPTIME_S")
TITANE_PROC=$(_titane_process_state)
TITANE_PID=$(echo "$TITANE_PROC" | grep -oP '"pid":\K[0-9]+' || echo "null")
TITANE_MEM=$(echo "$TITANE_PROC" | grep -oP '"mem_mib":\K[0-9]+' || echo "0")

OLLAMA_STATE=$(_systemd_is_active "ollama.service" 2>/dev/null || echo "unknown")
OLLAMA_RESTARTS=$(_systemd_restart_count "ollama.service" 2>/dev/null || echo "?")
OLLAMA_LATENCY_MS=$(_ollama_latency_ms)
OLLAMA_MODELS=$(_ollama_models_present)

AUTOHEAL_STATE=$(_autoheal_timer_state)
ALERT_24H=$(_alert_count_24h)
LAST_ALERT=$(_last_alert)

GLOBAL=$(_global_status "$TITANE_STATE" "$OLLAMA_LATENCY_MS" "$OLLAMA_MODELS" "$ALERT_24H")

# ─── output ───────────────────────────────────────────────────────────────
if [[ "$JSON_MODE" == "true" ]]; then
  cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "global_status": "$GLOBAL",
  "services": {
    "titane_infinity": {
      "state": "$TITANE_STATE",
      "pid": $([[ "$TITANE_PID" == "null" ]] && echo "null" || echo "$TITANE_PID"),
      "restarts": "$TITANE_RESTARTS",
      "uptime_seconds": $TITANE_UPTIME_S,
      "uptime_human": "$TITANE_UPTIME_H",
      "mem_mib": $TITANE_MEM
    },
    "ollama": {
      "state": "$OLLAMA_STATE",
      "restarts": "$OLLAMA_RESTARTS",
      "latency_ms": $OLLAMA_LATENCY_MS,
      "models_available": "$OLLAMA_MODELS"
    },
    "autoheal_timer": {
      "state": "$AUTOHEAL_STATE"
    }
  },
  "alerts": {
    "count_24h": $ALERT_24H,
    "last": "$LAST_ALERT"
  }
}
EOF
else
  # ─── human-readable dashboard ──────────────────────────────────────────
  SEP="══════════════════════════════════════════════════════"
  echo "$SEP"
  printf "  TITANE∞ Health Dashboard   [%s]\n" "$TIMESTAMP"
  echo "$SEP"
  printf "  Global Status : %-10s\n" "$(echo "$GLOBAL" | tr '[:lower:]' '[:upper:]')"
  echo ""
  echo "  ── Services ─────────────────────────────────────"
  printf "  %-20s  %-8s  restarts=%-3s  uptime=%-10s  mem=%sMiB\n" \
    "titane-infinity" "$TITANE_STATE" "$TITANE_RESTARTS" "$TITANE_UPTIME_H" "$TITANE_MEM"
  printf "  %-20s  %-8s  restarts=%-3s  latency=%-6sms  models: %s\n" \
    "ollama" "$OLLAMA_STATE" "$OLLAMA_RESTARTS" "$OLLAMA_LATENCY_MS" "$OLLAMA_MODELS"
  printf "  %-20s  %-8s\n" "autoheal-timer" "$AUTOHEAL_STATE"
  echo ""
  echo "  ── Alerts (24h) ──────────────────────────────────"
  printf "  count=%s   last: %s\n" "$ALERT_24H" "$LAST_ALERT"
  echo "$SEP"
fi

# ─── exit code aligned with global status ─────────────────────────────────
case "$GLOBAL" in
  healthy)  exit 0 ;;
  degraded) exit 1 ;;
  critical) exit 2 ;;
  *)        exit 2 ;;
esac
