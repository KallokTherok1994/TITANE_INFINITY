# E2E Build Authorization Gate (GATE_2)

**Date:** 2026-02-08  
**Protocol:** Ω.E2E.DESKTOP.CSP.UNBLOCK+GATED_BUILD+PROOF v1.0  
**Scope:** E2E desktop tests requiring Tauri build

---

## Problème Constitutionnel

**Règle critique (permanent) :**
```
NE JAMAIS déployer via AppImage ou DEB sans autorisation explicite de Kevin Thibault
NE JAMAIS lancer `pnpm run build` sans demande explicite
```

**Conflit avec E2E :**
- E2E desktop tests nécessitent un build Tauri (CSP compilée dans binaire)
- Build = violation potentielle de la règle "no build without auth"
- Besoin de distinguer "build pour E2E test" vs "build pour déploiement"

---

## Solution Implémentée

### Authorization File (Local, Non-Committed)

**Path:** `runtime/ALLOW_E2E_TAURI_BUILD.ok`  
**Content (exact match required):**
```
I_AUTHORIZE_E2E_TAURI_BUILD
```

**Properties:**
- ✅ Local uniquement (ajouté à `.gitignore`)
- ✅ Contenu explicite (pas de confusion possible)
- ✅ Audit trail (fichier créé = autorisation donnée)
- ✅ Révocable (supprimer fichier = bloquer builds)
- ❌ NON commité (pas de contournement via git pull)

### Gate Script

**Path:** `scripts/e2e/require-e2e-build-authorization.sh`  
**Purpose:** Bloquer tout build E2E sans autorisation explicite

**Checks:**
1. Fichier `runtime/ALLOW_E2E_TAURI_BUILD.ok` existe?
2. Contenu = exactement `I_AUTHORIZE_E2E_TAURI_BUILD`?
3. Si FAIL → afficher message clair + exit 1
4. Si PASS → continuer build

**Exit Codes:**
- `0` = Authorization OK, proceed
- `1` = Authorization FAIL, block build

---

## Usage

### Grant Authorization (One-Time Setup)

```bash
mkdir -p runtime
printf "I_AUTHORIZE_E2E_TAURI_BUILD\n" > runtime/ALLOW_E2E_TAURI_BUILD.ok
```

**Confirmation:**
```bash
cat runtime/ALLOW_E2E_TAURI_BUILD.ok
# Should output: I_AUTHORIZE_E2E_TAURI_BUILD
```

### Run E2E Tests (Gated)

```bash
pnpm run e2e:desktop
# ↳ Calls require-e2e-build-authorization.sh first
# ↳ If PASS: proceeds with build + tests
# ↳ If FAIL: blocks with clear error message
```

### Revoke Authorization

```bash
rm runtime/ALLOW_E2E_TAURI_BUILD.ok
# Next e2e:desktop run will be blocked
```

---

## Integration Points

### package.json Scripts

```json
{
  "build:tauri:e2e": "bash scripts/e2e/require-e2e-build-authorization.sh && pnpm tauri build --config runtime/e2e/tauri.conf.json",
  "e2e:desktop": "bash scripts/e2e/require-e2e-build-authorization.sh && wdio run wdio.desktop.conf.cjs"
}
```

**Sequence:**
1. `pnpm run e2e:desktop` invoked
2. Gate script runs first
3. If blocked → exit 1, no build
4. If authorized → continue to WDIO

### .gitignore Entry

```gitignore
# E2E authorization gate (local only, never commit)
runtime/ALLOW_E2E_TAURI_BUILD.ok
```

---

## Security Model

### Threat: Accidental Production Build

**Mitigation:**
- Gate script blocks by default (no file = no build)
- Requires explicit local action to authorize
- Authorization file never committed to repo

### Threat: Unauthorized Developer Build

**Mitigation:**
- Each developer must create authorization file locally
- File content must match exactly (no typos)
- Script shows clear instructions if blocked

### Threat: CI/CD Auto-Build

**Mitigation:**
- CI/CD environments won't have authorization file (gitignored)
- Builds will fail with clear error message
- Prevents accidental pipeline builds

---

## GATE_2 Validation

**Checklist:**
- ✅ Authorization file path: `runtime/ALLOW_E2E_TAURI_BUILD.ok`
- ✅ Content validation: exact match required
- ✅ Clear error messages: shows instructions if blocked
- ✅ Gitignored: file never committed
- ✅ Script executable: `chmod +x` applied
- ✅ Exit codes: 0=pass, 1=block
- ✅ Integration: called before build/E2E

**Test Gate:**

```bash
# Test 1: Without authorization (should block)
rm -f runtime/ALLOW_E2E_TAURI_BUILD.ok
bash scripts/e2e/require-e2e-build-authorization.sh
# Expected: Exit 1 + error message

# Test 2: With authorization (should pass)
mkdir -p runtime
printf "I_AUTHORIZE_E2E_TAURI_BUILD\n" > runtime/ALLOW_E2E_TAURI_BUILD.ok
bash scripts/e2e/require-e2e-build-authorization.sh
# Expected: Exit 0 + success message

# Test 3: Wrong content (should block)
printf "WRONG_CONTENT\n" > runtime/ALLOW_E2E_TAURI_BUILD.ok
bash scripts/e2e/require-e2e-build-authorization.sh
# Expected: Exit 1 + invalid content error
```

---

## Audit Trail

**Who can authorize?**
- Local developer with filesystem write access to `runtime/`
- Must be intentional (not accidental)

**When is authorization checked?**
- Before every `pnpm run e2e:desktop`
- Before every `pnpm run build:tauri:e2e`

**How to audit?**
```bash
# Check if authorization granted
ls -la runtime/ALLOW_E2E_TAURI_BUILD.ok
# If exists → authorized
# If not found → blocked

# Verify content
cat runtime/ALLOW_E2E_TAURI_BUILD.ok
# Must be exactly: I_AUTHORIZE_E2E_TAURI_BUILD
```

---

## Rollback Procedure

**Remove gate (emergency only):**

1. Remove gate check from `package.json` scripts
2. Delete `scripts/e2e/require-e2e-build-authorization.sh`
3. Remove `.gitignore` entry

**WARNING:** This violates CRITICAL RULE. Only do if authorized by Kevin Thibault.

---

**GATE_2:** ✅ IMPLEMENTED  
**Status:** Authorization gate active, blocks builds by default  
**Next:** Create `build:tauri:e2e` script (GATE_3)
