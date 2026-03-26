# 10 Auto Fix Decisions

Decision 1

- Classification: `SAFE_AUTO_FIX`
- Defect: mixed zoom units across keyboard zoom, storage, and Tauri window zoom hooks
- Kept: YES
- Reason:
  - exact root cause was proved in code
  - impact was bounded to frontend interaction logic
  - rollback is immediate
  - improvement was revalidated by tests and retained WDIO runs

Implementation kept:

- Add `src/hooks/zoomScale.ts`
- Normalize zoom parsing and persistence in `src/hooks/useZoomControl.ts`
- Map Tauri backend zoom multipliers onto the existing 75% UI baseline in `src/hooks/useWindowControls.ts`
- Add/extend hook tests

Decision 2

- Classification: rejected from final patch
- Candidate: global `overflow-x` alignment on `html`
- Kept: NO
- Reason:
  - runtime computed style under WRY remained unchanged
  - no measurable visual improvement was proved
  - keeping that change would violate minimal-patch and no-false-perfection rules
