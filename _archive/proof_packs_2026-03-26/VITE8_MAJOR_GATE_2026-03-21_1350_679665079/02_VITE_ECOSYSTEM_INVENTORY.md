# 02 — VITE ECOSYSTEM INVENTORY

## pnpm list --depth=0 (vite ecosystem)

```
├── @chromatic-com/storybook@5.0.2
├── @storybook/addon-a11y@10.3.1
├── @storybook/addon-docs@10.3.1
├── @storybook/addon-onboarding@10.3.1
├── @storybook/addon-vitest@10.3.1
├── @storybook/react-vite@10.3.1
├── @vitejs/plugin-react@5.1.4         ← CHAMPION (installed)
├── @vitest/browser@4.0.18
├── @vitest/browser-playwright@4.0.18
├── @vitest/coverage-v8@4.0.18
├── @vitest/ui@4.0.18
├── eslint-plugin-react@7.37.5
├── eslint-plugin-react-hooks@7.0.1
├── eslint-plugin-react-refresh@0.4.26
├── eslint-plugin-storybook@10.2.12
├── rollup-plugin-visualizer@6.0.5
├── storybook@10.3.1
├── vite@7.3.1                          ← CHAMPION (installed)
├── vite-plugin-compression@0.5.1
├── vite-tsconfig-paths@6.1.1
├── vitest@4.0.18                        ← CHAMPION (installed)
```

## pnpm why vite (top consumers)

```
vite@7.3.1
├── @joshwooding/vite-plugin-react-docgen-typescript@0.6.4
│   └── @storybook/react-vite@10.3.1
├── @storybook/builder-vite@10.3.1
├── @storybook/csf-plugin@10.3.1
├── @storybook/react-vite@10.3.1 [deduped]
├── @vitejs/plugin-react@5.1.4
├── @vitest/mocker@4.0.18 (via vitest)
└── vitest@4.0.18
```

## pnpm why @vitejs/plugin-react

```
@vitejs/plugin-react@5.1.4
└── titane-infinity@28.5.0 (devDependencies)
(Found 1 version)
```

## pnpm why vitest

```
vitest@4.0.18
├── @storybook/addon-vitest@10.3.1
├── @vitest/browser@4.0.18
├── @vitest/browser-playwright@4.0.18
├── @vitest/coverage-v8@4.0.18
└── @vitest/ui@4.0.18
```
