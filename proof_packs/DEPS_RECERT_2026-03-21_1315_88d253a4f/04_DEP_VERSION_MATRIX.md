# Dependency Version Matrix

**Source:** `pnpm list --depth=0` + `package.json`  
**Date:** 2026-03-21

## Updated Packages (Rounds 1-3)

| Package | Before (pre-round) | After (current installed) | Round |
|---------|-------------------|--------------------------|-------|
| vitest | 2.x / 3.x | 4.0.18 (pinned) | 1 |
| @vitest/browser | — | 4.0.18 (pinned) | 1 |
| @vitest/browser-playwright | — | 4.0.18 (pinned) | 1 |
| @vitest/coverage-v8 | — | 4.0.18 (pinned) | 1 |
| @vitest/ui | — | 4.0.18 (pinned) | 1 |
| @types/node | ~22.x | 25.5.0 | 1 |
| storybook | 8.x / 9.x | 10.3.1 | 2 |
| @storybook/addon-a11y | — | 10.3.1 | 2 |
| @storybook/addon-docs | — | 10.3.1 | 2 |
| @storybook/addon-onboarding | — | 10.3.1 | 2 |
| @storybook/addon-vitest | — | 10.3.1 | 2 |
| @storybook/react-vite | — | 10.3.1 | 2 |
| @chromatic-com/storybook | — | 5.0.2 | 2 |
| eslint-plugin-storybook | — | 10.2.12 | 2 |
| eslint-plugin-react-refresh | 0.4.x | 0.4.26 | 2 |
| jsdom | 25.x / 26.x | 29.0.1 | 3 |
| eslint | 9.x | 9.39.4 | 3 |
| @eslint/js | — | 9.39.4 | 3 |

## Stable/Unchanged Packages (not updated in rounds 1-3)

| Package | Installed Version | Notes |
|---------|-----------------|-------|
| vite | 7.3.1 | eslint-10 / vite-8 migration blocked |
| @vitejs/plugin-react | 5.1.4 | requires vite ^8 for v6 |
| eslint-plugin-react | 7.37.5 | max peer: eslint ^9.7 |
| eslint-plugin-react-hooks | 7.0.1 | max peer: eslint ^9.0.0 |
| @typescript-eslint/eslint-plugin | 8.57.1 | stable |
| @typescript-eslint/parser | 8.57.1 | stable |
| tailwindcss | 4.2.2 | stable |
| @tailwindcss/postcss | 4.2.2 | stable |
| postcss | 8.5.8 | stable |
| zustand | 5.0.12 | stable |
| dompurify | 3.3.3 | stable |
| webdriverio | 9.26.1 | stable |
| eslint-config-prettier | 10.1.8 | stable |
| @eslint/eslintrc | 3.3.5 | stable |
| vite-plugin-compression | 0.5.1 | stable |
| vite-tsconfig-paths | 6.1.1 | stable |

## pnpm list --depth=0 (raw, filtered)
```
├── dompurify@3.3.3
├── zustand@5.0.12
├── @chromatic-com/storybook@5.0.2
├── @eslint/eslintrc@3.3.5
├── @eslint/js@9.39.4
├── @storybook/addon-a11y@10.3.1
├── @storybook/addon-docs@10.3.1
├── @storybook/addon-onboarding@10.3.1
├── @storybook/addon-vitest@10.3.1
├── @storybook/react-vite@10.3.1
├── @tailwindcss/postcss@4.2.2
├── @types/node@25.5.0
├── @typescript-eslint/eslint-plugin@8.57.1
├── @typescript-eslint/parser@8.57.1
├── @vitejs/plugin-react@5.1.4
├── @vitest/browser@4.0.18
├── @vitest/browser-playwright@4.0.18
├── @vitest/coverage-v8@4.0.18
├── @vitest/ui@4.0.18
├── eslint@9.39.4
├── eslint-config-prettier@10.1.8
├── eslint-plugin-react@7.37.5
├── eslint-plugin-react-hooks@7.0.1
├── eslint-plugin-react-refresh@0.4.26
├── eslint-plugin-storybook@10.2.12
├── jsdom@29.0.1
├── postcss@8.5.8
├── storybook@10.3.1
├── tailwindcss@4.2.2
├── vite@7.3.1
├── vite-plugin-compression@0.5.1
├── vite-tsconfig-paths@6.1.1
├── vitest@4.0.18
├── webdriverio@9.26.1
```
