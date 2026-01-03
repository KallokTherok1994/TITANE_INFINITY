# 🚀 Guide de Démarrage Rapide - Remote Tunnel

## Installation en 30 secondes

```bash
# Option 1: Session temporaire (recommandé pour tester)
./scripts/remote/setup-github-tunnel.sh

# Option 2: Service permanent (pour usage régulier)
./scripts/remote/install-tunnel-service.sh
```

## Première utilisation

1. **Lancez le script** de votre choix ci-dessus
2. **Copiez l'URL** affichée dans votre navigateur
3. **Entrez le code** d'authentification
4. **Autorisez VS Code** sur GitHub
5. **C'est tout !** 🎉

## Accès à votre workspace

### 🌍 Via navigateur
```
https://vscode.dev/tunnel/<nom-de-votre-machine>
```

### 💻 Via VS Code Desktop
1. `Ctrl+Shift+P`
2. "Remote-Tunnels: Connect to Tunnel"
3. Sélectionnez votre machine

## Commandes utiles

```bash
# Voir le statut
code tunnel status

# Arrêter
code tunnel kill

# Redémarrer
code tunnel restart

# Service système
code tunnel service start
code tunnel service stop
code tunnel service status
```

## Depuis VS Code Tasks

Appuyez sur `Ctrl+Shift+P` puis "Tasks: Run Task" et choisissez :
- **🌐 Setup GitHub Tunnel** - Configuration interactive
- **🌐 Tunnel Status** - Voir l'état actuel
- **🌐 Tunnel Service Status** - État du service système

## Besoin d'aide ?

Consultez le guide complet : [docs/REMOTE_TUNNEL_GUIDE.md](REMOTE_TUNNEL_GUIDE.md)

---

**⚠️ Important:** Votre machine doit rester allumée pour que le tunnel reste actif.
