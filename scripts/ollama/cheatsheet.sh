#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ — AIDE-MÉMOIRE OLLAMA
# ═══════════════════════════════════════════════════════════════════════════

cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════╗
║                  TITANE∞ — AIDE-MÉMOIRE OLLAMA                          ║
╚══════════════════════════════════════════════════════════════════════════╝

🚀 INSTALLATION DES MODÈLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Interactive:    ./scripts/ollama/install-models.sh
  Automatique:    ./scripts/ollama/install-models-auto.sh
  One-liner:      ./scripts/ollama/quick-install.sh

⚙️  CONFIGURATION ALIAS /ollama
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Setup:          ./scripts/ollama/setup-ollama-alias.sh
  Activer:        source ~/.bashrc

🎮 COMMANDES /ollama (après alias configuré)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /ollama setup       Configuration complète
  /ollama serve       Démarrer le serveur
  /ollama status      Vérifier le statut
  /ollama test        Tester le modèle
  /ollama pull        Installer les modèles
  /ollama restart     Redémarrer le serveur
  /ollama stop        Arrêter le serveur
  /ollama permanent   Configurer service permanent (auto-start)
  /ollama help        Aide complète

🧠 MODÈLES TITANE∞
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  qwen2.5:latest      4.7 GB    Principal (défaut)
  llama3.1:8b         4.7 GB    Alternative
  mistral:7b          4.1 GB    Backup français
  
  Total: ~13.5 GB

🔧 COMMANDES OLLAMA NATIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ollama serve                    Démarrer serveur
  ollama pull <model>             Télécharger modèle
  ollama list                     Liste des modèles
  ollama run <model> "prompt"     Tester modèle
  ollama rm <model>               Supprimer modèle
  ollama --version                Version

📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  scripts/ollama/INSTALL.md         Guide d'installation
  scripts/ollama/README.md          Vue d'ensemble
  scripts/ollama/ACTIVATION.md      Configuration alias
  docs/OLLAMA_GUIDE.md              Guide complet

🎯 QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  # 1. Installer modèles
  ./scripts/ollama/install-models.sh

  # 2. Configurer alias
  ./scripts/ollama/setup-ollama-alias.sh
  source ~/.bashrc

  # 3. Vérifier
  /ollama status

  # 4. Lancer TITANE∞
  pnpm run dev

╔══════════════════════════════════════════════════════════════════════════╗
║  Pour plus d'infos: /ollama help                                        ║
╚══════════════════════════════════════════════════════════════════════════╝
EOF
