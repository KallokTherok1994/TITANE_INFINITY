# CROSS_RUN_MONOTONIC — P1.13a

## Proof of cross-run state accumulation

`persistent_memory_v19` persists entries to disk. Each run writes a new `long_term` entry. The next run reads the accumulated state.

## Evidence

| Run | pre_long_term | post_long_term | delta | total_count |
|-----|---------------|----------------|-------|-------------|
| 1   | 0             | 1              | +1    | 87          |
| 2   | 1             | 2              | +1    | 88          |
| 3   | 2             | 3              | +1    | 89          |

## Interpretation

- `pre_long_term` at Run N equals `post_long_term` at Run N-1: CONFIRMED
  - Run 2 pre (1) === Run 1 post (1) ✓
  - Run 3 pre (2) === Run 2 post (2) ✓
- `total_count` increases by 1 per run: CONFIRMED
  - 87 → 88 → 89 (+1 per run) ✓

## File path

Encrypted long_term entries file:
`~/.local/share/titane-infinity/persistent_memory/long_term/entries.json`

The file persists across runs (not wiped by app restart), demonstrating true LTM behavior.

## Intermediate entries (86 — pre-existing)

The 86 intermediate entries were present before P1.13a runs. They represent accumulated prior session data. Not modified by this proof cycle.

## Combined accumulation after P1.13a X3 runs

- long_term: 3 entries (all from P1.13a proof runs)
- intermediate: 86 entries (pre-existing)
- session_cache: 0 (ephemeral, cleared on restart)
- total readable at `persistent_memory_read`: 89
