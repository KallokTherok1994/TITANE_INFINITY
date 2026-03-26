# Scope Definition

**Session**: ORCHESTRATOR_FIXES_2026-03-23_1007_641001554
**Date**: 2026-03-23 10:07:34 UTC

---

## Affected Surfaces

### Primary Changes
| File | Type | Change Type | Lines Modified |
|------|------|-------------|----------------|
| `src/services/ai/orchestrator.ts` | SOURCE_CODE | CRITICAL_FIX | 3 targeted patches |
| `scripts/autoheal/autoheal_rules.jsonl` | AUTOHEAL_DATA | NEW_ENTRY | 1 entry added |

### Secondary Impact
- No architectural changes
- No API modifications
- No breaking changes
- Full backward compatibility maintained

---

## Scope Classification

| Surface | Type | In Scope | Reason |
|---------|------|----------|--------|
| `src/services/ai/orchestrator.ts` | CORE_SERVICE | YES | Memory leak fix, timeout adjustments |
| `scripts/autoheal/autoheal_rules.jsonl` | AUTOHEAL_DATA | YES | Full schema compliance required |
| `.clinerules/hooks/**` | GOVERNANCE | INDIRECT | Hooks already active, no changes |
| `src/services/ai/providers/*` | PROVIDERS | NO | No modifications |
| `src/config/aiTimeouts.config.ts` | CONFIG | NO | Using existing centralized config |

---

## Excluded Surfaces

- All provider implementations (titaneLocal, ollama, tauriChat, gemini, etc.)
- Memory services (UnifiedMemoryService, MemoryBridge)
- Cognitive kernel
- UI components
- Test files (except as validation artifacts)

---

## Change Boundaries

**Strict Minimal Patch**: Only 3 lines changed in orchestrator.ts:
1. Line ~148: `clearInterval(this.quickFailCleanupInterval);`
2. Line ~641: `const timeSinceLastUsed = Date.now() - stats.lastUsed;` (threshold 10000 instead of 30000)
3. Line ~1041: `const fallbackTimeout = Math.min(30, STREAM_CONFIG.fallbackTimeoutMs);`

No other modifications permitted.

---

## Rollback Scope

Complete rollback available via:
```bash
git checkout -- src/services/ai/orchestrator.ts
```

Rollback restores pre-fix state with zero side effects.

---

**Scope Status**: DEFINED
**Boundary Compliance**: VERIFIED