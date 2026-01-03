# 🌐 TITANE∞ - Accès Distant via GitHub Tunnel

## Vue d'ensemble

Ce guide explique comment configurer un accès distant sécurisé au workspace TITANE∞ via GitHub Remote Tunnels.

## 🎯 Deux Options Disponibles

### Option 1: Tunnel Temporaire (Session Interactive)

**Utilisation:** Accès ponctuel, tests, développement occasionnel

```bash
./scripts/remote/setup-github-tunnel.sh
```

Le script vous propose :
1. **Tunnel avec nom personnalisé** (ex: `titane-dev-laptop`)
2. **Tunnel avec nom aléatoire** (généré automatiquement)
3. **Redémarrer un tunnel existant**
4. **Afficher le statut**

**Avantages:**
- ✅ Rapide à démarrer
- ✅ Pas de configuration système
- ✅ Facile à arrêter (Ctrl+C)

**Inconvénients:**
- ❌ S'arrête quand vous fermez le terminal
- ❌ Nécessite de relancer manuellement

### Option 2: Service Système (Permanent)

**Utilisation:** Accès permanent, serveur de développement, équipe distribuée

```bash
# Installation (nom automatique basé sur hostname)
./scripts/remote/install-tunnel-service.sh

# Ou avec nom personnalisé
./scripts/remote/install-tunnel-service.sh titane-production
```

**Avantages:**
- ✅ Démarre automatiquement au boot
- ✅ Tourne en arrière-plan
- ✅ Logs système via journalctl
- ✅ Géré par systemd

**Inconvénients:**
- ❌ Nécessite droits sudo (première installation)
- ❌ Plus complexe à déboguer

## 🔐 Authentification GitHub

Au premier lancement, vous devrez :

1. Ouvrir l'URL fournie dans le terminal
2. Entrer le code d'authentification
3. Autoriser VS Code à accéder à votre compte GitHub
4. Sélectionner les permissions (recommandé: "Limited access")

**Note:** Cette authentification est sécurisée et ne donne **AUCUN** accès à vos repos GitHub.

## 🌍 Accès au Workspace

Une fois le tunnel établi :

### Via navigateur web
```
https://vscode.dev/tunnel/<nom-de-votre-machine>
```

### Via VS Code Desktop
1. Ouvrir la palette de commandes (Ctrl+Shift+P)
2. Chercher "Remote-Tunnels: Connect to Tunnel"
3. Sélectionner votre machine dans la liste

### Via VS Code Insiders
```bash
code-insiders --remote tunnel/<nom-de-votre-machine>
```

## 📊 Gestion du Tunnel

### Commandes rapides

```bash
# Afficher le statut
code tunnel status

# Arrêter le tunnel (session interactive)
code tunnel kill

# Redémarrer le tunnel
code tunnel restart

# Changer le nom
code tunnel rename <nouveau-nom>

# Désenregistrer la machine
code tunnel unregister
```

### Gestion du service système

```bash
# Démarrer le service
code tunnel service start

# Arrêter le service
code tunnel service stop

# Voir les logs
code tunnel service log

# Statut du service
code tunnel service status

# Désinstaller le service
code tunnel service uninstall
```

## 🔒 Sécurité

### ✅ Ce qui est sécurisé
- Authentification via GitHub OAuth
- Connexion chiffrée TLS 1.3
- Aucun port exposé publiquement
- Contrôle d'accès par compte GitHub

### ⚠️ Bonnes pratiques
- N'installez le service que sur des machines de confiance
- Vérifiez régulièrement les connexions actives
- Désenregistrez les machines inutilisées
- Utilisez des noms de machine descriptifs

### 🚫 Ce qui N'EST PAS partagé
- Vos credentials Git locaux
- Vos tokens d'authentification
- Vos variables d'environnement (sauf si explicitement incluses)
- Vos autres workspaces

## 🎛️ Configuration Avancée

### Changer le répertoire des données serveur
```bash
code tunnel --server-data-dir /chemin/personnalisé
```

### Précharger des extensions
```bash
code tunnel --install-extension dbaeumer.vscode-eslint \
            --install-extension rust-lang.rust-analyzer
```

### Empêcher la mise en veille
```bash
code tunnel --no-sleep
```

### Augmenter le délai de reconnexion (défaut: 3h)
```bash
code tunnel --reconnection-grace-time 43200  # 12 heures
```

## 🐛 Dépannage

### Le tunnel ne démarre pas
```bash
# Nettoyer les serveurs inactifs
code tunnel prune

# Vérifier les logs
journalctl -u code-tunnel --no-pager -n 50
```

### Impossible de se connecter
```bash
# Vérifier le statut
code tunnel status

# Forcer le redémarrage
code tunnel kill
code tunnel restart
```

### Erreur d'authentification
```bash
# Supprimer et réauthentifier
code tunnel unregister
code tunnel  # Relancer l'authentification
```

### Problèmes de performance
```bash
# Vérifier les ressources
systemctl status code-tunnel

# Limiter les extensions chargées
code tunnel --extensions-dir /tmp/minimal-extensions
```

## 📝 Exemples d'Utilisation

### Développement en déplacement
```bash
# Sur machine de bureau (permanente)
./scripts/remote/install-tunnel-service.sh titane-desktop

# Depuis laptop/tablette
# Ouvrir https://vscode.dev/tunnel/titane-desktop
```

### Collaboration d'équipe
```bash
# Serveur de dev partagé
sudo ./scripts/remote/install-tunnel-service.sh titane-team-dev

# Chaque développeur se connecte via GitHub
# Permissions gérées via GitHub Organizations
```

### Tests sur machine distante
```bash
# Sur serveur de CI/CD
./scripts/remote/setup-github-tunnel.sh
# Choisir option 2 (nom aléatoire)
# Debugger directement dans VS Code
```

## 🔗 Ressources

- [Documentation officielle VS Code Remote Tunnels](https://code.visualstudio.com/docs/remote/tunnels)
- [GitHub Issues VS Code](https://github.com/microsoft/vscode/issues)
- [Security Best Practices](https://code.visualstudio.com/docs/remote/tunnels#_security)

## ⚙️ Intégration avec TITANE∞

Le tunnel respecte toutes les contraintes TITANE∞ :
- ✅ **Local-first:** Le code reste sur votre machine
- ✅ **Privacy-first:** Aucune donnée envoyée à des tiers
- ✅ **No HTTP servers:** Utilise le protocole GitHub tunnel
- ✅ **Tauri-only:** Compatible avec l'architecture Tauri

---

**Version:** 26.2.3  
**Dernière mise à jour:** 2 janvier 2026
