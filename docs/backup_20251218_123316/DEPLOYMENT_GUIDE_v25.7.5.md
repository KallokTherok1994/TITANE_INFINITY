# 🚀 GUIDE DE DÉPLOIEMENT PRODUCTION — TITANE∞ v25.7.5

**Date:** 17 décembre 2025  
**Version:** v25.7.5  
**Phase:** Phase 4 P2 (Brotli + Service Worker)  
**Status:** ✅ **PRODUCTION READY**

---

## 📊 RÉCAPITULATIF DÉPLOIEMENT

### Ce qui sera déployé

| Feature                | Impact                     | Status   |
| ---------------------- | -------------------------- | -------- |
| **Brotli Compression** | -160.83 KB bundle (-14.4%) | ✅ Ready |
| **Service Worker**     | -400ms repeat TTI (-27%)   | ✅ Ready |
| **Offline Support**    | Partial (UI works)         | ✅ Ready |
| **78 files precached** | 4.1 MB cache               | ✅ Ready |
| **52 .br + 52 .gz**    | Dual compression           | ✅ Ready |

### Impact Utilisateur

**First Visit:**

- Download: 958 KB (Brotli) vs 1119 KB (Gzip) = -14.4%
- TTI: ~1.55s (+50ms SW install overhead)
- Cache: 4.1 MB disk storage

**Repeat Visit:**

- Download: **0 KB** (100% cached) ✅
- TTI: **~1.1s** (-400ms improvement) ✅
- Cache: Instant loading from disk

**Offline:**

- UI: ✅ Fully functional (HTML/CSS/JS cached)
- API: ⚠️ 5min cache fallback (degraded)
- ONNX: ✅ Cached models work

---

## 🔧 PRÉ-REQUIS

### Obligatoires ✅

1. **HTTPS obligatoire**
   - Service Workers requièrent HTTPS
   - Exception: localhost (dev/test OK en HTTP)
   - Si HTTP-only → SW ne s'installera pas (app fonctionne sans)

2. **Serveur Web moderne**
   - Nginx, Apache, Caddy, ou CDN (Cloudflare, Netlify, Vercel)
   - Support Brotli: Recommandé mais optionnel
   - Support Gzip: Fallback automatique

### Optionnels (Recommandés)

1. **Compression Brotli serveur**
   - Amélioration: -160 KB bundle
   - Fallback Gzip fonctionne si indisponible

2. **Cache-Control headers**
   - Optimisation cache navigateur
   - Recommandé mais non bloquant

---

## 📦 DÉPLOIEMENT SIMPLE (Rapide)

