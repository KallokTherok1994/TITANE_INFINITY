# P3 CERTIFICATION — BASELINE

**Date**: 2026-02-23  
**Objectif**: Transformer P2 PASS QUALIFIÉ → PASS CERTIFIÉ via validation 100% automatique  
**Mode**: PROOF-DRIVEN + REPRODUCTIBLE x3 + GATES BLOQUANTS

## Contexte P2

P2 = PASS QUALIFIÉ avec condition:
- Validation manuelle requise (~5 min)
- Logs [CONV_SEND]/[CONV_RECV] non capturés automatiquement
- Gates G1/G2/G3 opérationnels mais validation runtime manuelle

## Objectif P3

Créer validation Desktop E2E complète qui:
1. Lance TITANE en mode dev ou build E2E
2. Envoie automatiquement un message chat
3. Capture console logs
4. Parse decision meta (mode, reason_code, provider_used, network_used)
5. Vérifie invariants ONLINE-FIRST
6. Exécute x3
7. Génère PROOF PACK P3
8. Produit verdict PASS/FAIL/BLOCKED

**Zéro validation manuelle.**

## Approche Technique Initiale

**Framework**: Playwright (préféré)  
**Target**: Vite dev server http://127.0.0.1:5173  
**Method**: 
- `page.on('console')` pour capturer logs
- Parse [CONV_SEND] et [CONV_RECV]
- Assertions sur meta
- x3 runs pour reproductibilité

## État Pré-P3

### Commits
- 6ca03fae: P1 patch (provider decision observability)
- a67a90c7: P2 qualification (gates + legacy deprecation)

### Gates Existants
- G1: NO_OFFLINE_WITHOUT_REASON ✅
- G2: NO_FORCE_LOCAL_PROVIDER_IN_PROD ✅
- G3: LEGACY_DIVERGENCE ✅

### Infrastructure E2E Disponible
- Playwright configuré (playwright.config.ts)
- Tests existants:
  - e2e/desktop/online-chat-proof.wdio.test.js (WDIO + Tauri IPC)
  - tests/e2e/provider-flow.test.ts (Playwright + console logs)  
- Dev server Vite port 5173

### Fichiers P1 Modifiés
- src-tauri/src/conversation_engine/commands.rs (+3 lines log::warn!)
- src/services/conversationEngine.ts (+33 lines [CONV_SEND]/[CONV_RECV])
- src/hooks/useConversationEngine.ts (+25 lines mode detection)

### Fichiers P2 Ajoutés/Modifiés
- src/services/ai/providers/tauriChat.ts (+18 lines deprecation)
- scripts/gates/g{1,2,3}-*.sh (3 gate scripts)
- docs/_evidence/FIX_CHAT_PROVIDER_GOV_P2_20260223_094235/ (9 proof files)

## Snapshot Infrastructure

**Playwright**:
```bash
$ pnpm exec playwright test --version
Version 1.50.0
```

**Vite**:
```bash
$ pnpm exec vite --version
vite/7.3.1 linux-x64 node-v24.0.0
```

**Node/PNPM**:
```bash
$ node --version
v24.0.0
$ pnpm --version
10.28.2
```

## Snapshot Code (Baseline pour Rollback)

### conversationEngine.ts L261 (CONV_SEND)
```typescript
console.log('[CONV_SEND] External AI gate', {
  buildFlagEnabled: envFlag('VITE_ENABLE_EXTERNAL_AI'),
  runtimeToggleEnabled: import.meta.env.DEV ? true : runtimeFlag('titane.enable_external_ai'),
  allowed: externalAllowed,
  requested_provider: 'auto',
});
```

### conversationEngine.ts L355 (CONV_RECV)
```typescript
console.log('[CONV_RECV] Decision meta:', {
  mode: response.meta?.mode,
  reason_code: response.meta?.reason_code,
  provider_used: response.meta?.provider_used,
  network_used: response.meta?.network_used,
  attempts_count: response.meta?.attempts_count,
});
```

