#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE — TÉLÉMÉTRIE SYSTEM v1.0                               ║
# ║         Système de monitoring et métriques pour optimisation continue      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration télémétrie
TELEMETRY_DIR="${TITANE_TELEMETRY_DIR:-$HOME/.cache/titane-infinity/telemetry}"
TELEMETRY_DB="$TELEMETRY_DIR/metrics.db"
TELEMETRY_SESSION="$TELEMETRY_DIR/session_$(date +%s).json"
TELEMETRY_ENABLED="${TITANE_TELEMETRY_ENABLED:-true}"

# Métriques actuelles de session
declare -A TELEMETRY_METRICS=(
    ["session_start"]=$(date +%s)
    ["commands_executed"]=0
    ["cache_hits"]=0
    ["cache_misses"]=0
    ["errors_count"]=0
    ["warnings_count"]=0
)

################################################################################
# INITIALISATION
################################################################################

telemetry_init() {
    if [[ "$TELEMETRY_ENABLED" != "true" ]]; then
        return 0
    fi

    mkdir -p "$TELEMETRY_DIR"
    touch "$TELEMETRY_DB"

    # Initialiser session
    cat > "$TELEMETRY_SESSION" << EOF
{
  "session_id": "$(date +%s)",
  "start_time": "$(date -Iseconds)",
  "hostname": "$(hostname)",
  "user": "$(whoami)",
  "os": "$(uname -s)",
  "arch": "$(uname -m)",
  "metrics": {
    "commands_executed": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "errors_count": 0,
    "warnings_count": 0,
    "performance": {}
  },
  "events": []
}
EOF
}

################################################################################
# MÉTRIQUES DE PERFORMANCE
################################################################################

telemetry_start_timer() {
    local operation="$1"
    local start_time=$(date +%s%N 2>/dev/null || echo "$(date +%s)000000000")
    echo "$start_time"
}

telemetry_stop_timer() {
    local operation="$1"
    local end_time=$(date +%s%N 2>/dev/null || echo "$(date +%s)000000000")

    # Récupérer le start_time depuis les métriques actuelles ou utiliser une valeur par défaut
    local start_time="${TELEMETRY_CURRENT_START_TIME:-$end_time}"
    local duration_ns=$((end_time - start_time))
    local duration_ms=$((duration_ns / 1000000))

    # Stocker la métrique
    telemetry_record_metric "performance.${operation}.duration_ms" "$duration_ms"
    telemetry_record_metric "performance.${operation}.last_run" "$(date +%s)"

    echo "$duration_ms"
}

telemetry_record_metric() {
    local key="$1"
    local value="$2"

    if [[ "$TELEMETRY_ENABLED" != "true" ]]; then
        return 0
    fi

    # Ajouter au fichier de session
    if [[ -f "$TELEMETRY_SESSION" ]]; then
        # Utiliser jq pour mettre à jour le JSON
        jq --arg key "$key" --arg value "$value" \
           '.metrics.performance[$key] = $value' \
           "$TELEMETRY_SESSION" > "${TELEMETRY_SESSION}.tmp" 2>/dev/null && \
        mv "${TELEMETRY_SESSION}.tmp" "$TELEMETRY_SESSION" || true
    fi

    # Ajouter à la DB persistante (format: timestamp|key|value)
    echo "$(date +%s)|${key}|${value}" >> "$TELEMETRY_DB"
}

################################################################################
# ÉVÉNEMENTS ET LOGGING
################################################################################

