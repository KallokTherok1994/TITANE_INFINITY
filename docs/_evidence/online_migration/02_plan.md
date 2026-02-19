# PHASE 2: PLAN RING-AWARE — LOCAL-FIRST → ONLINE-FIRST

**Date:** 2026-02-19  
**Source:** 01_inventory.json (18 fichiers critiques)  
**Objective:** Migration constitutionnelle du projet vers ONLINE-FIRST gouverné

---

## SCOPE LOCK

Files in scope: **17 fichiers** (voir SCOPE_FILES.txt)

**Commitment:** Aucun fichier hors scope ne sera modifié sans justification explicite.

---

## RING-BY-RING ANALYSIS

### **Ring 1: Types** (⚙️ Pas d'impact direct)

**Fichiers:** Aucun dans le scope  
**Surface exposée:** N/A  
**Changements:** Aucun  
**Risques:** Aucun  
**Rollback:** N/A  

---

### **Ring 2: Engines** (⚙️ Pas d'impact direct)

**Fichiers:** Aucun dans le scope  
**Surface exposée:** N/A  
**Changements:** Aucun  
**Risques:** Aucun  
**Rollback:** N/A  

---

### **Ring 3: Services** (🔧 Impact MEDIUM)

**Fichiers:**
- `src/services/ai/orchestrator.ts` (ligne 664)
- `src-tauri/src/overdrive/chat_orchestrator.rs` (ligne 492)

**Surface exposée:**
- Provider selection logic (local-first priority → online-first + fallback)
- Default mode (offline → online with local fallback)

**Changements minimaux:**
1. `orchestrator.ts`: Inverser commentaire "LOCAL FIRST" → "ONLINE FIRST (local fallback)"
2. `chat_orchestrator.rs`: Changer "mode offline par défaut" → "mode online par défaut, fallback local"
3. S'assurer que le fallback local (Ollama) est toujours fonctionnel

**Risques:**
- MEDIUM: Si le fallback échoue, l'utilisateur reste sans AI
- MEDIUM: Régression de stabilité (actuellement mode dégradé = local-only)

**Rollback:**
```bash
git restore -- src/services/ai/orchestrator.ts src-tauri/src/overdrive/chat_orchestrator.rs
```

**Status:** EXPERIMENTAL → QUALIFIED après tests x3

---

### **Ring 4: Modules/UI** (🚫 Impact faible, policy seulement)

**Fichiers:**
- Aucun fichier UI direct

**Surface exposée:** N/A (changements doctrinaux uniquement)

---

## INSTRUCTIONS / DOCS (📋 Impact CRITICAL)

**Fichiers:**
1. `.github/copilot-instructions.md` (ligne 22)
2. `.github/instructions/titane.instructions.md`
3. `README.md` (lignes 220, 222)
4. `docs/adr/001-tauri-local-first-architecture.md`
5. `docs/backup_20251218_122540/CONTRIBUTING.md`
6. `docs/adr/002-omega-conversation-manager.md`

**Surface exposée:** Doctrine projet + DX (dev experience)

**Changements minimaux:**

### 1. `.github/copilot-instructions.md`

**Avant:**
```markdown
- Local-first only. No implicit cloud or network dependency.
```

**Après:**
```markdown
- Online-first governed. Network allowed via controlled surfaces only. Local fallback mandatory.
```

### 2. `.github/instructions/titane.instructions.md`

**Avant:**
```markdown
Local-first ≠ interdiction du réseau (clarification entre local-first vs hors ligne)
```

**Après:**
```markdown
Online-first = réseau ON par défaut, avec surfaces contrôlées + fallback local obligatoire.  
La distinction hors ligne/en ligne reste pertinente : le fallback local est toujours disponible.
```

### 3. `README.md`

**Avant:**
```markdown
### External AI (opt-in, local-first par défaut)

Par défaut, TITANE∞ est **local-only** (aucun cloud requis) et les providers externes sont **désactivés**.
```

**Après:**
```markdown
### AI Providers (online-first, local fallback)

Par défaut, TITANE∞ utilise des providers externes **si configurés**, avec fallback automatique vers Ollama local.  
Mode 100% local disponible en désactivant les providers cloud dans les paramètres.
```

### 4. ADR 001 et CONTRIBUTING

Renommer/clarifier que "local-first" signifie maintenant "fallback local disponible", pas "offline par défaut".

**Risques:**
- HIGH: Confusion des contributeurs/utilisateurs si message pas clair
- MEDIUM: Régression de confiance (utilisateurs attendent local-only strict)

**Rollback:**
```bash
git restore -- .github/ README.md docs/
```

**Status:** EXPERIMENTAL

---

## CONFIG / SCRIPTS (🔧 Impact CRITICAL)

**Fichiers:**
1. `package.json` (lignes 34, 38)
2. `scripts/verify/enforce-local-first.sh`
3. `scripts/verify/enforce-online-first.sh` (nouveau)
4. `scripts/governance/constitutional-audit.sh` (ligne 25)
5. `scripts/governance/prod-cert-release.sh` (ligne 111)

**Surface exposée:** CI/CD pipeline, verification gates

**Changements minimaux:**

### 1. `package.json`

**Avant:**
```json
"verify": "... && pnpm run verify:local-first && ...",
"verify:local-first": "bash scripts/verify/enforce-local-first.sh"
```

**Après:**
```json
"verify": "... && pnpm run verify:online-first && ...",
"verify:online-first": "bash scripts/verify/enforce-online-first.sh"
```

### 2. Créer `scripts/verify/enforce-online-first.sh`

Nouveau script qui échoue si :
- Doctrine "local-first only" encore présente
- Pas de policy réseau explicite
- `verify:local-first` encore référencé

