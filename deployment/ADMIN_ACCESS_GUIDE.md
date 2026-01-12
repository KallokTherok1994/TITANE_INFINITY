# 🔐 TITANE INFINITY v26.1 - Admin Access Guide

**Date:** 2024-12-17  
**Version:** v26.1  
**Security Level:** Production-grade with Nginx Basic Auth

---

## 🎯 ADMIN ACCESS ENDPOINTS

### Production URLs (après déploiement)

```
Main Application:
https://votre-domaine.com

Protected Admin Endpoints:
https://votre-domaine.com/admin     ← Stats & Administration
https://votre-domaine.com/stats     ← Performance Metrics
https://admin.votre-domaine.com     ← Dedicated Admin Subdomain (optional)

Public Health Check:
https://votre-domaine.com/health    ← No auth, monitoring
```

---

## 🔑 CREDENTIALS SETUP

### Automatic Setup (Recommended)

```bash
# Sur le serveur après déploiement
sudo ./deployment/setup-admin-access.sh

# Wizard interactif:
# 1. Entrez username admin (défaut: admin)
# 2. Entrez password (minimum 12 caractères recommandé)
# 3. Optionnel: Ajoutez autres utilisateurs
```

**Fichier généré:** `/etc/nginx/.htpasswd-titane`

### Manual Setup (Alternative)

```bash
# Installer htpasswd si nécessaire
sudo apt install apache2-utils

# Créer premier utilisateur
sudo htpasswd -c /etc/nginx/.htpasswd-titane admin

# Ajouter utilisateurs additionnels (SANS -c)
sudo htpasswd /etc/nginx/.htpasswd-titane user2

# Permissions sécurisées
sudo chmod 640 /etc/nginx/.htpasswd-titane
sudo chown root:www-data /etc/nginx/.htpasswd-titane
```

### Tester Credentials

```bash
# Test local
sudo htpasswd -v /etc/nginx/.htpasswd-titane admin

# Test production (après deploy)
curl -u admin:PASSWORD https://votre-domaine.com/admin
# Attendu: HTTP 200 avec HTML app
```

---

## 🛡️ SECURITY FEATURES

### Nginx Basic Auth Protection

```nginx
# Configuration active (déjà dans titane-infinity.conf)
location /admin {
    auth_basic "TITANE∞ Admin Access";
    auth_basic_user_file /etc/nginx/.htpasswd-titane;

    # Logs séparés admin
    access_log /var/log/nginx/titane-admin-access.log;

    try_files $uri $uri/ /index.html;
}
```

**Avantages:**

- ✅ Protection immediate (pas de code app requis)
- ✅ 0 overhead performance (Nginx natif)
- ✅ Logs séparés pour audit
- ✅ Compatible tous navigateurs (Basic Auth standard)

### SSL/TLS Encryption

```nginx
# Moderne TLS 1.2+ only
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:...';

# HSTS (après validation)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

# Certificate pinning (optionnel avancé)
# add_header Public-Key-Pins 'pin-sha256="..."; max-age=5184000;';
```

### Additional Headers

```nginx
# Anti-clickjacking
X-Frame-Options: SAMEORIGIN

# Prevent MIME sniffing
X-Content-Type-Options: nosniff

# XSS Protection
X-XSS-Protection: 1; mode=block

# CSP (Content Security Policy)
Content-Security-Policy: default-src 'self'; ...

# Permissions Policy (modern)
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 📊 ADMIN FEATURES AVAILABLE

### 1. Stats Dashboard (`/stats`)

**URL:** `https://votre-domaine.com/stats`  
**Auth:** Required (Basic Auth)

**Métriques disponibles:**

```
Performance:
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

Bundle Analysis:
- Total size: 872 KB gzip
- Chunks: 98 files
- Brotli compression: -14.4% vs gzip

Service Worker:
- Cache hit rate
- Precached files: 98
- Cache size: 4.13 MB

Memory:
- Current usage: ~25 MB
- Peak usage tracking
- Leak detection
```

### 2. Admin Panel (`/admin`)

**URL:** `https://votre-domaine.com/admin`  
**Auth:** Required (Basic Auth)

**Fonctionnalités:**

```
Configuration:
- Theme settings
- Feature flags
- API endpoints config

User Management:
- Active sessions
- Usage analytics
- Access logs viewer

System:
- Health checks
- Error logs
- Performance reports
- Cache management
```

