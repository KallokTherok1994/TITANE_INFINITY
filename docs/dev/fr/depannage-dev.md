# TITANE∞ — Dépannage Développeur (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Problèmes d'installation

### pnpm bloqué par le préinstall check

```bash
# Erreur : "This project requires pnpm"
# Solution : utiliser pnpm exclusivement
npm install -g pnpm
pnpm install
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
# Créer un placeholder dist/ (requis pour le build Tauri)
mkdir -p dist && echo "placeholder" > dist/index.html
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

## Docs obsolètes détectées

Si vous rencontrez une doc avec une version très ancienne (ex : 19.4.3, 24.2.0) :
- Cette doc est LEGACY
- Consultez `docs/user/fr/` ou `docs/dev/fr/` pour les versions canoniques
- Consultez `docs/reference/fr/matrice-verite-docs.md` pour le statut de vérité

---

*Documentation en anglais : [docs/dev/en/dev-troubleshooting.md](../en/dev-troubleshooting.md)*