telemetry_log_event() {
    local event_type="$1"
    local message="$2"
    local metadata="${3:-{}}"

    if [[ "$TELEMETRY_ENABLED" != "true" ]]; then
        return 0
    fi

    local event_json=$(cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "type": "$event_type",
  "message": "$message",
  "metadata": $metadata
}
EOF
)

    # Ajouter à la session
    if [[ -f "$TELEMETRY_SESSION" ]]; then
        jq --argjson event "$event_json" '.events += [$event]' \
           "$TELEMETRY_SESSION" > "${TELEMETRY_SESSION}.tmp" 2>/dev/null && \
        mv "${TELEMETRY_SESSION}.tmp" "$TELEMETRY_SESSION" || true
    fi

    # Compteurs automatiques
    case "$event_type" in
        "command_executed")
            TELEMETRY_METRICS["commands_executed"]=$((TELEMETRY_METRICS["commands_executed"] + 1))
            ;;
        "cache_hit")
            TELEMETRY_METRICS["cache_hits"]=$((TELEMETRY_METRICS["cache_hits"] + 1))
            ;;
        "cache_miss")
            TELEMETRY_METRICS["cache_misses"]=$((TELEMETRY_METRICS["cache_misses"] + 1))
            ;;
        "error")
            TELEMETRY_METRICS["errors_count"]=$((TELEMETRY_METRICS["errors_count"] + 1))
            ;;
        "warning")
            TELEMETRY_METRICS["warnings_count"]=$((TELEMETRY_METRICS["warnings_count"] + 1))
            ;;
    esac
}

telemetry_log_command() {
    local command="$1"
    local exit_code="$2"
    local duration_ms="$3"

    local metadata=$(cat << EOF
{
  "command": "$command",
  "exit_code": $exit_code,
  "duration_ms": $duration_ms
}
EOF
)

    telemetry_log_event "command_executed" "Command executed" "$metadata"
}

################################################################################
# ANALYSES ET STATISTIQUES
################################################################################

telemetry_get_stats() {
    local period="${1:-1d}"  # 1d, 1w, 1M

    case "$period" in
        "1d")
            local cutoff=$(( $(date +%s) - 86400 ))
            ;;
        "1w")
            local cutoff=$(( $(date +%s) - 604800 ))
            ;;
        "1M")
            local cutoff=$(( $(date +%s) - 2592000 ))
            ;;
        *)
            local cutoff=$(( $(date +%s) - 86400 ))
            ;;
    esac

    echo "=== TITANE∞ TÉLÉMÉTRIE STATS ($period) ==="
    echo ""

    # Analyser les métriques de performance
    echo "Performance Metrics:"
    awk -F'|' -v cutoff="$cutoff" '
        $1 >= cutoff && $2 ~ /^performance\./ {
            key = $2
            value = $3
            if (key ~ /\.duration_ms$/) {
                cmd = key
                sub(/^performance\./, "", cmd)
                sub(/\.duration_ms$/, "", cmd)
                durations[cmd] = durations[cmd] " " value
                count[cmd]++
            }
        }
        END {
            for (cmd in durations) {
                split(durations[cmd], arr, " ")
                sum = 0
                min = arr[1]
                max = arr[1]
                for (i in arr) {
                    sum += arr[i]
                    if (arr[i] < min) min = arr[i]
                    if (arr[i] > max) max = arr[i]
                }
                avg = sum / count[cmd]
                printf "  %-30s %4d runs | avg %6.0fms | min %6.0fms | max %6.0fms\n",
                       cmd, count[cmd], avg, min, max
            }
        }
    ' "$TELEMETRY_DB" 2>/dev/null || echo "  No performance data available"

    echo ""

    # Analyser les événements
    echo "Event Summary:"
    awk -F'|' -v cutoff="$cutoff" '
        $1 >= cutoff {
            key = $2
            if (key == "commands_executed") commands += $3
            if (key == "cache_hits") hits += $3
            if (key == "cache_misses") misses += $3
            if (key == "errors_count") errors += $3
            if (key == "warnings_count") warnings += $3
        }
        END {
            total_cache = hits + misses
            hit_rate = total_cache > 0 ? (hits * 100) / total_cache : 0
            printf "  Commands executed: %d\n", commands
            printf "  Cache hit rate:    %.1f%% (%d/%d)\n", hit_rate, hits, total_cache
            printf "  Errors:            %d\n", errors
            printf "  Warnings:          %d\n", warnings
        }
    ' "$TELEMETRY_DB" 2>/dev/null || echo "  No event data available"

    echo ""

    # Recommandations basées sur les métriques
    echo "Optimisation Recommendations:"
    awk -F'|' -v cutoff="$cutoff" '
        $1 >= cutoff && $2 ~ /^performance\./ && $2 ~ /\.duration_ms$/ {
            key = $2
            sub(/^performance\./, "", key)
            sub(/\.duration_ms$/, "", key)
            sum[key] += $3
            count[key]++
        }
        END {
            for (cmd in sum) {
                avg = sum[cmd] / count[cmd]
                if (avg > 30000) {  # > 30 secondes
                    print "  🚨 " cmd ": Very slow (avg " int(avg) "ms) - consider caching"
                } else if (avg > 10000) {  # > 10 secondes
                    print "  ⚠️  " cmd ": Slow (avg " int(avg) "ms) - potential optimisation"
                }
            }
        }
    ' "$TELEMETRY_DB" 2>/dev/null || echo "  No recommendations available"
}

