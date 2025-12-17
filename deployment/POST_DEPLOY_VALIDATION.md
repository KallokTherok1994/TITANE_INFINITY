# ✅ TITANE INFINITY v26.1 - Post-Deploy Validation Checklist

**Date:** 2024-12-17  
**Version:** v26.1  
**Commit:** b5927db3  
**Deployment:** Option 1 (Serveur Personnel Nginx)

---

## 🎯 VALIDATION IMMÉDIATE (Post-Deploy J+0)

### 1. Compression Brotli ⭐ CRITIQUE

**Test automatique:**

```bash
DOMAIN="votre-domaine.com"
curl -I -H "Accept-Encoding: br,gzip" https://$DOMAIN/assets/ui-common-*.js | grep content-encoding
```

**✅ Résultat attendu:**

```
content-encoding: br
```

**❌ Si absent** (content-encoding: gzip ou absent):

```bash
# Vérifier module Brotli installé
sudo apt list --installed | grep brotli
# Si absent:
sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
sudo systemctl restart nginx

# Vérifier config Nginx
sudo nginx -t
sudo cat /etc/nginx/sites-available/titane-infinity | grep brotli
```

**Impact si échec:**

- Bundle: +160 KB par utilisateur (-14.4% économie perdue)
- Bandwidth: +57.84 GB/an coût additionnel
- TTI: +200ms dégradation performance

---

### 2. Service Worker Activation

**Test navigateur:**

```
1. Ouvrir https://votre-domaine.com
2. F12 → Application → Service Workers
3. Vérifier: "TITANE∞ Service Worker v26.1" ACTIVATED ✅
```

**Test curl:**

```bash
curl -I https://$DOMAIN/sw.js | grep cache-control
```

**✅ Résultat attendu:**

```
cache-control: no-cache, no-store, must-revalidate
```

**❌ Si Service Worker non enregistré:**

```bash
# Console navigateur → Check erreurs
# Causes communes:
# 1. HTTP instead of HTTPS (SW requires HTTPS)
# 2. sw.js cached (CRITICAL: headers incorrects)
# 3. CSP blocking (check Content-Security-Policy header)

# Fixer headers Nginx:
sudo nano /etc/nginx/sites-available/titane-infinity
# Vérifier section "location = /sw.js"
```

**Impact si échec:**

- Cache: 0% au lieu de 80%+ (performance repeat visit)
- Offline: Non disponible
- TTI repeat: +400ms dégradation

---

### 3. PWA Installable

**Test manifest.json:**

```bash
curl https://$DOMAIN/manifest.json | jq .
```

**✅ Résultat attendu:**

```json
{
  "name": "TITANE INFINITY",
  "short_name": "TITANE∞",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Chat IA",
      "url": "/chat",
      "icons": [...]
    },
    {
      "name": "Stats Performance",
      "url": "/stats",
      "icons": [...]
    }
  ]
}
```

**Test installation browser:**

- **Chrome Desktop:** Bouton "Install" visible dans barre URL ✅
- **iOS Safari:** Share → Add to Home Screen ✅
- **Android Chrome:** Prompt "Install App" automatique ✅

**❌ Si non installable:**

```bash
# Lighthouse PWA audit détaillé
npx lighthouse https://$DOMAIN --only-categories=pwa --view

# Check common issues:
# 1. Icons manquants (192x192, 512x512)
# 2. start_url incorrect
# 3. display non "standalone"
# 4. Service Worker non enregistré
```

**Impact si échec:**

