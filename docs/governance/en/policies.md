# TITANE∞ — Policies (EN)

**Version:** 28.0.0  
**Status:** QUALIFIED  
**Date:** 2026-03-17

---

## Policy 1 — No-fiction (C2)

**Rule:** Never state that a feature is stable, complete, production-ready, self-healing, synced, secure, automated, or validated without direct proof in the repository.

**Mandatory statuses:** PROVEN | QUALIFIED | PARTIAL | BLOCKED | LEGACY | DOC_ONLY | PLANNED

**Applies to:** All documentation.

---

## Policy 2 — Repo Truth First (C3)

**Rule:** Documentation must follow the actual repository state. If docs, code, configs, scripts, or proof packs contradict: detect, name, classify, resolve, or mark BLOCKED.

**Applies to:** README, docs/, proof_packs/, scripts/.

---

## Policy 3 — Tauri-only runtime (Rule 4)

**Rule:** Production runtime is Tauri-only. No web server, Electron, or direct HTTP frontend access.

**Gate:** `pnpm run verify:tauri-only`  
**Status:** PROVEN

---

## Policy 4 — One Door network (Rule 5)

**Rule:** Allowed network path only: UI → canonical IPC → Services → Network Gateway → External. No direct network access from UI.

**Gate:** `pnpm run verify:network-guard`, `pnpm run verify:online-first`  
**Status:** QUALIFIED

---

## Policy 5 — IPC contract (Rule 6)

**Rule:** IPC payload contract is mandatory: `{ ok, content, error }`. Zero silent failure. No lying fallback.

**Source:** `docs/IPC_CONTRACT.md`  
**Status:** PROVEN

---

## Policy 6 — Online-first governed with mandatory local fallback (Rule 7)

**Rule:** Online-first governed policy is active. Local fallback is mandatory and operational.

**Note:** The "local-first" label in some files is a compatibility marker only.  
**Status:** QUALIFIED (local fallback: PARTIAL)

---

## Policy 7 — Stop-the-line (Rule 8)

**Rule:** Mandatory stop-the-line on: invariant violation, mandatory gate FAIL, unresolved contradiction, or missing proof.

**Main gate:** `bash scripts/verify_instructions.sh`  
**Status:** PROVEN

---

## Policy 8 — NO_SKIPS (Rule 9)

**Rule:** Required checks cannot be skipped by narrative. If a check cannot run, classify BLOCKED with a next action ≤ 30 minutes.

**Status:** PROVEN by rule

---

## Policy 9 — Mandatory AutoHeal capture (Rule 10)

**Rule:** For each fix, append an entry to `scripts/autoheal/autoheal_rules.jsonl`. Then run `detect_recurrence.sh` and `verify_instructions.sh`.

**Requirement:** `prevention_test` must contain `detect_recurrence`  
**Status:** PROVEN

---

## Policy 10 — Production builds on demand (Rule 11)

**Rule:** Production builds and deploys are executed on user request or when needed. No token gate required. Use `BUILD ALL` command (Rule 14) for the full automated build and deploy sequence.

**Status:** PROVEN by rule

---

## Policy 11 — Proof pack and rollback (Rule 12)

**Rule:** Each governed session must produce evidence in `proof_packs/` and `reports/`. Mandatory: gate report, rollback plan, and unique final verdict.

**Status:** PROVEN (proof packs present in repository)

---

## Policy 12 — No blind deletion of docs (C8)

**Rule:** Legacy docs must be: kept, redirected, archived, or explicitly marked obsolete with pointers.

**Status:** PROVEN by convention

---

*French documentation: [docs/governance/fr/politiques.md](../fr/politiques.md)*
