# CHAT_LAYOUT_DEFECT_MATRIX

Timestamp: 2026-04-17 20:47 America/Toronto
Surface: `/titane?tab=conversation`

| Defect | Evidence | Status |
| --- | --- | --- |
| `HEIGHT_AUTHORITY_CONFLICT` | Current worktree diff removes `calc(var(--conversation-vh, 100dvh) - 155px/-176px/-82px)` and fixed min-heights from `src/pages/TitanePage.css`; that conflict matches the reported bottom clipping mechanism | Verified root cause in history/worktree diff |
| `FIXED_OFFSET_OVERFLOW` | Same removed `calc(... - fixedOffset)` rules forced a second height system on the fullscreen lane | Verified root cause in history/worktree diff |
| `RIGHT_EDGE_OVERFLOW` | Previous `100vw` root sizing was replaced with parent-bound `100%`; AppShell also added width compensation under zoom | Historically verified, needs fresh runtime proof at `90%` |
| `ZOOM_SCALE_MISMATCH` | Existing browser and desktop proofs only exercise `100% -> 110% -> 100%`; they do not cover `90%` or below | Active certification gap |
| `STICKY_OFFSET_COLLISION` | Agent dashboards panel used to be a fixed bottom-right overlay; current worktree adds compact/collapsed conversation-safe mode | Mitigated in current worktree, needs runtime proof |
| `TARGET_MISMATCH` | Browser lane runs Vite; desktop lane runs a binary selected by policy. The user-visible defect could still live in a stale desktop artifact even if source is fixed | Active certification risk |
| `STALE_ARTIFACT_RISK` | Dirty worktree plus recent committed and uncommitted chat-layout changes mean installed/built runtime truth may not match current source | Active certification risk |
| `UNKNOWN` | No additional live authority outside the discovered chain has been identified yet | Not active |

## Current Real Lock

The historical layout bug was a real `HEIGHT_AUTHORITY_CONFLICT`, but the current blocking lock for certification is `ZOOM_SCALE_MISMATCH`:

- the source tree already contains an uncommitted parent-bound fullscreen fix,
- yet the exact user-reported zoom-out lane is still not executed in either canonical proof path,
- so the bug can be either truly fixed, still present, or fixed only in source while stale desktop runtime artifacts still reproduce it.

## Required Next Check

Expand the canonical browser and desktop tests to drive the real TopNav zoom-out state below baseline, then run them on the current worktree before deciding whether another product patch is required.
