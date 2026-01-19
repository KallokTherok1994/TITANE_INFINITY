#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║         TITANE∞ CORE — CACHE INTELLIGENT SYSTEM v1.0                       ║
# ║         Système de cache multi-niveau avec TTL et compression              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Configuration du cache
CACHE_DIR="${TITANE_CACHE_DIR:-$HOME/.cache/titane-infinity}"
CACHE_DB="$CACHE_DIR/cache.db"
CACHE_STATS="$CACHE_DIR/stats.json"
CACHE_COMPRESSION="${CACHE_COMPRESSION:-gzip}"

# Niveaux de cache
CACHE_LEVELS=("system" "project" "session" "runtime")

# TTL par défaut (en secondes)
DEFAULT_TTL=$((7 * 24 * 3600))  # 7 jours

# Statistiques
declare -A CACHE_STATS_MAP=(
    ["hits"]=0
    ["misses"]=0
    ["sets"]=0
    ["deletes"]=0
    ["compressions"]=0
)

################################################################################
# INITIALISATION
################################################################################

cache_init() {
    mkdir -p "$CACHE_DIR"
    touch "$CACHE_DB"

    # Initialiser stats si elles n'existent pas
    if [[ ! -f "$CACHE_STATS" ]]; then
        echo '{"hits":0,"misses":0,"sets":0,"deletes":0,"compressions":0,"created":"'$(date -Iseconds)'"}' > "$CACHE_STATS"
    fi

    # Nettoyer cache expiré au démarrage (1% de chance)
    if [[ $((RANDOM % 100)) -eq 0 ]]; then
        cache_cleanup_expired
    fi
}

################################################################################
# UTILITAIRES
################################################################################

cache_get_timestamp() {
    date +%s
}

cache_hash_key() {
    local key="$1"
    echo -n "$key" | sha256sum | cut -d' ' -f1
}

cache_compress() {
    local data="$1"
    case "$CACHE_COMPRESSION" in
        gzip)
            echo -n "$data" | gzip | base64 -w 0
            ;;
        none)
            echo -n "$data"
            ;;
        *)
            echo -n "$data" | gzip | base64 -w 0
            ;;
    esac
}

cache_decompress() {
    local compressed="$1"
    case "$CACHE_COMPRESSION" in
        gzip)
            echo -n "$compressed" | base64 -d | gunzip
            ;;
        none)
            echo -n "$compressed"
            ;;
        *)
            echo -n "$compressed" | base64 -d | gunzip
            ;;
    esac
}

################################################################################
# OPÉRATIONS DE BASE
################################################################################

