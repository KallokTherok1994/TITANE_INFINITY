# Lock C2 — Knowledge Governance — Audit

See full audit report at: `reports/knowledge_governance_audit.md`

## Summary

- Knowledge surfaces inspected: 277 files in `data/knowledge_base/default/`
- Governance index: `data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json`
- Index entries: 8 seed entries covering all 8 required domains
- Domains covered: architecture, memory, knowledge, safety, legal, medical, financial, spiritual_symbolic

## Verification Status

| Status | Count |
|---|---|
| verified | 0 |
| curated | 4 (kb-arch-001, kb-mem-001, kb-know-001, kb-spirit-001) |
| to_verify | 4 (kb-safety-001, kb-legal-001, kb-med-001, kb-fin-001) |
| rejected / outdated / unknown | 0 |

## High-Risk Domain Compliance

| Entry | Domain | not_allowed_use | requires_web_validation | Compliant |
|---|---|---|---|---|
| kb-safety-001 | safety | ✓ | ✓ | YES |
| kb-legal-001 | legal | ✓ | ✓ | YES |
| kb-med-001 | medical | ✓ | ✓ | YES |
| kb-fin-001 | financial | ✓ | ✓ | YES |

## Spiritual/Symbolic Compliance

| Entry | Domain | validation_status | Compliant |
|---|---|---|---|
| kb-spirit-001 | spiritual_symbolic | curated | YES (not verified) |

## Generated Content

None in current seed entries.

## Known Limitations

- Seed entries cover structural domains only; no inline content metadata exists yet.
- `to_verify` entries (4 high-risk) require manual review and web validation before any LLM use as authoritative source.
- C3 Research Provenance lock will extend this sidecar with source-level provenance chains.
