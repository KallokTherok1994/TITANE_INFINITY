# GATE 16A — ANNOTATION PROTOCOL

**Date:** 2026-05-29

---

## Purpose

Defines how Kevin annotates screenshots and how Claude processes the annotations.

---

## Kevin Annotation Steps

1. Open a screenshot from:
   ```
   artifacts/nexus-v36/human-review/originals/<filename>.png
   ```

2. Use any image editor:
   - Windows: Snipping Tool (annotation mode), Paint, Photos
   - Cross-platform: GIMP, Photoshop, Preview (Mac)

3. **Circle in red** anything that must be corrected or modified.

4. Add short text labels near the circles to describe the issue (optional but helpful).

5. Save the annotated image as:
   ```
   <id>_annotated.png
   ```
   where `<id>` matches the original file ID (e.g., `titane_annotated.png`).

6. Place the file in:
   ```
   artifacts/nexus-v36/human-review/annotated-inbox/
   ```

---

## File Naming Convention

| Original | Expected annotated name |
|----------|------------------------|
| titane.png | titane_annotated.png |
| orchestration-intelligence.png | orchestration-intelligence_annotated.png |
| quantum-center.png | quantum-center_annotated.png |
| titane-viewport.png | titane-viewport_annotated.png |
| (any) | (same basename)_annotated.png |

---

## After Annotation

Send one of:

```
KEVIN_VISUAL_APPROVED_NEXUS_V36
```
If all pages look correct and nothing was circled.

```
REQUEST_NEXUS_VISUAL_REPAIR_WITH_ANNOTATIONS
```
After placing annotated files in `annotated-inbox/`. Claude will inventory them first.

```
REQUEST_NEXUS_VISUAL_REPAIR
```
If a specific repair is needed but no annotation file is provided — describe the issue in text.

---

## What Claude Does After Annotations Are Returned

Claude does NOT auto-repair.

1. Claude inventories all files in `annotated-inbox/`
2. Claude creates: `docs/nexus-v36/16B_ANNOTATED_REPAIR_MATRIX.md`
3. Claude asks Kevin for approval before any repair gate begins
4. Repair gate is separate from Gate 16A
