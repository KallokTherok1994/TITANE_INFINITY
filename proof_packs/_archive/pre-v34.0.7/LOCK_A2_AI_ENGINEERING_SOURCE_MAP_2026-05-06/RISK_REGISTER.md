# RISK_REGISTER — Lock A2

**Lock**: A2  
**Date**: 2026-05-06

## Risks

| risk_id | surface | severity | description | mitigation |
|---------|---------|----------|-------------|------------|
| R1 | Source temporal freshness | LOW | arxiv papers and docs may be superseded by newer research | Note in source map; re-verify at time of lock implementation |
| R2 | URL link rot | LOW | External URLs may become unavailable | All arxiv abstracts are stable; NIST/LangSmith may change | canonical citation (arxiv id) is stable even if URL changes |
| R3 | KEVIN_AXIS scorecard has no external source | LOW | Personal identity evaluation is TITANE-internal; no external research applicable | Acceptable gap; documented explicitly |

## No New Runtime Risks

A2 is T0 docs-only. No runtime code, build artifacts, or operational systems were modified.