- PWA Score: 0/100 au lieu de 100/100
- Mobile engagement: -60% (pas d'icône home screen)

---

### 4. HTTPS + SSL Certificate

**Test SSL:**

```bash
curl -I https://$DOMAIN/ | head -1
# Attendu: HTTP/2 200

openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -noout -dates
# Vérifier: notAfter date dans le futur (3 mois Let's Encrypt)
```

**Test redirect HTTP → HTTPS:**

```bash
curl -I http://$DOMAIN/ | grep -i location
# Attendu: Location: https://votre-domaine.com/
```

**❌ Si certificat expiré:**

```bash
# Renouveler Let's Encrypt
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

**Impact si échec:**

- Service Worker: Non fonctionnel (HTTPS requis)
- SEO: Pénalité Google
- Sécurité: Données non chiffrées

---

### 5. Admin Access Protection

**Test endpoints protégés:**

```bash
# Sans credentials (doit fail 401)
curl -I https://$DOMAIN/admin
# Attendu: HTTP/2 401 Unauthorized

# Avec credentials (remplacer PASSWORD)
curl -u admin:PASSWORD https://$DOMAIN/admin | head -20
# Attendu: HTTP/2 200 + HTML app
```

**Test browser:**

```
1. Naviguer: https://votre-domaine.com/admin
2. Popup: "Authentication Required"
3. Enter: Username = admin, Password = [votre password]
4. Résultat: Dashboard admin accessible ✅
```

**❌ Si auth ne fonctionne pas:**

```bash
# Vérifier fichier .htpasswd existe
ls -lh /etc/nginx/.htpasswd-titane
# Attendu: -rw-r----- 1 root www-data

# Re-créer credentials si nécessaire
sudo htpasswd -c /etc/nginx/.htpasswd-titane admin
sudo chmod 640 /etc/nginx/.htpasswd-titane
sudo chown root:www-data /etc/nginx/.htpasswd-titane
sudo systemctl reload nginx
```

**Impact si échec:**

- Sécurité: Admin endpoints publics (CRITIQUE)
- Conformité: Violation politique accès

---

### 6. Health Check Endpoint

**Test monitoring:**

```bash
curl https://$DOMAIN/health
# Attendu: OK - TITANE∞ v26.1
```

**Setup monitoring externe (recommandé):**

```bash
# UptimeRobot: https://uptimerobot.com (Free)
# Check URL: https://votre-domaine.com/health
# Interval: 5 minutes
# Alert: Email si down

# Alternative: Cron local
crontab -e
# Ajouter:
*/5 * * * * curl -sf https://votre-domaine.com/health || echo "TITANE DOWN!" | mail -s "Alert TITANE" admin@domain.com
```

---

## 🧪 LIGHTHOUSE AUDIT COMPLET

### Test Performance Gold Standard

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Audit complet
lighthouse https://$DOMAIN \
  --output json \
  --output html \
  --output-path ./lighthouse-v26.1-report \
  --view
```

### ✅ Scores Cibles v26.1

```
Performance:      95-100  ← Target: 97
Accessibility:    100     ← WCAG AAA (Phase 5 complete)
Best Practices:   100     ← Security headers OK
PWA:              100     ← Installable + Service Worker
SEO:              95-100  ← Meta tags + sitemap
```

### 📊 Métriques Critiques Attendues

```
Metric                          Target      Acceptable    FAIL
────────────────────────────────────────────────────────────────
First Contentful Paint (FCP)    < 0.8s      < 1.0s        > 1.5s
Time to Interactive (TTI)       < 1.32s     < 1.5s        > 2.5s
Speed Index                     < 1.5s      < 2.0s        > 3.0s
Total Blocking Time (TBT)       < 150ms     < 200ms       > 300ms
Largest Contentful Paint (LCP)  < 1.8s      < 2.0s        > 2.5s
Cumulative Layout Shift (CLS)   < 0.05      < 0.1         > 0.25
```

**❌ Si Performance < 95:**

1. **Vérifier compression:**

   ```bash
   curl -I https://$DOMAIN/assets/*.js | grep content-encoding
   # DOIT être: br (prioritaire) ou gzip
   ```

2. **Vérifier caching:**

   ```bash
   curl -I https://$DOMAIN/assets/*.js | grep cache-control
   # DOIT être: public, max-age=31536000, immutable
   ```

3. **Vérifier code splitting:**

   ```bash
   # DevTools → Network → Filter: JS
   # Doit voir: 98 chunks (lazy-loading actif)
   ```

4. **Vérifier CDN (optionnel mais recommandé):**
   ```bash
   # Ajouter Cloudflare devant Nginx:
   # 1. Cloudflare.com → Add site
   # 2. Changer DNS nameservers
   # 3. Enable Auto Minify + Brotli
   ```

---

## 📈 VALIDATION BUNDLE SIZE

### Test DevTools Network

```
1. Ouvrir DevTools (F12)
2. Network tab
3. Disable cache ✓
4. Hard Reload (Ctrl+Shift+R)
5. Analyser fichiers loaded
```

### ✅ Fichiers Critiques Attendus (Initial Load)

```
Fichier                         Size Brotli    Notes
────────────────────────────────────────────────────────────
index.html                      ~7 KB          Entry point
ui-common-*.js.br               ~41.55 KB      UI components
services-common-*.js.br         ~24.23 KB      Services core
index-*.css.br                  ~18.56 KB      Styles
react-vendor-*.js.br            ~100 KB        React (lazy)

Total Initial Load:             ~67 KB brotli  ← EXCELLENT
Total After Lazy-Loading:       ~872 KB gzip   ← Phase 4 target
```

**❌ Si bundle > 1000 KB gzip:**

```bash
# Analyser stats.html (bundle visualizer)
curl https://$DOMAIN/stats.html.br -o stats.html.br
brotli -d stats.html.br
open stats.html  # Ou: xdg-open stats.html

# Identifier chunks > 100 KB (problème code splitting)
# Re-build local si nécessaire avec:
npm run build -- --debug
```

---

## 🔒 VALIDATION SÉCURITÉ

### Security Headers Check

```bash
curl -I https://$DOMAIN/ | grep -E "X-Frame|X-Content|X-XSS|Content-Security|Strict-Transport"
```

### ✅ Headers Attendus

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains (si activé)
```

**❌ Si headers manquants:**

```bash
# Vérifier Nginx config
sudo cat /etc/nginx/sites-available/titane-infinity | grep add_header
sudo nginx -t
sudo systemctl reload nginx
```

### Scan Vulnérabilités (Recommandé)

```bash
# Mozilla Observatory
curl -X POST https://http-observatory.security.mozilla.org/api/v1/analyze?host=$DOMAIN

# SecurityHeaders.com
curl "https://securityheaders.com/?q=https://$DOMAIN&followRedirects=on"

# Target: A ou A+ grade
```

---

## 📊 MONITORING CONTINU (J+1 à J+7)

### Métriques à Tracker (48h minimum)

#### 1. Performance Réelle Utilisateurs

**Google Analytics (si installé):**

```
Behavior → Site Speed → Page Timings
Métriques:
- Avg Page Load Time: < 2.0s ✅
- Avg Server Response Time: < 200ms ✅
- Avg Page Download Time: < 1.0s ✅
```

**Alternative: Cloudflare Analytics (gratuit):**

```
Analytics → Performance
Core Web Vitals:
- Good LCP: > 75% pages
- Good FID: > 95% pages
- Good CLS: > 75% pages
```

#### 2. Service Worker Cache Hit Rate

**Test après 1h utilisation:**

```javascript
// Console navigateur
caches.keys().then(keys => {
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`Cache ${key}: ${requests.length} files`);
      });
    });
  });
});

