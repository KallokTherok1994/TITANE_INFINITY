# E2E Sanity Verdict

**Date:** 2026-02-20T15:23:11-05:00  
**Spec:** `e2e/desktop/online-chat-proof-ui.wdio.test.js`  
**AppImage:** `runtime/stable/Titan-Stable_27.0.0_amd64.AppImage`  
**Timeout:** 60s  
**Duration:** 49s  

---

## VERDICT: **FAIL**

**Exit Code:** 1  
**Spec Files:** 0 passed, 1 failed  

---

## Root Cause

**TDZ error still present in production AppImage:**

```json
{
  "titaneBoot": {
    "errors": [{
      "err": "ReferenceError: Cannot access uninitialized variable.",
      "url": "tauri://localhost/assets/services-ai-OxGOyH_O.js",
      "line": 2
    }]
  }
}
```

**Bundle hash mismatch:**
- AppImage contains: `services-ai-OxGOyH_O.js` (OLD hash)
- Section B build generated: `services-ai-BWLxV_8F.js` (NEW hash)

**Implication:** The AppImage v27.0.0 was built BEFORE the atomic commit 78b45f7 that fixed the timeout budget (25s→60s). The production binary contains the old dist with the TDZ error still present.

---

## Test Error

```
Error: React root not mounted
    at async Context.<anonymous> (online-chat-proof-ui.wdio.test.js:120:7)
```

**Reason:** TDZ error blocks React hydration. The app boots to `#/chat` route but React root never mounts due to the initialization error in `services-ai-OxGOyH_O.js:2`.

---

## DOM State at Failure

- **Title:** `TITANE∞ v26.3.0 - Cognitive Operating System`
- **Body text:** `Aller au contenu principal\n⚡\nTITANE∞\nChargement...`
- **URL:** `tauri://localhost/#/chat`
- **Root children:** 1 (loading state, not hydrated)
- **Test IDs found:** 0 (React components not mounted)
- **Textareas found:** 0

---

## Diagnosis

| Component | Status | Evidence |
|-----------|--------|----------|
| AppImage launch | ✅ PASS | Window opened, HTML loaded |
| Tauri IPC | ✅ PASS | Navigation to #/chat successful |
| HTML boot marker | ✅ PASS | `__TITANE_BOOT__.html_ok = true` |
| JavaScript eval | ❌ FAIL | TDZ error in services-ai-OxGOyH_O.js:2 |
| React hydration | ❌ FAIL | Root never mounts |
| E2E test | ❌ FAIL | Timeout waiting for React root |

---

## Stop-the-Line Gate

**BLOCKED: E2E_SANITY_OLD_DIST**

**Reason:** AppImage contains outdated dist with TDZ error. Section B successfully regenerated dist with new hash (`services-ai-BWLxV_8F.js`), but production AppImage was built before the fix.

**Required Action:**
1. Rebuild AppImage with new dist from Section B
2. Re-run E2E sanity with new AppImage
3. OR: Update proof pack scope to document this as KNOWN_ISSUE and proceed with manual verification

**Rollback if needed:**
```bash
# Revert to last stable without TDZ fix
git revert 78b45f727508319e4e5171ce8f5b4e339b5ffd16
```

---

## Full Log

See: `docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/runs/e2e/WDIO_SANITY.log` (57K)

---

## Next Step

**STOP.** Do not proceed to Section E2 (full E2E campaign) until:
- [ ] AppImage rebuilt with new dist
- [ ] E2E sanity re-run PASSES with new AppImage
- [ ] Bundle hash verified: `services-ai-BWLxV_8F.js` present in AppImage

**Status:** BLOCKED
