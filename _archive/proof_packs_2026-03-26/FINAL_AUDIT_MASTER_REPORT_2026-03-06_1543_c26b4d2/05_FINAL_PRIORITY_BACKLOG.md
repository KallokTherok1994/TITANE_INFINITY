# 05 — BACKLOG PRIORITAIRE FINAL
## FINAL_AUDIT_MASTER_REPORT_2026-03-06_1543_c26b4d2

---

## P2-001 : Implémenter les 8 stubs identity

**Priorité :** P2 — prochaine sprint  
**Fichier cible :** `src-tauri/src/identity/commands.rs`  
**Commandes manquantes :**
```
identity_get_current_mode
identity_get_active_rules
identity_get_available_modes
identity_get_coherence_score
identity_get_current_tone
identity_get_personality_snapshot
identity_disable_rule
identity_enable_rule
```
**Impact :** Éliminer les `.catch(() => null)` dans `IdentityCenter.tsx`  
**Estimation :** 1 session

---

## P2-002 : Résoudre AIChatState BLOCKED_IMPL

**Priorité :** P2 — prochaine sprint  
**Problème :** `AIChatState` n'a pas d'impl `Default` → 6 commandes legacy bloquées  
**Options :**
1. Ajouter `impl Default for AIChatState` avec état par défaut sûr
2. Supprimer les 6 commandes legacy et les remplacer par `conversation_generate`  
**Note :** OMEGA v2 couvre les cas critiques — impact production = limité

---

## P2-003 : Unifier TAURI_COMMANDS.ts

**Priorité :** P2 — refactoring  
**Problème :** `src/core/commands/TAURI_COMMANDS.ts` redéclare une partie des commandes  
**Action :** Rediriger les imports vers `src/lib/tauriCommands.ts` (source canonique)  
**Risque régression :** Faible

---

## P2-004 : Réduire les 268 stubs non-enregistrés

**Priorité :** P2 — progressive  
**Stratégie :** Par catégorie :
1. **Cloud Sync** (14 cmds) : définir implémentation ou supprimer du frontend
2. **DevMode Engines** (12 cmds) : feature flag actif → implémenter ou gate
3. **Evolution/Hyper** (8 cmds) : experimental → labeler `EXPERIMENTAL` en UI
4. **Autonomy** (5 cmds) : définir scope ou supprimer

---

## P2-005 : Qualifier tests/build localement

**Priorité :** P2 — CI qualifie actuellement  
**Action :** Fournir un environnement local complet pour :
- `pnpm test` (vitest)
- `cargo test` (glib-2.0 requis)
- `pnpm test:e2e` (Tauri runtime requis)

---

## BACKLOG SUSPENDU (résolu ou non-critique)

| Item | Raison |
|------|--------|
| Ring 2 Rust HTTP | RÉSOLU |
| GitGuardian | RÉSOLU |
| Prettier failures | RÉSOLU |
| CP commands | RÉSOLU |
| SelfHeal commands | RÉSOLU |
| Identity registration | RÉSOLU |
| Audio commands | RÉSOLU |
| chat_generate allowlist | RÉSOLU |

---

## Progression mesurable

```
Global Completion = 15/20 findings résolus = 75%
P0: 100% résolu
P1: 100% résolu
P2: 0% résolu (dans budget — non bloquant)
```
