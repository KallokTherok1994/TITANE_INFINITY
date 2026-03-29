# 10 — Visible Label Truth Proof

## Label Classification Summary

| Label | Classification | Status |
|-------|---------------|--------|
| Provider badge (providerUsed) | PROVEN_VISIBLE | ✅ |
| Mismatch indicator (⚠) | PROVEN_VISIBLE | ✅ |
| Fallback indicator (fallback_used) | PROVEN_TRACE_ONLY | ✅ |
| Memory status (persistentMemoryStatus) | PROVEN_TRACE_ONLY | ✅ |
| Memory recall IDs (memory_recall_ids) | PROVEN_TRACE_ONLY | ✅ |
| Degraded mode (mode in meta) | PROVEN_TRACE_ONLY | ✅ |
| Reason code (reason_code in meta) | PROVEN_TRACE_ONLY | ✅ |

## Evidence
- **Provider badge**: Visible in `MessageBubble.tsx`, shows actual provider
- **Mismatch indicator**: Visible when provider differs from request
- **Fallback indicator**: Available in metadata, not visible in UI
- **Memory status**: Available in metadata, not visible in UI
- **Memory recall IDs**: Available in metadata, not visible in UI
- **Degraded mode**: Available in meta, not visible in UI
- **Reason code**: Available in meta, not visible in UI

## Analysis
Runtime truth is correctly propagated through the chain. Some fields are visible (provider badge), others are trace-only (memory status, fallback status, degraded mode). This is a design decision, not a contract violation.

## Status
**CERTIFIED** ✅