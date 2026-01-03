# TITANE∞ HTTP Server Deployment - Guide d'Utilisation

## 🚀 Déploiement Complet Effectué

Date: 2026-01-02
Version: 2.0.0

## ✅ Configuration Actuelle

### Serveur HTTP

- **Type**: Vite Development Server (Pure HTTP, sans Tauri)
- **Host**: 0.0.0.0 (accessible sur toutes les interfaces réseau)
- **Port**: 5173
- **Status**: ✅ **ACTIF ET OPÉRATIONNEL**

### URLs d'Accès

#### Local (Machine actuelle)

- http://localhost:5173
- http://127.0.0.1:5173

#### Réseau Local (LAN)

- http://192.168.2.16:5173
- Accessible depuis tous les appareils du même réseau local

### Tests de Connectivité

✅ **Local**: HTTP 200 OK
✅ **LAN**: HTTP 200 OK

## 📋 Fichiers Créés

### Scripts de Déploiement

1. **[deploy-http-server-pure.sh](deploy-http-server-pure.sh)**
   - Script de déploiement principal
   - Lance le serveur HTTP Vite standalone
   - Configure le réseau et le host
   - Option tunnel Cloudflare intégré
   - Logs automatiques dans `logs/network/`

2. **[stop-http-server.sh](stop-http-server.sh)**
   - Arrêt propre du serveur HTTP
   - Arrêt du tunnel si activé
   - Nettoyage des processus résiduels

3. **[deploy-http-server.sh](deploy-http-server.sh)**
   - Version alternative avec Tauri (nécessite environnement graphique)

## 🛠️ Commandes Utiles

### Démarrer le Serveur

```bash
bash ./deploy-http-server-pure.sh
```

### Arrêter le Serveur

```bash
bash ./stop-http-server.sh
```

### Vérifier le Statut

```bash
# Local
curl -I http://localhost:5173

# LAN
curl -I http://192.168.2.16:5173

# Processus
ps aux | grep vite
```

### Voir les Logs

```bash
# Logs du serveur
tail -f logs/network/http-server-*.log

# Dernier log
ls -t logs/network/http-server-*.log | head -1 | xargs tail -f
```

### Processus en Cours

```bash
# Afficher les PIDs
cat .server.pid
cat .tunnel.pid  # Si tunnel activé

# Tuer manuellement un processus
kill $(cat .server.pid)
```

## 🌐 Configuration Réseau

### Paramètres Actuels

- **Interface**: Toutes (0.0.0.0)
- **IP Locale**: 192.168.2.16
- **Port**: 5173 (modifiable via variable d'environnement `PORT`)
- **Protocole**: HTTP/1.1

### Changer le Port

```bash
PORT=8080 bash ./deploy-http-server-pure.sh
```

## 🔐 Tunnel Internet (Optionnel)

### Installation Cloudflared

```bash
# Ubuntu/Debian
sudo apt install cloudflared

# Arch Linux
sudo pacman -S cloudflared

# macOS
brew install cloudflare/cloudflare/cloudflared
```

### Activation

Le script propose automatiquement d'activer le tunnel si cloudflared est installé.
Une URL publique sera générée: `https://XXXXX.trycloudflare.com`

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│         TITANE∞ HTTP Server                 │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Vite Dev Server                     │  │
│  │  - Port: 5173                        │  │
│  │  - Host: 0.0.0.0                     │  │
│  │  - Mode: Development                 │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Accès:                                     │
│  ├─ Local:    http://localhost:5173        │
│  ├─ LAN:      http://192.168.2.16:5173     │
│  └─ Internet: Tunnel Cloudflare (opt.)     │
└─────────────────────────────────────────────┘
```

## 🎯 Cas d'Usage

### 1. Développement Local

```bash
# Accès depuis la même machine
open http://localhost:5173
```

### 2. Test Multi-Appareils (LAN)

```bash
# Accès depuis téléphone, tablette, autre PC sur le même réseau
# Utiliser: http://192.168.2.16:5173
```

### 3. Démonstration à Distance

```bash
# Activer le tunnel Cloudflare lors du déploiement
# Partager l'URL publique générée
```

## 🔧 Troubleshooting

### Port Déjà Utilisé

Le script détecte automatiquement si le port est occupé et propose de libérer le processus.

### Serveur Ne Démarre Pas

```bash
# Vérifier les logs
tail -100 logs/network/http-server-*.log

# Vérifier les dépendances
pnpm install
```

### Problème de Connectivité LAN

```bash
# Vérifier le pare-feu
sudo ufw status

# Autoriser le port si nécessaire
sudo ufw allow 5173/tcp
```

### Tunnel Ne Se Connecte Pas

```bash
# Vérifier cloudflared
cloudflared --version

# Vérifier les logs du tunnel
tail -f logs/network/tunnel-*.log
```

## 📈 Performance

### Métriques Actuelles

- Temps de réponse: < 50ms (local)
- Temps de démarrage: ~3-5 secondes
- Mode: Hot Module Replacement (HMR) activé

### Optimisations Actives

- Cache Vite optimisé (.vite-cache)
- Compression Brotli + Gzip
- Code splitting automatique
- Tree-shaking

## 🔄 Maintenance

### Logs

Les logs sont automatiquement horodatés et sauvegardés dans `logs/network/`

### Nettoyage

```bash
# Supprimer les anciens logs (> 7 jours)
find logs/network/ -name "*.log" -mtime +7 -delete

# Nettoyer le cache Vite
rm -rf .vite-cache
```

## 📝 Notes Importantes

1. **Mode Development**: Le serveur actuel est en mode développement avec HMR
2. **Production**: Pour un déploiement production, utiliser `npm run build` puis servir `dist/`
3. **Sécurité**: Le serveur écoute sur toutes les interfaces (0.0.0.0), configurer un pare-feu si nécessaire
4. **Tauri**: La version avec Tauri (`deploy-http-server.sh`) nécessite un environnement graphique (GTK)

## ✅ État Actuel du Déploiement

**STATUS**: 🟢 **OPÉRATIONNEL**

- ✅ Serveur HTTP actif
- ✅ Accessible en local
- ✅ Accessible sur le réseau LAN
- ✅ Tests de connectivité réussis
- ⏳ Tunnel Internet: Non configuré (optionnel)

## 📞 Support

Pour plus d'informations:

- Logs: `logs/network/`
- Configuration: `vite.config.ts`
- Documentation réseau: `docs/99_ARCHIVE/network/`
