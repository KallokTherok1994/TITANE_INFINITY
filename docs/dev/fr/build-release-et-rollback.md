# TITANE∞ — Build, Release et Rollback (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Build frontend

```bash
# Build standard
pnpm run build

# Sortie : dist/ (requis par Tauri)
```

> **Note CI :** Le CI Tauri (`rust.yml`) nécessite un placeholder `dist/` avant le build cargo :
> ```bash
> mkdir -p dist && echo "CI placeholder" > dist/index.html
> ```
> Source : `scripts/autoheal/autoheal_rules.jsonl` AH-2026-03-07-0092 (PROVEN)

---

## Build Tauri (binaire)

```bash
# Build production Tauri
pnpm run build:production

# Ordre : lint → format:check → ollama:bundle → vite build → tauri build
```

> **Prérequis Linux :** Les dépendances système Tauri doivent être installées.
> Voir : [Setup de l'environnement](./setup-environnement.md)

---

## Releases publiées

| Version | Type | Artefacts | Statut |
|---|---|---|---|
| v27.0.5 | Binaire production | AppImage, DEB, RPM | PROVEN — disponible sur GitHub Releases |
| v28.0.0 | Governance + docs | Aucun binaire public | PARTIAL |

**Téléchargements v27.0.5 :**
```bash
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.deb
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/Titan-Stable_27.0.5_amd64.AppImage
```

---

## Préparer une release

> **RESTREINT** — Tokens de gouvernance PROD requis.

```
GO_FOR_PROD_BUILD__TITANE_INFINITY
GO_FOR_PROD_DEPLOY__TITANE_INFINITY
```

Étapes minimales :
1. Vérifier que `pnpm run verify:final100` passe
2. Mettre à jour la version dans `package.json` et `src-tauri/Cargo.toml`
3. Mettre à jour `CHANGELOG.md`
4. Créer le proof pack de release
5. Lancer le build avec les tokens PROD

---

## Rollback

### Rollback docs

```bash
git restore -- docs/
```

### Rollback fichier spécifique

```bash
git restore -- src/services/api/chat.ts
```

### Rollback commit complet

```bash
git revert HEAD --no-commit
git commit -m "revert: description"
```

### Rollback urgent (à garder visible)

Chaque entrée autoheal dans `scripts/autoheal/autoheal_rules.jsonl` contient un champ `rollback` avec la commande exacte.

---

## CI/CD

| Workflow | Fichier | Déclencheur | Statut |
|---|---|---|---|
| CI principal | `.github/workflows/ci.yml` | push/PR | PROVEN |
| CI Rust | `.github/workflows/rust.yml` | push/PR | PROVEN |
| Mermaid verify | `.github/workflows/mermaid-verify.yml` | push | PROVEN |

**Note :** Les workflows CI nécessitent l'approbation du propriétaire du dépôt pour les PRs externes.

---

*Documentation en anglais : [docs/dev/en/build-release-and-rollback.md](../en/build-release-and-rollback.md)*
