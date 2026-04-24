# Test Plan

**Date:** 2026-02-07  
**Frameworks:** Vitest 4.0.18, Playwright 1.58.1

## Test Commands
```bash
pnpm run test              # Unit tests
pnpm run test:coverage     # Coverage report
pnpm run test:e2e          # Playwright E2E
pnpm run test:rust         # Backend tests
pnpm run test:architecture # 4-ring tests
pnpm run test:all          # Full suite
```

## Test Structure
- `src/__tests__/` - Unit/integration
- `src/__tests__/architecture/` - Ring isolation
- `src/__tests__/compliance/` - TITANE compliance
- `e2e/` - Playwright scenarios (3 OMEGA v2)

## Coverage Targets
- Unit: 80%+ statement coverage
- E2E: 3 critical flows (OMEGA v2)
- Architecture: 4-ring isolation validated

## Test Categories
1. **Architecture** - Ring isolation (Ring 1 = 0 imports)
2. **Compliance** - Tauri-only, secureInvoke, local-first
3. **OMEGA** - conversation_generate v2 usage
4. **Component** - UI behavior tests
5. **E2E** - End-to-end user flows

**Proof:** See package.json scripts, vitest.config.ts, playwright.config.ts
