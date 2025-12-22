#!/usr/bin/env bash
set -e

# Ensure we run from repo root
cd "$(dirname "$0")/../.."

# Prepare logs directory
mkdir -p runtime/dev/logs

echo "[BUILD] Starting vite build at $(date -Is)" | tee -a runtime/dev/logs/vite.log

# Run vite build via npm script and capture output
npm run build 2>&1 | tee -a runtime/dev/logs/vite.log

echo "[BUILD] Completed vite build at $(date -Is)" | tee -a runtime/dev/logs/vite.log
