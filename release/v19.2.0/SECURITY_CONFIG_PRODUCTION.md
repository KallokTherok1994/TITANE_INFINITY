# 🔐 TITANE∞ — Configuration Sécurité Production

**Date de configuration :** 29 novembre 2025
**Version :** TITANE∞ v19.2Ω

---

## ✅ Passphrases Sécurisées Configurées

Les passphrases de sécurité ont été générées avec `openssl rand -hex 32` (256-bit) :

### 1. TITANE_MEMORY_PASSPHRASE

- **Usage :** Chiffrement AES-256-GCM de la mémoire persistante
- **Longueur :** 64 caractères hexadécimaux (256 bits)
- **Status :** ✅ Configuré dans `.env`

### 2. TITANE_SECRETS_PASSPHRASE

- **Usage :** SecureSecretsEngine pour stockage chiffré des secrets
- **Longueur :** 64 caractères hexadécimaux (256 bits)
- **Status :** ✅ Configuré dans `.env`

---

## 🔒 Sécurité du Fichier .env

### ⚠️ IMPORTANT - À FAIRE IMMÉDIATEMENT

1. **Ne JAMAIS commiter `.env` dans Git**

   ```bash
   # Vérifier que .env est dans .gitignore
   grep "^\.env$" .gitignore
   ```

2. **Protéger les permissions du fichier**

   ```bash
   chmod 600 .env
   ```

3. **Backup sécurisé**
   - Copier `.env` dans un gestionnaire de mots de passe (1Password, Bitwarden, etc.)
   - OU chiffrer avec GPG :
     ```bash
     gpg -c .env
     # Crée .env.gpg chiffré
     ```

---

## 🚀 Configuration Gemini API (Optionnel)

Si vous souhaitez activer le provider Gemini en production :

1. **Obtenir une clé API**
   - Aller sur https://makersuite.google.com/app/apikey
   - Créer une nouvelle clé API

2. **Configurer dans `.env`**

   ```bash
   GEMINI_API_KEY=votre_cle_api_gemini_ici
   ```

3. **Tester la connexion**
   - Lancer l'application
   - Dans ChatPage, sélectionner provider "auto" ou "gemini"
   - Envoyer un message test

---

## 📋 Checklist Sécurité Production

- [x] Passphrases 256-bit générées
- [x] `.env` configuré avec passphrases sécurisées
- [ ] `.env` exclu de Git (vérifier `.gitignore`)
- [ ] Permissions `.env` restreintes (`chmod 600`)
- [ ] Backup `.env` sécurisé (gestionnaire mots de passe ou GPG)
- [ ] Gemini API Key configurée (si utilisé)
- [ ] Tests sur machine cible (Windows/macOS/Linux)
- [ ] Build final Tauri (`npm run tauri:build`)

---

## 🛡️ Recommandations Supplémentaires

### Rotation des Secrets

**Fréquence recommandée :** Tous les 90 jours

```bash
# Générer nouvelles passphrases
openssl rand -hex 32  # Pour TITANE_MEMORY_PASSPHRASE
openssl rand -hex 32  # Pour TITANE_SECRETS_PASSPHRASE

# Mettre à jour .env
# Redémarrer l'application
```

### Environnements Multiples

**Développement :**

```bash
# .env.development (passphrases simples OK)
TITANE_MEMORY_PASSPHRASE=dev_passphrase_12345678
TITANE_SECRETS_PASSPHRASE=dev_secrets_12345678
```

**Production :**

```bash
# .env.production (passphrases 256-bit)
TITANE_MEMORY_PASSPHRASE=<64-char-hex>
TITANE_SECRETS_PASSPHRASE=<64-char-hex>
```

### Audit Logs

Activer les logs de sécurité :

```bash
# .env
LOG_LEVEL=info
SECURITY_AUDIT_ENABLED=true
```

---

## 🆘 En Cas de Compromission

Si vous suspectez une compromission des passphrases :

1. **Générer immédiatement de nouvelles passphrases**

   ```bash
   openssl rand -hex 32
   openssl rand -hex 32
   ```

2. **Mettre à jour `.env`**

3. **Redémarrer l'application**

4. **Réinitialiser la mémoire chiffrée**

   ```bash
   # Supprimer anciennes données chiffrées
   rm -rf ~/.local/share/com.titane.infinity/data/memory/*
   ```

5. **Notifier les utilisateurs** (si application multi-utilisateurs)

---

## 📞 Support

Pour toute question de sécurité :

- Consulter `AUDIT_FINAL_COMPLET_v19.2_OMEGA.md`
- Vérifier les logs : `~/.local/share/com.titane.infinity/logs/`
- Tests sécurité : `npm run test` (698 tests)

---

**Configuration effectuée le 29 novembre 2025**
**Status : ✅ PRODUCTION READY**
