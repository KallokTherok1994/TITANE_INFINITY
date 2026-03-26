# PHASE 6 — TÂCHES RESTANTES COMPLÈTES
## MASTER_RECALC_2026-03-06_1714_128460f

---

## Tâches complétées dans cette session

| # | Tâche | Statut | Preuve |
|---|-------|--------|--------|
| T-001 | Corriger duplicats AutoHeal IDs (0049/0050) | ✅ DONE | detect_recurrence PASS |
| T-002 | Créer proof pack MASTER_RECALC | ✅ DONE | Ce pack |
| T-003 | verify_instructions.sh PASS=20 | ✅ DONE | PASS=20 FAIL=0 |
| T-004 | Ajouter entrée AutoHeal pour cette session | ✅ DONE | AH-2026-03-06-0055 |

---

## Tâches P2 restantes (backlog — non bloquantes)

Issues identifiées depuis `FINAL_AUDIT_MASTER_REPORT_2026-03-06_1543`:

### P2-001 : Implémenter les 8 stubs identity
**Fichier:** `src-tauri/src/identity/commands.rs`
**Commandes:**
- identity_get_current_mode
- identity_get_active_rules
- identity_get_available_modes
- identity_get_coherence_score
- identity_get_current_tone
- identity_get_personality_snapshot
- identity_disable_rule
- identity_enable_rule

**Impact:** Éliminer les `.catch(() => null)` dans `IdentityCenter.tsx`
**Estimation:** 1 session

### P2-002 : Résoudre AIChatState BLOCKED_IMPL
**Options:**
1. Ajouter `impl Default for AIChatState` avec état sûr
2. Migrer les 6 cmds legacy vers `conversation_generate`

**Note:** OMEGA v2 couvre les cas critiques — impact production limité
**Estimation:** 1 session

### P2-003 : Unifier TAURI_COMMANDS.ts
**Action:** Rediriger imports de `src/core/commands/TAURI_COMMANDS.ts` vers `src/lib/tauriCommands.ts`
**Risque:** Faible
**Estimation:** 0.5 session

### P2-004 : Réduire les 268 stubs non-enregistrés
**Stratégie par catégorie:**
- Cloud Sync (14 cmds): définir implémentation ou supprimer
- DevMode Engines (12 cmds): feature flag → implémenter ou gate
- Evolution/Hyper (8 cmds): labeler EXPERIMENTAL
- Autonomy (5 cmds): définir scope ou supprimer

**Estimation:** 2-3 sessions

### P2-005 : Qualifier tests/build localement
**Action:** Fournir environnement complet pour vitest + cargo test + E2E
**Estimation:** Environnement CI/Docker

---

## Tâches non-code restantes

| # | Tâche | Priorité |
|---|-------|----------|
| NC-001 | Approbation PR pour merge vers main | BLOCKED_APPROVAL |
| NC-002 | Validation CI sur PR merged | BLOCKED_APPROVAL |

---

## Chemin minimal vers 100% PASS / SEALED

```
Sprint P2-ALPHA (prochaine session):
1. identity/commands.rs → 8 stubs (P2-001)
2. AIChatState::default() ou migration (P2-002)
3. Unification TAURI_COMMANDS.ts (P2-003)

Sprint P2-BETA (session suivante):
4. Réduction stubs non-enregistrés (P2-004)
5. Tests locaux qualifiés (P2-005)

Approbation + merge:
6. PR approuvé → CI main qualifie → SEALED
```
