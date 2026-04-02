# 08 FALSE PASS HARDENING

## Hardening implemented

- N2 path now differentiates:
  - real-answer validation (anchors + anti-generic)
  - degraded-honest validation (explicit degraded semantics)
- UI path now validates assistant-only payload surface and DOM/runtime alignment fallback.
- Forced-offline scenario validated after env propagation fix.

## Residual risk

- Mixed provider/runtime behavior can still produce all-degraded windows in x3, so campaign-B must remain non-sealed unless real-answer evidence is refreshed.
