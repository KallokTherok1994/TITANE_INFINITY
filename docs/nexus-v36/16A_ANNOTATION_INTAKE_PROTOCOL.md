# GATE 16A — ANNOTATION INTAKE PROTOCOL

**Date:** 2026-05-29 (updated Gate 16A.1)

---

## Intake Trigger

Kevin sends: `REQUEST_NEXUS_VISUAL_REPAIR_WITH_ANNOTATIONS`

Annotated files are in: `artifacts/nexus-v36/human-review/annotated-inbox/`

---

## Annotation Color Legend

| Code | Color (FR) | Meaning | Output |
|------|-----------|---------|--------|
| RED_CORRECT | Rouge | À corriger | repair candidate → requires Kevin approval before patch |
| YELLOW_VERIFY | Jaune | À vérifier | verification task → no auto-patch |
| PURPLE_OPTIMIZE | Mauve | À vérifier, améliorer, optimiser | optimization candidate → requires Kevin approval |
| BLUE_INTERACTION_TEST | Bleu | Bouton/case/fonction à tester | interaction test task → requires Kevin approval |
| GREEN_UI_PREFERENCE | Vert | Préférence visuelle UI | → `.titane-dev/memory/frontend_visual_preferences.md` |

Full legend: `artifacts/nexus-v36/human-review/annotation_legend.json`

---

## Claude Intake Steps (in order)

### Step 1 — Inventory

```powershell
Get-ChildItem "artifacts\nexus-v36\human-review\annotated-inbox" | Select-Object Name, Length
```

### Step 2 — Match to originals

For each `<id>_annotated.png`, find the matching original in `manifest.json`.  
If no match: classify as `UNMATCHED_ANNOTATION`.

### Step 3 — Create inventory

Create: `docs/nexus-v36/16B_ANNOTATION_INVENTORY.md`

### Step 4 — Create repair matrix

Create: `docs/nexus-v36/16B_ANNOTATED_REPAIR_MATRIX.md`

For each annotated file, one entry per color annotation type identified:

```json
{
  "id": "<id>",
  "route": "/route",
  "annotation_file": "annotated-inbox/<id>_annotated.png",
  "annotation_color": "RED_CORRECT | YELLOW_VERIFY | PURPLE_OPTIMIZE | BLUE_INTERACTION_TEST | GREEN_UI_PREFERENCE",
  "repair_class": "REPAIR_???",
  "description": "<what was circled>",
  "estimated_scope": "<source file if determinable>",
  "blocking": true,
  "approved_for_repair": false
}
```

### Step 5 — Create UI preference notes

Create: `docs/nexus-v36/16B_UI_PREFERENCE_NOTES.md` (from GREEN annotations)

Update: `.titane-dev/memory/frontend_visual_preferences.md`

### Step 6 — Present to Kevin

Present `16B_ANNOTATED_REPAIR_MATRIX.md`.  
Do NOT begin repairs without explicit approval.

### Step 7 — Await Kevin approval

Kevin sends: `APPROVE_REPAIR_GATE_16B`

Claude may then execute repairs — one per commit, minimum scope, AutoHeal entry required.

---

## Hard Constraints During Repair

- One defect → one fix. No broad refactor.
- No product model mutation (`gemma2:2b` protected).
- No route deletion, rename, or alias deletion.
- Every fix: AutoHeal entry + detect_recurrence.sh PASS + certifier PASS.
- SEALED requires fresh Kevin visual re-confirmation after repairs.
- Claude does NOT auto-repair from screenshots. Inventory first, always.
