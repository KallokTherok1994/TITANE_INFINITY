# 14_ACCELERATION_PLAN

## Dimensions d acceleration
- kernel always-on plus court
- rules specialisees locales
- validator-first checks
- simple path vs heavy path
- pas d audit full repo pour petit fix local
- routage deterministe vers bon agent
- prompt files reutilisables
- moins de repetition doctrinale
- resolution conflit plus claire
- charge startup session reduite

## PATH_SIMPLE
Used for:
- small local fixes
- doc-only updates
- limited-scope refines

Must include:
- minimal discovery (paths impacts seulement)
- local rules only (L2 + L3)
- targeted proofs only (1-3 checks max)

Execution profile:
- bootstrap court
- pas de full contradiction sweep
- sortie rapide avec rollback local

## PATH_HEAVY
Used for:
- instruction architecture changes
- runtime / IPC / E2E / release work
- contradiction resolution

Must include:
- full bootstrap
- layer analysis complete
- broader validation
- proof pack discipline complete

Execution profile:
- checks multi-domaines
- gates explicites
- verdict qualifie + next action

## Triggers PATH_SIMPLE -> PATH_HEAVY
- modification de `.github/copilot-instructions.md`
- changement `src-tauri/**` ou IPC contract
- changement e2e wrapper/exports
- changement release/prod gating
- detection contradiction de couches
- ajout/suppression validator governance

## Gains attendus
- reduction latence demarrage session: HIGH
- reduction ambiguite routage: HIGH
- reduction cout maintenance doctrine: HIGH
- augmentation taux verification mecanique: HIGH
