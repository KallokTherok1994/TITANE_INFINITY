# TITANE∞ — Glossary

**Status:** DOC_ONLY (canonical term definitions)  
**Date:** 2026-03-17  
**Bilingual lock:** See `GLOSSARY_FR_EN_LOCK.md`

---

## A

**Allowlist**  
A controlled whitelist of Tauri IPC commands that the frontend is permitted to invoke. Located at `src-tauri/allowlist.whitelist.stable.json`. Any command not on the allowlist is blocked at the Tauri layer.

**Architecture 4-Ring**  
The layered architectural model used in TITANE∞. Ring 1 (types, no I/O) → Ring 2 (engines, pure logic) → Ring 3 (services, governed I/O) → Ring 4 (UI + OS/IPC layer). No inverse imports allowed between rings.

**AutoHeal**  
The automated self-healing registry system. Each fix is captured as a JSON entry in `scripts/autoheal/autoheal_rules.jsonl`. The `detect_recurrence.sh` gate verifies no rules have been silently violated.

**Append-only registry**  
A registry file where entries are only added, never deleted or rewritten. Used for governance traceability in `registry/` and `proof_packs/`. See PARTIAL — not all registries are enforced as append-only at the tooling level.

---

## B

**Bilingual parity**  
The requirement that FR and EN documentation maintain structural alignment. No silent semantic divergence is accepted.

---

## C

**Canon / Canonical**  
A document, file, or claim that is the authoritative, trusted source of truth for a given subject. Canonical sources override any contradicting documentation.

**Canonical source of truth**  
The single authoritative source for a given fact (version, architecture claim, gate result). In TITANE∞, `package.json` is the canonical source of the product version.

**Cognitive OS**  
The product framing for TITANE∞ — a desktop application acting as a "cognitive operating system" for AI interactions. See `README.md`. Status: DOC_ONLY (marketing framing).

**Controlled boundary**  
A network or I/O surface that is explicitly governed by the architecture. In TITANE∞, the IPC boundary between frontend and Tauri backend is the primary controlled boundary.

---

## D

**Degraded mode**  
A runtime state where the application operates with reduced capability due to a provider failure, network unavailability, or configuration issue. Mandatory local fallback must activate in degraded mode. Status: PARTIAL.

**DOC_ONLY**  
A status label indicating a claim is documented but has no direct runtime proof in the repository.

---

## E

**E2E (End-to-End test)**  
Tests that exercise the full application stack from UI to backend. TITANE∞ uses Playwright (browser E2E) and WDIO (desktop Tauri E2E). Full E2E is disabled by default (`FULL_E2E_ENABLED=false`).

---

## F

**Fallback**  
See: **Local fallback** / **Degraded mode**.

**4-Ring**  
Short form of Architecture 4-Ring. See Architecture 4-Ring.

---

## G

**Gate**  
A verification script that must pass before a governed action can proceed. Examples: `scripts/verify_instructions.sh`, `scripts/autoheal/detect_recurrence.sh`, `scripts/gates/g1-no-offline-without-reason.sh`.

**Governed**  
A process, network call, or capability that is subject to TITANE∞ governance rules (gates, proof requirements, IPC contracts).

**Governance**  
The set of rules, gates, proof disciplines, and documentation standards that govern how TITANE∞ is developed, released, and operated.

---

## H

**Honest fallback**  
A fallback that accurately reports its degraded state to the user, rather than silently presenting a fake success response. Required by the IPC contract.

---

## I

**IPC (Inter-Process Communication)**  
The communication channel between the React frontend and the Rust Tauri backend. IPC payloads must follow the contract: `{ ok: boolean, content?: string, error?: {...} }`.

**IPC contract**  
The formal specification of the IPC payload format. Defined in `docs/IPC_CONTRACT.md`. Key rule: no silent failures, no lying responses.

---

## L

**Legacy doc**  
A documentation file that is no longer current but is kept for historical traceability. Legacy docs must have a banner indicating their status and pointing to the current canonical doc.

**Local fallback**  
A fallback behavior activated when online providers are unavailable. Required by the online-first governed policy. See: **Degraded mode**.

---

## O

**OMEGA v2 pipeline**  
The AI processing pipeline in TITANE∞. 10-stage pipeline processing user messages through context, provider selection, and response generation. Defined in `docs/OMEGA_v2_SPEC.md`. Status: PARTIAL.

**Online-first governed**  
The network policy doctrine for TITANE∞. The application assumes and requires network connectivity for primary AI provider operations. A mandatory local fallback must be available. The "local-first" label in some files is a compatibility marker only — it does not mean the product is local-first in practice.

---

## P

**PLANNED**  
A status label indicating a feature or behavior that is documented as future intent but is not currently implemented.

**Proof-driven**  
The development posture requiring that claims be supported by verifiable evidence before being declared PASS or complete.

**Proof pack**  
A directory under `proof_packs/` containing artifacts (VERDICT.md, ROLLBACK.md, gate outputs) that prove a governed session was completed correctly.

**PROVEN**  
A status label indicating a claim is directly verifiable in the repository.

---

## R

**Ring**  
See: **Architecture 4-Ring**.

**Rollback**  
An explicit set of `git restore` commands that can undo a given change. Required for every governed session.

**Runtime-proven**  
A claim or behavior that has been verified in actual execution (not just code review or documentation). Distinct from DOC_ONLY.

---

## S

**Stop-the-line**  
A governance rule requiring that work stop immediately when a critical gate fails, an invariant is violated, or a contradiction is unresolved.

---

## T

**Tauri-only**  
The production runtime constraint: TITANE∞ is a Tauri desktop application. No web server, no Electron, no direct HTTP frontend. All I/O goes through Tauri IPC.

**Truth model**  
The documentation policy in TITANE∞ requiring that every claim be classified by its proof status (PROVEN, PARTIAL, DOC_ONLY, etc.) and that contradictions be named explicitly.

---

## U

**User-facing**  
A feature, behavior, or document intended for end users (not developers or maintainers).

---

## V

**Version authority**  
The canonical source determining the current product version. In TITANE∞: `package.json`.

---

*Generated: 2026-03-17 | See also: `GLOSSARY_FR_EN_LOCK.md` for bilingual term mapping*
