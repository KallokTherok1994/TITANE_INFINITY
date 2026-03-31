# Recertification Test Matrix

**Date:** 2026-03-21  
**Node:** v20.20.0 | pnpm: 10.30.2

---

## 4a. TypeScript Check (tsc --noEmit)

**Command:**
```bash
pnpm tsc --noEmit
```

**Output:** (no output = clean)  
**Exit code:** 0  
**Result:** PASS ✅

---

## 4b. Lint (eslint src)

**Command:**
```bash
pnpm exec eslint src --ext .ts,.tsx --max-warnings=999
```

**Output:** (no output = clean)  
**Exit code:** 0  
**Result:** PASS ✅

---

## 4c. Vitest (3399 tests)

**Command:**
```bash
pnpm vitest run --reporter=dot
```

**Output (tail):**
```
 Test Files  231 passed (231)
      Tests  3399 passed (3399)
   Start at  09:11:39
   Duration  129.41s (transform 5.47s, setup 30.80s, import 14.12s, tests 24.19s, environment 39.57s)
```

**Exit code:** 0  
**Result:** PASS ✅

---

## 4d. Governance Gates

### verify_instructions.sh
```
SUMMARY: PASS=20 FAIL=0
```
**Result:** PASS ✅

### detect_recurrence.sh
```
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=507
```
**Result:** PASS ✅

---

## 4e. Build (pnpm build = vite build)

**Command:**
```bash
grep '"build"' package.json && pnpm build
```

**Package.json entry:**
```
"build": "vite build",
```

**Output (tail):**
```
[4/4] Vérification de l'installation...
✓ Installation réussie!

Détails de l'installation:
  • Fichier .desktop: /home/titane-os/.local/share/applications/titane-infinity.desktop
  • Binaire: /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.5.0_amd64.AppImage
  • Icône: /home/titane-os/Documents/GitHub/TITANE_INFINITY/src-tauri/icons/128x128.png

ℹ L'application TITANE∞ est maintenant disponible dans votre menu d'applications

✅ Post-Build terminé
```

**Exit code:** 0  
**Result:** PASS ✅

---

## Summary

| Gate | Command | Exit | Result |
|------|---------|------|--------|
| tsc --noEmit | pnpm tsc --noEmit | 0 | PASS |
| eslint | pnpm exec eslint src | 0 | PASS |
| vitest 3399 | pnpm vitest run | 0 | PASS |
| verify_instructions | bash scripts/verify_instructions.sh | 0 | PASS |
| detect_recurrence | bash scripts/autoheal/detect_recurrence.sh | 0 | PASS |
| build | pnpm build | 0 | PASS |

**All 6 gates: PASS**
