# ESLint Ecosystem Inventory

## pnpm list --depth=0 (filtered: eslint, typescript-eslint, plugin-react)

```
├── @eslint/eslintrc@3.3.5
├── @eslint/js@9.39.4
├── @typescript-eslint/eslint-plugin@8.57.1
├── @typescript-eslint/parser@8.57.1
├── @vitejs/plugin-react@5.1.4
├── eslint@9.39.4
├── eslint-config-prettier@10.1.8
├── eslint-plugin-react@7.37.5
├── eslint-plugin-react-hooks@7.0.1
├── eslint-plugin-react-refresh@0.4.26
├── eslint-plugin-storybook@10.2.12
```

## pnpm why eslint (head -20)

```
eslint@9.39.4
node_modules/.pnpm/eslint@9.39.4/node_modules/eslint
  devDependencies
  └── eslint 9.39.4
```

## pnpm why eslint-plugin-react (head -20)

```
eslint-plugin-react@7.37.5
  devDependencies
  └── eslint-plugin-react 7.37.5
```

## pnpm why eslint-plugin-react-hooks (head -20)

```
eslint-plugin-react-hooks@7.0.1
  devDependencies
  └── eslint-plugin-react-hooks 7.0.1
```

## pnpm why @typescript-eslint/eslint-plugin (head -20)

```
@typescript-eslint/eslint-plugin@8.57.1
  devDependencies
  └── @typescript-eslint/eslint-plugin 8.57.1
```

## pnpm why @typescript-eslint/parser (head -20)

```
@typescript-eslint/parser@8.57.1
  devDependencies
  └── @typescript-eslint/parser 8.57.1
```

## eslint.config.js (active flat-config with FlatCompat shim)

```js
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const legacyConfig = require('./.eslintrc.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
// ... loads .eslintrc.cjs via compat.config(legacyConfig)
```

**Key observation**: Uses `FlatCompat` from `@eslint/eslintrc@3.3.5` to shim the legacy `.eslintrc.cjs` into flat config format.
ESLint 10 removes the `@eslint/eslintrc` FlatCompat shim — the entire config would need a native flat-config rewrite.

## Lint command (package.json)

```json
"lint": "eslint \"src/**/*.{ts,tsx,js,jsx}\"",
"lint:fix": "eslint \"src/**/*.{ts,tsx,js,jsx}\" --fix",
"lint:staged": "lint-staged",
```
