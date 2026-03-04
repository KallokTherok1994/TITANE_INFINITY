# 10_MASTER_FIX_PLAN — Plan de remédiation priorisé
**Session:** AUDIT360_20260304_173436 (continuation de AUDIT360_20260304_132822)
**Horodatage UTC:** 2026-03-04T17:34:36Z
**Version:** 27.2.0

---

## Principes de priorisation

| Priorité | Critère | Délai recommandé |
|----------|---------|-----------------|
| P0 | Crash / perte de données / sécurité critique | Immédiat (hotfix) |
| P1 | Violation invariant constitutionnel, dette archi bloquante | Sprint dédié (1-2 semaines) |
| P2 | Amélioration qualité, gouvernance, UX | Sprint normal (1 mois) |
| P3 | Nice-to-have, optimisations | Backlog |

---

## Findings P1 — Sprint dédié recommandé

### FIX-RV-001 — selfHealingEngine : déplacer vers Ring 3

**Finding :** `src/engines/selfHealing/selfHealingEngine.ts` utilise `safeInvoke` (I/O en Ring 2)
**Action :**
```bash
# Option A : Déplacer le fichier vers Ring 3
mv src/engines/selfHealing/selfHealingEngine.ts src/services/selfHealing/selfHealingEngine.ts
# Mettre à jour les imports dans les consommateurs

# Option B : Extraire uniquement le sous-module I/O
# Créer src/services/selfHealing/selfHealingIOAdapter.ts
# selfHealingEngine.ts reste en Ring 2 (logique pure)
# selfHealingIOAdapter.ts en Ring 3 (appels IPC)
```
**Estimation :** M (2-4h) — impact : imports dans ~5-10 fichiers consommateurs
**Rollback :** `git restore -- src/engines/selfHealing/selfHealingEngine.ts`

---

### FIX-RV-002 — cognitiveLayoutIntegrations : déplacer vers Ring 3

**Finding :** `src/engines/cognitive/cognitiveLayoutIntegrations.ts` utilise `tauriClient` (I/O en Ring 2)
**Action :**
```bash
# Déplacer vers Ring 3 (nom "Integrations" indique un connecteur I/O)
mv src/engines/cognitive/cognitiveLayoutIntegrations.ts src/services/cognitive/cognitiveLayoutIntegrations.ts
# Mettre à jour les imports dans les consommateurs
```
**Estimation :** S (1-2h)
**Rollback :** `git restore -- src/engines/cognitive/cognitiveLayoutIntegrations.ts`

---

### FIX-IPC-004 — Migrer SecureResponse.data → content

**Finding :** 100+ callsites utilisent `.data` au lieu de `.content`
**Action :**
```bash
# Identifier tous les callsites
grep -rn "\.data" src/ --include="*.ts" --include="*.tsx" | grep "SecureResponse\|secureInvoke" | wc -l

# Migration progressive par module
# 1. Mettre à jour le type SecureResponse pour accepter les deux temporairement
# 2. Migrer les callsites par domaine (mémoire, chat, système...)
# 3. Supprimer l'alias .data une fois tous migrés
```
**Estimation :** L (1-2 jours) — 100+ fichiers à modifier
**Rollback :** `git restore -- src/` si migration échoue à mi-parcours

---

## Findings P2 — Sprint normal

### FIX-IPC-CANON-001 — generate_response : ajouter champ ok

**Finding :** `src-tauri/src/commands/ai_chat.rs:249` — réponse sans `ok: true`
**Action :**
```rust
// Avant
Ok(serde_json::json!({
    "content": balanced_response,
    "provider": format!("{:?}", response.provider),
    "tokens": response.tokens,
    "timestamp": response.timestamp,
}).to_string())

// Après
Ok(serde_json::json!({
    "ok": true,
    "content": balanced_response,
    "provider": format!("{:?}", response.provider),
    "tokens": response.tokens,
    "timestamp": response.timestamp,
}).to_string())
```
**Estimation :** XS (15-30 min) — 1 ligne Rust + 1 ligne par commande concernée
**Impact :** Mise en conformité gouvernance, aucun impact runtime UI (UI lit `response.content`)
**Rollback :** `git restore -- src-tauri/src/commands/ai_chat.rs`

