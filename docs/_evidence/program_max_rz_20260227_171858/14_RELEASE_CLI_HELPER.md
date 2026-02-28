# Release CLI Helper — v27.5.1-docs-rz-seal

Ce document fournit des commandes prêtes à copier-coller pour créer la release GitHub depuis le tag existant, avec notes FR ou EN.

## Pré-requis
- `gh` CLI installé et authentifié (`gh auth status`)
- Tag déjà présent: `v27.5.1-docs-rz-seal`
- Branche cible: `MAIN`

## Vérification rapide
```bash
git fetch --tags origin
git tag --list "v27.5.1-docs-rz-seal"
```

## Option A — Release FR
```bash
gh release create v27.5.1-docs-rz-seal \
  --repo KallokTherok1994/TITANE_INFINITY \
  --title "v27.5.1-docs-rz-seal — R→Z documentation sealing (x3)" \
  --notes-file docs/_evidence/program_max_rz_20260227_171858/11_GITHUB_RELEASE_DRAFT_FR.md \
  --target MAIN
```

## Option B — Release EN
```bash
gh release create v27.5.1-docs-rz-seal \
  --repo KallokTherok1994/TITANE_INFINITY \
  --title "v27.5.1-docs-rz-seal — R→Z documentation sealing (x3)" \
  --notes-file docs/_evidence/program_max_rz_20260227_171858/12_GITHUB_RELEASE_DRAFT_EN.md \
  --target MAIN
```

## Vérification post-création
```bash
gh release view v27.5.1-docs-rz-seal --repo KallokTherok1994/TITANE_INFINITY
```

## Rollback (release GitHub uniquement)
```bash
gh release delete v27.5.1-docs-rz-seal --repo KallokTherok1994/TITANE_INFINITY --yes
```

> Note: la suppression de la release ne supprime pas automatiquement le tag Git.
