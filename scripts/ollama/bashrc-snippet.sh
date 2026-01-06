#!/usr/bin/env bash
# Quick launcher - source depuis ~/.bashrc pour activer /ollama

TITANE_ROOT="/home/titane-os/Documents/GitHub/TITANE_INFINITY"

if [ -f "$TITANE_ROOT/scripts/ollama/run-ollama.sh" ]; then
    alias /ollama="$TITANE_ROOT/scripts/ollama/run-ollama.sh"
fi
