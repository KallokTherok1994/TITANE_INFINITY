# Knowledge Governance Policy — TITANE∞

**Lock:** C2 — Knowledge Governance  
**Date:** 2026-05-06  
**Status:** ACTIVE (T2 bounded — passive governance, no runtime activation required)  
**Doctrine:** Intelligence prouvée avant intelligence proclamée.

---

## 1. Core Principle

TITANE∞ must govern its knowledge base for:

- **Provenance**: where does knowledge come from?
- **Freshness**: is this knowledge still current?
- **Confidence**: how reliable is this knowledge?
- **Allowed-use boundaries**: what can this knowledge be used for?
- **Risk classification**: what harms could arise from misuse?

The governance layer is a **sidecar index** — it never rewrites knowledge content.

---

## 2. Content Mutation Rule

> **Knowledge content in `data/knowledge_base/default/` is NEVER rewritten by governance processes.**

Governance metadata is stored in:

```
data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json
```

This file contains metadata entries that reference content files — not the content itself.

---

## 3. Source Verification Rules

| source_type | Verification requirement |
|---|---|
| `curated` | Internal curation review sufficient |
| `internal` | Internal source, auto-trusted |
| `generated` | Cannot be `validation_status=verified` without explicit human review marker in `notes` |
| `public` | Cannot be `validation_status=verified` without `url` or `last_reviewed` date |
| `unknown` | Cannot have `confidence >= 0.75` (high confidence claim) |

---

## 4. Freshness & Web Validation Policy

| freshness | requires_web_validation policy |
|---|---|
| `stable` | Optional (web validation not required) |
| `time_sensitive` | **REQUIRED** — `requires_web_validation` must be `true` |
| `unknown` | Recommended but not enforced |

Time-sensitive knowledge includes: security threats, legal regulations, financial data, medical guidelines, current events.

---

## 5. High-Risk Domain Boundaries

The following domains are classified as **high-risk** and require explicit `not_allowed_use` declarations:

| Domain | Required `not_allowed_use` examples |
|---|---|
| `legal` | `"definitive_legal_advice"`, `"replace_lawyer"` |
| `medical` | `"diagnosis"`, `"treatment_prescription"`, `"replace_doctor"` |
| `financial` | `"investment_advice"`, `"trading_recommendation"` |
| `safety` | `"definitive_security_certification"`, `"replace_professional_audit"` |

**Rule:** High-risk domain knowledge MUST NOT be presented as definitive professional advice.

---

## 6. Spiritual/Symbolic Domain Policy

> Content in the `spiritual_symbolic` domain is **interpretive, not factual certainty**.

- `validation_status` MUST NOT be `verified` for spiritual_symbolic content
- Acceptable statuses: `curated`, `to_verify`, `unknown`
- Framing requirement: always present as interpretive exploration, not scientific proof

---

## 7. Generated Content Policy

AI-generated content MUST NOT be marked as `validation_status=verified` without:

1. Human review explicitly documented in the `notes` field
2. The word "review" present in the `notes` string

Generated content that has not been reviewed must be `to_verify`, `curated` (if human-reviewed without formal verification), or `unknown`.

---

## 8. Governance Index Schema

See: [`docs/knowledge/KNOWLEDGE_GOVERNANCE_SCHEMA.md`](KNOWLEDGE_GOVERNANCE_SCHEMA.md)

Required fields per entry: `knowledge_id`, `title`, `domain`, `source_type`, `validation_status`, `requires_web_validation`, `risk_level`, `allowed_use`, `not_allowed_use`

---

## 9. Validator

Run governance validation:

```bash
bash scripts/verify/verify_knowledge_governance.sh
```

This checks:
- Index exists and is valid JSON
- All required metadata fields present
- Policy compliance (time_sensitive → web_validation, public verified → evidence, etc.)
- AI-DESKTOP-08 registered in Desktop E2E registry

---

## 10. Rollback Policy

If governance metadata introduces incorrect risk classification:

1. Edit `data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json` — correct the entry
2. Do NOT delete the index — governance must always be present
3. Re-run validator: `bash scripts/verify/verify_knowledge_governance.sh`
4. Append AutoHeal entry documenting the correction
5. Commit targeted fix with message `fix(C2): correct knowledge governance metadata [ROLLBACK]`

Knowledge content in `data/knowledge_base/default/` is never modified by rollback.

---

## 11. Desktop E2E Lane

**AI-DESKTOP-08** — Knowledge governance metadata used  
Status: SCAFFOLDED (pending E0 desktop execution authority)  
Dependency: E0 lock + desktop runtime + real Tauri process

---

## 12. References

- Contract: `src/services/knowledge_governance/KnowledgeGovernanceContract.ts`
- Tests: `src/services/knowledge_governance/__tests__/KnowledgeGovernanceContract.test.ts` (77 tests)
- Index: `data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json`
- Schema: `docs/knowledge/KNOWLEDGE_GOVERNANCE_SCHEMA.md`
- Proof pack: `proof_packs/LOCK_C2_KNOWLEDGE_GOVERNANCE_2026-05-06/`
- AutoHeal: `LOCK_C2_KNOWLEDGE_GOVERNANCE_2026_05_06` in `scripts/autoheal/autoheal_rules.jsonl`
