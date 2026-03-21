# 08 — TEST MATRIX

## Champion Baseline Results (This Session)

### TypeScript Check

```bash
pnpm tsc --noEmit 2>&1 | tail -5
```

```
(no output — clean)
TSC_EXIT:0
```

**Result: PASS ✅**

---

### Frontend Build

```bash
pnpm build 2>&1 | tail -15
```

```
[4/4] Vérification de l'installation...
✓ Installation réussie!

Détails de l'installation:
  • Fichier .desktop: /home/titane-os/.local/share/applications/titane-infinity.desktop
  • Binaire: TITANE-Infinity_28.5.0_amd64.AppImage
  • Icône: src-tauri/icons/128x128.png

✅ Post-Build terminé
BUILD_EXIT:0
```

**Result: PASS ✅**

---

### Vitest Unit Suite (Prior Recert — Not Re-Run Per Instructions)

| Suite | Tests | Pass | Fail | Status |
|-------|-------|------|------|--------|
| unit | 3399 | 3399 | 0 | ✅ PASS |

Source: deps recert proof pack (368a740c3) — 3399/3399 PASS.  
Per task instructions: "Do NOT run vitest again — it was already proven as 3399/3399 PASS in the recert pass."

---

### Gates

```bash
bash scripts/verify_instructions.sh 2>&1 | tail -5
```
```
PASS: G_MARKER_NO_SKIPS
PASS: G_MARKER_PROOF_PACK
PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=20 FAIL=0
VERIFY_INSTRUCTIONS_EXIT:0
```

```bash
bash scripts/autoheal/detect_recurrence.sh 2>&1 | tail -3
```
```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=508
DETECT_RECURRENCE_EXIT:0
```

**All gates: PASS ✅**

---

## Challenger Baseline (Not Run — Trial Not Executed on MAIN)

Per mission rules: NO new package installs unless isolated trial proven safe first.
Challenger tests PENDING — to be run on `trial/vite8-migration` branch.

| Test | Required Result | Status |
|------|----------------|--------|
| TSC | exit 0 | PENDING (trial branch) |
| pnpm build | exit 0 | PENDING |
| vitest 4.1.0 run | ≥3399/3399 | PENDING |
| rolldown treeshake compat | no errors | PENDING |
| Tauri build | exit 0 | PENDING |
