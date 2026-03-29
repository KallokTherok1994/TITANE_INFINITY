# 11 — Anti-Lie Results

## Anti-Lie Tests Analyzed

### Test 1: online-availability.test.ts
**Status**: ✅ PASS
**Coverage**:
- Invariant 1: mode=REMOTE → network_used=true
- Invariant 2: provider_used=local_only → mode≠REMOTE
- Invariant 3: fallback → reason_code≠OK/UNKNOWN
- Invariant 4: providerUsed always defined

### Test 2: provider-decision-invariants.test.ts
**Status**: ✅ PASS
**Coverage**:
- validateProviderDecisionMeta() correctly validates invariants
- clampProviderDecisionMeta() correctly corrects violations
- No lying violations detected

### Test 3: chat.test.ts (Provider Truth Chain)
**Status**: ✅ PASS
**Coverage**:
- RP1: meta.provider_used used as truth when differs from legacy provider
- RP2: ollama propagated as actual provider when meta.provider_used=ollama
- RP3: default provider when no meta
- RP4: preferred=ollama but backend used gemini → metadata.provider_used=gemini

## Anti-Lie Violations Detected
**NONE**

## Label Classification Summary
| Label | Classification | Status |
|-------|---------------|--------|
| Provider badge | PROVEN_VISIBLE | ✅ |
| Mismatch indicator | PROVEN_VISIBLE | ✅ |
| Title tooltip | PROVEN_VISIBLE | ✅ |
| ARIA label | PROVEN_VISIBLE | ✅ |

## Status
**CERTIFIED** ✅