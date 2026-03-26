# MODÈLE DE VÉRITÉ CANONIQUE

**Session:** GITHUB_AGENT_TOTAL_RECONCILIATION_2026-03-07_1416_b41305f  
**Date:** 2026-03-07

---

## 1. ÉTAT DU DÉPÔT

| Attribut | Valeur |
|----------|--------|
| Commit HEAD | b41305f |
| Branche active | copilot/audit-cleanup-autofix-workflows |
| Branche cible | MAIN |
| Shallow clone | Résolu par `git fetch --unshallow origin` |

## 2. MERMAID — ÉTAT CANONIQUE

| Diagramme | Fichier source | Statut |
|-----------|---------------|--------|
| Architecture 4-Ring | sources/architecture_4_ring.mmd | SYNCED |
| Data Flow Chat | sources/data_flow_chat.mmd | SYNCED |
| Omega Pipeline V2 | sources/omega_pipeline_v2.mmd | SYNCED |
| Certification Gates | sources/certification_gates.mmd | SYNCED |
| Network Surface Online First | sources/network_surface_online_first.mmd | SYNCED |

- Baseline SHA: `3a5026995a2e4390a47a98cad9dcdc315dde6194` (V6, 2026-02-22)
- Mode système: DORMANT (V12), Phase active: V11
- Drift strict: PASS
- Registry: HASH_REGISTRY_OK
- Lineage vérifié: PASS (après unshallow)

## 3. REGISTRIES — ÉTAT CANONIQUE

| Registry | Fichier | Statut |
|---------|---------|--------|
| Registry events | runtime/registry/events.jsonl | 17 events, last update: 2026-03-07 |
| Registry snapshot | runtime/registry/snapshot.json | 10 suites, 7 gates |
| Registry dashboard | runtime/registry/dashboard.md | RENDERED |
| MERMAID_HASH_REGISTRY | docs/diagrams/MERMAID_HASH_REGISTRY.json | OK (45 lignes) |
| autoheal_rules.jsonl | scripts/autoheal/autoheal_rules.jsonl | 96 entries |

## 4. WORKFLOWS — ÉTAT CANONIQUE

| Workflow | Statut |
|---------|--------|
| rust.yml | FIXED (working-directory: src-tauri) + Prettier |
| python-package-conda.yml | FIXED (Prettier) |
| Autres (39 total) | Action_required = approbation manuelle requise (gouvernance normale) |

## 5. CAPABILITIES — ÉTAT CANONIQUE

- Commands stable: 216
- Présence registry: OK
- 5 commands dans registry mais hors allowlist stable (dev-only, classifiées WARN non bloquant)
- Capabilities drift gate: PASS

## 6. ARCHITECTURE 4-RING — CONFORMITÉ

- Ring 2 (Engines): isolation pure ✅
- Ring 1 (Types): self-contained ✅
- Tauri-only enforced: 0 erreurs ✅
- Invariants gouvernés: PASS ✅
- Online-first doctrine: présente dans copilot-instructions.md ✅

## 7. OBSERVATION TECHNIQUE — FAUX NÉGATIF LOCAL

`enforce-online-first.sh` produit un FAIL local dû à `rg` (ripgrep) absent dans l'environnement local. 
Le contenu est **prouvablement présent** (`grep -iE "online[-\s]?first.*govern" .github/copilot-instructions.md` → TROUVÉ).  
Ce script n'est inclus dans aucun workflow CI actif sur PR. Faux négatif local classifié P2-non-bloquant.