### 3. Dedicated Admin Subdomain (Optional)

**URL:** `https://admin.votre-domaine.com`  
**Auth:** Required on entire subdomain

**Setup DNS:**

```bash
# Ajouter record DNS A
admin.votre-domaine.com → IP_SERVEUR

# SSL auto avec Certbot
sudo certbot --nginx -d admin.votre-domaine.com

# Nginx config déjà prête (section ADMIN SUBDOMAIN)
```

**Avantages:**

- Séparation complète admin/user
- Logs admin isolés
- Sécurité renforcée (subdomain filtering possible)
- Rate limiting dédié

---

## 🔐 RECOMMENDED PASSWORD POLICY

### For Production Admins

**Minimum Requirements:**

```
Length:       14+ caractères
Complexity:   Majuscules + minuscules + chiffres + symboles
Examples:
  ✅ T!t4n3-1nf!n!ty-Adm1n#2024
  ✅ P@ssw0rd-$ecure-V26!Admin
  ❌ admin123 (trop court, prévisible)
  ❌ Titane2024 (pas de symboles)
```

**Rotation:** 90 jours recommandé

### Password Manager Integration

```bash
# Générer password fort
openssl rand -base64 24

# Ou avec pwgen
pwgen -s 20 1

# Stocker dans password manager:
# - 1Password
# - Bitwarden
# - KeePass
# - LastPass
```

---

## 🚨 EMERGENCY ACCESS

### Locked Out? Reset Credentials

```bash
# SSH sur serveur
ssh root@votre-serveur.com

# Reset password utilisateur existant
sudo htpasswd /etc/nginx/.htpasswd-titane admin

# Ou créer nouvel admin
sudo htpasswd /etc/nginx/.htpasswd-titane emergency-admin

# Reload Nginx
sudo systemctl reload nginx

# Test
curl -u emergency-admin:NEW_PASSWORD https://domain.com/admin
```

### Disable Auth Temporarily (DANGER)

```bash
# SSH sur serveur
ssh root@votre-serveur.com

# Backup config
sudo cp /etc/nginx/sites-available/titane-infinity /tmp/titane-backup.conf

# Commenter auth lines
sudo nano /etc/nginx/sites-available/titane-infinity
# Commenter: auth_basic "...";
# Commenter: auth_basic_user_file ...;

# Test + reload
sudo nginx -t && sudo systemctl reload nginx

# IMPORTANT: Re-enable auth après maintenance!
```

---

## 📈 MONITORING ADMIN ACCESS

### Logs Location

```bash
# Admin access logs
/var/log/nginx/titane-admin-access.log

# Admin error logs
/var/log/nginx/titane-admin-error.log

# Main app logs
/var/log/nginx/titane-infinity-access.log
/var/log/nginx/titane-infinity-error.log
```

### Real-time Monitoring

```bash
# Tail admin access
tail -f /var/log/nginx/titane-admin-access.log

# Grep failed auth attempts
grep "401" /var/log/nginx/titane-admin-access.log

# Count unique IPs accessing admin
awk '{print $1}' /var/log/nginx/titane-admin-access.log | sort -u | wc -l
```

### Alert on Failed Auth

```bash
# Script: /usr/local/bin/alert-admin-failed-auth.sh
#!/bin/bash
FAILED=$(grep -c "401" /var/log/nginx/titane-admin-access.log)
if [ "$FAILED" -gt 10 ]; then
    echo "⚠️ $FAILED failed admin auth attempts" | mail -s "TITANE Admin Alert" admin@domain.com
fi

# Cron: Check every 5 min
*/5 * * * * /usr/local/bin/alert-admin-failed-auth.sh
```

---

## 🔒 ADVANCED SECURITY (Optional)

### 1. IP Whitelisting

```nginx
# Dans /etc/nginx/sites-available/titane-infinity
location /admin {
    # Allow specific IPs only
    allow 192.168.1.0/24;     # LAN
    allow 203.0.113.0/24;     # Office IP range
    deny all;

    # Basic auth après IP check
    auth_basic "TITANE∞ Admin";
    auth_basic_user_file /etc/nginx/.htpasswd-titane;
}
```

### 2. Fail2Ban Integration

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Create filter: /etc/fail2ban/filter.d/nginx-titane-admin.conf
[Definition]
failregex = ^<HOST> .* "GET /admin HTTP/.*" 401
ignoreregex =

