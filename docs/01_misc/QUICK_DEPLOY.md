# 🚀 TITANE INFINITY v26.1 - Quick Deploy Instructions

**Pour:** Déploiement serveur Nginx complet avec admin access  
**Temps estimé:** 15-20 minutes

---

## 📋 PRÉ-REQUIS

### Sur Votre Machine Locale

- [x] Build production exécuté (`npm run build`)
- [x] Git repo à jour (commit 9efa5cf8)
- [x] SSH configuré vers serveur

### Sur Le Serveur

**Requis:**

- Ubuntu 20.04+ ou Debian 10+
- Nginx 1.18+
- Certbot (Let's Encrypt)
- Accès SSH root ou sudo

**Installation rapide si manquant:**

```bash
# Sur le serveur
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx apache2-utils
```

---

## ⚡ DEPLOY EN 3 COMMANDES

### 1. Éditer Configuration Serveur

```bash
# Sur votre machine locale
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
nano deployment/deploy-to-server.sh

# MODIFIER ces lignes (ligne 18-25):
SERVER_USER="root"              # Votre user SSH
SERVER_HOST="203.0.113.50"      # IP de votre serveur
SERVER_PORT="22"                # Port SSH (22 par défaut)
DOMAIN="titane-infinity.com"    # Votre domaine
```

**💡 Tip:** Si pas de domaine encore, utiliser IP temporairement:

```bash
DOMAIN="203.0.113.50"  # Remplacer par votre IP serveur
```

### 2. Lancer Déploiement Automatique

```bash
# Depuis votre machine locale
chmod +x deployment/deploy-to-server.sh
./deployment/deploy-to-server.sh
```

**Le script automatiquement:**

1. ✅ Vérifie build local (dist/)
2. ✅ Test connexion SSH serveur
3. ✅ Backup version existante (si applicable)
4. ✅ Upload application via rsync
5. ✅ Configure Nginx + compression Brotli
6. ✅ Setup admin access (interactive)
7. ✅ Génère certificat SSL (Let's Encrypt)
8. ✅ Restart Nginx

**Durée:** ~5 minutes (+ 2 min SSL)

### 3. Validation Post-Deploy

```bash
# Remplacer DOMAIN par votre domaine
DOMAIN="titane-infinity.com"

# Test 1: Brotli compression
curl -I -H "Accept-Encoding: br,gzip" https://$DOMAIN/assets/ui-common-*.js | grep content-encoding
# Attendu: content-encoding: br

# Test 2: Service Worker
curl -I https://$DOMAIN/sw.js | grep cache-control
# Attendu: cache-control: no-cache, no-store, must-revalidate

# Test 3: PWA Manifest
curl https://$DOMAIN/manifest.json | jq .name
# Attendu: "TITANE INFINITY"

# Test 4: Admin Access (remplacer PASSWORD)
curl -u admin:PASSWORD https://$DOMAIN/admin
# Attendu: HTTP 200 avec HTML

# Test 5: Health Check
curl https://$DOMAIN/health
# Attendu: OK - TITANE∞ v26.1
```

**✅ Si tous les tests passent:** Deployment SUCCESS!

---

## 🔐 SETUP ADMIN ACCESS (Interactif)

Pendant `deploy-to-server.sh`, vous serez invité à créer credentials:

```
╔══════════════════════════════════════════════════╗
║   TITANE∞ - Admin Access Setup                  ║
╚══════════════════════════════════════════════════╝

Admin username (défaut: admin): admin
Entrez le mot de passe admin (caché): ************

✓ Credentials créées: /etc/nginx/.htpasswd-titane

Ajouter utilisateurs supplémentaires? (o/n): n
```

**Recommandations password:**

- Minimum 14 caractères
- Majuscules + minuscules + chiffres + symboles
- Exemple: `T!t4n3-Adm!n#2024`

**💡 Générer password fort:**

```bash
openssl rand -base64 24
# Exemple output: vK3mP8xL2wQ9nR6tY1zA5bC7dE4fG
```

---

## 📊 ACCÈS ADMIN POST-DEPLOY

### URLs Disponibles

```
Application principale:
https://votre-domaine.com

Endpoints admin protégés:
https://votre-domaine.com/admin   ← Dashboard admin
https://votre-domaine.com/stats   ← Métriques performance

Health check public:
https://votre-domaine.com/health  ← Monitoring (no auth)
```

### Test Admin Login

**Browser:**

1. Naviguer vers `https://votre-domaine.com/admin`
2. Popup "Authentication Required"
3. Username: `admin`
4. Password: `[celui créé pendant deploy]`
5. ✅ Dashboard admin s'affiche

**Terminal:**

```bash
curl -u admin:PASSWORD https://votre-domaine.com/admin
```

---

## 🧪 LIGHTHOUSE VALIDATION (Recommandé)

```bash
# Installer Lighthouse CLI (si pas déjà)
npm install -g lighthouse

# Audit complet
lighthouse https://votre-domaine.com --view

# Targets v26.1:
# ✅ Performance: 95+
# ✅ Accessibility: 100
# ✅ Best Practices: 100
# ✅ PWA: 100
```

**Métriques critiques attendues:**

```
Time to Interactive:      < 1.5s  (target: 1.32s)
First Contentful Paint:   < 1.0s  (target: 0.8s)
Largest Contentful Paint: < 2.0s  (target: 1.8s)
Cumulative Layout Shift:  < 0.1   (target: 0.05)
Total Blocking Time:      < 200ms (target: 150ms)
```

---

## 🔧 MANUAL STEPS (Si script échoue)

### Option A: Deploy Nginx Seulement

```bash
# 1. SSH sur serveur
ssh root@votre-serveur.com

# 2. Upload Nginx config
scp deployment/nginx/titane-infinity.conf root@serveur:/tmp/

# 3. Sur serveur: Install config
sed -i "s/titane-infinity.local/votre-domaine.com/g" /tmp/titane-infinity.conf
sudo mv /tmp/titane-infinity.conf /etc/nginx/sites-available/titane-infinity
sudo ln -s /etc/nginx/sites-available/titane-infinity /etc/nginx/sites-enabled/

# 4. Test + reload
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Deploy App Seulement

```bash
# 1. Depuis local: Upload dist/
rsync -avz --delete dist/ root@serveur:/var/www/html/titane-infinity/

# 2. Sur serveur: Permissions
sudo chown -R www-data:www-data /var/www/html/titane-infinity
```

### Option C: Admin Access Seulement

```bash
# Sur serveur
sudo htpasswd -c /etc/nginx/.htpasswd-titane admin
sudo chmod 640 /etc/nginx/.htpasswd-titane
sudo chown root:www-data /etc/nginx/.htpasswd-titane
sudo systemctl reload nginx
```

---

## 🚨 TROUBLESHOOTING

### Problème: "Connection refused" SSH

```bash
# Vérifier port SSH correct
ssh -v -p 22 root@serveur 2>&1 | grep "port"

# Tester autre port si modifié (souvent 2222)
ssh -p 2222 root@serveur
```

### Problème: SSL Certificate échoue

```bash
# DNS doit pointer vers serveur AVANT Certbot
dig +short votre-domaine.com
# Doit retourner IP serveur

# Si IP incorrecte: Attendre propagation DNS (5-60 min)
# Puis relancer Certbot:
sudo certbot --nginx -d votre-domaine.com
```

### Problème: Nginx "Address already in use"

```bash
# Port 80/443 déjà utilisé par Apache ou autre
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stopper Apache si présent
sudo systemctl stop apache2
sudo systemctl disable apache2

# Restart Nginx
sudo systemctl restart nginx
```

### Problème: Brotli non servi

```bash
# Installer module Brotli Nginx
sudo apt install libnginx-mod-http-brotli-filter
sudo systemctl restart nginx

# Vérifier module chargé
nginx -V 2>&1 | grep brotli
# Doit afficher: --add-module=...brotli
```

---

## 📝 CHECKLIST FINALE

Avant de considérer deployment complet:

**Build & Upload:**

- [x] `npm run build` local SUCCESS
- [x] `dist/` size: ~8.7 MB
- [x] Service Worker: `dist/sw.js` présent
- [x] PWA Manifest: `dist/manifest.json` présent
- [x] Brotli files: 52+ fichiers `.br`

**Serveur:**

- [ ] SSH connexion OK
- [ ] Nginx installé et running
- [ ] Certbot installé
- [ ] DNS pointant vers serveur IP

**Configuration:**

- [ ] Nginx config uploadée
- [ ] Domain modifié dans config
- [ ] Site enabled (symlink)
- [ ] `nginx -t` validation OK
- [ ] Nginx reload sans erreur

**SSL:**

- [ ] Certbot SSL généré
- [ ] HTTPS accessible (https://domain.com)
- [ ] HTTP redirect vers HTTPS OK
- [ ] Certificat valide (navigateur no warning)

**Admin Access:**

- [ ] `.htpasswd-titane` créé
- [ ] Permissions 640 root:www-data
- [ ] Test curl auth success
- [ ] Browser login admin OK

**Validation:**

- [ ] Brotli compression: `content-encoding: br` ✅
- [ ] Service Worker: `cache-control: no-cache` ✅
- [ ] PWA Manifest accessible ✅
- [ ] Admin login fonctionnel ✅
- [ ] Lighthouse Performance 95+ ✅
- [ ] Lighthouse PWA 100 ✅
- [ ] Lighthouse A11y 100 ✅

**Monitoring:**

- [ ] Logs Nginx accessibles
- [ ] 0 erreurs dans error.log
- [ ] Admin access logs séparés
- [ ] Health endpoint: 200 OK

---

## 🎯 RÉSUMÉ 1-MINUTE

```bash
# 1. EDIT CONFIG
nano deployment/deploy-to-server.sh
# Modifier: SERVER_USER, SERVER_HOST, DOMAIN

# 2. DEPLOY AUTO
./deployment/deploy-to-server.sh
# Suivre prompts interactifs (admin password)

# 3. VALIDATE
curl -I https://DOMAIN/sw.js | grep cache-control
curl -u admin:PASS https://DOMAIN/admin
lighthouse https://DOMAIN --view

# 4. DONE! 🎉
```

**Support:** [ADMIN_ACCESS_GUIDE.md](ADMIN_ACCESS_GUIDE.md)

---

_Quick Deploy Guide - TITANE INFINITY v26.1 - 2024-12-17_
