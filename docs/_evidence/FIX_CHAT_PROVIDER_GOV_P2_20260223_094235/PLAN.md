# P2 PLAN — Transformation PASS AVEC RÉSERVES → PASS QUALIFIÉ

**Mode**: COPILOT VSCODE AUTO (100% AUTO)  
**Methodology**: PROOF-DRIVEN. STOP-THE-LINE.  
**Context**: P1 = patch appliqué + proof pack complet, non encore commité

---

## OBJECTIF P2

Transformer "PASS avec réserves" → "PASS qualifié" via:

1. **Commit propre** du patch P1 + tags evidence
2. **Validation réelle x3** (runs reproductibles avec logs réels)
3. **Legacy alignment** (tauriChat.ts patch/neutralisation)
4. **Gates bloquants** anti-régression
5. **Proof pack P2** complet + verdict final

---

## LOIS NON NÉGOCIABLES

### L1: ONLINE-FIRST
Si `externalAllowed=true` ET `≥1 provider remote READY`:
- `selected_provider != 'local'`
- UI n'affiche **jamais** "hors ligne"

### L2: OFFLINE = EXPLICITE
Mode `OFFLINE` requiert:
- `meta.mode = 'OFFLINE'`
- `meta.reason_code` obligatoire (non-empty)

### L3: NO LEGACY DIVERGENCE
Le legacy `tauriChat.ts` ne doit **pas** pouvoir forcer `provider='local'` quand cloud autorisé.

### L4: STOP-THE-LINE TRIGGERS
Arrêt immédiat si:
- Tests/runs réels impossibles à exécuter
- Logs decision meta manquants dans run réel
- Divergence "modern vs legacy"
- Offline affiché sans reason_code

---

## PHASES D'EXÉCUTION

### Phase 0: État initial (DONE)
- ✅ Baseline captured
- ✅ Evidence folder P2 créé
- ✅ Plan documenté

### Phase 1: COMMIT (NEXT)
**Scope**: Commit atomique du patch P1 + proof packs

**Actions**:
1. Pré-check strict (repo propre)
2. `git add` des 3 fichiers + evidence folders
3. `git commit` avec message structuré
4. Vérification post-commit (git log, diff vide)

**Output**: 
- Commit SHA
- FILES_CHANGED.md

**Gate**: FAIL si fichiers imprévus dans commit

---

### Phase 2: VALIDATION RÉELLE x3
**Scope**: Runs automatisés avec collecte logs [CONV_SEND]/[CONV_RECV]

**Actions**:
1. Identifier scripts E2E/tests existants (`package.json`, `wdio*`, `playwright*`)
2. Si automatisation possible:
   - Loop x3: `pnpm run dev:tauri` + E2E chat + capture logs + stop
3. Si aucune automatisation:
   - STOP-THE-LINE = BLOCKED (validation sans manuel impossible)

**Output**:
- VALIDATION_SCRIPTS.md
- RUN_REAL_1.md, RUN_REAL_2.md, RUN_REAL_3.md

**PASS criteria**:
- ≥2/3 runs avec `mode='REMOTE'` si externalAllowed=true + clés cloud
- Aucun run n'affiche "hors ligne" en mode REMOTE
- Si LOCAL/OFFLINE: reason_code présent

**Gate**: BLOCKED si pas de logs réels, ou si offline sans reason_code

---

### Phase 3: LEGACY ALIGNMENT
**Scope**: Patch ou neutralisation de `tauriChat.ts`

**Actions**:
1. Rechercher usages réels: `rg "from .*tauriChat|new TauriChat"`
2. Décision selon résultats:
   - **Option L1 (Preferred)**: Align avec gate moderne
     - Utiliser `getExternalAIGateState()`
     - `requested_provider='auto'` si allowed=true
     - Ajouter logs [CONV_SEND]/[CONV_RECV] équivalents
   - **Option L2**: Hard deprecation guard
     - WARN "LEGACY_TAURICHAT_USED"
     - Throw en dev si invoked (sauf si casse runtime)

**Output**:
- LEGACY_FINDINGS.md
- LEGACY_CHANGES.md (si patch appliqué)

**Gate**: FAIL si legacy reste utilisable et force local sans gate

---

### Phase 4: GATES ANTI-RÉGRESSION
**Scope**: Checks automatiques simples (scripts bash/node, pas de nouvelles deps)

**Gates à implémenter**:

1. **G1: NO_OFFLINE_WITHOUT_REASON**
   - `rg` check: toute occurrence de setError/offline doit exiger reason_code
   - Guard runtime: si `mode=='OFFLINE' && !reason_code` → console.error + marker

2. **G2: NO_FORCE_LOCAL_PROVIDER_IN_PROD**
   - Backend: log marker unique si FORCE_LOCAL_PROVIDER set au boot
   - Script bash: FAIL si env var détectée dans config prod
   - Minimum: doc "PROD_ENV_CHECKLIST.md"

3. **G3: LEGACY_DIVERGENCE**
   - Script `rg`: FAIL si tauriChat.ts contient `provider: 'local'` sans condition gate

**Output**:
- GATES.md (description + how to run)
- Gate execution outputs

**Gate**: FAIL si un gate échoue

---

### Phase 5: PROOF PACK P2
**Scope**: Documentation complète dans evidence folder P2

**Files à créer**:
- ✅ BASELINE.md (DONE)
- ✅ PLAN.md (DONE)
- VALIDATION_SCRIPTS.md
- RUN_REAL_1.md, RUN_REAL_2.md, RUN_REAL_3.md
- LEGACY_FINDINGS.md
- LEGACY_CHANGES.md (si applicable)
- GATES.md
- COMMANDS_RUN.md (log de toutes commandes executées)
- FILES_CHANGED.md (liste finale)
- VERDICT_P2.md (PASS/FAIL/BLOCKED + critères)

---

### Phase 6: OUTPUT FINAL
**Scope**: Affichage synthèse dans chat Copilot

**Contenu**:
- FILES_CHANGED (liste exacte)
- RING IMPACT (par fichier)
- COMMANDS_RUN (liste)
- PROOF PACK PATH P2
- VERDICT_P2 (PASS/FAIL/BLOCKED) + justification
- ROLLBACK (git revert + restore instructions)

---

## ROLLBACK STRATÉGIE

**Si FAIL**:
```bash
git revert HEAD  # Si commit déjà fait
# OU
git restore src-tauri/src/conversation_engine/commands.rs \
            src/hooks/useConversationEngine.ts \
            src/services/conversationEngine.ts
```

**Temps**: <5s  
**Proofs**: Diff après restore = vide

---

## MÉTRIQUES SUCCÈS

| Critère | Requis | Status |
|---------|--------|--------|
| Commit propre | Git log SHA visible | ❓ |
| Runs réels ≥2/3 PASS | Logs [CONV_SEND]/[CONV_RECV] présents | ❓ |
| Legacy patché/neutralisé | Pas de force local sans gate | ❓ |
| Gates ≥3 implémentés | Scripts fonctionnels | ❓ |
| Proof pack complet | ≥10 fichiers evidence | ❓ |
| VERDICT P2 = PASS | Sans réserves bloquantes | ❓ |

---

**Next Step**: Phase 1 — COMMIT