### Étape 1: Build Production

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm run build
```

**Output attendu:**

```
✅ Workbox: 78 files precached (4127.85 KB)
dist/index.html    5.71 kB │ gzip: 2.06 kB
Build time: ~13.8s
```

**Validation:**

```bash
ls -lh dist/sw.js              # Devrait exister (10 KB)
find dist/assets -name "*.br" | wc -l  # Devrait retourner 52
```

### Étape 2: Upload dist/ vers serveur

**Via FTP/SFTP:**

```bash
# Upload tout le dossier dist/ vers votre serveur web
scp -r dist/* user@server:/var/www/html/
```

**Via Git Deploy (Netlify/Vercel):**

```bash
# Déjà fait! Le push origin/MAIN déclenche auto-deploy
# Vérifier dashboard Netlify/Vercel pour status
```

**Via Docker:**

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t titane-infinity:v25.7.5 .
docker run -d -p 80:80 titane-infinity:v25.7.5
```

### Étape 3: Vérification Post-Déploiement

**1. Ouvrir https://votre-domaine.com**

**2. DevTools > Application > Service Workers**

- ✅ Devrait voir: "sw.js" activé
- ✅ Status: "activated and is running"
- ✅ Scope: https://votre-domaine.com/

**3. DevTools > Application > Cache Storage**

- ✅ Devrait voir 5 caches:
  - precache-v2-... (4.1 MB, 78 files)
  - titane-assets-v1 (0 MB initialement)
  - titane-static-v1 (0 MB)
  - titane-api-v1 (0 MB)
  - titane-onnx-models-v1 (0 MB)

**4. DevTools > Network > Throttling > Offline**

- ✅ Refresh page → UI devrait charger
- ✅ Console: "✅ Service Worker registered"

**5. Performance Test**

```bash
# Lighthouse
npx lighthouse https://votre-domaine.com --view

# Métriques attendues:
# - Performance: 90-100
# - PWA: 100 (Service Worker détecté)
# - Best Practices: 90-100
```

---

## ⚙️ CONFIGURATION SERVEUR (Optionnel)

### Nginx (Recommandé)

**Fichier:** `/etc/nginx/sites-available/titane-infinity`

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    # SSL Configuration (obligatoire pour SW)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html/titane-infinity;
    index index.html;

    # ═══════════════════════════════════════════════════════════
    # BROTLI COMPRESSION (Optionnel mais recommandé)
    # ═══════════════════════════════════════════════════════════

    # Enable Brotli static (serve .br files pre-built)
    brotli_static on;
    brotli on;
    brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    brotli_comp_level 6;

    # Gzip fallback (browsers without Brotli)
    gzip_static on;
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;

    # ═══════════════════════════════════════════════════════════
    # CACHE HEADERS (Optionnel mais recommandé)
    # ═══════════════════════════════════════════════════════════

    # Service Worker: Always check for updates
    location = /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    # Assets: Long cache (content-hashed filenames)
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # HTML: No cache (always fresh)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # ═══════════════════════════════════════════════════════════
    # SPA ROUTING (React Router)
    # ═══════════════════════════════════════════════════════════

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}
```

**Activer:**

```bash
sudo ln -s /etc/nginx/sites-available/titane-infinity /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

### Apache (.htaccess)

**Fichier:** `dist/.htaccess` (créer si inexistant)

```apache
# ═══════════════════════════════════════════════════════════
# HTTPS REDIRECT (Obligatoire pour Service Worker)
# ═══════════════════════════════════════════════════════════

RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# ═══════════════════════════════════════════════════════════
# BROTLI COMPRESSION (Optionnel)
# ═══════════════════════════════════════════════════════════

<IfModule mod_brotli.c>
    AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript

    # Serve .br files if they exist
    RewriteCond %{HTTP:Accept-Encoding} br
    RewriteCond %{REQUEST_FILENAME}.br -f
    RewriteRule ^(.*)$ $1.br [L]
</IfModule>

# ═══════════════════════════════════════════════════════════
# GZIP FALLBACK
# ═══════════════════════════════════════════════════════════

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript
</IfModule>

# ═══════════════════════════════════════════════════════════
# CACHE HEADERS
# ═══════════════════════════════════════════════════════════

# Service Worker: No cache
<FilesMatch "sw\.js$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
    Header set Service-Worker-Allowed "/"
</FilesMatch>

# Assets: Long cache
<FilesMatch "\.(js|css|woff2|svg|png|jpg|webp)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# HTML: No cache
<FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>

# ═══════════════════════════════════════════════════════════
# SPA ROUTING
# ═══════════════════════════════════════════════════════════

RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Déployer:**

```bash
cp .htaccess dist/.htaccess
# Upload dist/ (inclut .htaccess)
```

### Cloudflare (CDN)

**Auto-configuration:** ✅ Aucune config requise!

**Recommendations:**

1. **SSL/TLS:** Full (strict) mode
2. **Brotli:** Auto-enabled (Cloudflare dashboard)
3. **Cache Rules:**
   ```
   sw.js → Cache Level: Bypass
   /assets/* → Cache Level: Standard, Edge TTL: 1 year
   *.html → Cache Level: Bypass
   ```

### Netlify/Vercel

**Auto-deploy configuré!** ✅

**Vérifier:**

1. Netlify: Dashboard > Site > Deploys
2. Vercel: Dashboard > Project > Deployments
3. Status devrait être "Published" avec preview URL

**Headers customization (optionnel):**

**Netlify:** `netlify.toml`

```toml
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Vercel:** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 🧪 TESTS POST-DÉPLOIEMENT

### Test 1: Service Worker Installation

**Chrome DevTools:**

```
1. F12 > Application > Service Workers
2. Vérifier: "sw.js" activé
3. Console: "✅ Service Worker registered: https://..."
4. Cache Storage: 5 caches créés
```

**Expected console logs:**

```
✅ TITANE∞ REACT ROOT MOUNTED (App Complet Actif)
✅ Service Worker registered: https://votre-domaine.com/
✅ TITANE∞ Service Worker v25.7.5 activated
```

### Test 2: Brotli Compression

**Vérification Headers:**

```bash
curl -H "Accept-Encoding: br" -I https://votre-domaine.com/assets/monitoring-*.js

# Devrait retourner:
# Content-Encoding: br
# Content-Length: 108860  (taille .br, pas .js)
```

**Si Content-Encoding: gzip** → Brotli pas activé serveur, fallback Gzip OK ✅

### Test 3: Offline Mode

**Chrome:**

```
1. F12 > Network > Throttling > Offline
2. Refresh page (Ctrl+R)
3. ✅ UI devrait charger complètement
4. ⚠️ API calls peuvent échouer (attendu)
5. Console: "Service Worker serving from cache"
```

### Test 4: Performance (Repeat Visit)

**Chrome DevTools:**

```
1. F12 > Network > Disable cache: OFF
2. Load page first time (populate cache)
3. Refresh page (Ctrl+R)
4. Network tab: Size column devrait montrer "(ServiceWorker)"
5. Total transferred: ~0 B (100% cached) ✅
```

**Lighthouse:**

```bash
npx lighthouse https://votre-domaine.com --view

# Métriques attendues:
# Performance: 90-100
# TTI: ~1.1s (repeat visit, -400ms vs baseline)
# PWA: 100 (installable)
```

### Test 5: Update Flow

**Simuler nouvelle version:**

```bash
# 1. Modifier code
# 2. Build
pnpm run build

# 3. Upload dist/ (sw.js change → new revision)
# 4. Reload page
# 5. Console devrait montrer:
#    "🔄 New Service Worker available. Refresh to update."
# 6. Refresh again → new version active
```

---

## 📊 MONITORING PRODUCTION

### Métriques à surveiller

**Performance:**

```javascript
// Web Vitals (déjà intégré)
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getLCP(console.log); // Largest Contentful Paint

// Attendu:
// LCP: < 2.5s (Good)
// FID: < 100ms (Good)
// CLS: < 0.1 (Good)
```

**Cache Usage:**

```javascript
// Browser console
navigator.storage.estimate().then(({ usage, quota }) => {
  console.log(
    `Cache: ${(usage / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB`
  );
});

// Attendu: ~4-5 MB usage
```

**Service Worker Status:**

```javascript
// Browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Active:', reg.active?.state);
  console.log('SW Waiting:', reg.waiting?.state);
  console.log('SW Installing:', reg.installing?.state);
});
```

### Logs Serveur (Nginx example)

**Access log:**

```bash
tail -f /var/log/nginx/access.log | grep -E "(sw.js|\.br|\.gz)"

# Devrait montrer:
# GET /sw.js HTTP/2.0" 200 10240 (Service Worker loads)
# GET /assets/monitoring-*.js.br HTTP/2.0" 200 108860 (Brotli served)
```

**Error log:**

```bash
tail -f /var/log/nginx/error.log

# Devrait être vide (pas d'erreurs)
```

---

## 🔧 TROUBLESHOOTING

### Problème: Service Worker ne s'installe pas

**Causes possibles:**

1. ❌ Site en HTTP (pas HTTPS)
   - **Solution:** Activer HTTPS (Let's Encrypt gratuit)
2. ❌ sw.js 404 Not Found
   - **Solution:** Vérifier dist/sw.js uploadé correctement

3. ❌ CORS errors dans console
   - **Solution:** Vérifier headers `Service-Worker-Allowed`

**Debug:**

```javascript
// Browser console
navigator.serviceWorker
  .register('/sw.js')
  .then(reg => console.log('OK:', reg))
  .catch(err => console.error('FAIL:', err));
```

### Problème: Brotli non servi (Gzip à la place)

**Vérification:**

```bash
curl -H "Accept-Encoding: br, gzip" -I https://votre-domaine.com/assets/monitoring-*.js
```

**Si Content-Encoding: gzip** → 3 scénarios:

1. ✅ **Fallback intentionnel** (browser ancien)
   - Normal, Gzip fonctionne bien

2. ⚠️ **Brotli pas activé serveur**
   - Nginx: Installer `nginx-module-brotli`
   - Apache: Installer `mod_brotli`

3. ⚠️ **Fichiers .br manquants**
   - Vérifier: `ls dist/assets/*.br`
   - Re-build si nécessaire

**Impact si Brotli désactivé:**

- Performance: -14.4% gain perdu (Gzip vs Brotli)
- Fonctionnel: ✅ App fonctionne normalement avec Gzip

### Problème: Cache pas vidé après update

**Causes:**

1. Service Worker stuck en "waiting"
   - **Solution:** skipWaiting() déjà implémenté
   - Forcer: DevTools > Application > SW > "skipWaiting"

2. Content-hashing pas changé
   - **Solution:** Re-build (Vite génère nouveaux hashes)

3. Browser cache aggressive
   - **Solution:** Ctrl+Shift+R (hard refresh)

**Force clear cache:**

```javascript
// Browser console (en cas d'urgence)
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  location.reload();
});
```

### Problème: Offline mode ne fonctionne pas

**Checklist:**

1. ✅ Service Worker actif? → DevTools > Application > SW
2. ✅ Fichiers précached? → Cache Storage devrait avoir 78 files
3. ✅ Network offline? → DevTools > Network > Throttling

**Si API calls échouent offline:**

- ✅ **Comportement attendu!**
- NetworkFirst strategy = Try network → Fallback cache 5min
- Solution: Afficher UI offline indicator

---

## 📈 ROLLBACK PLAN

### Si problème critique en production

**Option 1: Rollback Git (Recommandé)**

```bash
# Retour version précédente
git revert HEAD
git push origin MAIN

# Re-deploy dist/ version précédente
pnpm run build
# Upload dist/
```

**Option 2: Désactiver Service Worker**

```bash
# Modifier src/main.tsx
# Commenter registration:
/*
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
  ...
}
*/

