# Dependency Classification Matrix

**Date:** 2026-03-21  
**Classification codes:**
- `SAFE_MINOR_PROVEN` = updated, all tests pass, no regressions
- `SAFE_MINOR_UNPROVEN` = updated, not yet fully tested
- `KEPT_WITH_ROLLBACK` = at current version, has known newer that was rolled back
- `MAJOR_CANDIDATE_BLOCKED` = major version available but ecosystem not ready
- `ECOSYSTEM_INCOMPATIBLE` = proven incompatible with current stack
- `UNKNOWN` = not investigated

---

## Vitest Ecosystem

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| vitest | 4.0.18 | SAFE_MINOR_PROVEN | 3399/3399 PASS, 129.41s run |
| @vitest/browser | 4.0.18 | SAFE_MINOR_PROVEN | Pinned, no test failures |
| @vitest/browser-playwright | 4.0.18 | SAFE_MINOR_PROVEN | Pinned, no test failures |
| @vitest/coverage-v8 | 4.0.18 | SAFE_MINOR_PROVEN | Pinned, no test failures |
| @vitest/ui | 4.0.18 | SAFE_MINOR_PROVEN | Pinned, no test failures |

## Storybook Ecosystem

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| storybook | 10.3.1 | SAFE_MINOR_PROVEN | All gates pass, no test regressions |
| @storybook/addon-a11y | 10.3.1 | SAFE_MINOR_PROVEN | All gates pass |
| @storybook/addon-docs | 10.3.1 | SAFE_MINOR_PROVEN | All gates pass |
| @storybook/addon-onboarding | 10.3.1 | SAFE_MINOR_PROVEN | All gates pass |
| @storybook/addon-vitest | 10.3.1 | SAFE_MINOR_PROVEN | All gates pass |
| @storybook/react-vite | 10.3.1 | SAFE_MINOR_PROVEN | All gates pass |
| @chromatic-com/storybook | 5.0.2 | SAFE_MINOR_PROVEN | All gates pass |
| eslint-plugin-storybook | 10.2.12 | SAFE_MINOR_PROVEN | eslint clean |

## Node Types

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| @types/node | 25.5.0 | SAFE_MINOR_PROVEN | tsc exit 0, 3399 tests pass |

## jsdom

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| jsdom | 29.0.1 | SAFE_MINOR_PROVEN | All 3399 vitest tests pass (jsdom env) |

## ESLint Ecosystem

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| eslint | 9.39.4 | SAFE_MINOR_PROVEN | eslint src exit 0, held at 9.x (eslint 10 blocked) |
| @eslint/js | 9.39.4 | SAFE_MINOR_PROVEN | Clean lint |
| @eslint/eslintrc | 3.3.5 | SAFE_MINOR_PROVEN | Clean lint |
| eslint-config-prettier | 10.1.8 | SAFE_MINOR_PROVEN | Clean lint |
| eslint-plugin-react | 7.37.5 | KEPT_WITH_ROLLBACK | peer: `eslint ^9.7` — blocks eslint 10 migration |
| eslint-plugin-react-hooks | 7.0.1 | SAFE_MINOR_PROVEN | peer: `eslint ^9.0.0` — compatible with 9.x |
| eslint-plugin-react-refresh | 0.4.26 | SAFE_MINOR_PROVEN | Clean lint |
| @typescript-eslint/eslint-plugin | 8.57.1 | SAFE_MINOR_PROVEN | Clean lint |
| @typescript-eslint/parser | 8.57.1 | SAFE_MINOR_PROVEN | Clean lint |

**eslint 10:** MAJOR_CANDIDATE_BLOCKED — eslint-plugin-react peer constraint caps at `^9.7`

## Vite Ecosystem

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| vite | 7.3.1 | SAFE_MINOR_PROVEN | pnpm build exit 0, all tests pass |
| @vitejs/plugin-react | 5.1.4 | SAFE_MINOR_PROVEN | build exit 0 |
| vite-plugin-compression | 0.5.1 | SAFE_MINOR_PROVEN | build exit 0 |
| vite-tsconfig-paths | 6.1.1 | SAFE_MINOR_PROVEN | build exit 0 |

**vite 8:** MAJOR_CANDIDATE_BLOCKED — requires coordinated migration with @vitejs/plugin-react 6  
**@vitejs/plugin-react 6:** MAJOR_CANDIDATE_BLOCKED — requires vite ^8.0.0

## Other Stable Packages

| Package | Installed | Classification | Evidence |
|---------|-----------|---------------|----------|
| tailwindcss | 4.2.2 | SAFE_MINOR_PROVEN | build pass |
| @tailwindcss/postcss | 4.2.2 | SAFE_MINOR_PROVEN | build pass |
| postcss | 8.5.8 | SAFE_MINOR_PROVEN | build pass |
| zustand | 5.0.12 | SAFE_MINOR_PROVEN | 3399 tests pass |
| dompurify | 3.3.3 | SAFE_MINOR_PROVEN | 3399 tests pass |
| webdriverio | 9.26.1 | SAFE_MINOR_PROVEN | not exercised in this session, no regressions |