### 3. `scripts/governance/constitutional-audit.sh`

**Avant:**
```bash
echo "L1: LOCAL-FIRST STRICT - Interdiction réseau en production..."
```

**Après:**
```bash
echo "L1: ONLINE-FIRST GOVERNED - Réseau via surfaces contrôlées uniquement..."
```

### 4. `prod-cert-release.sh`

**Supprimer:**
```bash
- **L1 LOCAL-FIRST**: ✅ No HTTP servers in production
```

**Ajouter:**
```bash
- **L1 NETWORK POLICY**: ✅ Network via controlled API surfaces only (no scattered fetch)
```

**Risques:**
- CRITICAL: Si le script `enforce-online-first.sh` est bogué, `pnpm verify` échoue → blocage dev
- HIGH: Régression CI si gates ne sont plus valides

**Rollback:**
```bash
git restore -- package.json scripts/verify/ scripts/governance/
rm scripts/verify/enforce-online-first.sh
```

**Status:** EXPERIMENTAL → QUALIFIED après run verify x3

---

## TAURI CONFIG / ALLOWLIST (🔒 Impact HIGH)

**Fichiers:**
1. `src-tauri/Cargo.toml`
2. `src-tauri/tauri.conf.json`

**Surface exposée:** Tauri allowlist, HTTP capabilities

**Changements minimaux:**

### 1. Vérifier si HTTP plugin est déjà présent

```bash
rg "tauri-plugin-http" src-tauri/Cargo.toml
```

Si absent, **ajouter** :

```toml
[dependencies]
tauri-plugin-http = "2.x"  # Version appropriée Tauri v2
```

### 2. Vérifier `tauri.conf.json` allowlist

Chercher si `http` scope existe. Si non, **ajouter** :

```json
{
  "permissions": {
    "http": {
      "scope": ["https://*"],  // À restreindre selon besoins réels
      "timeouts": { "default": 30000 }
    }
  }
}
```

**Documenter explicitement** :
- Quels domaines sont autorisés
- Pourquoi (providers AI externes)
- Rollback path

**Risques:**
- HIGH: Allowlist trop large = surface d'attaque augmentée
- MEDIUM: Allowlist trop stricte = providers externes cassés

**Rollback:**
```bash
git restore -- src-tauri/Cargo.toml src-tauri/tauri.conf.json
cargo clean && cargo build
```

**Status:** EXPERIMENTAL

---

## GUARDS / TESTS (🛡️ Impact HIGH)

**Fichiers:**
1. `scripts/guards/guard-network-policy.mjs` (nouveau)

**Surface exposée:** Anti-bypass enforcement

**Changements minimaux:**

Créer un guard qui échoue si :

1. `fetch("https://...")` utilisé hors des fichiers autorisés (ex: `NetworkService`, `ApiClient`)
2. `localhost` ou `127.0.0.1` hardcodé (sauf Ollama + annotations)
3. Appels réseau dispersés (pas via surface unique)

**Exemple de guard:**

```javascript
// scripts/guards/guard-network-policy.mjs
import { execSync } from 'child_process';

// Whitelist: fichiers autorisés à faire du réseau
const ALLOWED_NETWORK_FILES = [
  'src/services/network/NetworkService.ts',
  'src/services/network/ApiClient.ts',
  'src-tauri/src/network/', // Rust network layer
];

// Chercher fetch/axios hors whitelist
const result = execSync(
  `rg -l "fetch\\(|axios\\." src/ --type ts | grep -v -f <(echo "${ALLOWED_NETWORK_FILES.join('\\n')}")`
);

if (result.toString().trim()) {
  console.error('FAIL: Network calls outside allowed surfaces');
  process.exit(1);
}

console.log('PASS: Network policy enforced');
```

Ajouter au `package.json` :

```json
"guard:network": "node scripts/guards/guard-network-policy.mjs"
```

**Risques:**
- MEDIUM: Guard trop strict = faux positifs
- LOW: Guard pas assez strict = bypass possible

**Rollback:**
```bash
rm scripts/guards/guard-network-policy.mjs
# Retirer du package.json
```

**Status:** EXPERIMENTAL

---

## GLOBAL RISKS & MITIGATION

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Confusion utilisateurs (attendent local-only) | HIGH | MEDIUM | README clair + CHANGELOG explicite |
| Régression stabilité (fallback local cassé) | MEDIUM | HIGH | Tests x3 + smoke tests runtime |
| Allowlist Tauri trop large | MEDIUM | HIGH | Scope explicite + documentation |
| Gate `verify` cassé | MEDIUM | CRITICAL | Dry-run x3 avant commit |
| Drift hors scope | LOW | MEDIUM | SCOPE_FILES.txt verrouillé |

---

## PRIORITY ORDER (Execution séquentielle)

1. **Phase 3:** Docs/instructions (doctrine)
2. **Phase 4:** Scripts/gates (outillage)
3. **Phase 5:** Runtime (services offline→online)
4. **Phase 6:** Tauri (allowlist)
5. **Phase 7:** Guards (anti-bypass)
6. **Phase 8:** Tests x3 + VERDICT

**Chaque phase bloquante si FAIL.**

---

## PROOF REQUIREMENTS

Chaque phase produit :

- `.diff` file (patches appliqués)
- Logs de run
- PASS/FAIL verdict

Phase 8 produit :

- `FINAL_VERDICT.md` (PASS/FAIL/BLOCKED)
- `ROLLBACK.md` (commandes exactes)
- `FILES_CHANGED.md` (liste finale)
- `COMMANDS_RUN.md` (traçabilité complète)

---

**END OF PLAN**
