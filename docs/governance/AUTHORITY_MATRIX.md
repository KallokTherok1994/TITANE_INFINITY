# AUTHORITY MATRIX

## 1. Purpose and scope
This document defines the current authority surfaces for TITANE. It is a governance convergence tool, not a product release seal.

## 2. Truth vocabulary
- Canonical: the primary authority surface for a domain.
- Supporting: secondary surfaces that must align with the canonical surface.
- Competing: surfaces that can confuse authority or imply stronger truth.
- Status: CANONICAL, PARTIAL, COMPETING, DOC_ONLY, UNKNOWN, NEEDS_ALIGNMENT.

## 3. Domain-by-domain authority matrix

### A) Version authority
- Canonical surface: package.json + CHANGELOG.md + release seal files (RELEASE_v*.txt)
- Supporting surfaces: README.md, docs/README.md
- Competing surfaces: none detected
- Status: CANONICAL
- Recommended action: keep aligned to canonical sources

### B) Product state authority
- Canonical surface: sentinel baseline + current worktree truth (proof packs)
- Supporting surfaces: monitoring proof packs
- Competing surfaces: docs that claim runtime truth without proof
- Status: PARTIAL
- Recommended action: keep runtime truth anchored in proof packs

### C) UI truth authority
- Canonical surface: runtime evidence + proof packs
- Supporting surfaces: UI-facing docs
- Competing surfaces: scattered UI claims without proof
- Status: NEEDS_ALIGNMENT
- Recommended action: centralize UI truth in proof-backed surfaces

### D) Memory truth authority
- Canonical surface: runtime evidence + proof packs
- Supporting surfaces: memory docs
- Competing surfaces: implied or duplicated claims
- Status: PARTIAL
- Recommended action: document a single proof-backed memory authority

### E) Provider / routing truth authority
- Canonical surface: routing/proof packs + runtime evidence
- Supporting surfaces: governance docs
- Competing surfaces: UI or docs claiming provider_used without proof
- Status: PARTIAL
- Recommended action: require proof-pack lineage for provider claims

### F) Governance / gates authority
- Canonical surface: proof pack verdicts + governance docs
- Supporting surfaces: README/docs summaries
- Competing surfaces: ad-hoc status notes without proof
- Status: PARTIAL
- Recommended action: keep verdicts tied to proof packs

## 4. Conflict register summary
- UI truth authority: CONFLICT_MAJOR (scattered claims; no single canon)
- Memory truth authority: CONFLICT_MINOR (partial but not explicit)
- Provider/routing authority: CONFLICT_MAJOR (multiple implied sources)
- Governance/gates authority: CONFLICT_MINOR (proof packs vs narrative summaries)
- Version authority: ALREADY_RESOLVED

## 5. What is explicitly NOT authoritative
- Unverified narrative docs or UI strings without proof-pack lineage
- Local workspace dirtiness as truth for version or product state
- Non-proof artifacts or logs without governance linkage

## 6. Patch / alignment rules
- Align docs only when a contradiction is proven.
- Never update product scope from governance alignment.
- Keep authority claims in README/docs subordinate to canonical sources.

## 7. Reopen rules
- Product reopen requires a fresh proven trigger.
- Authority convergence does not reopen product scope.

## 8. Relation to proof packs and verdicts
- Proof packs are the primary evidence chain for runtime truth.
- Verdicts inherit authority from proof packs, not from narrative docs.

## 9. Rollback note
- This matrix can be superseded only by a later convergence cycle or a fresh proven trigger.
