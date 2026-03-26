# 04_AUTHORITY_HIERARCHY

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `authority ranking and conflict resolution`

C) RISK: `P1`

D) PLAN (<=7):
1. Rank sources by authority.
2. Compute winners and conflicts.
3. Reject authority inversions.

E) PROOFS:
- Inputs: `03_DOCTRINE_SOURCE_MAP.md` + `raw/source__*.md` + `raw/source__*.sh` + `raw/source__*.js`

Authority levels applied:
1. Constitution/canonical instruction explicit.
2. Repo governance authoritative docs.
3. Blocking validator/cert script behavior.
4. Automated convention.
5. Historical practice.
6. Technical tolerance.
7. Absence of blocking.

AUTHORITY_WINNERS:
1. Kernel + docs-registry define mandatory proof existence, append-only discipline, no-delete.
2. `lib_cert.sh` proves untracked proof packs are explicitly tolerated in clean-tree precheck.
3. No higher authority explicitly imposes TRACK_ALL for `proof_packs/`.

AUTHORITY_CONFLICTS:
1. Historical mix (tracked and untracked) conflicts at practice level only, not at higher doctrine level.
2. `run-p10-desktop-cert.sh` commit behavior is scoped to `deployment/latest/certification/phase10/`, not a global `proof_packs/` tracking law.
3. `.gitignore` silence on `proof_packs/` creates UX noise, not doctrine.

Why lower signals are limited:
- Historical practice cannot override explicit canonical instructions.
- Script permissiveness alone cannot define TRACK_ALL obligation.

F) ROLLBACK:
- No mutation; hierarchy analysis only.
