# MEMORY SEAL SPEC

## 1. Purpose and scope
Define the exact behavioral standard for conversational memory consumption on the active target. This is a governance convergence artifact, not a release seal.

## 2. Memory truth standard
A memory is only real if it crosses:
write → persist → recall → inject → consume → answer.

Stored ≠ consumed. Recalled ≠ consumed. Injected ≠ consumed.

## 3. Active target
- Canonical target: Tauri desktop runtime with Rust backend (`memory_os` + `unified_memory_v2`).
- Proof must be executed on the active target, not by doc inference.

## 4. Chain map (current known wiring)
| Stage | Canonical owner | Current surface/path | Status | Proof |
| --- | --- | --- | --- | --- |
| WRITE | Frontend memory writers | `chatMemoryCompactor` / `UnifiedMemory.add()` | WIRED_BUT_UNPROVEN | Memory authority map (QUALIFIED) |
| PERSIST | Rust backend | `src-tauri/src/memory_os/`, `src-tauri/src/unified_memory_v2/` | WIRED_BUT_UNPROVEN | Memory authority map (QUALIFIED) |
| RECALL | Frontend memory read | `UnifiedMemory.search()` | WIRED_BUT_UNPROVEN | Memory authority map (QUALIFIED) |
| INJECT | Context formatter | `chatMemorySingleDoor.formatContextEnvelopeForSystemPrompt()` | WIRED_BUT_UNPROVEN | Memory authority map (QUALIFIED) |
| CONSUME | Active model | LLM consumes injected prompt | UNKNOWN | Requires behavioral proof |
| ANSWER | Output change | Response uses improbable fact | UNKNOWN | Requires behavioral proof |

## 5. Anti-false-positive rules
- Use an improbable token not present elsewhere (e.g., `NEBULA-DELTA-7429`).
- Clear short-term context between write and test (restart app/session).
- Ask a retrieval question that cannot be answered without memory.
- Require the exact token in the final answer.
- Disallow fallback via recent prompt or visible UI state.

## 6. Critical scenario design (single primary)
1. Write: store `NEBULA-DELTA-7429` as a user-specific memory (explicit “remember this”).
2. Persist: close session or restart app to drop short-term context.
3. Recall: ask “What is my secret token?” with no other cues.
4. Inject: confirm memory envelope injection (log or trace if available).
5. Consume: model uses the token in its answer.
6. Answer: response includes exact token; no guessing.

## 7. Breakpoint vocabulary
- BREAK_AT_WRITE / PERSIST / RECALL / INJECT / CONSUME / ANSWER
- TARGET_MISMATCH / FALSE_POSITIVE_RISK / UNKNOWN

## 8. Minimal fix rules
- Only bounded fixes inside the active proof path.
- No architecture-wide memory refactor.
- No provider/router redesign.
- Rollback must be trivial.

## 9. Reopen rule
- Any fix requiring memory engine redesign triggers triage.

## 10. Rollback rule
- Revert this doc with: `git restore -- docs/governance/MEMORY_SEAL_SPEC.md`
- Supersession only via a new bounded memory cycle or deeper runtime proof lane.
