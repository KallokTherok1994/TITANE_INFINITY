---
description: Use for the hybrid-memory multi-agent program, dispatch orchestration, graph-memory rollout, proof gates, and durable deployment planning
applyTo: 'src/**, src-tauri/**, tests/**, e2e/**, scripts/**, docs/**, .github/**'
---

# Hybrid Memory Dispatch Instructions

## Operating rules

- keep the current semantic and unified memory stack as the production-safe baseline
- do not replace the current behavior in one step
- use shadow write before feature activation
- use shadow read before user-visible exposure
- require feature flags for rollout steps
- require explicit rollback commands and evidence
- update mapping and architecture documentation when structure changes
- require unit, integration, and E2E proof for new user-facing capabilities
- block completion if proofs are missing or contradictory
- prefer the smallest safe patch set

## Mandatory report format

- mission
- scope
- actions
- evidence
- risks
- verdict
- next step
- rollback note

## Mandatory validators

```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_prompt_files_index.sh
```