---

### FIX-SEC-001 — CSP img-src : restreindre https:

**Finding :** `src-tauri/tauri.conf.json:66` — `img-src ... https:` autorise toute image HTTPS externe
**Action :**
```json
// Avant
"img-src 'self' asset: data: blob: https:"

// Après (si aucune image externe explicitement requise)
"img-src 'self' asset: data: blob:"

// Ou si des avatars/images de providers sont nécessaires, lister explicitement :
"img-src 'self' asset: data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com"
```
**Estimation :** XS (15 min) — 1 champ JSON
**Test de régression :** Vérifier qu'aucune image UI ne charge depuis une URL externe non listée
**Rollback :** `git restore -- src-tauri/tauri.conf.json`

---

### FIX-SEC-002 — db_service.rs : Mutex unwrap → expect

**Finding :** `src-tauri/src/services/db_service.rs` — 9+ `.unwrap()` sur Mutex locks
**Action :**
```rust
// Avant
let conn = self.conn.lock().unwrap();

// Après
let conn = self.conn.lock().expect("db_service: Mutex poisonné — état incohérent");
```
**Estimation :** XS (30 min) — rechercher/remplacer ciblé dans db_service.rs
**Rollback :** `git restore -- src-tauri/src/services/db_service.rs`

---

### FIX-CHAT-01 — Désactiver textarea pendant envoi

**Finding :** ConversationSection — double-submit possible via Enter rapide
**Action :**
```tsx
// Ajouter disabled sur le textarea
<textarea
  {...}
  disabled={sendingRef.current}
/>
// Ou utiliser l'état loading du hook
```
**Estimation :** XS (20 min)
**Rollback :** `git restore -- src/components/sections/ConversationSection.tsx`

---

## Findings P2 différés (sprints futurs)

### FIX-PERF-002 — stream_response : vrai streaming

**Finding :** `stream_response` retourne la réponse complète puis la chunke (faux streaming)
**Action :** Refactorisation `ProviderBridge` pour streaming natif par provider
**Estimation :** XL (3-5 jours) — refactorisation profonde
**Bloquer sur :** Design doc + tests de régression streaming

---

## Plan d'exécution recommandé

### Sprint 1 — Architecture (1 semaine)
1. FIX-RV-001 — selfHealingEngine → Ring 3
2. FIX-RV-002 — cognitiveLayoutIntegrations → Ring 3
3. `pnpm test:architecture` doit passer après chaque déplacement

### Sprint 2 — Sécurité + IPC rapide (2-3 jours)
1. FIX-IPC-CANON-001 — ajouter `ok: true` (15 min)
2. FIX-SEC-001 — restreindre CSP img-src (15 min)
3. FIX-SEC-002 — db_service Mutex expect (30 min)
4. FIX-CHAT-01 — désactiver textarea (20 min)

### Sprint 3 — Migration IPC-004 (1-2 semaines)
1. FIX-IPC-004 — migrer .data → .content progressivement

### Sprint 4 — Performance (futur)
1. FIX-PERF-002 — vrai streaming

---

## Métriques cibles post-remédiation

| Gate | État actuel | Cible post-Sprint 1+2 |
|------|-------------|----------------------|
| G2 — 4-Ring | ⚠️ MINOR | ✅ PASS |
| IPC-CANON | P2 OPEN | ✅ CONFORMÉ |
| CSP | P2 OPEN | ✅ DURCI |
| db_service Rust | P2 OPEN | ✅ ROBUSTE |
| Chat UX | P2 OPEN | ✅ CORRIGÉ |
