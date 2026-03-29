# DEFERRED ITEMS

## 1. Shell Thinning (SHELL_OVERWEIGHT_CONFIRMED)

**Status**: DEFERRED
**Reason**: App.tsx overload is real but not causally linked to the current lock (version drift). Proposing shell thinning without runtime proof of which "Centers" are actually used in production would violate the NO_FAKE_LIGHTENING rule.
**Next Action**: Run runtime usage tracking on lazy-loaded modules to determine which are actually invoked by users.
**Estimated Effort**: 2-4 hours (instrumentation + analysis)

## 2. Labs Module Certification

**Status**: DEFERRED
**Reason**: Each Labs module (Reality, Hyper, Quantum, Identity, Memory Evolution, Cloud, Orchestration Intelligence, Perfect Fusion, Ultimate Optimization) requires individual runtime proof before being classified as Core or demoted.
**Next Action**: For each Labs module, determine: Is it accessible via navigation? Is it invoked by users? Does it have tests? Does it affect the chat core?
**Estimated Effort**: 4-8 hours (per-module audit)

## 3. Dependency Triage Completion

**Status**: DEFERRED
**Reason**: Several dependencies have UNKNOWN usage status (tantivy, ndarray, rustfft, ed25519-dalek, instant-distance, @xenova/transformers, better-sqlite3, recharts). Requires `pnpm why` and `cargo tree` execution to determine real usage.
**Next Action**: Run dependency analysis commands and update the triage matrix.
**Estimated Effort**: 1-2 hours

## 4. CI Workflow Gate Hardening

**Status**: DEFERRED
**Reason**: 33+ CI workflows exist but their actual blocking status is unknown. Need to determine which are real blockers vs decorative.
**Next Action**: For each workflow, check: Does it run on PR? Does it block merge? Does it cover version authority drift?
**Estimated Effort**: 2-3 hours

## 5. Version Header Validator (Non-Recurrence)

**Status**: RECOMMENDED
**Reason**: To prevent future version drift, add a validator that checks version headers across core files match package.json version.
**Next Action**: Create a script (e.g., scripts/verify/verify_version_headers.sh) that greps for version strings in core files and compares to package.json.
**Estimated Effort**: 30 minutes