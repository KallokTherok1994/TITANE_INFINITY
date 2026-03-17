# TITANE∞ — Versioning, Release et Canons (FR)

**Version :** 28.0.0  
**Statut :** PROVEN  
**Date :** 2026-03-17

> Voir aussi : `docs/reference/fr/rapport-autorite-version.md`

---

## Source de version canonique

| Source | Valeur | Statut |
|---|---|---|
| `package.json` → `version` | `28.0.0` | SOURCE PRIMAIRE |
| `src-tauri/Cargo.toml` → `version` | `28.0.0` | Doit correspondre |
| `CHANGELOG.md` | `[28.0.0]` | Corrobore |
| `README.md` | `v28.0.0` | Surface canonique |

**Règle :** `package.json` est l'autorité de version unique.

---

## Politique de versionnement

- **Incrémentation MAJOR** (X.0.0) : changement de paradigme, refactoring majeur
- **Incrémentation MINOR** (X.Y.0) : nouvelle fonctionnalité, changement non-breaking
- **Incrémentation PATCH** (X.Y.Z) : correctif de bug, mise à jour de docs uniquement

### Cohérence obligatoire

Lors de toute incrémentation de version :
1. `package.json` → `version`
2. `src-tauri/Cargo.toml` → `version`
3. `CHANGELOG.md` → nouvelle entrée `[X.Y.Z] - YYYY-MM-DD`
4. `README.md` → mise à jour du champ Version

---

## Documents canoniques

| Type | Document canonique | Statut |
|---|---|---|
| README principal | `README.md` | PROVEN |
| Hub documentaire | `docs/README.md` | PROVEN |
| Autorité de version | `docs/reference/fr/rapport-autorite-version.md` | PROVEN |
| Historique | `CHANGELOG.md` | PROVEN |
| Index FR | `docs/INDEX_FR.md` | PROVEN |
| Index EN | `docs/INDEX_EN.md` | PROVEN |

---

## Historique des releases

| Version | Date | Type | Binaire publié | Statut |
|---|---|---|---|---|
| `28.0.0` | 2026-03-14 | Gouvernance + docs | NON | COURANT |
| `27.2.0` | 2026-03-07 | TypeScript strict + CI | OUI | HISTORIQUE |
| `27.0.5` | Pré-2026-03 | Baseline production | OUI (AppImage/DEB/RPM) | HISTORIQUE |
| `27.0.6` | 2026-02-18 | Hotfix DOCS-ONLY | NON | HISTORIQUE |

---

## Politique de release binaire

> **RESTREINT** — Tokens PROD requis.

1. Tous les gates doivent passer (`pnpm run verify:final100`)
2. Version mise à jour dans `package.json` et `src-tauri/Cargo.toml`
3. `CHANGELOG.md` mis à jour
4. Proof pack de release créé
5. Token `GO_FOR_PROD_BUILD__TITANE_INFINITY` fourni
6. Build Tauri lancé
7. Artefacts vérifiés (checksums)
8. Release GitHub créée
9. Token `GO_FOR_PROD_DEPLOY__TITANE_INFINITY` fourni pour déploiement

---

*Documentation en anglais : [docs/governance/en/versioning-release-and-canons.md](../en/versioning-release-and-canons.md)*
