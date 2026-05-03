# MANIFEST — Release Archive TITANE_INFINITY

**Généré** : 2026-05-03  
**Source canonique** : `RELEASE_SURFACE_INVENTORY.md` à la racine du repo  
**Critère "COMPLETE"** : entrée RELEASE_SURFACE_INVENTORY.md avec ✅ PASS sur core surfaces (package.json, Cargo.toml, AppImage/DEB, deployment/latest) OU sealed file présent.  
**Note** : `BLOCKED_SUDO_REQUIRED` pour system install = acceptable (contrainte CI/noninteractive, pas une lacune).

---

## v32.x — ACTIF (checksums conservés à la racine)

| Version | Checksums | Inventory | Sealed | Statut E2E |
|---------|-----------|-----------|--------|------------|
| v32.0.4 | `RELEASE_ARTIFACTS_CHECKSUMS_32.0.4.txt` ✅ | HEAD actif | — | **ACTIVE** |
| v32.0.3 | `RELEASE_ARTIFACTS_CHECKSUMS_32.0.3.txt` ✅ | ✅ PASS | — | **COMPLETE** |
| v32.0.2 | `RELEASE_ARTIFACTS_CHECKSUMS_32.0.2.txt` ✅ | ✅ PASS | — | **COMPLETE** |
| v32.0.1 | `RELEASE_ARTIFACTS_CHECKSUMS_32.0.1.txt` ✅ | ✅ PASS | — | **COMPLETE** |
| v32.0.0 | `RELEASE_ARTIFACTS_CHECKSUMS_32.0.0.txt` + `_v2.txt` ✅ | ✅ PASS | — | **COMPLETE** |

---

## v31.x — Archivés dans checksums/ + notes/

| Version | Checksums archivés | Notes archivées | Statut E2E |
|---------|--------------------|-----------------|------------|
| v31.3.4 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.3.4.txt | — | PARTIAL (inventory à confirmer) |
| v31.3.3 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.3.3.txt | — | PARTIAL |
| v31.3.2 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.3.2.txt | — | PARTIAL |
| v31.3.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.3.0.txt | — | **COMPLETE** (inventory PASS) |
| v31.2.41 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.41.txt | — | **COMPLETE** (inventory PASS + SHA256) |
| v31.2.40 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.40.txt | — | **COMPLETE** (inventory PASS) |
| v31.2.39 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.39.txt | — | **COMPLETE** (inventory PASS + SHA256) |
| v31.2.37 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.37.txt | — | PARTIAL |
| v31.2.35 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.35.txt | — | PARTIAL |
| v31.2.34 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.34.txt | — | PARTIAL |
| v31.2.14 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.14.txt | — | **COMPLETE** (BUILD ALL PASS) |
| v31.2.13 | — | — | GOVERNANCE_ONLY (no binary bump) |
| v31.2.9 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.2.9.txt | — | PARTIAL |
| v31.2.7 | — | — | PARTIAL (deployment proof only) |
| v31.1.4 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.1.4.txt | — | **COMPLETE** (E2E 98 PASS, launchers) |
| v31.1.3 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.1.3.txt | — | PARTIAL |
| v31.1.2 | — | — | GOVERNANCE_SEAL (proof_packs/SEAL_v31.1.2/) |
| v31.0.6 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_31.0.6.txt + sizes | — | PARTIAL |
| v31.0.3 | — | — | PARTIAL (desktop pub, BLOCKED_SUDO) |
| v31.0.2 | — | notes/RELEASE_v31.0.2.md | **COMPLETE** (desktop + Windows MSI) |
| **v31.0.1** | ❌ AUCUN | — | **⚠️ INCOMPLETE** — source bump uniquement, zéro artifact |

> v31.0.1 : version enregistrée comme source-sync uniquement dans RELEASE_SURFACE_INVENTORY.md. Aucun artifact packagé, aucun deployment/latest, aucune preuve binaire. Status INCOMPLETE documenté.

---

## v30.x — Archivés dans checksums/ + notes/ + sealed/