cache_set() {
    local level="$1"
    local key="$2"
    local value="$3"
    local ttl="${4:-$DEFAULT_TTL}"

    local hashed_key=$(cache_hash_key "${level}:${key}")
    local timestamp=$(cache_get_timestamp)
    local expires=$((timestamp + ttl))

    # Compresser la valeur si elle est grande (>1KB)
    local compressed_value
    if [[ ${#value} -gt 1024 ]]; then
        compressed_value=$(cache_compress "$value")
        CACHE_STATS_MAP["compressions"]=$((CACHE_STATS_MAP["compressions"] + 1))
    else
        compressed_value="$value"
    fi

    # Stocker dans la DB (format: hash|timestamp|expires|level|compressed_value)
    sed -i "/^${hashed_key}|/d" "$CACHE_DB" 2>/dev/null || true
    echo "${hashed_key}|${timestamp}|${expires}|${level}|${compressed_value}" >> "$CACHE_DB"

    CACHE_STATS_MAP["sets"]=$((CACHE_STATS_MAP["sets"] + 1))
    return 0
}

cache_get() {
    local level="$1"
    local key="$2"

    local hashed_key=$(cache_hash_key "${level}:${key}")
    local timestamp=$(cache_get_timestamp)

    local line=$(grep "^${hashed_key}|" "$CACHE_DB" 2>/dev/null || echo "")
    if [[ -z "$line" ]]; then
        CACHE_STATS_MAP["misses"]=$((CACHE_STATS_MAP["misses"] + 1))
        return 1
    fi

    local expires=$(echo "$line" | cut -d'|' -f3)
    if [[ $timestamp -gt $expires ]]; then
        # Cache expiré, supprimer
        cache_delete "$level" "$key"
        CACHE_STATS_MAP["misses"]=$((CACHE_STATS_MAP["misses"] + 1))
        return 1
    fi

    local compressed_value=$(echo "$line" | cut -d'|' -f5-)
    local value

    # Essayer de décompresser, sinon utiliser tel quel
    if value=$(cache_decompress "$compressed_value" 2>/dev/null); then
        CACHE_STATS_MAP["hits"]=$((CACHE_STATS_MAP["hits"] + 1))
        echo -n "$value"
        return 0
    else
        # Si décompression échoue, utiliser la valeur brute
        CACHE_STATS_MAP["hits"]=$((CACHE_STATS_MAP["hits"] + 1))
        echo -n "$compressed_value"
        return 0
    fi
}

cache_delete() {
    local level="$1"
    local key="$2"

    local hashed_key=$(cache_hash_key "${level}:${key}")
    sed -i "/^${hashed_key}|/d" "$CACHE_DB" 2>/dev/null || true

    CACHE_STATS_MAP["deletes"]=$((CACHE_STATS_MAP["deletes"] + 1))
    return 0
}

cache_exists() {
    local level="$1"
    local key="$2"

    local hashed_key=$(cache_hash_key "${level}:${key}")
    local timestamp=$(cache_get_timestamp)

    local line=$(grep "^${hashed_key}|" "$CACHE_DB" 2>/dev/null || echo "")
    if [[ -z "$line" ]]; then
        return 1
    fi

    local expires=$(echo "$line" | cut -d'|' -f3)
    [[ $timestamp -le $expires ]]
}

################################################################################
# GESTION AVANCÉE
################################################################################

cache_cleanup_expired() {
    local timestamp=$(cache_get_timestamp)
    local before_count=$(wc -l < "$CACHE_DB")

    # Créer un fichier temporaire sans les entrées expirées
    local temp_file=$(mktemp)
    while IFS='|' read -r hash ts expires level value; do
        if [[ $timestamp -le $expires ]]; then
            echo "$hash|$ts|$expires|$level|$value" >> "$temp_file"
        fi
    done < "$CACHE_DB"

    mv "$temp_file" "$CACHE_DB"
    local after_count=$(wc -l < "$CACHE_DB")
    local cleaned=$((before_count - after_count))

    if [[ $cleaned -gt 0 ]]; then
        echo "Cache: nettoyé $cleaned entrées expirées" >&2
    fi
}

cache_clear_level() {
    local level="$1"
    sed -i "/^[^|]*|[^|]*|[^|]*|${level}|/d" "$CACHE_DB" 2>/dev/null || true
    echo "Cache level '$level' cleared"
}

cache_clear_all() {
    rm -f "$CACHE_DB"
    touch "$CACHE_DB"
    echo "Cache entièrement vidé"
}

cache_stats() {
    local total_entries=$(wc -l < "$CACHE_DB" 2>/dev/null || echo 0)
    local cache_size=$(du -h "$CACHE_DB" 2>/dev/null | cut -f1 || echo "0B")

    # Charger stats depuis fichier
    local stats_json=$(cat "$CACHE_STATS" 2>/dev/null || echo "{}")
    local hits=$(echo "$stats_json" | jq -r '.hits // 0' 2>/dev/null || echo 0)
    local misses=$(echo "$stats_json" | jq -r '.misses // 0' 2>/dev/null || echo 0)
    local total_requests=$((hits + misses))
    local hit_rate="0%"
    if [[ $total_requests -gt 0 ]]; then
        hit_rate="$((hits * 100 / total_requests))%"
    fi

    cat << EOF
╔══════════════════════════════════════════════════════════════╗
║                    TITANE∞ CACHE STATS                       ║
╚══════════════════════════════════════════════════════════════╝

Cache Directory: $CACHE_DIR
Database: $CACHE_DB
Size: $cache_size

Entries: $total_entries
Hit Rate: $hit_rate ($hits/$total_requests)
Compression: $CACHE_COMPRESSION

Session Stats:
  Sets: ${CACHE_STATS_MAP["sets"]}
  Hits: ${CACHE_STATS_MAP["hits"]}
  Misses: ${CACHE_STATS_MAP["misses"]}
  Deletes: ${CACHE_STATS_MAP["deletes"]}
  Compressions: ${CACHE_STATS_MAP["compressions"]}
EOF
}

cache_save_stats() {
    # Fusionner stats actuelles avec stats de session
    local current_stats=$(cat "$CACHE_STATS" 2>/dev/null || echo "{}")
    local updated_stats=$(echo "$current_stats" | jq \
        --arg hits "${CACHE_STATS_MAP["hits"]}" \
        --arg misses "${CACHE_STATS_MAP["misses"]}" \
        --arg sets "${CACHE_STATS_MAP["sets"]}" \
        --arg deletes "${CACHE_STATS_MAP["deletes"]}" \
        --arg compressions "${CACHE_STATS_MAP["compressions"]}" \
        '.hits = (.hits // 0 | tonumber) + ($hits | tonumber) |
         .misses = (.misses // 0 | tonumber) + ($misses | tonumber) |
         .sets = (.sets // 0 | tonumber) + ($sets | tonumber) |
         .deletes = (.deletes // 0 | tonumber) + ($deletes | tonumber) |
         .compressions = (.compressions // 0 | tonumber) + ($compressions | tonumber) |
         .last_update = "'$(date -Iseconds)'"' 2>/dev/null || echo "$current_stats")

    echo "$updated_stats" > "$CACHE_STATS"
}

################################################################################
# FONCTIONS DE CACHE SPÉCIALISÉES
################################################################################

cache_system_info() {
    local key="$1"
    local ttl="${2:-$DEFAULT_TTL}"

    local value=$(cache_get "system" "$key")
    if [[ -n "$value" ]]; then
        echo -n "$value"
        return 0
    fi

    # Calculer la valeur selon la clé
    case "$key" in
        os)
            value=$(uname -s)
            ;;
        arch)
            value=$(uname -m)
            ;;
        cpu_cores)
            value=$(nproc 2>/dev/null || echo "1")
            ;;
        memory_gb)
            value=$(free -g 2>/dev/null | awk 'NR==2{printf "%.1f", $2/1024}' || echo "unknown")
            ;;
        disk_free_gb)
            value=$(df -BG . 2>/dev/null | tail -1 | awk '{print int($4)}' || echo "unknown")
            ;;
        *)
            return 1
            ;;
    esac

    cache_set "system" "$key" "$value" "$ttl"
    echo -n "$value"
}

cache_command_result() {
    local command="$1"
    local ttl="${2:-$DEFAULT_TTL}"

    local cmd_hash=$(cache_hash_key "cmd:$command")
    local cached_result=$(cache_get "system" "cmd_$cmd_hash")

    if [[ -n "$cached_result" ]]; then
        echo -n "$cached_result"
        return 0
    fi

    # Exécuter la commande
    if result=$(eval "$command" 2>/dev/null); then
        cache_set "system" "cmd_$cmd_hash" "$result" "$ttl"
        echo -n "$result"
        return 0
    else
        return 1
    fi
}

################################################################################
# INITIALISATION AUTO
################################################################################

# Initialiser le cache au chargement
cache_init

# Sauvegarder stats à la sortie
trap 'cache_save_stats' EXIT