# Create jail: /etc/fail2ban/jail.d/titane-admin.conf
[nginx-titane-admin]
enabled = true
port = http,https
logpath = /var/log/nginx/titane-admin-access.log
maxretry = 5
bantime = 3600
findtime = 600

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

**Résultat:** 5 tentatives échouées = Ban IP 1h

### 3. Two-Factor Auth (2FA)

**Option A: Nginx + Google Authenticator**

```bash
# Install PAM module
sudo apt install libpam-google-authenticator

# Setup per-user
google-authenticator

# Nginx PAM module (requires compilation)
# Complex, documentation: https://github.com/sto/ngx_http_auth_pam_module
```

**Option B: Application-level 2FA (dans React app)**

```typescript
// src/pages/Admin/Login.tsx
import { useAuth } from '@/hooks/useAuth';
import { TOTPVerifier } from '@/components/auth/TOTPVerifier';

function AdminLogin() {
  const [step, setStep] = useState<'password' | 'totp'>('password');

  // Step 1: Basic Auth (Nginx)
  // Step 2: TOTP verification (app-level)

  if (step === 'totp') {
    return <TOTPVerifier onSuccess={handleAdminAccess} />;
  }

  return <PasswordForm onSuccess={() => setStep('totp')} />;
}
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Problem:** "401 Unauthorized" malgré bon password

**Solution:**

```bash
# Vérifier fichier .htpasswd existe
ls -lh /etc/nginx/.htpasswd-titane

# Vérifier permissions
# Doit être: -rw-r----- root:www-data
sudo chmod 640 /etc/nginx/.htpasswd-titane
sudo chown root:www-data /etc/nginx/.htpasswd-titane

# Vérifier Nginx peut lire
sudo -u www-data cat /etc/nginx/.htpasswd-titane
```

**Problem:** Admin page ne charge pas (500 error)

**Solution:**

```bash
# Check Nginx error log
sudo tail -50 /var/log/nginx/titane-admin-error.log

# Vérifier config syntax
sudo nginx -t

# Vérifier path /admin existe dans app
# Si SPA: doit redirect to /index.html
```

**Problem:** SSL certificate error sur /admin

**Solution:**

```bash
# Vérifier certificat valide
sudo certbot certificates

# Renouveler si expiré
sudo certbot renew

# Forcer renouvellement
sudo certbot renew --force-renewal
```

---

## ✅ CHECKLIST POST-SETUP

Avant de considérer admin access tech-ready (dev):

- [ ] Credentials créées (`/etc/nginx/.htpasswd-titane`)
- [ ] Permissions 640 root:www-data
- [ ] Test curl auth success avec bon password
- [ ] Test curl auth fail 401 avec mauvais password
- [ ] Nginx reload sans erreur
- [ ] HTTPS actif (Let's Encrypt)
- [ ] Admin logs séparés créés
- [ ] Password manager: credentials stockées
- [ ] Team: credentials partagées (sécurisé)
- [ ] Monitoring: alertes failed auth configurées
- [ ] Documentation: procédure reset password documentée
- [ ] Backup: .htpasswd inclus dans backup procedure

---

## 🎯 QUICK REFERENCE

### Create New Admin User

```bash
sudo htpasswd /etc/nginx/.htpasswd-titane new-admin
sudo systemctl reload nginx
```

### Remove Admin User

```bash
sudo htpasswd -D /etc/nginx/.htpasswd-titane old-admin
sudo systemctl reload nginx
```

### List All Admin Users

```bash
sudo cat /etc/nginx/.htpasswd-titane | cut -d: -f1
```

### Test Admin Access

```bash
# Avec credentials
curl -u admin:PASSWORD https://domain.com/admin

# Sans credentials (doit fail 401)
curl https://domain.com/admin
```

### Admin Logs Quick View

```bash
# Last 20 admin accesses
tail -20 /var/log/nginx/titane-admin-access.log

# Today's admin activity
grep "$(date +%d/%b/%Y)" /var/log/nginx/titane-admin-access.log

# Count admin sessions today
grep "$(date +%d/%b/%Y)" /var/log/nginx/titane-admin-access.log | wc -l
```

---

**🔐 Admin Access Secured and Ready!**

**Next:** Deploy to server with `./deployment/deploy-to-server.sh`

---

_Generated: 2024-12-17 - TITANE INFINITY v26.1 Admin Access Guide_
