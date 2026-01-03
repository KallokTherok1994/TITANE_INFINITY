# TITANE∞ Network Dev Tunnel - Configuration & Usage

## 🌐 Vue d'ensemble

Exposition sécurisée de TITANE∞ dev server sur:

- **Local**: http://localhost:5173
- **LAN**: http://192.168.2.16:5173
- **Internet**: https://\*.trycloudflare.com (tunnel Cloudflare)

## 🚀 Usage rapide

### Démarrer le tunnel

```bash
./scripts/network/start-tunnel.sh
```

**Ce script:**

1. Vérifie si Vite dev tourne (sinon propose de lancer)
2. Affiche l'URL LAN locale
3. Installe cloudflared (si absent)
4. Démarre le tunnel Cloudflare
5. Affiche l'URL HTTPS publique

### Arrêter le tunnel

```bash
./scripts/network/stop-tunnel.sh
```

**Ce script:**

1. Tue le processus cloudflared
2. Nettoie les fichiers PID/URL
3. Préserve les logs

### Valider l'accès réseau

```bash
./scripts/network/validate-network.sh
```

**Tests effectués:**

- ✅ Accès local (localhost:5173)
- ✅ Accès LAN (IP locale:5173)
- ✅ Accès tunnel (HTTPS public)
- ✅ HTTPS enforced
- ✅ Vite HMR actif
- ✅ Aucun secret exposé dans HTML

## 📁 Fichiers générés

```
logs/network/
├── tunnel.log        # Logs cloudflared
├── tunnel.pid        # PID du processus tunnel
├── tunnel.url        # URL HTTPS publique
└── tunnel.start      # Timestamp démarrage
```

## 🔒 Sécurité

### CSP Modifiée (dev uniquement)

```
connect-src 'self' tauri: asset: ipc:
  http://localhost:*
  http://*.trycloudflare.com
  https://*.trycloudflare.com
  http://192.168.*:*
  http://10.*:*
  https://generativelanguage.googleapis.com
```

**Autorise:**

- ✅ localhost (tous ports)
- ✅ Cloudflare tunnels
- ✅ Réseaux LAN privés (192.168.x.x, 10.x.x.x)
- ✅ API externes (Gemini)

**Bloque:**

- ❌ Connexions non autorisées
- ❌ Domaines arbitraires
- ❌ Accès production (CSP stricte maintenue)

### Recommandations

⚠️ **Mode DEV uniquement:**

- Ne PAS partager l'URL tunnel publiquement
- Arrêter le tunnel après usage
- Vérifier les logs régulièrement

⚠️ **Données sensibles:**

- Aucune clé API dans le code frontend
- Variables d'environnement côté serveur
- Tauri invoke pour opérations sensibles

## 🧪 Workflow de test

### 1. Démarrer dev + tunnel

```bash
# Terminal 1: Titan-Dev
pnpm run dev:tauri

# Terminal 2: Tunnel
./scripts/network/start-tunnel.sh
```

### 2. Tester accès

```bash
# Local
curl http://localhost:5173

# LAN (autre device même réseau)
curl http://192.168.2.16:5173

# Internet (n'importe où)
curl https://xxx-yyy-zzz.trycloudflare.com
```

### 3. Valider

```bash
./scripts/network/validate-network.sh
```

### 4. Arrêter

```bash
./scripts/network/stop-tunnel.sh
```

## 📊 Logs & Monitoring

### Voir logs tunnel en temps réel

```bash
tail -f logs/network/tunnel.log
```

### Vérifier tunnel actif

```bash
# PID
cat logs/network/tunnel.pid

# URL
cat logs/network/tunnel.url

# Démarré à
cat logs/network/tunnel.start
```

### Statistiques cloudflared

```bash
# Connexions actives
sudo ss -tulnp | grep cloudflared

# Processus
ps aux | grep cloudflared
```

## 🔧 Configuration avancée

### Changer port Vite

```json
// package.json
{
  "scripts": {
    "vite:dev": "vite --host 0.0.0.0 --port 5173 --strictPort"
  }
}
```

**⚠️ Important:** Mettre à jour aussi:

- `src-tauri/tauri.conf.json` → `"devUrl": "http://localhost:5173"`
- `scripts/network/start-tunnel.sh` → `DEV_PORT=5173`

### Tunnel permanent (domaine fixe)

Pour production/démo, utiliser tunnel authentifié:

```bash
# Login Cloudflare
cloudflared tunnel login

# Créer tunnel nommé
cloudflared tunnel create titane-dev

# Route domaine
cloudflared tunnel route dns titane-dev dev.titane-infinity.com

# Démarrer avec config
cloudflared tunnel run titane-dev
```

## 🐛 Troubleshooting

### Tunnel ne démarre pas

```bash
# Vérifier cloudflared installé
cloudflared --version

# Réinstaller
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### URL tunnel non obtenue

```bash
# Vérifier logs
cat logs/network/tunnel.log

# Tuer processus zombie
pkill -9 cloudflared

# Redémarrer
./scripts/network/start-tunnel.sh
```

### LAN inaccessible

```bash
# Vérifier firewall
sudo ufw status

# Autoriser port 5173
sudo ufw allow 5173/tcp

# Vérifier IP
hostname -I
```

### CSP bloque requêtes

```bash
# Vérifier console navigateur (F12)
# Si erreur CSP, ajouter domaine dans:
# src-tauri/tauri.conf.json → security.csp → connect-src
```

## 📚 Références

- [Cloudflared Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps)
- [Tauri Security](https://tauri.app/v1/references/security/)
- [Vite Network](https://vitejs.dev/config/server-options.html#server-host)

## 🎯 Prochaines étapes

- [ ] Authentification tunnel (token/password)
- [ ] Rate limiting connexions remote
- [ ] Dashboard monitoring (connexions actives)
- [ ] Auto-shutdown tunnel après N minutes inactivité
- [ ] Metrics Prometheus (latence, bandwidth)

## 📄 Version

- **Version**: 1.0.0
- **Date**: 12/12/2025
- **Auteur**: TITANE∞ Team
- **Status**: ✅ Production Ready
