# Install Log

## Command
```
pnpm add -D vite@^8 @vitejs/plugin-react@^5.2.0
```

## Output (tail -20)
```
Progress: resolved 1858, reused 1720, downloaded 10, added 19, done
 WARN  Issues with peer dependencies found
.
├─┬ @vitest/browser 4.0.18
│ └─┬ @vitest/mocker 4.0.18
│   └── ✕ unmet peer vite@"^6.0.0 || ^7.0.0-0": found 8.0.1
└─┬ @storybook/react-vite 10.3.1
  └─┬ @joshwooding/vite-plugin-react-docgen-typescript 0.6.4
    └── ✕ unmet peer vite@"^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0": found 8.0.1

devDependencies:
- @vitejs/plugin-react 5.1.4
+ @vitejs/plugin-react 5.2.0 (6.0.1 is available)
- vite 7.3.1
+ vite 8.0.1

Done in 5.6s using pnpm v10.30.2
```
Exit: 0 (warnings only, not errors)

## Verified Installed Versions
```
├── @storybook/addon-vitest@10.3.1
├── @storybook/react-vite@10.3.1
├── @vitejs/plugin-react@5.2.0
├── @vitest/browser@4.0.18
├── @vitest/browser-playwright@4.0.18
├── @vitest/coverage-v8@4.0.18
├── @vitest/ui@4.0.18
├── vite@8.0.1
├── vite-plugin-compression@0.5.1
├── vite-tsconfig-paths@6.1.1
├── vitest@4.0.18
```

## Bundler Engine
- vite@8.0.1 uses rolldown@1.0.0-rc.10 (not rollup)
