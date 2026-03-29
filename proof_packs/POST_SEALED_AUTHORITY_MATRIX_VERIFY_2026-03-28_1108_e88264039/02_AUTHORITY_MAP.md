# Authority Map

| Domain | Canonical surface | Supporting surfaces | Competing surfaces | Status | Recommended action |
| --- | --- | --- | --- | --- | --- |
| Version authority | package.json + CHANGELOG.md + RELEASE_v*.txt | README.md, docs/README.md | none detected | CANONICAL | Keep aligned to canonical sources |
| Product state authority | Sentinel baseline + current worktree truth (proof packs) | Monitoring proof packs | Narrative docs without proof | PARTIAL | Anchor runtime truth in proof packs |
| UI truth authority | Runtime evidence + proof packs | UI docs | Scattered UI claims | NEEDS_ALIGNMENT | Centralize UI truth in proof-backed surfaces |
| Memory truth authority | Runtime evidence + proof packs | Memory docs | Implied/duplicated claims | PARTIAL | Maintain single proof-backed authority |
| Provider/routing truth | Routing proof packs + runtime evidence | Governance docs | UI/docs claims without proof | PARTIAL | Require proof-pack lineage for claims |
| Governance/gates authority | Proof pack verdicts + governance docs | README/docs summaries | Ad-hoc status notes | PARTIAL | Keep verdicts tied to proof packs |
