# 07 — BACKLOG FINAL PRIORITAIRE
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## A. P0 — Critique immédiat

**Aucun P0 identifié.** Les invariants constitutionnels sont respectés :
- Tauri-only ✅
- Deny-by-default ✅
- Anti-silence ✅
- Contrat IPC canonique ✅

---

## B. P1 — À aligner avant le seal

### B-1 — Retrait `chat_generate` de `chat_ai.json` [APPLYING]

- **Finding :** F-006
- **Objectif :** Retirer l'alias mort `chat_generate` de l'allowlist Tauri
- **Cause racine :** `chat_generate` n'existe pas dans `generate_handler!` — seules les versions
  `chat_generate_gemini`, `chat_generate_openai`, `chat_generate_claude` existent.
  L'alias est dans l'allowlist depuis une époque antérieure à la refactorisation.
- **Fichier :** `src-tauri/capabilities/chat_ai.json`
- **Ring touché :** R4 (capabilities)
- **Impact réseau :** Nul
- **Preuve requise :** `grep -v chat_generate src-tauri/capabilities/chat_ai.json`
- **Rollback :** `git restore -- src-tauri/capabilities/chat_ai.json`
- **Type :** CODE (capabilities)
- **Ordre d'exécution :** 1 (appliqué en session 3)

---

## C. P2 — Seal / anti-régression / suivi uniquement

### C-1 — autonomy_* (5 commandes) — allowlistés mais non enregistrés

- **Finding :** F-007
- **Objectif :** Implémenter les stubs ou retirer de `self_heal.json`
- **Fichier :** `src-tauri/capabilities/self_heal.json`
- **Type :** CODE ou SCRIPT
- **Urgence :** Non — budget toléré

### C-2 — engines_devmode_* (12 commandes) — stubs non enregistrés

- **Finding :** F-008
- **Objectif :** Implémenter ou supprimer `developer_mode.json`
- **Type :** CODE
- **Urgence :** Non — feature non active

### C-3 — identity stubs (8 commandes) sans backend

- **Finding :** F-011
- **Objectif :** Créer stubs dans `identity/commands.rs` (identity_get_current_mode, etc.)
- **Fichier :** `src-tauri/src/identity/commands.rs`
- **Type :** CODE
- **Urgence :** Moyen — `IdentityCenter.tsx` appelle ces commandes avec fallback `.catch(() => null)`

### C-4 — AIChatState non managé

- **Finding :** F-012
- **Objectif :** Ajouter `Default` impl à `AIChatState` ou migrer définitivement vers OMEGA v2
- **Type :** CODE
- **Urgence :** Faible — OMEGA v2 couvre les cas critiques via `conversation_generate`

### C-5 — handlers.rs code mort

- **Finding :** F-014
- **Objectif :** Annoter `// DEAD CODE — do not use this macro` ou supprimer
- **Type :** DOC
- **Urgence :** Faible — confusion développeur seulement

### C-6 — TAURI_COMMANDS.ts dupliqué

- **Finding :** F-015
- **Objectif :** Consolider vers `src/lib/tauriCommands.ts`
- **Type :** CODE
- **Urgence :** Faible — pas de risque runtime immédiat

---

## Budget total

| Priorité | Items | Appliqués | Restants |
|----------|-------|-----------|---------|
| P0 | 0 | 0 | 0 |
| P1 | 1 (F-006) | 1 | 0 |
| P2 | 6 | 0 | 6 (budget toléré) |