# Build + Deploy
pnpm run build
```

**Option 3: Unregister SW côté client**

```javascript
// Ajouter à index.html temporairement
<script>
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
</script>
```

**Impact rollback:**

- Perte: -160 KB Brotli gain + -400ms SW cache
- Retour: État baseline (Gzip standard)
- Utilisateurs: Cache vidé au prochain reload

---

## ✅ CHECKLIST DÉPLOIEMENT

### Pré-Déploiement

- [x] Build production: `pnpm run build` ✅
- [x] Git pushed: origin/MAIN à jour ✅
- [x] sw.js généré: `ls dist/sw.js` ✅
- [x] Brotli files: 52 .br files ✅
- [x] TypeScript: 0 errors ✅
- [x] Tests: All passing ✅

### Déploiement

- [ ] dist/ uploadé vers serveur
- [ ] HTTPS actif (obligatoire)
- [ ] Nginx/Apache config (optionnel)
- [ ] DNS configuré (si nouveau domaine)
- [ ] SSL certificate valide

### Post-Déploiement

- [ ] Site accessible: https://votre-domaine.com ✅
- [ ] Service Worker: DevTools > Application ✅
- [ ] Cache Storage: 78 files precached ✅
- [ ] Offline mode: Fonctionne ✅
- [ ] Performance: Lighthouse > 90 ✅
- [ ] Logs serveur: Pas d'erreurs ✅

### Monitoring (24h après)

- [ ] Erreurs JS: Sentry/LogRocket
- [ ] Performance: Google Analytics
- [ ] Cache usage: < 5 MB par user
- [ ] SW installation rate: > 95%
- [ ] TTI repeat visit: < 1.5s

---

## 🎯 RÉSUMÉ RAPIDE

### Commandes Essentielles

```bash
# 1. Build
pnpm run build

