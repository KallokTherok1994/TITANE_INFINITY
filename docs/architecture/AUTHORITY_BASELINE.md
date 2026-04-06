# AUTHORITY_BASELINE
**TITANE∞ — Baseline d'autorité canonique**
**Date**: 2026-03-26
**Phase**: PHASE 1 — AUTHORITY_BASELINE
**Verdict**: PASS

---

## Version canonique actuelle

```
28.88.0
```

---

## Sources d'autorité (classées par priorité)

| Rang | Fichier | Valeur | Statut |
|------|---------|--------|--------|
| 1 | `package.json` → `"version"` | `28.88.0` | CANONICAL — source primaire |
| 2 | `src-tauri/Cargo.toml` → `version` | `28.88.0` | CANONICAL — en accord |
| 3 | `README.md` → header + badge | `v28.88.0` | CANONICAL — en accord |
| 4 | `docs/README.md` → header | `28.88.0` | CANONICAL — en accord |
| 5 | `CHANGELOG.md` | référence v28.88.0 | CANONICAL — en accord |
| 6 | `RELEASE_v28.88.0_SEALED.txt` | v28.88.0 | CANONICAL — release scellée |

**Règle**: `package.json` est la source primaire. Toute autre surface doit s'y aligner.

---

## Contradictions observées

### CONTRADICTION 1 — App.tsx header (CORRIGÉE)

| Champ | Valeur avant | Valeur après | Gravité |
|-------|-------------|-------------|---------|
| `src/App.tsx` ligne 2 | `TITANE_INFINITY v26.3.0` | `TITANE_INFINITY v28.88.0` | P1 — surface visible |
| `src/App.tsx` ligne 11 | `TITANE∞ v26.3.0 — APP COMPONENT` | `TITANE∞ v28.88.0 — APP COMPONENT` | P1 — surface visible |

**Cause probable**: header non mis à jour depuis v26.3.0 lors des releases successives.
**Patch**: correction minimale des deux commentaires uniquement. Aucune logique touchée.
**Preuve**: `grep "v26.3.0\|v28.88.0" src/App.tsx` → uniquement v28.88.0 après patch.

### CONTRADICTION 2 — doc historique (ACCEPTABLE)

| Fichier | Valeur | Statut |
|---------|--------|--------|
| `docs/architecture/ENGINES_MAPPING_v26.3.0.md` | v26.3.0 dans le nom | ACCEPTABLE — document historique, non modifié |

**Décision**: les docs historiques conservent leur version dans le nom. Pas de renommage.

---

## Fichiers d'autorité (liste exhaustive)

```
package.json                          ← SOURCE PRIMAIRE
src-tauri/Cargo.toml                  ← autorité Rust
README.md                             ← autorité doc publique
docs/README.md                        ← autorité doc interne
CHANGELOG.md                          ← historique
RELEASE_v28.88.0_SEALED.txt           ← release canonique scellée
```

---

## Release canonique actuelle

```
v28.88.0 — Sealed
Artefacts: RELEASE_v28.88.0_SEALED.txt
```

Releases historiques conservées (ne pas supprimer):
- `RELEASE_v27.0.3_SEALED.txt`
- `RELEASE_v28.0.0_SEALED.txt`
- `RELEASE_v28.5.0_SEALED.txt`
- `RELEASE_v28.81.0_SEALED.txt` → `RELEASE_v28.87.0_SEALED.txt`

---

## Patchs effectués

1. `src/App.tsx` — correction du header de version (v26.3.0 → v28.88.0)
   - Lignes 2 et 11 uniquement
   - Aucun comportement modifié

---

## Patchs restants

Aucun. Toutes les surfaces d'autorité principales sont alignées après le patch App.tsx.

---

## Rollback

```bash
git revert <sha_phase1_commit>
# Revert App.tsx et supprime ce fichier
```

---

## Verdict

```
PHASE 1: PASS
- Version canonique: 28.88.0 (prouvée par package.json, Cargo.toml, README, docs/README)
- Contradiction principale: CORRIGÉE (App.tsx header)
- Sources d'autorité: documentées
- Prochaine action: PHASE 2 — SURFACES CONCURRENTES
```
