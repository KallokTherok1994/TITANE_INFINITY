# GATE 16A — REPAIR ROUTER TEMPLATE

**Date:** 2026-05-29

---

## Purpose

Template for classifying visual repairs after Kevin returns annotated screenshots.  
Claude populates this into `docs/nexus-v36/16B_ANNOTATED_REPAIR_MATRIX.md`.  
No repair is executed without Kevin's explicit gate approval.

---

## Repair Classes

| Class | Meaning |
|-------|---------|
| REPAIR_LAYOUT | Element positions, spacing, or sizing wrong |
| REPAIR_TEXT | Text content incorrect, truncated, or missing |
| REPAIR_NAVIGATION | Nav highlight wrong, missing route, wrong mode shown |
| REPAIR_TRUTH_BADGE | SIMULATED badge missing or shown on wrong route |
| REPAIR_ROUTE | Route shows wrong component or blank |
| REPAIR_TAB | Tab content missing, wrong state |
| REPAIR_CLIPPING | Content clipped by panel or viewport |
| REPAIR_SIMULATED_DISCLOSURE | SIMULATED route visible in Daily nav (SIM-03) |
| REPAIR_VISUAL_HIERARCHY | Z-order, overlay, or layering wrong |
| REPAIR_UNKNOWN | Cannot classify from annotation alone |

---

## Repair Entry Schema

```json
{
  "id": "<screenshot-id>",
  "route": "/route",
  "annotation_file": "annotated-inbox/<id>_annotated.png",
  "repair_class": "REPAIR_???",
  "description": "What Kevin circled",
  "estimated_scope": "src/components/??? or src/styles/???",
  "blocking": true,
  "approved_for_repair": false
}
```

---

## Gate Flow After Repair Matrix

1. Claude presents `16B_ANNOTATED_REPAIR_MATRIX.md` to Kevin
2. Kevin approves scope for each repair item
3. Kevin sends: `APPROVE_REPAIR_GATE_16B`
4. Claude executes repairs (one per commit, minimal patch)
5. Re-capture (if binary rebuild authorized)
6. Return to visual review
