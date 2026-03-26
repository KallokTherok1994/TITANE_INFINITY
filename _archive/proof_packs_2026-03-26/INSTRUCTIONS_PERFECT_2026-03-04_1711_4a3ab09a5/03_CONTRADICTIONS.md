# 03_CONTRADICTIONS

## CONTRADICTION C1 — Doctrine réseau

- Constat: plusieurs fichiers path-specific indiquent `Local-first`, alors que la constitution repo-wide active `Online-first governed` avec fallback local obligatoire.
- Evidence:
  - `.github/copilot-instructions.md` (doctrine online-first + fallback local)
  - `.github/instructions/frontend.instructions.md` (`Local-first, no implicit network`)
  - `.github/instructions/tauri.instructions.md` (`Local-first, Tauri-only`)
- Canon choisi: `.github/copilot-instructions.md` (repo-wide prioritaire).
- Décision: conserver `Local-first` uniquement comme marqueur de compatibilité historique, doctrine active = online-first gouverné + fallback local.
- Impact: harmonisation terminologie dans satellites, sans changement runtime.

## CONTRADICTION C2 — Emplacement du système AutoHeal

- Constat: règles AH existantes pointent vers `registry/autofix-autoheal-rules.jsonl` + validator `scripts/qa/...`, alors que la demande impose `scripts/autoheal/*`.
- Canon choisi: demande utilisateur explicite + constitution mise à jour.
- Décision: migrer la règle vers `scripts/autoheal/autoheal_rules.jsonl` et scripts dédiés, maintenir compatibilité minimale si nécessaire par mention de transition.
- Impact: updates docs/checklists/workflow/verify script.

## CONTRADICTION C3 — Preuves dans `reports/` vs `proof_packs/`

- Constat: `docs-registry.instructions.md` cible `reports/**` mais accepte des proof packs; la demande impose `proof_packs/INSTRUCTIONS_PERFECT_*`.
- Canon choisi: demande session + pratique existante des proof packs.
- Décision: produire ce cycle dans `proof_packs/` (append-only), sans supprimer la doctrine historique.

## Statut global

- Contradictions tranchées avec canon explicite.
- Pas de `BLOCKED_DOCTRINE` à ce stade.
