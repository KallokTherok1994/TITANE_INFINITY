# TITANE∞ — Build, Release et Rollback (FR)

**Version :** 35.1.9  
**Statut :** CURRENT  
**Date :** 2026-05-21

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
| v35.1.9 | Binaire production | AppImage, DEB (Linux) | PROVEN — `deployment/latest/` |
| v35.1.7 | Binaire production | AppImage, DEB, RPM (Linux) | PROVEN — checksums vérifiés |
| v34.0.12 | MSI Windows | MSI installer | PROVEN (Windows v34 uniquement) |
| v35.1.x | MSI Windows | MSI installer | UNKNOWN — non encore prouvé (voir Rule 14.4) |

> **Statut MSI Windows :** Le MSI v35.x n'est pas encore prouvé. Pour le générer, utiliser le workflow `.github/workflows/windows-msi-on-demand.yml` et fournir : artefact MSI + SHA256 + preuve smoke-test.

**Artefacts Linux v35.1.9 (prouvés) :**
```bash
# AppImage
sha256: 9c924cca70655654a56afa75aeff2f425e86844c894704aeaf82f84bd9868315
# DEB
sha256: 84f706ca56f0739bca101742e9ebbd634cd6f235e9632f7901b65b88d8b14d17
```

---

## Préparer une release

> Builds production à la demande — aucun token gate requis (Rule 11).
> Utiliser la commande `BUILD ALL` pour la séquence complète (Rule 14).

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
