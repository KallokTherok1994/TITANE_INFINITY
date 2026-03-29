# Authority Map

A) VERSION AUTHORITY
- Canonical: package.json + CHANGELOG.md + RELEASE_v*.txt
- Supporting: README.md, docs/README.md
- Competing: none
- Status: CANONICAL
- Recommended action: maintain alignment

B) PRODUCT STATE AUTHORITY
- Canonical: sentinel baseline + proof packs
- Supporting: current worktree truth
- Competing: docs claiming runtime truth without proof
- Status: PARTIAL
- Recommended action: keep proof-pack lineage explicit

C) UI TRUTH AUTHORITY
- Canonical: runtime evidence + proof packs
- Supporting: UI docs
- Competing: scattered UI claims
- Status: NEEDS_ALIGNMENT
- Recommended action: consolidate UI truth claims

D) MEMORY TRUTH AUTHORITY
- Canonical: runtime evidence + proof packs
- Supporting: memory docs
- Competing: implied claims
- Status: PARTIAL
- Recommended action: define one proof-backed authority

E) PROVIDER / ROUTING TRUTH AUTHORITY
- Canonical: routing proof packs + runtime evidence
- Supporting: governance docs
- Competing: UI or docs claiming provider_used without proof
- Status: PARTIAL
- Recommended action: enforce proof-pack lineage

F) GOVERNANCE / GATES AUTHORITY
- Canonical: proof pack verdicts + governance docs
- Supporting: README/docs summaries
- Competing: ad-hoc status notes
- Status: PARTIAL
- Recommended action: keep verdicts bound to proof packs
