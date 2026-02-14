# Guide: Authentification GitHub CLI pour Release v27.0.2

## 🔐 Authentification Requise

La création de la GitHub Release nécessite l'authentification de `gh` CLI.

---

## 📝 Étapes d'Authentification

### Option 1: Browser (Recommandé)

```bash
gh auth login
```

**Réponses attendues:**
1. What account do you want to log into? → **GitHub.com**
2. What is your preferred protocol for Git operations? → **HTTPS**
3. Authenticate Git with your GitHub credentials? → **Yes**
4. How would you like to authenticate GitHub CLI? → **Login with a web browser**

**Résultat:**
- Un code de 8 caractères s'affiche
- Votre navigateur s'ouvre sur https://github.com/login/device
- Entrer le code → Authorize GitHub CLI

### Option 2: Personal Access Token (PAT)

```bash
gh auth login --with-token < ~/.github/token.txt
```

**Créer un PAT:**
1. Aller sur https://github.com/settings/tokens/new
2. Note: "TITANE Release Workflow"
3. Scopes requis:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `write:packages` (Upload packages)
4. Generate token → Copier le token
5. Sauvegarder: `echo "ghp_YOUR_TOKEN" > ~/.github/token.txt`
6. Authentifier: `gh auth login --with-token < ~/.github/token.txt`

---

## 🚀 Workflow Post-Authentification

### 1. Vérifier Authentification
```bash
gh auth status
```

**Output attendu:**
```
✓ Logged in to github.com as KallokTherok1994 (oauth_token)
✓ Git operations for github.com configured to use https protocol.
✓ Token: *******************
```

### 2. Créer Release avec Script Helper
```bash
./scripts/create-release-v27.0.2.sh
```

**Le script va:**
- ✅ Vérifier l'authentification
- ✅ Vérifier les artifacts (AppImage + DEB)
- ✅ Créer la release v27.0.2 sur GitHub
- ✅ Upload les artifacts
- ✅ Afficher le lien vers la release

### 3. Vérifier Release
```bash
gh release view v27.0.2 --web
```

Ouvre le navigateur sur: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v27.0.2

---

## 🔧 Commande Manuelle (Alternative)

Si vous préférez créer la release manuellement:

```bash
gh release create v27.0.2 \
  --repo KallokTherok1994/TITANE_INFINITY \
  --title "TITANE∞ v27.0.2 - Conversation Storage Hotfix" \
  --notes "## 🔥 Hotfix - Conversation Storage + IPC Classification

### Changements
- 🐛 **fix(chat):** Correction de la persistance des conversations (ID mismatch fixed)
- 🔧 **fix(IPC):** Classification correcte des erreurs IPC vs Provider
- 🧪 **tests:** Stabilisation des tests (voiceE2E legacy API warnings)
- 📝 **types:** Correction des erreurs TypeScript chatEngine + tsconfig
- 🎨 **format:** Auto-format Prettier (9 fichiers)

### Artifacts
- **AppImage (96 MB):** \`TITANE-Infinity_27.0.2_amd64.AppImage\`
- **DEB (26 MB):** \`TITANE-Infinity_27.0.2_amd64.deb\`

### SHA256 Checksums
\`\`\`
969d05489cb7c11c40dba7b3bea30bdaaf7d0d7eac2a83c9fbe5b43627efd265  TITANE-Infinity_27.0.2_amd64.deb
460f1ff9b22456f6719c95dadd01656463fff579baab0abd7bc3b782e0327ed1  TITANE-Infinity_27.0.2_amd64.AppImage
\`\`\`

### Build Info
- **Commit:** 8238c666
- **Rust Compile:** 6m47s (release optimized)
- **Vite Build:** 3439 modules (gzip + brotli)

Voir [ARTIFACTS_SHA256_v27.0.2.md](../ARTIFACTS_SHA256_v27.0.2.md) pour détails complets." \
  deployment/latest/TITANE-Infinity_27.0.2_amd64.AppImage \
  deployment/latest/TITANE-Infinity_27.0.2_amd64.deb
```

---

## 🌐 Alternative: Interface Web

Si `gh` CLI pose problème:

1. **Aller sur GitHub:**
   https://github.com/KallokTherok1994/TITANE_INFINITY/releases/new?tag=v27.0.2

2. **Remplir le formulaire:**
   - **Tag:** v27.0.2 (déjà créé)
   - **Title:** `TITANE∞ v27.0.2 - Conversation Storage Hotfix`
   - **Description:** Copier depuis [ARTIFACTS_SHA256_v27.0.2.md](ARTIFACTS_SHA256_v27.0.2.md)

3. **Upload Artifacts:**
   - Glisser-déposer: `deployment/latest/TITANE-Infinity_27.0.2_amd64.AppImage`
   - Glisser-déposer: `deployment/latest/TITANE-Infinity_27.0.2_amd64.deb`

4. **Publish Release**

---

## 🐛 Troubleshooting

### Erreur: "Could not resolve to a Repository"
```bash
gh auth refresh -s repo,write:packages
```

### Erreur: "authentication token is required"
```bash
gh auth logout
gh auth login
```

### Erreur: "Resource protected by organization SAML"
```bash
gh auth status
# Suivre le lien SSO dans l'output pour autoriser le token
```

### Vérifier Permissions du Token
```bash
gh auth status -t
```

---

## 📊 Validation Post-Release

```bash
# Voir la release
gh release view v27.0.2

# Télécharger artifacts
gh release download v27.0.2 --pattern "*.deb" -D /tmp/test-release

# Vérifier SHA256
cd /tmp/test-release
sha256sum TITANE-Infinity_27.0.2_amd64.deb
# Doit correspondre: 969d05489cb7c11c40dba7b3bea30bdaaf7d0d7eac2a83c9fbe5b43627efd265
```

---

## 📚 Ressources

- **GitHub CLI Docs:** https://cli.github.com/manual/
- **PAT Guide:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- **Release Docs:** https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository

---

**Status Actuel:**
- ✅ Code pushé (commit 8238c666)
- ✅ Tag v27.0.2 créé et pushé
- ✅ Artifacts validés (96MB AppImage, 26MB DEB)
- ✅ SHA256 checksums documentés
- ⏳ **GitHub Release:** Authentification requise

**Prochaine Action:** `gh auth login` → `./scripts/create-release-v27.0.2.sh`
