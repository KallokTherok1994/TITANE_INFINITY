#!/usr/bin/env bash
# TITANE∞ Dev Cleanup & Process Manager
# Nettoie les processus dev TITANE et libère les ports

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🧹 TITANE∞ DEV CLEANUP"
echo "======================"

# 1. Nettoyer les anciens processus TITANE
echo "1️⃣ Nettoyage des processus TITANE..."
TITANE_PIDS=$(pgrep -f "titane.*infinity" || true)
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
    REMAINING_PIDS=$(pgrep -f "titane.*infinity" || true)
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
VITE_PIDS=$(pgrep -f "vite.*dev" || true)
if [[ -n "$VITE_PIDS" ]]; then
    echo "   Arrêt des processus Vite: $VITE_PIDS"
    for pid in $VITE_PIDS; do
        kill -TERM "$pid" 2>/dev/null || true
    done
    sleep 2
else
    echo "   ✅ Aucun processus Vite orphelin"
fi

# 3. Vérifier et nettoyer les ports dev
echo -e "\n3️⃣ Vérification des ports dev (5173, 1420)..."
for PORT in 5173 1420; do
    PID=$(ss -tlnp | grep ":$PORT " | grep -o "pid=[0-9]*" | cut -d= -f2 | head -1 || true)
    if [[ -n "$PID" ]]; then
        echo "   Port $PORT utilisé par PID $PID - arrêt..."
        kill -TERM "$PID" 2>/dev/null || true
        sleep 1
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
REMAINING_TITANE=$(pgrep -f "titane" || true)
REMAINING_VITE=$(pgrep -f "vite.*dev" || true)

if [[ -z "$REMAINING_TITANE" && -z "$REMAINING_VITE" ]]; then
    echo "   ✅ Nettoyage terminé - environnement dev propre"
else
    echo "   ⚠️  Processus restants détectés:"
    [[ -n "$REMAINING_TITANE" ]] && echo "      TITANE: $REMAINING_TITANE"
    [[ -n "$REMAINING_VITE" ]] && echo "      Vite: $REMAINING_VITE"
fi

echo -e "\n🎉 Cleanup terminé - prêt pour un nouveau 'pnpm run dev:tauri'"