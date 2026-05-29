# GATE 16A.1 — VISUAL REVIEW OPENING GUIDE

**Date:** 2026-05-29

---

## Open this file in your browser

```
artifacts/nexus-v36/human-review/viewer/REVIEW_START_HERE.html
```

Double-click the file or drag it into your browser. No server required.

---

## If images do not appear

**Step 1:** Confirm files exist in originals:
```
artifacts/nexus-v36/human-review/originals/
```
58 PNG files should be there. Open one directly to verify.

**Step 2:** Open a PNG directly (double-click it). If it opens, the issue is path rendering.

**Step 3:** If the PNG opens but the HTML does not show it, check your browser's local file policy:
- Chrome/Edge: may block `file://` cross-directory image loads. Use Firefox instead.
- Firefox: supports local file `<img>` with relative paths without restrictions.
- Alternative: open `contact-sheets/all.html` instead.

**Step 4:** If the PNG itself does not open, the screenshot source is broken.
Report: `REQUEST_NEXUS_VISUAL_REPAIR` with details.

---

## Recommended review order

1. `REVIEW_START_HERE.html` → priority buttons (titane, orchestration-intelligence, quantum-center)
2. `daily.html` → 10 Daily routes
3. `lab.html` → 2 Lab/SIMULATED routes (priority: SIMULATED badge check)
4. `system.html` → 15 System routes
5. `dev.html` → 2 Dev routes
6. `contact-sheets/all.html` → quick visual scan of all 29 routes

---

## Gallery files

| File | Description |
|------|-------------|
| `viewer/REVIEW_START_HERE.html` | Main entry — start here |
| `viewer/daily.html` | 10 Daily routes |
| `viewer/system.html` | 15 System routes |
| `viewer/dev.html` | 2 Dev routes |
| `viewer/lab.html` | 2 Lab/SIMULATED routes |
| `viewer/all.html` | All 29 routes with anchors |
| `viewer/missing.html` | VN-01 through VN-05 |
| `contact-sheets/daily.html` | Daily thumbnail grid |
| `contact-sheets/all.html` | All-routes thumbnail grid |
