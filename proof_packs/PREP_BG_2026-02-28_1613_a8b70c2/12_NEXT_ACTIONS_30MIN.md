# 12_NEXT_ACTIONS_30MIN.md — Actions Suivantes (≤30min)
**Generated:** 2026-02-28T18:41:19Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Actions Immédiates (0-10 min)

### 1. **FIX Vitest execution** (5 min)

```bash
# Alternative: use npm scripts instead of direct vitest calls
npm run test                    # → uses npm lifecycle, bypasses pnpm symlink issues
npm run test:architecture       # → architecture tests
npm run test:rust               # → cargo tests (working)
```

### 2. **TEST pnpm via npm wrapper** (3 min)

```bash
# Export pnpm to PATH temporarily
export PATH="$PATH:$(pwd)/node_modules/.bin"
pnpm test  # → should work now

# Or via npm wrapper
npx --no -- pnpm test
```

## Actions Moyennes (10-30 min)

### 3. **INVESTIGATE Node.js upgrade** (15 min)

**Option A:** Node.js upgrade (si faisable sur système)
```bash
# Check if Node.js 20+ available
node -v                    # Current: v18.19.1
nvm install 20             # If nvm available
# OR: sudo apt install nodejs=20.x (if apt)
```

**Option B:** Vite downgrade (moins risqué)
```bash
# Check what Vite version supports Node 18
npm info vite versions --json | jq '.[]' | grep -E '^"[4-6]'
# Downgrade to compatible version
npx pnpm add -D vite@^5.0.0  # Known compatible with Node 18
```

### 4. **VALIDATE workarounds** (10 min)

```bash
# Test if npm scripts work
npm run test 2>&1 | tail -30
npm run test:architecture 2>&1 | tail -10
npm run build 2>&1 | tail -20  # After Vite fix
```

## Actions Non-Critiques

### 5. **Setup proper pnpm** (optionnel)

```bash
# Permanent pnpm fix
npm install -g pnpm
# OR
corepack enable
```

## Success Criteria (30 min)

- ✅ Tests unitaires exécutables (npm run test)
- ✅ Build frontend possible (vite build)
- ✅ All scripts dans package.json functional

## Rollback Plan

Si échec complet:
```bash
# Document current blocking state
git add proof_packs/PREP_BG_2026-02-28_1613_a8b70c2/
git commit -m "docs(proof-pack): background prep blocked by node/vite incompatibility"
# → Hand off to team avec diagnostic complet
```