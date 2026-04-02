# 06 — CHAMPION vs CHALLENGER MATRIX

## Champion Stack (Current — RETAINED)

| Component | Version | Status |
|-----------|---------|--------|
| vite | 7.3.1 | ✅ CHAMPION — RETAINED |
| @vitejs/plugin-react | 5.1.4 | ✅ CHAMPION — RETAINED |
| vitest | 4.0.18 | ✅ CHAMPION — RETAINED |
| @vitest/browser | 4.0.18 | ✅ CHAMPION |
| @vitest/coverage-v8 | 4.0.18 | ✅ CHAMPION |
| @vitest/ui | 4.0.18 | ✅ CHAMPION |
| @vitest/browser-playwright | 4.0.18 | ✅ CHAMPION |
| storybook | 10.3.1 | ✅ CHAMPION |
| @storybook/react-vite | 10.3.1 | ✅ CHAMPION |
| @storybook/builder-vite | 10.3.1 | ✅ CHAMPION |
| Node.js | v20.20.0 | ✅ CHAMPION |
| pnpm | 10.30.2 | ✅ CHAMPION |
| rollup bundler | (via vite@7) | ✅ CHAMPION |

**Champion build:** TSC exit 0, build exit 0, verify_instructions PASS=20/20, autoheal PASS
**Champion tests:** vitest 3399/3399 PASS (from prior recert)

---

## Challenger Stack (Proposed — NOT INSTALLED)

| Component | Champion | Challenger | Delta |
|-----------|----------|------------|-------|
| vite | 7.3.1 | **8.0.1** | MAJOR — rolldown bundler |
| @vitejs/plugin-react | 5.1.4 | **5.2.0** (min) or **6.0.1** | MINOR (5.2.0) or MAJOR (6.0.1) |
| vitest | 4.0.18 | **4.1.0** | PATCH — adds vite@8 support |
| @vitest/browser | 4.0.18 | **4.1.0** | PATCH |
| @vitest/coverage-v8 | 4.0.18 | **4.1.0** | PATCH |
| @vitest/ui | 4.0.18 | **4.1.0** | PATCH |
| @vitest/browser-playwright | 4.0.18 | **4.1.0** | PATCH |
| storybook | 10.3.1 | 10.3.1 | NO CHANGE |
| @storybook/react-vite | 10.3.1 | 10.3.1 | NO CHANGE |
| rolldown | — (rollup) | **1.0.0-rc.10** | NEW — default bundler in vite@8 |
| vite.config.ts treeshake | rollup options | rolldown compat? | CONFIG REVIEW NEEDED |

---

## Key Risk Delta

1. **Bundler switch**: rollup → rolldown. Build output, sourcemaps, chunk names may differ.
2. **treeshake options**: rollup-specific sub-options may not be supported in rolldown.
3. **vitest 4.1.0**: first release with explicit vite@8 peer support — minimal ecosystem risk.
4. **plugin-react 5.2.0 vs 6.0.1**: 5.2.0 is lowest-risk path; 6.0.1 uses @rolldown/plugin-babel (more change).

---

## Recommendation

**Minimal trial path**: upgrade to plugin-react@5.2.0 + vitest@4.1.0-suite + vite@8.0.1.
This minimizes surface change while validating rolldown bundler compatibility.
