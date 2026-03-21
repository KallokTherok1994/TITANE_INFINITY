# Major Migration Gate Analysis

**Date:** 2026-03-21  
**Evaluated migrations:** eslint 10, vite 8, @vitejs/plugin-react 6

---

## eslint 10

### Current installed
`eslint@9.39.4`

### Latest available
`eslint@9.x` (10.x exists as separate major)

### Blocker: eslint-plugin-react peer dependency
```bash
$ npm info eslint-plugin-react peerDependencies
{ eslint: '^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7' }
```

**Analysis:** The peer constraint tops at `^9.7`. This means eslint 10 is NOT in the peer range. Upgrading to eslint 10 would cause a peer conflict with `eslint-plugin-react@7.37.5`.

### eslint-plugin-react-hooks peer dependency
```bash
$ npm info eslint-plugin-react-hooks@latest peerDependencies
{ eslint: '^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0' }
```

**Analysis:** react-hooks peer also tops at `^9.0.0`, not supporting eslint 10.

### Decision
**MAJOR_CANDIDATE_BLOCKED** — eslint 10 migration requires waiting for eslint-plugin-react and eslint-plugin-react-hooks to publish eslint-10-compatible versions.

---

## vite 8

### Current installed
`vite@7.3.1`

### Latest available
```bash
$ npm info vite@latest version
8.0.1
```

### Blocker: @vitejs/plugin-react peer dependency
```bash
$ npm info @vitejs/plugin-react@latest peerDependencies
{
  '@rolldown/plugin-babel': '^0.1.7 || ^0.2.0',
  'babel-plugin-react-compiler': '^1.0.0',
  vite: '^8.0.0'
}
```

**Analysis:** @vitejs/plugin-react@latest (v6.x) requires `vite: '^8.0.0'`. Current project uses `@vitejs/plugin-react@5.1.4` which is compatible with vite 7.x. Migrating vite to 8 requires simultaneous upgrade of @vitejs/plugin-react to 6.x.

### Decision
**MAJOR_CANDIDATE_BLOCKED** — vite 8 migration requires coordinated upgrade with @vitejs/plugin-react 6. This is a breaking coordinated migration, not a drop-in upgrade.

---

## @vitejs/plugin-react 6

### Current installed
`@vitejs/plugin-react@5.1.4`

### Latest available
`@vitejs/plugin-react@6.0.1`

### Peer requirements for v6
```bash
$ npm info @vitejs/plugin-react@6 peerDependencies
@vitejs/plugin-react@6.0.0 { vite: '^8.0.0', '@rolldown/plugin-babel': '^0.1.7', 'babel-plugin-react-compiler': '^1.0.0' }
@vitejs/plugin-react@6.0.1 { '@rolldown/plugin-babel': '^0.1.7 || ^0.2.0', 'babel-plugin-react-compiler': '^1.0.0', vite: '^8.0.0' }
```

**Analysis:** v6.0.x requires `vite: '^8.0.0'` AND introduces new required peer deps (`@rolldown/plugin-babel`, `babel-plugin-react-compiler`). This is a significant breaking change requiring new packages.

### Decision
**MAJOR_CANDIDATE_BLOCKED** — requires vite 8 + new rolldown/compiler dependencies. Coordinated migration needed.

---

## Migration Summary

| Migration | Verdict | Unblocking Condition |
|-----------|---------|---------------------|
| eslint 9→10 | MAJOR_CANDIDATE_BLOCKED | eslint-plugin-react publishes eslint-10 peer support |
| vite 7→8 | MAJOR_CANDIDATE_BLOCKED | Coordinated with @vitejs/plugin-react 6 + new rolldown deps |
| plugin-react 5→6 | MAJOR_CANDIDATE_BLOCKED | Requires vite 8 + @rolldown/plugin-babel + babel-plugin-react-compiler |

**Champion retained:** Current stable baseline (eslint 9.39.4, vite 7.3.1, plugin-react 5.1.4)
