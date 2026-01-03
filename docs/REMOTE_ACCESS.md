# 🌐 Accès Distant - Remote Tunnel

## Vue d'ensemble

TITANE∞ supporte l'accès distant sécurisé via **GitHub Remote Tunnels**, vous permettant de travailler sur votre projet depuis n'importe où, tout en respectant les principes **local-first** et **privacy-first**.

## ⚡ Démarrage Rapide

### Option 1: Session Temporaire
```bash
./scripts/remote/setup-github-tunnel.sh
```

### Option 2: Service Permanent
```bash
./scripts/remote/install-tunnel-service.sh
```

## 📖 Documentation Complète

- **[Guide Complet](REMOTE_TUNNEL_GUIDE.md)** - Documentation détaillée
- **[Quick Start](REMOTE_TUNNEL_QUICKSTART.md)** - Démarrage en 30 secondes

## 🛠️ Scripts Disponibles

| Script | Description |
|--------|-------------|
| `setup-github-tunnel.sh` | Configuration interactive du tunnel |
| `install-tunnel-service.sh` | Installation comme service système |
| `diagnose-tunnel.sh` | Diagnostic complet de l'état |
| `show-tunnel-info.sh` | Afficher les infos de connexion |

## 🎯 Cas d'Usage

- ✅ Développement en déplacement (laptop, tablette)
- ✅ Accès depuis un autre ordinateur
- ✅ Collaboration d'équipe à distance
- ✅ Debugging sur serveur distant
- ✅ CI/CD avec accès direct au code

## 🔒 Sécurité

- Authentification via GitHub OAuth
- Connexion chiffrée TLS 1.3
- Aucun port exposé publiquement
- Code reste sur votre machine locale
- Respecte les principes TITANE∞

## 🚀 Accès au Workspace

Une fois configuré, accédez à TITANE∞ via :

```
https://vscode.dev/tunnel/<nom-de-votre-machine>
```

## 📊 Commandes VS Code Tasks

Depuis VS Code, appuyez sur `Ctrl+Shift+P` puis "Tasks: Run Task" :

- **🌐 Setup GitHub Tunnel** - Configuration
- **🌐 Tunnel Status** - Voir l'état
- **🌐 Start/Stop Tunnel Service** - Contrôle du service

## ⚙️ Configuration Avancée

Voir [REMOTE_TUNNEL_GUIDE.md](REMOTE_TUNNEL_GUIDE.md#-configuration-avancée) pour :
- Préchargement d'extensions
- Configuration du délai de reconnexion
- Gestion multi-machines
- Intégration systemd

---

**Note:** Cette fonctionnalité nécessite VS Code CLI installé et un compte GitHub.