| Version | Checksums archivés | Notes archivées | Sealed | Statut E2E |
|---------|--------------------|-----------------|--------|------------|
| v30.1.34 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.34.txt | — | — | **COMPLETE** (HOST_SYNC_VERIFIED) |
| v30.1.33 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.33.txt | — | — | **COMPLETE** (HOST_SYNC_VERIFIED) |
| v30.1.31 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.31.txt | notes/RELEASE_v30.1.31.md | — | **COMPLETE** |
| v30.1.28 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.28.txt | notes/RELEASE_v30.1.28.md | — | **COMPLETE** |
| v30.1.27 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt | notes/RELEASE_v30.1.27.md | — | **COMPLETE** |
| v30.1.26 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.26.txt | — | — | PARTIAL |
| v30.1.23 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.23.txt | notes/RELEASE_v30.1.23.md | — | **COMPLETE** |
| v30.1.22 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.22.txt | notes/RELEASE_v30.1.22.md | — | **COMPLETE** |
| v30.1.8 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.8.txt | notes/RELEASE_v30.1.8.md | sealed/RELEASE_v30.1.8_SEALED.txt | **COMPLETE + SEALED** |
| v30.1.7 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.7.txt | notes/RELEASE_v30.1.7.md | — | **COMPLETE** |
| v30.1.6 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.6.txt | — | — | PARTIAL |
| v30.1.4 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.1.4.txt | notes/RELEASE_v30.1.4.md | — | PARTIAL |
| v30.0.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_30.0.0.txt | — | — | **COMPLETE** (autoheal confirmed) |

---

## v29.x — Archivés dans checksums/

| Version | Checksums archivés | Statut E2E |
|---------|--------------------|------------|
| v29.0.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt | PARTIAL (checksums seuls) |

---

## v28.x — Archivés dans checksums/ + sealed/ + notes/

> Note: les fichiers v28.5.0, v28.81.0 et v28.82.0 existaient déjà en doublon dans `_archive/releases/`.  
> Les copies racine ont été supprimées (déduplification) — une seule copie conservée ici.

| Version | Checksums archivés | Notes archivées | Sealed | Statut E2E |
|---------|--------------------|-----------------|--------|------------|
| v28.88.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.88.0.txt | notes/RELEASE_v28.88.0.md | sealed/RELEASE_v28.88.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.87.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.87.0.txt | — | sealed/RELEASE_v28.87.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.86.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.86.0.txt | — | sealed/RELEASE_v28.86.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.85.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.85.0.txt | — | sealed/RELEASE_v28.85.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.84.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.84.0.txt | — | sealed/RELEASE_v28.84.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.83.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.83.0.txt | — | sealed/RELEASE_v28.83.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.82.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.82.0.txt (dédupliqué) | — | sealed/RELEASE_v28.82.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.81.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt (dédupliqué) | — | sealed/RELEASE_v28.81.0_SEALED.txt | **COMPLETE + SEALED** |
| v28.5.0 | checksums/RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt (dédupliqué) | — | (en _archive/01_root_reports/releases/) | COMPLETE |
| v28.0.0 | ❌ AUCUN | — | sealed/RELEASE_v28.0.0_SEALED.txt | PARTIAL (sealed sans checksums) |
| v27.0.3 | hotfix/TITANE_ARTIFACTS_SHA256_v27.0.2_HOTFIX.txt | — | sealed/RELEASE_v27.0.3_SEALED.txt | PARTIAL (hotfix patch) |

---

## Fichiers spéciaux

| Fichier | Destination | Note |
|---------|-------------|------|
| `RELEASE_ARTIFACTS_CHECKSUMS.txt` (sans version) | checksums/ | Checksums génériques (probablement v30.1.31) |
| `RELEASE_ARTIFACTS_SIZES_31.0.6.txt` | checksums/ | Sizes v31.0.6, groupé avec checksums |

---

*Ce MANIFEST est la preuve d'audit E2E de toutes les versions TITANE_INFINITY avant archivage.*
