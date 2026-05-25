# TITANE∞ — Dépannage Développeur (FR)

**Version :** 35.2.0  
**Statut :** CURRENT  
**Date :** 2026-05-25

---

## Problèmes d'installation

### pnpm bloqué par le préinstall check

```bash
# Erreur : "This project requires pnpm"
# Solution : utiliser corepack pnpm exclusivement
corepack enable
corepack prepare pnpm@10.30.2 --activate
corepack pnpm install
```

### Erreurs de dépendances TypeScript

```bash
pnpm run clean:all
pnpm install
pnpm run check
```

---

## Problèmes d'environnement

### Node.js mauvaise version

```bash
# Utiliser la version recommandée via nvm
nvm install $(cat .nvmrc)
nvm use $(cat .nvmrc)
```

### Rust manquant ou mauvaise version

```bash
# Installer/mettre à jour Rust
rustup update stable
rustup default stable
```

### Tauri CLI manquant

```bash
cargo install tauri-cli
```

---

## Problèmes Tauri

### Erreur de compilation Tauri (dépendances système Linux)

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libasound2-dev
```

### Erreur "dist/ not found" lors du build cargo

```bash
# Linux/CI (bash)
mkdir -p dist && echo "placeholder" > dist/index.html
```
```powershell
# Windows (PowerShell)
New-Item -ItemType Directory -Force dist | Out-Null
"placeholder" | Out-File dist/index.html -Encoding ascii
```

### tauri.conf.json introuvable

Vérifier que `src-tauri/tauri.conf.json` existe et est valide :
```bash
pnpm run verify:tauri-configs
```

---

## Problèmes de tests

### Tests qui échouent en CI mais pas en local

```bash
# Vérifier les variables d'environnement CI
# Vérifier le format du code (Prettier peut échouer en CI)
pnpm run format:check

# Vérifier TypeScript strict
pnpm run check
```

### Tests E2E flaky

- Les tests E2E desktop (WDIO) peuvent échouer si l'environnement Tauri crashe
- Voir les entrées autoheal pour les patterns connus : `scripts/autoheal/autoheal_rules.jsonl`

---

## Problèmes de gates

### verify_instructions.sh échoue

```bash
bash scripts/verify_instructions.sh
# Lire les FAIL pour identifier la règle qui échoue
# Consulter scripts/verify_instructions.sh pour comprendre la règle
```

### detect_recurrence.sh échoue

```bash
bash scripts/autoheal/detect_recurrence.sh
# Si un pattern de récurrence est détecté, créer une entrée autoheal corrective
```

---

## Problèmes serveur HTTP réseau

### launch-titane.ps1 -Mode server — secret trop court

```powershell
# Erreur : [WARN] TITANE_REMOTE_SECRET non defini ou trop court
# Solution : définir un secret persistant dans .env ou en ligne
$env:TITANE_REMOTE_SECRET = "secret_minimum_32_caracteres_ici"
.\scripts\launch\launch-titane.ps1 -Mode server
```

### Création de règle firewall échoue (admin requis)

```powershell
# Lancer PowerShell en administrateur, puis :
New-NetFirewallRule -DisplayName "TITANE Remote Gateway port 7420" `
  -Direction Inbound -Protocol TCP -LocalPort 7420 `
  -Action Allow -Profile Private,Domain
```

### Remote Gateway ne répond pas sur le LAN

```powershell
# 1. Vérifier que TITANE est lancé avec TITANE_REMOTE_ENABLED=1
# 2. Contrôler les logs Tauri : "🌐 [RemoteGateway] Starting on http://0.0.0.0:7420"
# 3. Tester en local d'abord :
curl http://localhost:7420/health
# 4. Vérifier que la règle firewall existe :
Get-NetFirewallRule -DisplayName "TITANE Remote Gateway port 7420"
# 5. Vérifier que Windows Defender / antivirus ne bloque pas le port 7420
```

### Référence des modes launch-titane.ps1

```powershell
.\scripts\launch\launch-titane.ps1 -Mode dev            # Tauri + Vite HMR
.\scripts\launch\launch-titane.ps1 -Mode server         # dev + gateway HTTP port 7420
.\scripts\launch\launch-titane.ps1 -Mode verify-windows # vérifications prebuild
.\scripts\launch\launch-titane.ps1 -Mode build-msi      # build MSI + NSIS
.\scripts\launch\launch-titane.ps1 -Mode release-msi    # bump + build + vérification
.\scripts\launch\launch-titane.ps1 -Mode check          # TS + lint + tests
.\scripts\launch\launch-titane.ps1 -Mode clean          # supprime les artefacts
```

---

## Docs obsolètes détectées

Si vous rencontrez une doc avec une version très ancienne (ex : 19.4.3, 24.2.0) :
- Cette doc est LEGACY
- Consultez `docs/user/fr/` ou `docs/dev/fr/` pour les versions canoniques
- Consultez `docs/reference/fr/matrice-verite-docs.md` pour le statut de vérité

---

*Documentation en anglais : [docs/dev/en/dev-troubleshooting.md](../en/dev-troubleshooting.md)*
