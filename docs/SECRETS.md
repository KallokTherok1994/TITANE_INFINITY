# TITANE∞ — SECRETS MANAGEMENT

**Version** : 1.0.0  
**Status** : 🔒 SEALED (Production Certification P0-1)  
**Date** : 15 janvier 2026  

---

## 🎯 Objectif

Procédure **ZÉRO SECRET VERSIONNÉ** pour certification PROD TITANE∞.  
Tous les secrets restent locaux, chiffrés ou dans l'environnement d'exécution.

**Loi Absolue** : Aucun secret réel ne doit être commité dans git.

---

## 🛡️ Types de Secrets

### 1. CRITIQUES (Jamais versionnés)
- `.env`, `.env.production`, `.env.local`  
- `.current-server-info` (état serveur local)
- `.envrc` (direnv config avec potentiels secrets)
- `*.key`, `*.pem` (clés cryptographiques)
- `secret*.json`, `tunnel*.json` (configurations sensibles)

### 2. TEMPLATE AUTORISÉS (Versionnés)
- `.env.example`, `.env.production.example`
- `.current-server-info.example`  
- Tous fichiers `*.example`, `*.template`, `*.sample`

### 3. RUNTIME SEULEMENT
- Variables d'environnement système
- Keystore OS (Linux: gnome-keyring, KDE Wallet)
- TITANE_SECRETS_PASSPHRASE (runtime encryption)

---

## 📋 Procédures

### 🔍 Détection (CI Bloquant)
```bash
# Scanner automatique
./scripts/security/secret-scan.sh

# Gate CI: doit être PASS pour certification
```

### 🔄 Rotation Secrets
```bash
# 1. Identifier secret compromis
grep -r "OLD_SECRET" .env* 2>/dev/null || echo "Pas trouvé"

# 2. Générer nouveau secret
openssl rand -base64 32

# 3. Mettre à jour .env local (jamais commité)
echo "NEW_API_KEY=nouveau_secret_ici" >> .env.local

# 4. Redémarrer services
./scripts/restart-services.sh
```

### 📦 Stockage Local Sécurisé
```bash
# Option A: Variables environnement session
export TITANE_SECRETS_PASSPHRASE="votre_passphrase_>=12_chars"
export GEMINI_API_KEY="votre_clé_gemini"

# Option B: Fichier .env local (gitignored)
echo "TITANE_SECRETS_PASSPHRASE=passphrase_sécurisée" > .env.local
echo "GEMINI_API_KEY=clé_api_gemini" >> .env.local

# Option C: Keystore système (recommandé production)
secret-tool store --label="TITANE Secrets" titane secrets
```

---

## 🚨 Procédure d'Incident

### Si Secret Commité par Erreur
```bash
# 1. URGENT: Révoquer le secret immédiatement
# (API key, token, certificat, etc.)

# 2. Nettoyer l'historique git
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch FICHIER_SECRET' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (attention: destructif)
git push origin --force --all

# 4. Générer nouveau secret
# 5. Mettre à jour documentation .example si nécessaire
# 6. Relancer CI secret-scan pour validation
```

### Si Leak Suspect
```bash
# Scanner historique complet
git log --all --grep="password\|secret\|key" --oneline
git log --all -p | grep -E "password|secret|key|token" | head -10

# Audit manuel
./scripts/security/secret-scan.sh
```

---

## 🔧 Configuration Développement

### Setup Initial Local
```bash
# 1. Copier templates
cp .env.example .env
cp .current-server-info.example .current-server-info

# 2. Configurer secrets locaux
vi .env  # Éditer avec vrais secrets (gitignored)

# 3. Valider protection
git status  # .env ne doit PAS apparaître
./scripts/security/secret-scan.sh  # Doit être PASS
```

### Variables Requises
```env
# .env (local seulement)
TITANE_SECRETS_PASSPHRASE=minimum_12_caracteres_securises
GEMINI_API_KEY=votre_cle_google_gemini_api
OPENAI_API_KEY=sk-votre_cle_openai_optionnelle
CLAUDE_API_KEY=sk-ant-votre_cle_anthropic_optionnelle
```

---

## ✅ Validation P0-1

### Gate P0-1: Secret Scan
```bash
./scripts/security/secret-scan.sh
# Résultat attendu: ✅ SECRET-SCAN: PASS - Aucun secret critique tracké
```

### Checklist de Certification
- [x] ✅ Aucun fichier `.env` réel tracké par git
- [x] ✅ `.current-server-info` non tracké  
- [x] ✅ Aucun `*.key`, `*.pem` tracké
- [x] ✅ .gitignore protège tous patterns secrets
- [x] ✅ Secret scanner CI est BLOQUANT
- [x] ✅ Documentation rotation/stockage complète

---

## 📞 Support & Audit

### Logs Audit
- Scanner CI: sortie dans CI logs
- Historique: `git log --grep="secret"`
- Local: `./scripts/security/secret-scan.sh`

### Escalade
Si problème critique secrets détecté :
1. **STOP** tous commits
2. Révoquer secrets compromis  
3. Nettoyer historique git
4. Re-valider avec secret scanner
5. Redéployer avec nouveaux secrets

---

**🔒 RÈGLE ABSOLUE** : Seuls les fichiers `*.example` contenant des secrets d'exemple sont autorisés en version.

**Status** : ✅ SEALED (P0-1 Production Certification)  
**Maintainer** : TITANE∞ Security Team  
**Last Updated** : 15 janvier 2026
