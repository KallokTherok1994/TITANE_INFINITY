# 12_DUPLICATION_FUSION_MATRIX

| Candidate | Observation | Fusion decision | Reason |
|---|---|---|---|
| README root vs docs/README | overlapping install/build guidance | NO MERGE | different authority levels and audiences |
| Browser vs desktop test docs/proofs | partial overlaps in narrative | NO MERGE | would mask harness separation truth |
| recent proof packs around TOTAL_DEV | multiple adjacent packs | NO MERGE | each captures a distinct gate state/history |
| token/build command snippets | one stale command found | PATCH ONLY | safer than structural merge |

Result:

- no destructive fusion performed
- only anti-drift wording/command alignment applied
