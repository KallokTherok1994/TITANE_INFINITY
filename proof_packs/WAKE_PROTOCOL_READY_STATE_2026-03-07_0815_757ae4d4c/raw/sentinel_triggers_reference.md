# 03_SENTINEL_TRIGGERS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `trigger policy`

C) RISK: `P1`

D) PLAN (<=7):
1. Define allowed wake triggers.
2. Define forbidden triggers.
3. Attach activation criteria.

E) PROOFS:

Allowed triggers:

| Trigger | Allowed | Activation criterion |
|---|---|---|
| `EXPLICIT_NEW_SCOPE` | Yes | explicit user request for new bounded objective not already closed |
| `PROVEN_DRIFT` | Yes | measurable divergence: tracked drift, untracked nonproof, or baseline contradiction evidence |
| `CRITICAL_EXTERNAL_FAILURE` | Yes | CI non-success or external major contradiction against canonical baseline |

Forbidden triggers:

| Trigger type | Allowed | Why forbidden |
|---|---|---|
| Curiosity / exploratory urge | No | no legitimate entry signal |
| Opportunistic cleanup | No | violates no-action-on-stable rule |
| Repetitive verification without signal | No | unnecessary cycle reopening |
| Intuition without proof | No | non-deterministic and non-canonical |

F) ROLLBACK:
- Policy file only.
