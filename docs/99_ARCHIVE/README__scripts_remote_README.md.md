# Scripts Remote Access - TITANE∞

Ce dossier contient les scripts de gestion de l'accès distant via GitHub Remote Tunnels.

## 📁 Scripts Disponibles

### `setup-github-tunnel.sh`

**Usage:** `./setup-github-tunnel.sh`

Script interactif pour configurer un tunnel temporaire. Offre plusieurs options :

1. Tunnel avec nom personnalisé
2. Tunnel avec nom aléatoire
3. Redémarrage du tunnel existant
4. Affichage du statut

**Quand l'utiliser :**

- Première configuration
- Tests ponctuels
- Accès temporaire depuis un autre ordinateur

---

### `install-tunnel-service.sh`

**Usage:** `./install-tunnel-service.sh [nom-optionnel]`

Installe le tunnel comme service système (systemd). Le tunnel démarre automatiquement au boot.

**Arguments :**

- `nom-optionnel` : Nom personnalisé (défaut: `titane-infinity-<hostname>`)

**Quand l'utiliser :**

- Serveur de développement permanent
- Accès régulier depuis plusieurs machines
- Configuration en production

**Exemple :**

```bash
./install-tunnel-service.sh titane-dev-server
```

---

### `diagnose-tunnel.sh`

**Usage:** `./diagnose-tunnel.sh`

Effectue un diagnostic complet de l'état du tunnel :

- ✅ Vérification VS Code CLI
- 📊 Statut du tunnel
- 🔧 État du service système
- 🔍 Processus actifs
- 🌐 Connexions réseau
- 📄 Logs récents

**Quand l'utiliser :**

- Problème de connexion
- Tunnel ne démarre pas
- Vérification après installation

---

### `show-tunnel-info.sh`

**Usage:** `./show-tunnel-info.sh`

Affiche les informations de connexion du tunnel actif :

- 🌍 URL d'accès web
- 💻 Commandes pour VS Code Desktop
- ⌨️ Commandes CLI
- 📋 Commandes utiles

**Quand l'utiliser :**

- Récupérer l'URL de connexion
- Partager les infos d'accès avec l'équipe
- Rappel des commandes disponibles

---

## 🚀 Workflows Typiques

### Premier Setup (Test)

```bash
# 1. Configuration interactive
./setup-github-tunnel.sh

# 2. Choisir option 1 ou 2
# 3. Authentifier sur GitHub
# 4. Récupérer l'URL
./show-tunnel-info.sh
```

### Installation Permanente

```bash
# 1. Installer comme service
./install-tunnel-service.sh titane-prod

# 2. Vérifier l'installation
./diagnose-tunnel.sh

# 3. Afficher les infos
./show-tunnel-info.sh

# 4. Démarrer si nécessaire
code tunnel service start
```

### Dépannage

```bash
# 1. Diagnostic complet
./diagnose-tunnel.sh

# 2. Vérifier les logs
code tunnel service log

# 3. Redémarrer si nécessaire
code tunnel service restart

# 4. Réinstaller en dernier recours
code tunnel service uninstall
./install-tunnel-service.sh
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement

Ces scripts respectent les variables suivantes :

```bash
# Répertoire des données serveur
VSCODE_CLI_DATA_DIR=/chemin/personnalisé

# Niveau de log (trace, debug, info, warn, error)
VSCODE_CLI_LOG=debug
```

### Intégration Systemd

Le service installé crée une unité systemd user :

```bash
# Fichier: ~/.config/systemd/user/code-tunnel.service

# Commandes systemd standard
systemctl --user status code-tunnel
systemctl --user enable code-tunnel
systemctl --user disable code-tunnel

# Logs via journalctl
journalctl --user -u code-tunnel -f
```

---

## 📚 Documentation

- [Guide Complet](../../docs/REMOTE_TUNNEL_GUIDE.md)
- [Quick Start](../../docs/REMOTE_TUNNEL_QUICKSTART.md)
- [Accès Distant](../../docs/REMOTE_ACCESS.md)

---

## 🔒 Sécurité

⚠️ **Attention :** Ces scripts donnent accès complet au workspace TITANE∞.

### Bonnes Pratiques

1. ✅ Utilisez des noms de machine descriptifs
2. ✅ Vérifiez régulièrement les connexions actives
3. ✅ Désenregistrez les machines inutilisées
4. ✅ Utilisez le service système uniquement sur machines de confiance
5. ❌ N'installez PAS le service sur des machines publiques/partagées

### Permissions GitHub

L'authentification GitHub ne donne **AUCUN** accès à :

- Vos repositories GitHub
- Vos organisations
- Vos données privées

Elle permet uniquement :

- Établir le tunnel sécurisé
- Vous identifier comme propriétaire du tunnel

---

**Version:** 26.2.3  
**Dernière mise à jour:** 2 janvier 2026
