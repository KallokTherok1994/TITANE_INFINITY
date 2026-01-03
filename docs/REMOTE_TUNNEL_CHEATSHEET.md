# 📋 Cheat Sheet - Remote Tunnel TITANE∞

## 🚀 Démarrage Rapide

```bash
# Vérifier les prérequis
./scripts/remote/check-prerequisites.sh

# Configuration rapide (mode interactif)
./scripts/remote/setup-github-tunnel.sh

# OU installation permanente
./scripts/remote/install-tunnel-service.sh
```

## 📊 Statut & Diagnostic

```bash
# Statut simple
code tunnel status

# Diagnostic complet
./scripts/remote/diagnose-tunnel.sh

# Afficher les infos de connexion
./scripts/remote/show-tunnel-info.sh
```

## 🔧 Gestion du Service

```bash
# Démarrer
code tunnel service start

# Arrêter
code tunnel service stop

# Redémarrer
code tunnel service restart

# Statut du service
code tunnel service status

# Voir les logs (temps réel)
code tunnel service log

# Désinstaller le service
code tunnel service uninstall
```

## 🌐 Gestion du Tunnel (Session Interactive)

```bash
# Démarrer avec nom personnalisé
code tunnel --name mon-tunnel

# Démarrer avec nom aléatoire
code tunnel --random-name

# Arrêter le tunnel actif
code tunnel kill

# Redémarrer
code tunnel restart

# Renommer
code tunnel rename nouveau-nom

# Désenregistrer la machine
code tunnel unregister

# Nettoyer les serveurs inactifs
code tunnel prune
```

## 🔐 Authentification

```bash
# Finaliser l'authentification (assistant)
./scripts/remote/complete-auth.sh

# Ou manuellement
code tunnel service stop
code tunnel --name titane-infinity-$(hostname)
# [Authentifier sur GitHub, puis Ctrl+C]
code tunnel service start
```

## 🌍 Accès au Workspace

```bash
# Via navigateur
https://vscode.dev/tunnel/<nom-machine>

# Via VS Code Desktop
code --remote tunnel/<nom-machine>

# Via VS Code Insiders
code-insiders --remote tunnel/<nom-machine>
```

## 🎯 VS Code Tasks

Depuis VS Code: `Ctrl+Shift+P` → "Tasks: Run Task"

- **🌐 Setup GitHub Tunnel**
- **🌐 Tunnel Status**
- **🌐 Start Tunnel Service**
- **🌐 Stop Tunnel Service**
- **🌐 Tunnel Service Logs**

## 🔍 Dépannage

```bash
# Vérifier les processus
pgrep -af 'code.*tunnel'

# Logs système
journalctl --user -u code-tunnel -n 50

# Connexions réseau
ss -tunap | grep tunnel

# Redémarrage complet
code tunnel service uninstall
./scripts/remote/install-tunnel-service.sh

# Test de connexion
ping github.com
curl -I https://vscode.dev
```

## 📦 Configuration Avancée

```bash
# Changer le répertoire des données
code tunnel --server-data-dir /chemin/personnalisé

# Précharger des extensions
code tunnel --install-extension ms-python.python

# Empêcher la mise en veille
code tunnel --no-sleep

# Augmenter le délai de reconnexion (12h)
code tunnel --reconnection-grace-time 43200

# Mode verbose
code tunnel --verbose --log debug
```

## 🛡️ Sécurité

```bash
# Vérifier les connexions actives
code tunnel user show

# Voir toutes les machines enregistrées
code tunnel user list

# Désenregistrer une machine spécifique
code tunnel user unregister <nom-machine>

# Révoquer tous les accès
code tunnel user logout
```

## 📄 Documentation

```bash
# Aide générale
code tunnel --help

# Aide pour une commande
code tunnel service --help

# Version
code --version
```

## 🎨 Format JSON (scripting)

```bash
# Statut en JSON
code tunnel status --output json

# Parser avec jq
code tunnel status | jq '.tunnel.name'
code tunnel status | jq '.tunnel.tunnel'
```

## 🔄 Workflows Courants

### Démarrer pour la première fois
```bash
./scripts/remote/check-prerequisites.sh
./scripts/remote/install-tunnel-service.sh
./scripts/remote/complete-auth.sh
./scripts/remote/show-tunnel-info.sh
```

### Vérification quotidienne
```bash
./scripts/remote/show-tunnel-info.sh
```

### Dépannage rapide
```bash
./scripts/remote/diagnose-tunnel.sh
code tunnel service restart
```

### Changement de machine
```bash
# Sur ancienne machine
code tunnel service stop
code tunnel unregister

# Sur nouvelle machine
./scripts/remote/install-tunnel-service.sh
```

---

**💡 Astuce:** Ajoutez ces alias à votre `~/.bashrc` :

```bash
alias tunnel-status='code tunnel status'
alias tunnel-start='code tunnel service start'
alias tunnel-stop='code tunnel service stop'
alias tunnel-logs='code tunnel service log'
alias tunnel-info='~/Documents/GitHub/TITANE_INFINITY/scripts/remote/show-tunnel-info.sh'
```

---

**Version:** 26.2.3  
**Dernière mise à jour:** 2 janvier 2026
