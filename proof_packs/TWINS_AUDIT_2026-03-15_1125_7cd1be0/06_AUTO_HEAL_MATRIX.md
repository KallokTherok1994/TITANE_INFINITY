# 06_AUTO_HEAL_MATRIX

## Entrée ajoutée

| ID | Scope | Symptôme | Fix | Prévention |
|---|---|---|---|---|
| AH-2026-03-15-TWINS-001 | numeric_twin, ipc, generate_handler, manage, tauri.conf.json | 8 commandes twin_* définies mais non enregistrées + NumericTwinState non managé | Ajout .manage() + generate_handler![] + tauri.conf.json allow list | grep twin_get_state src-tauri/src/main.rs + detect_recurrence.sh |

## Fichier mis à jour
`scripts/autoheal/autoheal_rules.jsonl` — 269 entrées totales

## Gates exécutés
```
bash scripts/autoheal/detect_recurrence.sh
→ PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
→ PASS: G_AH_RECURRENCE_GUARD_PASS
→ INFO: entries=269

bash scripts/verify_instructions.sh
→ PASS: G_AUTOHEAL_FILE_detect_recurrence.sh
→ PASS: G_AUTOHEAL_JSONL_VALID
→ PASS: G_MARKER_VERDICT_UNIQUE
→ PASS: G_MARKER_STOPLINE
→ PASS: G_MARKER_NO_SKIPS
→ PASS: G_MARKER_PROOF_PACK
→ PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
→ PASS: G_AH_RECURRENCE_GUARD_PASS
→ SUMMARY: PASS=20 FAIL=0
```

## Correction additionnelle (pré-existante)
`AH-2026-03-15-AUDIO-003` — entrée préexistante avec champs requis manquants
(scope, symptom, prevention_test, commands, files_changed, rollback).
Champs ajoutés pour restaurer la validité du registre. Ceci était bloquant
pour detect_recurrence.sh.
