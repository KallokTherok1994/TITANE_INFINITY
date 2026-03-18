# XP OUTDATEDNESS ANALYSIS

## 1. Canonical current XP model
File: src/types/experience.ts + src/services/experienceService.ts (v24)
- ExperienceState: { totalXp, level, domains, history, lastUpdated, version }
- Level formula: floor(sqrt(xp / 100)) — QUADRATIC
- History type: ExperienceGain { id, domainId, amount, source, metadata?, timestamp }
- Persistence: Tauri invoke → localStorage fallback

## 2. Old (obsolete) XP model
File: src/core/experience/XP_ENGINE.ts
- XPState: { total, level, history }
- Level formula: floor(1 + total/500) — LINEAR
- History type: XPEvent { source, amount, timestamp, description? }
- Persistence: localStorage key 'xp_state'

## 3. Outdatedness classification
| Type | Description | Fixed? |
|---|---|---|
| SCHEMA_DRIFT | XPState.total vs ExperienceState.totalXp; XPEvent vs ExperienceGain | YES (Experience.tsx now uses canonical) |
| BUSINESS_RULE_DRIFT | Level formula linear(500) vs quadratic(sqrt) used in UI cards | YES (now uses useExperience computations) |
| UI_DRIFT | xpInLevel / 500 hardcoded threshold | YES (now xpInLevel / xpPerLevel with correct formula) |
| SOURCE_MISMATCH | Old engine for global stats, new service for domains | YES (single source now) |
| ROUTE_DRIFT | /xp → /titane instead of /experience | YES (fixed) |

## 4. Files reflecting old XP model (still exist but no longer imported by Experience page)
- src/core/experience/XP_ENGINE.ts — LEGACY, still used by:
  - src/hooks/useChat.ts (gainXP binding — partial, awardExperience also called)
  - NOT touched in this patch (useChat.ts usage is complex, separate concern)
- src/cognitive/progression/xpEngine.ts — THIRD engine using secureInvoke, not connected to Experience page
- src/components/experience/ExpPanel.tsx — uses tauriClient with 4th schema (GlobalExpState), not in Experience route

## 5. XP_BACKEND_INACTIVE: NOT patched (backend fix requires real Rust impl of experience persistence)
