# 03 — Do-Not-Touch Surfaces

## PROTECTED SURFACES

Even though no optimization will be attempted (system not in TERMINAL_REFINEMENT), the following surfaces must remain untouched until blocking issues are resolved.

| Surface | Why Protected | Risk of Reopening | Evidence Required to Reopen |
|---------|---------------|-------------------|----------------------------|
| `src-tauri/src/conversation_engine/commands.rs` | Just patched by LOCK_SURGEON (AV-01 fix). Needs post-patch evaluation before any further changes. | Could reintroduce AV-01 or create new anti-lie violations. | Full X3 evaluation confirming AV-01 still PASS and no new violations. |
| `evals/harness/antiLie.ts` | Anti-lie detection logic (AV-01 to AV-08). Changing it would mask violations rather than fix them. | Would weaken truth enforcement, allowing false PASS verdicts. | Proof that any change improves detection accuracy, not just changes thresholds. |
| `evals/harness/gates.ts` | Gate evaluation logic. Changing it would weaken promotion discipline. | Would allow promotion without meeting all blocking gates. | Proof that gate logic change is constitutionally justified. |
| `config/championChallenger.json` | Champion baseline v28.0.0. Changing it would invalidate all comparisons. | Would reset the reference point, making all prior evaluations meaningless. | Explicit champion version bump with full re-evaluation. |
| All existing proof packs | Historical evidence of system state. Must not be modified. | Would corrupt the audit trail. | Never — proof packs are append-only by definition. |
| `evals/harness/gates.ts` gate definitions | Promotion gate logic. Changing gate definitions would weaken quality enforcement. | Would allow promotion without meeting constitutional requirements. | Constitutional amendment with explicit justification. |

## ADDITIONAL PROTECTED SURFACES (from deferred items)

| Surface | Why Protected | Deferred Until |
|---------|---------------|----------------|
| `src/App.tsx` | Shell overweight confirmed but deferred. Thinning requires runtime usage data. | Runtime proof of which Centers/routes are actually used. |
| `package.json` dependencies | Dependency triage deferred. Requires pnpm why + cargo tree. | Usage analysis per dependency. |
| `.github/workflows/` | CI gate hardening deferred. Requires per-workflow validation. | Per-workflow blocking status verification. |

## CONSTITUTIONAL BASIS

Per the task instructions:
- "No terminal refinement may quietly touch protected surfaces"
- "No optimization that weakens truth labels"
- "No optimization that reintroduces authority drift"
- "No optimization that hides fallback or memory uncertainty"
- "No optimization that harms rollback clarity"