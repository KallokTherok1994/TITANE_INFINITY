# 🔄 Ollama Service Permanent — TITANE∞

## 🎯 Objectif

Configurer Ollama pour qu'il démarre automatiquement et reste toujours actif.

---

## ✅ Option 1: Service systemd (Recommandé)

**Avantages:**
- ✅ Démarrage automatique au boot système
- ✅ Redémarrage automatique en cas de crash
- ✅ Gestion centralisée via systemctl
- ✅ Logs système intégrés

**Prérequis:** Ubuntu, Debian, Fedora, Arch, etc.

### Installation

```bash
# Via le launcher
/ollama permanent
# Choisir option 1

# Ou directement
./scripts/ollama/setup-permanent-service.sh
```

### Gestion du service

```bash
# Vérifier le statut
sudo systemctl status ollama-titane

# Voir les logs
sudo journalctl -u ollama-titane -f

# Redémarrer
sudo systemctl restart ollama-titane

# Arrêter
sudo systemctl stop ollama-titane

# Désactiver (ne plus démarrer au boot)
sudo systemctl disable ollama-titane
```

---

## ⚡ Option 2: Auto-start bashrc (Simple)

**Avantages:**
- ✅ Aucun besoin de sudo
- ✅ Compatible tous systèmes
- ✅ Simple à installer/désinstaller

**Inconvénient:** Démarre à l'ouverture de terminal (pas au boot)

### Installation

```bash
# Via le launcher
/ollama permanent
# Choisir option 2

# Ou directement
./scripts/ollama/setup-auto-start.sh
```

### Activer maintenant

```bash
source ~/.bashrc
```

### Gestion manuelle

```bash
# Vérifier si actif
pgrep -af ollama

# Arrêter
pkill -f "ollama serve"

# Voir les logs
tail -f /tmp/ollama-serve.log
```

### Désinstaller

Éditez `~/.bashrc` et supprimez:
```bash
# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ Ollama Auto-Start
# ...
# End TITANE∞ Ollama
```

---

## 🔍 Comparaison

| Critère | systemd | bashrc |
|---------|---------|--------|
| **Démarrage** | Au boot système | À l'ouverture de terminal |
| **Sudo requis** | Oui (installation) | Non |
| **Redémarrage auto** | Oui | Non |
| **Logs système** | Oui (journalctl) | Non (fichier) |
| **Compatibilité** | Linux avec systemd | Tous systèmes |
| **Désinstallation** | systemctl disable | Éditer ~/.bashrc |

---

## 🎮 Test

### Vérifier qu'Ollama est permanent

**Option 1 (systemd):**
```bash
# Redémarrer le système
sudo reboot

# Après redémarrage
curl http://localhost:11434/api/version
# → Doit répondre immédiatement
```

**Option 2 (bashrc):**
```bash
# Ouvrir un nouveau terminal
# → Message "🚀 Ollama démarré automatiquement"

curl http://localhost:11434/api/version
# → Doit répondre
```

---

## 🔧 Dépannage

### systemd: Service ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u ollama-titane -n 50

# Vérifier le statut
sudo systemctl status ollama-titane

# Recharger la configuration
sudo systemctl daemon-reload
sudo systemctl restart ollama-titane
```

### bashrc: Ollama ne démarre pas

```bash
# Vérifier la configuration
grep -A 10 "TITANE∞ Ollama Auto-Start" ~/.bashrc

# Tester manuellement
source ~/.bashrc

# Vérifier les logs
tail -f /tmp/ollama-serve.log
```

---

## 📊 Monitoring

### systemd

```bash
# Statut en temps réel
watch -n 1 'systemctl status ollama-titane | head -n 20'

# Logs en direct
sudo journalctl -u ollama-titane -f
```

### bashrc

```bash
# Vérifier le processus
ps aux | grep "ollama serve"

# Logs en direct
tail -f /tmp/ollama-serve.log
```

---

## 🚀 Utilisation avec TITANE∞

Une fois Ollama permanent configuré:

1. **Lancer TITANE∞:**
   ```bash
   pnpm run dev
   ```

2. **Ollama est déjà actif!** Pas besoin de `ollama serve`

3. **Dans l'application:**
   - Ouvrir Paramètres (⚙️)
   - Activer "Ollama"
   - Sélectionner `qwen2.5:latest`
   - ✅ Fonctionne immédiatement!

---

## 💡 Recommandation

**Pour développement:**
- ✅ Option 2 (bashrc) — Simple, sans sudo

**Pour production/serveur:**
- ✅ Option 1 (systemd) — Robuste, redémarrage auto

**Pour laptop/desktop personnel:**
- ✅ Option 2 (bashrc) — Démarre quand vous travaillez

---

## 📚 Ressources

- [setup-permanent-service.sh](./setup-permanent-service.sh) — Script systemd
- [setup-auto-start.sh](./setup-auto-start.sh) — Script bashrc
- [run-ollama.sh](./run-ollama.sh) — Launcher principal

---

**Version:** 1.0.0  
**Date:** 2026-01-04  
**TITANE∞ v26.2.0**
