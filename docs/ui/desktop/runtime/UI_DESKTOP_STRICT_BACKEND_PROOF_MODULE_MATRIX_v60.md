# UI Desktop Strict Backend Proof — Module Matrix v60

**Date**: 2026-05-10

## Tier 1 — Core (uiEvidence required)

| Module | Route | Proof Level | Spec |
|---|---|---|---|
| TITANE_CHAT | `/titane` | `UI_REFLECTS_BACKEND_RESULT` | core |
| TIME | `/time` | `UI_REFLECTS_BACKEND_RESULT` | core |
| MEMORY | `/memory` | `UI_REFLECTS_BACKEND_RESULT` | core |
| ADMIN_SYSTEM | `/admin` | `UI_REFLECTS_BACKEND_RESULT` | admin-dev |
| ADMIN_CONFIG | `/admin` | `UI_REFLECTS_BACKEND_RESULT` | admin-dev |
| DEV_COCKPIT | `/dev` | `UI_REFLECTS_BACKEND_RESULT` | admin-dev |
| DOC_CENTER | `/doc-center` | `UI_REFLECTS_BACKEND_RESULT` | utility |
| AGENT_CHAT | `/admin` | `PROOF_DEPTH_BLOCKED_BY_RUNTIME` | agent-chat |
| CHAT_CONTEXT | `/titane` | `UI_REFLECTS_BACKEND_RESULT` | agent-chat |
| AGENT_CONTEXT | `/memory` | `UI_REFLECTS_BACKEND_RESULT` | agent-chat |

## Tier 2 — Secondary (IPC_RESPONSE_PROVEN min)

| Module | Route | Proof Level | Spec |
|---|---|---|---|
| EXPERIENCE | `/experience` | `PROOF_DEPTH_BLOCKED_BY_RUNTIME` | core |
| RESEARCH | `/research` | `PROOF_DEPTH_GUARDED_ONLY` | core |
| CLOUD | `/cloud` | `PROOF_DEPTH_GUARDED_ONLY` | core |
| PERFORMANCE | `/performance` | `UI_REFLECTS_BACKEND_RESULT` | utility |
| SKILLS | `/skills` | `PROOF_DEPTH_GUARDED_ONLY` | utility |
| KNOWLEDGE | `/knowledge` | `PROOF_DEPTH_GUARDED_ONLY` | utility |
| CREATION | `/creation` | `PROOF_DEPTH_GUARDED_ONLY` | utility |
| EVOLUTION | `/evolution` | `PROOF_DEPTH_GUARDED_ONLY` | utility |
| TWINS | `/twins` | `PROOF_DEPTH_GUARDED_ONLY` | utility |
| FUSION | `/fusion` | `PROOF_DEPTH_GUARDED_ONLY` | utility |

## Tier 3 — Infrastructure (DISPLAY_ONLY_CONFIRMED accepted)

| Module | Route | Proof Level | Spec |
|---|---|---|---|
| ORCHESTRATION_CENTER | `/orchestration-center` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | agent-chat |
| ORCHESTRATION_INTELLIGENCE | `/orchestration-intelligence` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | agent-chat |
| SELFHEAL | `/selfheal` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | sandbox |
| ADAPTIVE | `/adaptive` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | sandbox |
| SINGULARITY | `/singularity` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | sandbox |
| SENTINEL | `/sentinel` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | sandbox |
| WATCHDOG | `/watchdog` | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | sandbox |

## Sandboxed Mutations

| Module | Route | Proof Level |
|---|---|---|
| ADMIN_SYSTEM | `/admin` | `SANDBOXED_MUTATION_PROVEN` |
| MEMORY | `/memory` | `SANDBOXED_MUTATION_PROVEN` |
| TIME | `/time` | `SANDBOXED_MUTATION_PROVEN` |
| DOC_CENTER | `/doc-center` | `SANDBOXED_MUTATION_PROVEN` |
| CLOUD | `/cloud` | `SANDBOXED_MUTATION_PROVEN` |
