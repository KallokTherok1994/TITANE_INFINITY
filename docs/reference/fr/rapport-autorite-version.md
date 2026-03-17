# TITANE∞ — Rapport d'Autorité de Version

**Statut :** PROVEN  
**Date :** 2026-03-17  
**Mode :** AUDIT

---

## 1. VERSION CANONIQUE COURANTE

| Champ | Valeur | Source | Statut |
|---|---|---|---|
| Version produit | `28.0.0` | `package.json` → `"version": "28.0.0"` | PROVEN |
| Version crate Rust | `28.0.0` | `src-tauri/Cargo.toml` → `version = "28.0.0"` | PROVEN |
| Entrée CHANGELOG | `[28.0.0] - 2026-03-14` | `CHANGELOG.md` | PROVEN |
| Déclaration README | `v28.0.0 (repository authority)` | `README.md` | PROVEN |
| Déclaration hub docs | `28.0.0` | `docs/README.md` | PROVEN |

**Source de version canonique :** `package.json` (primaire), corroboré par `src-tauri/Cargo.toml` et `CHANGELOG.md`.

---

## 2. AUDIT DES SURFACES DE VERSION

### 2.1 Surfaces contenant la version courante (28.0.0)

| Fichier | Version trouvée | Cohérent | Statut |
|---|---|---|---|
| `package.json` | `28.0.0` | OUI | PROVEN |
| `src-tauri/Cargo.toml` | `28.0.0` | OUI | PROVEN |
| `CHANGELOG.md` | `[28.0.0]` | OUI | PROVEN |
| `README.md` | `v28.0.0` | OUI | PROVEN |
| `docs/README.md` | `28.0.0` | OUI | PROVEN |
| `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` | `28.0.0` | OUI | PROVEN |

### 2.2 Références de versions historiques (NON des contradictions)

| Fichier / Référence | Version | Classification | Action |
|---|---|---|---|
| `docs/user/README.md` | `19.4.3` | LEGACY — ancien README utilisateur | Ajouter bannière legacy |
| `docs/INVARIANTS_TITANE.md` | `19.3Ω` | LEGACY — doc d'invariants historique | Conserver, étiqueter LEGACY |
| `docs/GETTING_STARTED.md` | `v24.2.0` | LEGACY — guide plus ancien | Conserver, ajouter bannière |
| `deployment/latest/SHA256SUMS_v27.0.5.txt` | `v27.0.5` | Binaire LEGACY — explicitement documenté | CONSERVER comme historique |
| `titane-infinity@16.2.3` (fichier racine) | `16.2.3` | Fichier placeholder vide | Marqueur LEGACY |
| `titane-infinity@9.0.0` (fichier racine) | `9.0.0` | Fichier placeholder vide | Marqueur LEGACY |
| `docs/ARCHITECTURE.md` | `v8.0` (titre interne) | Label de sous-version LEGACY | DOC_ONLY |

### 2.3 Contradictions actives

Aucune détectée. Toutes les surfaces `28.0.0` sont cohérentes.  
Les références historiques sont explicitement étiquetées dans README et CHANGELOG.

---

## 3. RÈGLE DE DÉTERMINATION DE VERSION CANONIQUE

```
VERSION CANONIQUE = package.json → champ version
CORROBORÉE PAR :
  - src-tauri/Cargo.toml → champ version (doit correspondre)
  - CHANGELOG.md → dernière entrée [X.Y.Z]
  - README.md → champ "Version:" dans l'en-tête
VERSIONS HISTORIQUES :
  - Conservées dans les docs avec étiquettes LEGACY explicites
  - Non supprimées, non présentées comme courantes
  - Artefacts binaires v27.0.5 sont référence historique, non release courante
```

---

## 4. NORMALISATION DE VERSION REQUISE

| Fichier | Action | Priorité |
|---|---|---|
| `docs/user/README.md` | Ajouter bannière legacy pointant vers `docs/user/fr/README.md` | P2 |
| `docs/GETTING_STARTED.md` | Ajouter bannière legacy pointant vers les nouveaux guides canoniques | P2 |
| `docs/INVARIANTS_TITANE.md` | Ajouter note de version : "document reflect la baseline pre-28.x" | P3 |

---

## 5. HISTORIQUE DES RELEASES (REGISTRE CANONIQUE)

| Version | Date | Type | Binaire publié | Statut |
|---|---|---|---|---|
| `28.0.0` | 2026-03-14 | Gouvernance + autorité docs | En attente / DOC_ONLY | COURANT |
| `27.2.0` | 2026-03-07 | TypeScript strict + correctifs CI | OUI | HISTORIQUE |
| `27.0.5` | Pré-2026-03 | Baseline binaire production | OUI (AppImage/DEB/RPM) | HISTORIQUE |
| `27.0.6` | 2026-02-18 | Correctif DOCS-ONLY | NON binaire | HISTORIQUE |

---

## 6. VERDICT

**AUTORITÉ_VERSION :** PROVEN — `package.json` v28.0.0 est l'unique source de version canonique.  
**CONTRADICTIONS :** 0 contradiction active trouvée.  
**DÉRIVE HISTORIQUE :** Documentée et contrôlée — aucun flou silencieux.

---

*Autorité source : `package.json`, `src-tauri/Cargo.toml`, `CHANGELOG.md`, `README.md`*  
*Généré : 2026-03-17*
