# PROOF PACK — AH-2026-03-18-EVOLUTION-RESULT-ERRORS-NULL

**Date**: 2026-03-18  
**Component**: EvolutionResultPanel  
**File**: src/components/MemoryEvolution/MemoryEvolutionCenter.tsx  
**Verdict**: PASS

---

## Crash Evidence

```
"undefined is not an object (evaluating 'result.errors.length')"
at src/components/MemoryEvolution/MemoryEvolutionCenter.tsx:791:18
component: EvolutionResultPanel
```

## Root Cause

**Category: null-safety failure + lying fallback**

`tauriProtector.createFallbackResponse()` returns a generic  
`{ success: false, error: "...", fallback: true, timestamp: ... }` object  
when Tauri is unavailable. This object lacks an `errors` field.

The `handleAction('full')` path casts this to `EvolutionResult` and calls  
`setLastResult(result)`. When `EvolutionResultPanel` renders, it evaluates  
`result.errors.length` — which throws because `errors` is `undefined`.

Secondary path: `memoryEvolutionStatus()` fallback (matches `includes('status')`)  
returns `{ status: 'offline', ... }` without `last_evolution`, but any partially  
deserialized stored result without `errors` triggers the same crash.

## Contract Analysis

| Source                                      | `errors` field                                     |
| ------------------------------------------- | -------------------------------------------------- |
| Rust `EvolutionResult` struct (backend)     | `errors: Vec<String>` — always present in real IPC |
| `tauriProtector` generic fallback           | **ABSENT** — lying fallback                        |
| TS interface `EvolutionResult` (before fix) | `errors: string[]` — required (wrong)              |
| TS interface `EvolutionResult` (after fix)  | `errors?: string[]` — optional (correct)           |

## Patch Applied (minimal)

```diff
// interface EvolutionResult
-  errors: string[];
+  errors?: string[];

// EvolutionResultPanel render
-  {result.errors.length > 0 && (
+  {(result.errors?.length ?? 0) > 0 && (
     <div className="result-errors">
       <ul>
-        {result.errors.map((err, i) => (
+        {(result.errors ?? []).map((err, i) => (
```

## Proof

- Regression test: `src/components/__tests__/EvolutionResultPanel.errors.test.ts`
- Test result: **4/4 PASS**
  - CRASH CASE: does not throw when errors is undefined ✓
  - renders no errors block when errors is empty array ✓
  - renders errors block when errors has items ✓
  - does not assume missing errors means success ✓
- TypeScript check: **0 errors** in patched file
- G_AH_RECURRENCE_GUARD_PASS: **PASS**
- G_MARKER_VERDICT_UNIQUE: **PASS**
- verify_instructions.sh: **PASS (20/20)**

## Verdict

**PASS** — crash eliminated, regression covered, gates clean, AutoHeal captured.
