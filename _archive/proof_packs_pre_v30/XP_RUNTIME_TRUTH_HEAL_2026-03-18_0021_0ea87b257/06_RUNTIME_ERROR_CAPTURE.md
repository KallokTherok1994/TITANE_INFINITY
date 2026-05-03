# RUNTIME ERROR CAPTURE

## Pre-patch identified defects

### DEFECT 1: XP_ROUTE_BROKEN
Route: /xp → Navigate to="/titane" (App.tsx line 1063)
Impact: Any bookmark/link to /xp does not reach XP page
Classification: XP_ROUTE_BROKEN

### DEFECT 2: XP_SOURCE_MISMATCH
Experience.tsx used XP_ENGINE.state for (level, total, history) AND useExperience().domains simultaneously.
Two stores: localStorage('xp_state') vs localStorage('titane_experience')
These stores are NOT synchronized. XP awarded to old engine is invisible on new domain cards and vice versa.
Classification: XP_SOURCE_MISMATCH + XP_CONTRACT_DRIFT

### DEFECT 3: XP_CONTRACT_DRIFT
Level formula:
- Old: level = 1 + floor(total/500) → Level 1 at 0 XP, Level 2 at 500 XP (linear)
- New: level = floor(sqrt(xp/100)) → Level 1 at 100 XP, Level 2 at 400 XP (quadratic)
XP cards showed: "XP dans ce niveau: N / 500" — wrong threshold for new formula.
Classification: XP_CONTRACT_DRIFT + XP_OUTDATED_UI

### DEFECT 4: DOUBLE XP AWARD
MemoryViewer.tsx and FileUploadButton.tsx called both XP.gain() AND awardExperience() for same event.
Result: old store gets XP via gain(), new store gets XP via awardExperience() — bloating both.
Classification: XP_SOURCE_MISMATCH (PRODUCT)

### DEFECT 5: XP_BACKEND_INACTIVE
experience_get_state and experience_update_state are MOCK (mock_commands.rs).
In Tauri mode: mock returns zeros on every load (saved state wiped), update is no-op.
Classification: XP_BACKEND_INACTIVE + XP_FALLBACK_LYING
STATUS: NOT patched — requires real Rust persistence. Disclosed via UI label.

## Post-patch: no TypeScript errors, build succeeds.
