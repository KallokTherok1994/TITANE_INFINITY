# 15 — GATES REPORT

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Gates requis (Rule 10)

| Gate | Script | Statut |
|------|--------|--------|
| detect_recurrence | `scripts/autoheal/detect_recurrence.sh` | EN ATTENTE EXÉCUTION |
| verify_instructions | `scripts/verify_instructions.sh` | EN ATTENTE EXÉCUTION |

## Exécution

Les gates seront exécutés après finalisation des 19 documents.
Les résultats seront ajoutés dans `raw/15_gate_detect_recurrence.log` et `raw/15_gate_verify_instructions.log`.

Ce fichier sera mis à jour avec les résultats réels après l'exécution.

---

*[SECTION MISE À JOUR APRÈS EXÉCUTION DES GATES]*

## Résultats

### detect_recurrence.sh

Log: `raw/15_gate_detect_recurrence.log`

### verify_instructions.sh  

Log: `raw/15_gate_verify_instructions.log`

---

## Verdict initial

**BLOCKED (en attente)** — gates à exécuter avant commit final.

---

## RESULTATS REELS

### detect_recurrence.sh — RC=0

```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=157
```

### verify_instructions.sh — RC=0

```
PASS: G_AUTOHEAL_FILE_detect_recurrence.sh
PASS: G_AUTOHEAL_JSONL_VALID
PASS: G_MARKER_VERDICT_UNIQUE
PASS: G_MARKER_STOPLINE
PASS: G_MARKER_NO_SKIPS
PASS: G_MARKER_PROOF_PACK
PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=20 FAIL=0
```

**PASS — detect_recurrence RC=0, verify_instructions PASS=20 FAIL=0.**
