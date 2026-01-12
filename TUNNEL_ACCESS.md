# 🌐 TITANE∞ Tunnel Public

## État du Tunnel
✅ **Cloudflared tunnel activé**

## Accès Public au Serveur Dev

Le serveur TITANE dev (Vite sur port 5173) est maintenant exposé publiquement via Cloudflare Tunnel.

### URL d'Accès
```
https://[URL-TRYCLOUDFLARE].trycloudflare.com
```

**Note:** L'URL exact est généré automatiquement par Cloudflare. Vérifiez la sortie cloudflared ou utilisez :
```bash
curl -I http://localhost:5173
```

## Configuration Active

| Paramètre | Valeur |
|-----------|--------|
| **Local URL** | http://localhost:5173 |
| **Tunnel Type** | Cloudflare Quick Tunnel (account-less) |
| **Service** | Vite Dev Server (TITANE) |
| **Ollama** | http://localhost:11434 (local only) |
| **Status** | 🟢 Running |

## Commandes Utiles

### Afficher l'URL du tunnel
```bash
# L'URL s'affiche dans les logs cloudflared
ps aux | grep cloudflared
# ou vérifiez les logs récents:
tail -50 ~/.local/share/cloudflared/tunnel.log 2>/dev/null || echo "Logs not found"
```

### Arrêter le tunnel
```bash
pkill -f "cloudflared tunnel"
```

### Relancer le tunnel
```bash
cd /home/titane/Documents/TITANE_INFINITY
nohup cloudflared tunnel --url http://localhost:5173 > .tunnel-access.txt 2>&1 &
```

### Tester l'accès local
```bash
curl -s http://localhost:5173 | head -20
```

## Services Disponibles

- **TITANE Dev App**: Public via tunnel (Vite)
- **Ollama API**: Local only (127.0.0.1:11434) - NOT exposed
- **Backend Tauri**: Local WebView

## ⚠️ Important

1. **Tunnel non persistant**: Ces tunnels account-less Cloudflare sont sans uptime guarantee
2. **Pas d'authentification**: Le serveur dev est PUBLIC
3. **Données sensibles**: Ne pas utiliser pour production
4. **Autorités de certification**: Certificat automatique Cloudflare

## 🔐 Sécurité

Pour production, utilisez un tunnel nommé Cloudflare authentifié :
https://developers.cloudflare.com/cloudflare-one/connections/connect-apps

---

**Tunnel actif depuis:** 2026-01-12T22:59:17Z
**Processus:** `pkill -f "cloudflared tunnel"` pour arrêter
