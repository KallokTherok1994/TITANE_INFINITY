# 05_RESIDUAL_ROOT_CAUSE_MATRIX

## RESIDUAL_ROOT_CAUSE_MATRIX

| Sujet | Cause racine prouvée | Preuve | Fichiers impactés | Gravité | Correctif minimal | Statut |
|-------|---------------------|--------|-------------------|---------|------------------|--------|
| XP Runtime Grid hardcodé | Prompt #1 a remplacé `NON CAPTURÉ` par `+5 XP` statique au lieu d'utiliser `lastGainAmount` — pattern conditionnel présent dans les 2 autres sections XP mais oublié ici | `grep "+5 XP" ThinkingPanel.tsx` ligne ~590 avant patch | src/features/chat/ThinkingPanel.tsx | P2 (RENDERED_BUT_FALSE) | Conditionnel `lastGainDomain === 'chat' && lastGainAmount !== undefined` identique aux autres sections | **CORRIGÉ** |
| autoheal_rules.jsonl index/worktree delta | `git add` effectué trop tôt (avant correction de format des règles) — index avait ancien format (sans `id`) ; worktree avait format corrigé | `git --no-pager diff -- scripts/autoheal/autoheal_rules.jsonl` : 5 lignes modifiées | scripts/autoheal/autoheal_rules.jsonl | P2 (detect_recurrence aurait FAIL sur cible précise) | `git add scripts/autoheal/autoheal_rules.jsonl` | **CORRIGÉ** |

## RECURRENCE_MAP

| Sujet | Défaut déjà corrigé (Prompt #1) ? | Rechute observée ? | Cause de rechute | Correctif anti-récidive |
|-------|------------------------------------|----------------------|-----------------|------------------------|
| Durée undefined post-load | OUI | NON | — | Entrée AH-001 propage la règle |
| Fichier Système oj-non-capture inconditionnelle | OUI | NON | — | Entrée AH-002 |
| Score qualité null | OUI | NON | — | Entrée AH-003 |
| XP hardcodé (essentiel + expert) | OUI | NON | — | Entrée AH-004 |
| XP hardcodé (runtime grid) | OUI partiel | **RÉSIDUEL** traité | Pattern appliqué à 2/3 sections seulement | Entrée AH-006 |
| Scroll .oj-journal-body | OUI | NON | — | Entrée AH-005 |
| autoheal format id | OUI (worktree) | Oui (index) | git add prématuré | `git add` lors de la recertification |

## Classification des défauts

- `RENDERED_BUT_FALSE` : XP runtime grid (corrigé)
- `FALLBACK_MASKING` : autoheal index/worktree (corrigé)
- Aucun défaut `TARGET_MISMATCH`, `CONTRACT_DRIFT`, `FIELD_NOT_INSTRUMENTED` non résolu
