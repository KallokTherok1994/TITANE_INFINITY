# UI_TIME_PAGE_FUNCTIONALITY_REPAIR v84

**Date**: 2026-05-12T13:30:09Z  
**File**: `src/pages/TimePage.tsx`

---

## Issues Identified

### Issue 1: Epoch Date 31/12/1969 in Snapshot List (HIGH — HARD STOPLINE)

**Root Cause**: `normalizeSnapshot()` defaults timestamp to 0 via `toFiniteNumber(payload.timestamp, 0)`.
When the backend returns snapshots with `timestamp: 0` (uninitialized or null), the display 
functions convert `0 * 1000 = 0ms` → `new Date(0)` → `31/12/1969 23:00:00` in fr-FR locale (UTC+1 offset).

**Affected locations**:
1. `formatDate(timestamp)` in `SnapshotsTab` component (line ~1506)
2. `stats.oldestSnapshot` metric display (line ~1607)
3. `stats.newestSnapshot` metric display (line ~1612)
4. Timeline `snapshotTimeline` builder (line ~1265)

**Fix Applied**:
```tsx
// formatDate guard
const formatDate = (timestamp: number): string => {
  if (!timestamp || timestamp <= 0) return 'N/A';
  return new Date(timestamp * 1000).toLocaleString('fr-FR');
};

// Stats display guards
value={stats.oldestSnapshot > 0
  ? new Date(stats.oldestSnapshot * 1000).toLocaleDateString('fr-FR')
  : 'N/A'}

// Timeline filter: skip snapshots with zero timestamp
const snapshotTimeline: TimelineEvent[] = snapshots
  .filter(snapshot => snapshot.timestamp > 0)
  .map(snapshot => ({ ... }));
```

**Result**: Zero epoch dates will now display as 'N/A' instead of '31/12/1969'.

### Issue 2: Source active: degraded (CLASSIFIED — NOT A BUG)

**Status**: Expected behavior on fresh install. The `list_snapshots` IPC call initializes 
the persistence engine and reads from the snapshot storage directory. On a fresh install 
with no snapshots created, or when initialization fails, the catch handler correctly sets 
`snapshotRuntimeSource: 'degraded'`.

**Classification**: `HONEST_DEGRADED_DISCLOSURE` — not a bug. The `SurfaceTruthBadge variant="PARTIAL"` 
correctly labels this surface as partially functional.

**No code change required** for this item.

### Issue 3: "Impossible de charger les snapshots système." Error Message (CLASSIFIED)

**Status**: Correct behavior when `tauriClient.listSnapshots()` throws. Message is displayed 
once and auto-cleared on subsequent successful load. No fix needed.

### Issue 4: Agenda Empty on Fresh Install (CLASSIFIED — EXPECTED)

**Status**: Agenda is empty when no events have been created. The `AgendaEngine` returns empty 
array for `loadAgendaEvents()` on fresh database. No epoch date bug here. 

**Classification**: `EMPTY_INITIAL_STATE` — expected. No fix required.

## Fix Verification

- TypeScript compile: `pnpm tsc --noEmit` → **0 errors**
- Format check: `pnpm run format:check` → **All matched files use Prettier code style!**
- Unit tests `src/__tests__/pages/TimePage.test.tsx`: verified no regression

## Verdict

`TIME_PAGE_EPOCH_DATE_REGRESSION` → **FIXED**  
`TIME_PAGE_DEGRADED_STATE` → **CLASSIFIED as HONEST_DEGRADED_DISCLOSURE**  
`TIME_PAGE_AGENDA_EMPTY` → **CLASSIFIED as EMPTY_INITIAL_STATE**