// Attendu:
// Cache "titane-v26.1": 98 files ✅
```

**Target cache hit rate:**

```
First visit:     0% (normal)
Repeat visit:    80%+ ✅
After 1 week:    90%+ ✅
```

#### 3. Erreurs Console (MUST be 0)

**Monitoring logs:**

```bash
# Nginx error log
sudo tail -f /var/log/nginx/titane-infinity-error.log

# Attendu: AUCUNE ligne nouvelle ✅
# Si erreurs: Investiguer immédiatement
```

**Browser console (sample users):**

```
F12 → Console → Filter: Errors only
Attendu: 0 erreurs JavaScript ✅
```

#### 4. Bandwidth Usage

**Cloudflare Analytics (si utilisé):**

```
Analytics → Traffic
Bandwidth Saved (Compression):
- Expected: 14.4% Brotli savings
- Expected: 453.95 GB/year total savings (vs v24.3)
```

**Nginx logs analysis (alternative):**

```bash
# Total bandwidth last 24h
sudo cat /var/log/nginx/titane-infinity-access.log | \
  awk '{sum+=$10} END {print sum/(1024*1024) " MB"}'

# Brotli vs gzip ratio
sudo grep "content-encoding: br" /var/log/nginx/titane-infinity-access.log | wc -l
sudo grep "content-encoding: gzip" /var/log/nginx/titane-infinity-access.log | wc -l
# Target: br >> gzip (90%+ browsers support Brotli)
```

---

## 🚨 ALERTES CRITIQUES

### Triggers Rollback Immédiat

**❌ ROLLBACK SI:**

1. **TTI > 2.5s** (vs target 1.32s)

   ```bash
   # Restaurer backup
   sudo cp -r /var/www/backups/titane-YYYYMMDD_HHMMSS/* /var/www/html/titane-infinity/
   sudo systemctl reload nginx
   ```

2. **Erreurs console > 5/min**

   ```bash
   # Logs Nginx
   sudo tail -100 /var/log/nginx/titane-infinity-error.log
   # Si bug critique JS: Rollback
   ```

3. **Service Worker registration failed**

   ```bash
   # Vérifier headers sw.js
   curl -I https://$DOMAIN/sw.js
   # Si cache-control incorrect: Fix Nginx config
   ```

4. **PWA score < 80** (vs target 100)

   ```bash
   lighthouse https://$DOMAIN --only-categories=pwa
   # Si critical issues: Rollback
   ```

5. **Security headers missing**
   ```bash
   curl -I https://$DOMAIN/ | grep X-Frame
   # Si absent: CRITICAL, fix Nginx immédiatement
   ```

### ⚠️ Investigation Requise Si:

1. **Cache hit rate < 70%** (target 80%+)
   - Vérifier Service Worker logs
   - Check cache storage quota
   - Investigate cache invalidation strategy

2. **Bundle total > 1000 KB gzip** (target 872 KB)
   - Analyser stats.html
   - Vérifier code splitting actif (98 chunks)
   - Check lazy-loading routes

3. **Memory usage > 35 MB** (target 25 MB)
   - Ouvrir DevTools → Memory → Heap Snapshot
   - Check memory leaks (listeners non cleaned)
   - Profile component re-renders

4. **Mobile FCP > 1.5s** (target 0.8s)
   - Vérifier compression active (Brotli)
   - Test CDN latency
   - Check image sizes (WebP Phase 6)

---

## ✅ CHECKLIST FINALE

**Tous les tests passés = Production validée ✅**

### Build & Compression

- [ ] Brotli compression: `content-encoding: br` ✅
- [ ] 64 fichiers .br générés dans dist/
- [ ] Gzip fallback actif (navigateurs anciens)
- [ ] Bundle initial < 70 KB brotli ✅

### Service Worker & PWA

- [ ] Service Worker activé (DevTools Application tab)
- [ ] sw.js headers: `cache-control: no-cache` ✅
- [ ] 98 fichiers précachés validés
- [ ] PWA installable (iOS + Android tested)
- [ ] manifest.json accessible et valide
- [ ] Lighthouse PWA: 100/100 ✅

### Performance

- [ ] Lighthouse Performance: 95-100 ✅
- [ ] TTI < 1.5s (target 1.32s) ✅
- [ ] FCP < 1.0s (target 0.8s) ✅
- [ ] CLS < 0.1 (target 0.05) ✅
- [ ] Code splitting: 98 chunks ✅
- [ ] Lazy-loading routes actif ✅

### Sécurité

- [ ] HTTPS actif (certificat valide)
- [ ] Admin endpoints protégés (htpasswd)
- [ ] Security headers présents (7 headers)
- [ ] CSP configuré (pas d'inline scripts)
- [ ] HSTS activé (recommandé après 48h validation)

### Accessibilité

- [ ] Lighthouse A11y: 100/100 ✅
- [ ] Touch targets: 44x44px minimum ✅
- [ ] Keyboard navigation complète ✅
- [ ] Font-size: 12px+ min ✅
- [ ] WCAG 2.1 AAA validé ✅

### Monitoring

- [ ] Health endpoint: /health returns 200 OK
- [ ] Admin access logs séparés
- [ ] 0 erreurs console production
- [ ] Nginx error log: 0 nouvelles erreurs
- [ ] Cache hit rate tracking configuré
- [ ] Alertes email configurées (optionnel)

---

## 📞 SUPPORT POST-DEPLOY

### Documentation Référence

- **Quick Deploy:** `deployment/QUICK_DEPLOY.md`
- **Admin Access:** `deployment/ADMIN_ACCESS_GUIDE.md`
- **Deployment Production:** `DEPLOYMENT_PRODUCTION_v26.0.md`
- **Release Notes:** `TITANE_INFINITY_v26.1_RELEASE_NOTES.md` (si créé)

### Troubleshooting Rapide

**Problème → Solution Rapide:**

| Symptôme            | Cause Probable  | Fix                                          |
| ------------------- | --------------- | -------------------------------------------- |
| No Brotli           | Module manquant | `apt install libnginx-mod-http-brotli-*`     |
| SW non activé       | Headers cache   | Vérifier `cache-control: no-cache` sur sw.js |
| PWA non installable | Icons manquants | Vérifier 192x192 + 512x512 dans public/      |
| TTI > 2.5s          | Compression off | Vérifier `content-encoding` headers          |
| Admin 401 loop      | .htpasswd perms | `chmod 640` + `chown root:www-data`          |
| HTTPS redirect fail | Nginx config    | Vérifier `return 301` port 80                |

### Logs Location

```bash
# Application
/var/log/nginx/titane-infinity-access.log
/var/log/nginx/titane-infinity-error.log

# Admin access
/var/log/nginx/titane-admin-access.log
/var/log/nginx/titane-admin-error.log

# Nginx global
/var/log/nginx/error.log
/var/log/nginx/access.log
```

---

**🎉 DEPLOYMENT v26.1 VALIDÉ!**

**Prochaine étape:** Monitoring 48h + Rapport performance semaine 1

---

_Post-Deploy Validation Checklist - TITANE INFINITY v26.1 - 2024-12-17_
