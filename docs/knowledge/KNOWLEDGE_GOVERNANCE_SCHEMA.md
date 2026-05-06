# Knowledge Governance Schema — TITANE∞

**Lock:** C2 — Knowledge Governance  
**Date:** 2026-05-06  
**Schema version:** C2-v1

---

## Index Structure

The governance sidecar index is stored at:

```
data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json
```

Top-level structure:

```json
{
  "schema_version": "C2-v1",
  "generated_at": "<ISO-8601 datetime>",
  "lock": "C2",
  "policy": { ... },
  "entries": [ <KnowledgeItemMetadata[]> ]
}
```

---

## KnowledgeItemMetadata Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `knowledge_id` | string | ✅ | — | Unique identifier |
| `title` | string | ✅ | — | Human-readable title |
| `domain` | KnowledgeDomain | ✅ | — | Domain classification (see below) |
| `version` | string | — | `"1.0"` | Semantic version of this metadata |
| `source_type` | KnowledgeItemSourceType | ✅ | — | Source category |
| `source_ref` | string \| null | — | null | File path, URI, or reference |
| `url` | string \| null | — | null | Source URL (required for public+verified) |
| `last_reviewed` | string \| null | — | null | ISO date of last review |
| `confidence` | number [0..1] | — | 0.5 | Confidence score |
| `freshness` | stable \| time_sensitive \| unknown | — | `"unknown"` | Freshness classification |
| `requires_web_validation` | boolean | — | false | Must be true if `time_sensitive` |
| `risk_level` | low \| medium \| high \| restricted | — | `"low"` | Risk classification |
| `allowed_use` | string[] | — | [] | Explicit allowed use cases |
| `not_allowed_use` | string[] | — | [] | Explicit prohibited use cases (required for high-risk) |
| `validation_status` | KnowledgeValidationStatus | — | `"unknown"` | Verification status |
| `notes` | string \| null | — | null | Free-form governance notes |

---

## Domain Values (KnowledgeDomain)

```
architecture      — Software and system architecture
memory            — Memory subsystems (LTM, STM, graph)
knowledge         — Knowledge governance itself
research          — Research and source validation
provider_routing  — AI provider routing and orchestration
omega             — OMEGA pipeline governance
singularity       — Singularity measurement layer
twin              — Digital twin consent
agents            — Agent effectiveness
instructions      — System instructions
desktop_e2e       — Desktop E2E test surfaces
safety            — Security and safety (HIGH RISK)
legal             — Legal information (HIGH RISK)
medical           — Medical/health information (HIGH RISK, RESTRICTED)
financial         — Financial/trading (HIGH RISK)
spiritual_symbolic— Spiritual and symbolic (INTERPRETIVE ONLY)
business_strategy — Business and strategic planning
unknown           — Unknown or unclassified
```

---

## Source Type Values (KnowledgeItemSourceType)

```
curated    — Manually reviewed and curated by the team
generated  — AI-generated content (requires review before verification)
internal   — Internal system data / service contracts
public     — Public external sources (requires URL/date for verification)
unknown    — Origin unknown or unclassified
```

---

## Validation Status Values (KnowledgeValidationStatus)

```
verified    — Formally verified (requires evidence for public/generated)
curated     — Human-reviewed and curated (trusted but not formally verified)
to_verify   — Needs verification
outdated    — Known to be outdated
rejected    — Explicitly rejected / should not be used
unknown     — Verification status unknown
```

---

## Policy Enforcement Functions (TypeScript)

Exported from `src/services/knowledge_governance/KnowledgeGovernanceContract.ts`:

| Function | C2-UNIT | Description |
|---|---|---|
| `requiresWebValidationForTimeSensitive()` | C2-UNIT-02 | time_sensitive requires web validation |
| `publicSourceCannotBeVerifiedWithoutEvidence()` | C2-UNIT-03 | public+verified needs URL or date |
| `unknownSourceCannotBeHighConfidence()` | C2-UNIT-04 | unknown source max confidence < 0.75 |
| `highRiskDomainRequiresNotAllowedUse()` | C2-UNIT-05 | legal/medical/financial/safety need boundaries |
| `generatedSourceCannotBeVerifiedWithoutReview()` | C2-UNIT-06 | generated needs review marker |
| `spiritualSymbolicIsInterpretive()` | C2-UNIT-07 | spiritual_symbolic cannot be verified |
| `governanceIndexContainsRequiredDomains()` | C2-UNIT-08 | index covers all required domains |

---

## Validator

```bash
bash scripts/verify/verify_knowledge_governance.sh
```

---

## Implementation Reference

- Contract: `src/services/knowledge_governance/KnowledgeGovernanceContract.ts`
- Tests: `src/services/knowledge_governance/__tests__/KnowledgeGovernanceContract.test.ts`
- Index: `data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json`
- Policy: `docs/knowledge/KNOWLEDGE_GOVERNANCE_POLICY.md`