### useConversationEngine.ts L297 (Mode Detection)
```typescript
const mode = response.meta?.mode || 'UNKNOWN';
const reasonCode = response.meta?.reason_code || 'UNKNOWN';

if (mode === 'OFFLINE') {
  const message =
    reasonCode !== 'UNKNOWN'
      ? `Mode hors ligne: ${reasonCode}`
      : 'Mode hors ligne (raison inconnue)';
  setError(message);
  logger.warn('[useConversationEngine] OFFLINE mode', { reasonCode });
} else if (mode === 'LOCAL' || mode === 'REMOTE') {
  setError(null); // Clear error for successful modes
  logger.info('[useConversationEngine] Provider active', { mode });
}
```

## Métriques Baseline

### Taille Evidence P1+P2
```bash
$ du -sh docs/_evidence/FIX_CHAT_PROVIDER_GOV_*
352K    docs/_evidence/FIX_CHAT_PROVIDER_GOV_P1_20260223_091507
264K    docs/_evidence/FIX_CHAT_PROVIDER_GOV_P2_20260223_094235
```

### LOC Modifiées
- P1: +61 lines (commands.rs + conversationEngine.ts + useConversationEngine.ts)
- P2: +18 lines (tauriChat.ts) + 257 lines gates + ~2,200 lines documentation

### Gates Exécution Baseline
```bash
$ bash scripts/gates/g1-no-offline-without-reason.sh
✅ GATE G1: PASS

$ bash scripts/gates/g2-no-force-local-in-prod.sh
✅ GATE G2: PASS

$ bash scripts/gates/g3-legacy-divergence.sh
✅ GATE G3: PASS (with observations)
```

## Invariants à Valider (P3)

### CASE 1: externalAllowed=true
- **ASSERT**: `mode !== 'OFFLINE'` (sauf si providers réellement down)
- **ASSERT**: `provider_used` défini
- **ASSERT**: UI **NE contient PAS** "hors ligne"

### CASE 2: externalAllowed=false
- **ASSERT**: `mode === 'LOCAL' OU 'OFFLINE'`
- **ASSERT**: Si OFFLINE → `reason_code` présent

### CASE 3: mode=OFFLINE (quel que soit externalAllowed)
- **ASSERT**: `reason_code` non vide
- **ASSERT**: UI **contient** "Mode hors ligne:"

### INVARIANT GLOBAL
- **Si mode=OFFLINE** → reason_code OBLIGATOIRE
- **Si mode≠OFFLINE** → UI sans "hors ligne"

## Critères PASS P3

1. ✅ Test E2E créé (Playwright ou équivalent)
2. ✅ Logs [CONV_SEND]/[CONV_RECV] capturés
3. ✅ Meta parsé (mode, reason_code, provider_used, network_used)
4. ✅ Assertions invariants x3 runs PASS
5. ✅ G1/G2/G3 PASS
6. ✅ G4 créé et PASS
7. ✅ Proof pack P3 complet
8. ✅ ZÉRO validation manuelle

## Critères BLOCKED P3

- ❌ Impossible lancer app en mode test
- ❌ Logs non capturables
- ❌ Test E2E non stable
- ❌ Timeout récurrent
- ❌ UI testids absents (blocage infrastructure)

## Critères FAIL P3

- ❌ Offline affiché en REMOTE
- ❌ reason_code absent en OFFLINE
- ❌ provider_used absent en LOCAL/REMOTE
- ❌ 1+ run échoue sur 3

## Rollback P3

Si P3 = FAIL ou BLOCKED:
```bash
# Option 1: Revert commit P3 uniquement
  git revert HEAD

# Option 2: Revert P3 + conserver P2
git revert <commit_p3>

# Option 3: Full rollback P1+P2+P3
git revert HEAD~2..HEAD
```

## Fichiers P3 Prévus

Evidence Pack P3:
```
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_YYYYMMDD_HHMMSS/
├── BASELINE.md (ce fichier)
├── E2E_CERTIFICATION_TEST.md
├── RUN_1.md
├── RUN_2.md
├── RUN_3.md
├── LOG_CAPTURE.md
├── PARSED_DECISION_META.md
├── INVARIANT_CHECKS.md
└── VERDICT_P3.md
```

Gate G4:
```
scripts/gates/g4-provider-decision-certified.sh
```

Test E2E:
```
e2e/chat-provider-decision-certification.spec.ts
```

Script runner:
```
scripts/certification/p3-runner.sh
```

---

**Baseline établi**: 2026-02-23T10:15:06-05:00  
**Status**: READY FOR P3 EXECUTION
