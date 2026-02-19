#!/usr/bin/env bash
# TITANE∞ - Ollama Configuration Setup Guide
# Pour les déploiements et l'installation locale

cat << 'EOF'
═══════════════════════════════════════════════════════════════════════════════
  TITANE∞ — OLLAMA INTEGRATION SETUP GUIDE
═══════════════════════════════════════════════════════════════════════════════

## 🎯 QUICKSTART

### Option 1: Default Configuration (Recommended)
La plupart des utilisateurs n'ont rien à faire. L'app utilise automatiquement:
  • Modèle par défaut: gemma2:2b (rapide, léger, précis)
  • URL: http://127.0.0.1:11434
  • Port: 11434

### Option 2: Custom Model
Pour utiliser un modèle différent:
  $ export TITANE_OLLAMA_MODEL="qwen2.5:latest"
  $ titane-infinity

### Option 3: Custom Ollama URL
Si Ollama tourne sur un autre host:
  $ export TITANE_OLLAMA_URL="http://192.168.1.5:11434"
  $ titane-infinity

───────────────────────────────────────────────────────────────────────────────

## 📋 SUPPORTED MODELS

Les modèles suivants sont testés et recommandés:
  • gemma2:2b       — Rapide (⚡), recommandé pour machines faibles
  • gemma2:latest   — Équilibre qualité/vitesse
  • qwen2.5:latest  — Haute qualité, plus lent
  • llama3.1:latest — Précision maximale (très gourmand)
  • mistral:latest  — Bon équilibre
  • deepseek-coder-v2:latest — Pour la génération de code

Pour vérifier les modèles disponibles localement:
  $ curl http://127.0.0.1:11434/api/tags | jq '.models[].name'

───────────────────────────────────────────────────────────────────────────────

## ⚙️ INSTALLATION OLLAMA

### Linux/macOS
  $ curl -fsSL https://ollama.ai/install.sh | sh
  $ ollama serve &

### Vérifier qu'Ollama fonctionne
  $ curl http://127.0.0.1:11434/api/tags
  
Vous devez recevoir un JSON avec les modèles disponibles.

───────────────────────────────────────────────────────────────────────────────

## 🔧 TROUBLESHOOTING

### Erreur: "model 'titane-local' not found"
→ Ancien bug corrigé en v27.0.3+
→ Mise à jour vers la dernière version

### Erreur: "Impossible de se connecter à Ollama"
Vérifications:
  1. Ollama tourne? $ ps aux | grep ollama
  2. Port correct? $ netstat -tlnp | grep 11434
  3. Firewall? $ curl http://127.0.0.1:11434/api/tags

### Modèle trop lent
→ Essayez: gemma2:2b (très rapide)
→ Ou: qwen2.5:latest (bon équilibre)

### Modèle pas disponible
→ Installer: $ ollama pull qwen2.5:latest
→ Vérifier liste: $ curl http://127.0.0.1:11434/api/tags | jq '.models[].name'

───────────────────────────────────────────────────────────────────────────────

## 📊 SYSTÈME D'AUTORECOVERY

L'app a un système intelligent de fallback:
  1. Essaie le modèle par défaut (ou TITANE_OLLAMA_MODEL)
  2. Si "model not found": cherche automatiquement un modèle disponible
  3. Préférence: gemma2:2b > gemma2:latest > qwen2.5:latest > llama3.2 > ...
  4. Utilise le premier modèle disponible si aucune préférence ne match

Vous n'êtes jamais bloqué si au moins 1 modèle existe!

───────────────────────────────────────────────────────────────────────────────

## 🚀 CONFIGURATION PERMANENTE

### Linux (systemd)
Créer ~/.config/systemd/user/ollama.service:
  [Unit]
  Description=Ollama Service
  After=network.target
  
  [Service]
  ExecStart=/usr/bin/ollama serve
  Restart=on-failure
  
  [Install]
  WantedBy=default.target

Activer:
  $ systemctl --user enable ollama
  $ systemctl --user start ollama

### Vérifier le status
  $ systemctl --user status ollama

───────────────────────────────────────────────────────────────────────────────

## 📝 VERSION INFO

Dernière correction: v27.0.3 (2026-02-19)
  • Changé modèle par défaut: titane-local → gemma2:2b
  • Ajout fallback automatique pour modèles manquants
  • Amélioration gestion erreurs API Ollama

═══════════════════════════════════════════════════════════════════════════════
EOF
