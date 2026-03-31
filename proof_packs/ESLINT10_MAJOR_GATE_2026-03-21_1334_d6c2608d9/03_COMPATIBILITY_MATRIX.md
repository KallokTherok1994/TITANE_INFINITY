# Compatibility Matrix

## npm info queries (READ-ONLY — no installs performed)

### eslint-plugin-react

```
npm info eslint-plugin-react@latest peerDependencies
{ eslint: '^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7' }

npm info eslint-plugin-react@latest version
7.37.5
```

Last 10 published versions (as of 2026-03-21):
```
7.35.1
7.35.2
7.36.0
7.36.1
7.37.0
7.37.1
7.37.2
7.37.3
7.37.4
7.37.5
```
**None** of the last 10 versions include ESLint 10 in peer range.

### eslint-plugin-react-hooks

```
npm info eslint-plugin-react-hooks@latest peerDependencies
{ eslint: '^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0' }

npm info eslint-plugin-react-hooks@latest version
7.0.1
```

Peer range caps at `^9.0.0`. ESLint 10 NOT included.

### @typescript-eslint/eslint-plugin

```
npm info @typescript-eslint/eslint-plugin@latest peerDependencies
{
  eslint: '^8.57.0 || ^9.0.0 || ^10.0.0',
  typescript: '>=4.8.4 <6.0.0',
  '@typescript-eslint/parser': '^8.57.1'
}

npm info @typescript-eslint/eslint-plugin@latest version
8.57.1
```

✅ Explicitly supports ESLint `^10.0.0`.

### eslint-plugin-react-refresh

```
npm info eslint-plugin-react-refresh@latest peerDependencies
{ eslint: '^9 || ^10' }
```

✅ Explicitly supports ESLint `^10`.

### eslint-plugin-storybook

```
npm info eslint-plugin-storybook@latest peerDependencies
{ eslint: '>=8', storybook: '^10.3.1' }

npm info eslint-plugin-storybook@latest version
10.3.1
```

✅ Supports ESLint `>=8` (includes 10).

### eslint (latest / 10.x)

```
npm info eslint@latest version
10.1.0

npm info eslint@10 versions
10.0.0  10.0.1  10.0.2  10.0.3  10.1.0
```

### @eslint/js@10

```
npm info @eslint/js@10 version
10.0.1
```

---

## Summary Matrix

| Package | Installed | Latest | Peer Range | ESLint 10? | Blocker |
|---------|-----------|--------|-----------|-----------|---------|
| eslint-plugin-react | 7.37.5 | 7.37.5 | `^3‖^4‖^5‖^6‖^7‖^8‖^9.7` | ❌ NO | **HARD** |
| eslint-plugin-react-hooks | 7.0.1 | 7.0.1 | `^3‖…‖^9.0` | ❌ NO | **HARD** |
| @typescript-eslint/eslint-plugin | 8.57.1 | 8.57.1 | `^8.57‖^9‖^10` | ✅ YES | none |
| @typescript-eslint/parser | 8.57.1 | 8.57.1 | (same) | ✅ YES | none |
| eslint-plugin-react-refresh | 0.4.26 | 0.4.26 | `^9‖^10` | ✅ YES | none |
| eslint-plugin-storybook | 10.2.12 | 10.3.1 | `>=8` | ✅ YES | none |
| eslint-config-prettier | 10.1.8 | 10.1.8 | (no peer eslint restriction) | ✅ YES | none |
| @eslint/eslintrc (FlatCompat) | 3.3.5 | 3.3.5 | — | ⚠️ REMOVED in eslint 10 | **CONFIG** |

**@eslint/eslintrc note**: ESLint 10 removes the `FlatCompat` compat shim entirely.
The current `eslint.config.js` depends on `FlatCompat` to load `.eslintrc.cjs`.
This would require a full native flat-config rewrite regardless of plugin availability.
