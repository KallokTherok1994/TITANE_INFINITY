#!/usr/bin/env bash
# TITANE∞ Dev Cleanup & Process Manager
# Nettoie les processus dev TITANE et libère les ports

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🧹 TITANE∞ DEV CLEANUP"
echo "======================"

TITANE_PROCESS_PATTERN='titane[-_ ]?infinity|dev_tauri_monitor|tauri dev|cargo run.*titane|src-tauri/target/.*/titane-infinity|runtime/stable/.*titane'

get_port_pid() {
    local port="$1"
    (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep ":$port " | grep -o "pid=[0-9]*" | cut -d= -f2 | head -1 || true
}

get_titane_pids() {
    pgrep -f "$TITANE_PROCESS_PATTERN" || true
}

get_titane_process_lines() {
    pgrep -af "$TITANE_PROCESS_PATTERN" || true
}

# 1. Nettoyer les anciens processus TITANE
echo "1️⃣ Nettoyage des processus TITANE..."
TITANE_PIDS=$(get_titane_pids)
if [[ -n "$TITANE_PIDS" ]]; then
    echo "   Processus TITANE trouvés: $TITANE_PIDS"
    # Arrêt propre d'abord (SIGINT)
    for pid in $TITANE_PIDS; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "   Arrêt propre du processus $pid..."
            kill -INT "$pid" 2>/dev/null || true
        fi
    done
    
    sleep 3
    
    # Vérification et force kill si nécessaire
    REMAINING_PIDS=$(get_titane_pids)
    if [[ -n "$REMAINING_PIDS" ]]; then
        echo "   Force kill des processus restants: $REMAINING_PIDS"
        for pid in $REMAINING_PIDS; do
            kill -KILL "$pid" 2>/dev/null || true
        done
    fi
else
    echo "   ✅ Aucun processus TITANE à nettoyer"
fi

# 2. Nettoyer les processus Vite orphelins
echo -e "\n2️⃣ Nettoyage des processus Vite..."
# Le dépôt utilise aussi des Vite legacy sur 4000/4173 sans argument `dev` explicite.
VITE_PIDS=$(pgrep -f "vite" || true)
if [[ -n "$VITE_PIDS" ]]; then
    echo "   Arrêt des processus Vite: $VITE_PIDS"
    for pid in $VITE_PIDS; do
        kill -TERM "$pid" 2>/dev/null || true
    done
    sleep 2

    REMAINING_VITE_PIDS=$(pgrep -f "vite" || true)
    if [[ -n "$REMAINING_VITE_PIDS" ]]; then
        echo "   Force kill des processus Vite restants: $REMAINING_VITE_PIDS"
        for pid in $REMAINING_VITE_PIDS; do
            kill -KILL "$pid" 2>/dev/null || true
        done
    fi
else
    echo "   ✅ Aucun processus Vite orphelin"
fi

# 3. Vérifier et nettoyer les ports dev
echo -e "\n3️⃣ Vérification des ports dev (4000, 5173, 4173, 1420, 1430)..."
for PORT in 4000 5173 4173 1420 1430; do
    PID=$(get_port_pid "$PORT")
    if [[ -n "$PID" ]]; then
        echo "   Port $PORT utilisé par PID $PID - arrêt..."
        kill -TERM "$PID" 2>/dev/null || true
        sleep 1

        PID=$(get_port_pid "$PORT")
        if [[ -n "$PID" ]]; then
            echo "   Port $PORT toujours occupé par PID $PID - force kill..."
            kill -KILL "$PID" 2>/dev/null || true
            sleep 1
        fi
    else
        echo "   ✅ Port $PORT libre"
    fi
done

# 4. Nettoyer les fichiers de monitoring temporaires
echo -e "\n4️⃣ Nettoyage des fichiers temporaires..."
if [[ -d "runtime/dev/logs" ]]; then
    # Garder les logs mais nettoyer les status/summary
    rm -f runtime/dev/logs/*status*.json 2>/dev/null || true
    rm -f runtime/dev/logs/*summary*.json 2>/dev/null || true
    echo "   ✅ Fichiers de monitoring nettoyés"
else
    echo "   ✅ Pas de fichiers temporaires"
fi

# 5. Nettoyer les fichiers de mémoire dev qui traînent
echo -e "\n5️⃣ Nettoyage des fichiers de mémoire dev..."
if [[ -f "src-tauri/memory/memory_core_state.json" ]]; then
    # Restaurer le fichier à son état git si modifié
    if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        if ! git diff --quiet -- src-tauri/memory/memory_core_state.json 2>/dev/null; then
            git restore src-tauri/memory/memory_core_state.json 2>/dev/null || true
            echo "   ✅ Fichier memory_core_state.json restauré"
        else
            echo "   ✅ Fichier memory_core_state.json inchangé"
        fi
    fi
fi

# 6. Vérification finale
echo -e "\n6️⃣ Vérification finale..."
REMAINING_TITANE=$(get_titane_process_lines)
REMAINING_VITE=$(pgrep -f "vite" || true)

if [[ -z "$REMAINING_TITANE" && -z "$REMAINING_VITE" ]]; then
    echo "   ✅ Nettoyage terminé - environnement dev propre"
else
    echo "   ⚠️  Processus restants détectés:"
    [[ -n "$REMAINING_TITANE" ]] && echo "      TITANE DEV: $REMAINING_TITANE"
    [[ -n "$REMAINING_VITE" ]] && echo "      Vite: $REMAINING_VITE"
fi

echo -e "\n🎉 Cleanup terminé - prêt pour un nouveau 'pnpm run dev:tauri'"