telemetry_export_session() {
    if [[ ! -f "$TELEMETRY_SESSION" ]]; then
        echo "No active session to export"
        return 1
    fi

    # Finaliser la session avec métriques actuelles
    jq --arg end_time "$(date -Iseconds)" \
       --arg duration "$(( $(date +%s) - TELEMETRY_METRICS["session_start"] ))" \
       --arg commands "${TELEMETRY_METRICS["commands_executed"]}" \
       --arg cache_hits "${TELEMETRY_METRICS["cache_hits"]}" \
       --arg cache_misses "${TELEMETRY_METRICS["cache_misses"]}" \
       --arg errors "${TELEMETRY_METRICS["errors_count"]}" \
       --arg warnings "${TELEMETRY_METRICS["warnings_count"]}" \
       '.end_time = $end_time |
        .duration_seconds = $duration |
        .metrics.commands_executed = ($commands | tonumber) |
        .metrics.cache_hits = ($cache_hits | tonumber) |
        .metrics.cache_misses = ($cache_misses | tonumber) |
        .metrics.errors_count = ($errors | tonumber) |
        .metrics.warnings_count = ($warnings | tonumber)' \
       "$TELEMETRY_SESSION" > "${TELEMETRY_SESSION}.final" && \
    mv "${TELEMETRY_SESSION}.final" "$TELEMETRY_SESSION"

    echo "Session exported: $TELEMETRY_SESSION"
    cat "$TELEMETRY_SESSION"
}

################################################################################
# NETTOYAGE
################################################################################

telemetry_cleanup() {
    local days="${1:-30}"

    if [[ ! -f "$TELEMETRY_DB" ]]; then
        return 0
    fi

    local cutoff=$(( $(date +%s) - (days * 86400) ))
    local before_count=$(wc -l < "$TELEMETRY_DB")

    # Garder seulement les données récentes
    awk -F'|' -v cutoff="$cutoff" '$1 >= cutoff' "$TELEMETRY_DB" > "${TELEMETRY_DB}.tmp" && \
    mv "${TELEMETRY_DB}.tmp" "$TELEMETRY_DB"

    local after_count=$(wc -l < "$TELEMETRY_DB")
    local removed=$((before_count - after_count))

    echo "Telemetry: cleaned $removed old entries ($days days retention)"
}

################################################################################
# FONCTIONS WRAPPER POUR INTÉGRATION
################################################################################

telemetry_wrap_command() {
    local command="$1"
    local start_time=$(telemetry_start_timer "command")

    # Exécuter la commande
    if eval "$command"; then
        local exit_code=0
    else
        local exit_code=$?
    fi

    local duration=$(telemetry_stop_timer "command" "$start_time")
    telemetry_log_command "$command" "$exit_code" "$duration"

    return $exit_code
}

telemetry_track_cache() {
    local operation="$1"  # hit, miss, set, delete
    telemetry_log_event "cache_$operation" "Cache $operation"
}

################################################################################
# INITIALISATION AUTO
################################################################################

# Initialiser la télémétrie au chargement
telemetry_init

# Exporter session à la sortie
trap 'telemetry_export_session' EXIT
