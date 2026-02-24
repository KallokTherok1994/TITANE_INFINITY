# 02_PATCH_PLAN — FINAL CLEAN SEAL

## Règle: diff minimal, cause-only, aucun refactor gratuit

| Item | Priorité | Ring | Fichier(s) | Cause | Fix minimal | Risque | Rollback |
|------|----------|------|-----------|-------|-------------|--------|----------|
| README "Truth & Proof" | P2 | Doc | `README.md` | Section manquante — mission demande "where to find proofs" | Ajouter section `## 🔍 Truth & Proof` avant la license (append) | Zéro — docs only | `git restore -- README.md` |
| TERMINOLOGY_ALIGNMENT_FINAL.md | P2 | Doc | `docs/TERMINOLOGY_ALIGNMENT_FINAL.md` | Terminologie canon absente | Créer fichier (nouveau) | Zéro — nouveau fichier | `git rm docs/TERMINOLOGY_ALIGNMENT_FINAL.md` |
| 04_DOC_CHANGES.md | P2 | Doc | evidence only | Docs audit trace | Créer fichier evidence | Zéro | `git rm docs/_evidence/final_clean_seal/04_DOC_CHANGES.md` |
| Registry append FINAL_SEAL_APPLIED | P2 | Registry | `registry/ui-events.jsonl` | Scellement final requis | Append 1 ligne JSONL | Minimal — append-only | Remove last line if rollback needed |

## Items NON-MODIFIÉS (hors scope)

| Item | Raison |
|------|--------|
| Runtime TODOs (ollama.ts:631, streaming_engine.rs:446) | Roadmap non bloquante, hors scope |
| `docs/archive/` "local-first" | HISTORY — immuable |
| `scripts/verify/enforce-tauri-only.sh` faux positif | Pré-existant, hors scope de ce cycle |
| Tout code Rust non lié au Truth Contract | Hors scope |

## Interdits confirmés

- ❌ `rg -r` global OFFLINE→ONLINE (renommage global)
- ❌ Refactor architecture
- ❌ Changement allowlist/capabilities
- ❌ Build PROD (token requis)
