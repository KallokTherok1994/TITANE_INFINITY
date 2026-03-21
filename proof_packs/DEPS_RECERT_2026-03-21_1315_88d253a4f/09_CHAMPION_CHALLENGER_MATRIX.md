# Champion / Challenger Matrix

**Date:** 2026-03-21  
**Decision:** CHAMPION RETAINED

---

## Champion: Current Stable Baseline

| Package | Champion Version | Status |
|---------|-----------------|--------|
| eslint | 9.39.4 | PROVEN STABLE |
| @eslint/js | 9.39.4 | PROVEN STABLE |
| vite | 7.3.1 | PROVEN STABLE |
| @vitejs/plugin-react | 5.1.4 | PROVEN STABLE |
| vitest | 4.0.18 | PROVEN STABLE |
| jsdom | 29.0.1 | PROVEN STABLE |
| storybook | 10.3.1 | PROVEN STABLE |
| @types/node | 25.5.0 | PROVEN STABLE |

**Champion proof:** 3399/3399 vitest tests PASS, tsc PASS, eslint PASS, build PASS, verify_instructions PASS=20 FAIL=0, detect_recurrence PASS

---

## Challengers Evaluated

### Challenger 1: eslint 10.x

| Attribute | Value |
|-----------|-------|
| Challenger version | 10.x (latest not pinned) |
| Champion version | 9.39.4 |
| Test result | NOT ATTEMPTED (ecosystem incompatibility pre-confirmed) |
| Peer conflict | eslint-plugin-react: `^9.7` max |
| Decision | MAJOR_CANDIDATE_BLOCKED |

### Challenger 2: vite 8.0.1

| Attribute | Value |
|-----------|-------|
| Challenger version | 8.0.1 |
| Champion version | 7.3.1 |
| Test result | NOT ATTEMPTED (requires coordinated migration) |
| Dependency conflict | @vitejs/plugin-react 5.x requires vite ^7 |
| Decision | MAJOR_CANDIDATE_BLOCKED |

### Challenger 3: @vitejs/plugin-react 6.0.1

| Attribute | Value |
|-----------|-------|
| Challenger version | 6.0.1 |
| Champion version | 5.1.4 |
| Test result | NOT ATTEMPTED (requires vite 8 + new deps) |
| Dependency conflict | Requires vite ^8.0.0 + @rolldown/plugin-babel + babel-plugin-react-compiler |
| Decision | MAJOR_CANDIDATE_BLOCKED |

---

## Rationale

All three major migration candidates are blocked by ecosystem peer dependency constraints. Attempting any of them individually would create broken peer states. A coordinated migration plan (vite 8 + plugin-react 6 as one sprint, eslint 10 as separate sprint when plugin-react publishes support) is the correct approach for the future.

**Champion retained with full proof. No regression introduced.**
