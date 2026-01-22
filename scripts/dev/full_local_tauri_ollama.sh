#!/bin/bash

# Script recréé pour gérer le runtime de développement Tauri avec Ollama
# Usage : ./scripts/dev/full_local_tauri_ollama.sh [options]

# Variables par défaut
BASE_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
MODEL_NAME="llama3.2:latest"
PULL_MODEL=false
NO_OLLAMA=false

# Analyse des arguments
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --model)
      MODEL_NAME="$2"
      shift 2
      ;;
    --pull-model)
      PULL_MODEL=true
      shift
      ;;
    --no-ollama)
      NO_OLLAMA=true
      shift
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "Option inconnue : $1"
      exit 1
      ;;
  esac
done

# Exemple de logique (à adapter selon les besoins réels)
if $PULL_MODEL; then
  echo "Téléchargement du modèle : $MODEL_NAME"
  # Commande fictive pour télécharger un modèle
  curl -X POST "$BASE_URL/api/models/$MODEL_NAME/pull"
fi

if ! $NO_OLLAMA; then
  echo "Démarrage d'Ollama avec le modèle : $MODEL_NAME"
  # Commande fictive pour démarrer Ollama
  /usr/local/bin/ollama run "$MODEL_NAME"
fi

# Lancer Tauri avec les arguments restants
if [[ "$#" -gt 0 ]]; then
  echo "Lancement de Tauri avec les arguments : $*"
  tauri "$@"
else
  echo "Aucun argument pour Tauri."
fi