# 2. Vérifier dist/
ls -lh dist/sw.js              # 10 KB
find dist/assets -name "*.br" | wc -l  # 52 files

# 3. Upload dist/ vers serveur
scp -r dist/* user@server:/var/www/html/

# 4. Tester
curl -I https://votre-domaine.com/sw.js
# HTTP/2 200 OK ✅
```

### Métriques Attendues

**Production:**

- Bundle: 958 KB Brotli (vs 1119 KB Gzip)
- TTI first: ~1.55s (+50ms SW overhead)
- TTI repeat: ~1.1s (-400ms cache hit)
- Offline: ✅ Partial support

**Utilisateurs:**

- Cache: 4.1 MB disk
- Network first visit: -160 KB download
- Network repeat: 0 KB (100% cached)
- Experience: Instant page loads

---

## 📞 SUPPORT

### En cas de problème

**1. Logs:**

```bash
# Browser console
F12 > Console > Filter: "service worker"

# Serveur Nginx
sudo tail -f /var/log/nginx/error.log
```

**2. Debug DevTools:**

```
F12 > Application > Service Workers
- État: Should be "activated and is running"
- Errors: Should be empty

F12 > Application > Cache Storage
- precache-v2-...: Should have 78 entries
```

**3. Rollback si critique:**

```bash
git revert HEAD && git push origin MAIN
pnpm run build
# Upload dist/
```

---

**Document:** DEPLOYMENT_GUIDE_v25.7.5.md  
**Version:** v25.7.5  
**Date:** 17 décembre 2025  
**Status:** ✅ **READY TO DEPLOY**

🚀 **Bon déploiement!**
