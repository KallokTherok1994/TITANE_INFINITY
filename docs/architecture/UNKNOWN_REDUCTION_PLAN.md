# UNKNOWN_REDUCTION_PLAN
**Date**: 2026-03-26 | **Scope**: Réduction des UNKNOWN post-chantier à coût bas

---

## RÉSULTATS DES RÉDUCTIONS

### UNKNOWN-1: chatClient.ts orphelin
**Statut**: **RESOLVED — fichier inexistant**

Grep exhaustif sur src/, tests/, e2e/, scripts/ → 0 résultats.
Recherche par `find` → fichier introuvable dans le repo.
**Conclusion**: Le fichier `src/services/ai/chatClient.ts` n'existe pas dans le repo actuel.
UNKNOWN classé RESOLVED. Aucune action requise.

---

### UNKNOWN-2: features/conversation/ vs features/chat/ overlap
**Statut**: **QUALIFIED — ALIAS_COMPAT confirmé**

**Analyse**:
| Fichier | features/conversation/ | features/chat/ | Verdict |
|---------|------------------------|----------------|---------|
| `ProviderStatusPanel.tsx` | Re-exporte depuis `@/features/chat/ProviderStatusPanel` | Implémentation complète (312L) | chat/ = canonique |
| `ChatProviderSelector.tsx` | Légèrement derrière (pas de data-testid) | Avec data-testid | chat/ = plus complet |
| `exportImport.ts` | Logger.warn/error | console.warn/error | conversation/ = plus propre |
| `artifactIntent.ts` | Absent | Présent | chat/ = canonique |
| `ChatMessage.tsx` | Identique | Identique | — |
| `TypingIndicator.tsx` | Identique | Identique | — |
| `ChatContextPanel.tsx` | Identique | Identique | — |

**Imports entrants**:
- `features/conversation/` utilisé par: ChatPage.tsx, ConversationSection.tsx, Chat.tsx (3 pages)
- `features/chat/` utilisé directement par: ProviderStatusPanel re-export + __tests__

**Décision**:
- `features/chat/` = **KEEP_CORE** (implémentation canonique)
- `features/conversation/` = **ALIAS_COMPAT** (couche de compatibilité publique)

**Migration P2** (différée — scope moyen):
Objectif futur: faire pointer tous les fichiers conversation/ vers chat/ via re-export, puis supprimer les duplicats. Nécessite mise à jour des imports entrants (ChatPage, ConversationSection, Chat).

**Gate requise**: tsc PASS + vitest ≥ 3518/3518 après migration.

---

### UNKNOWN-3: vitest.workspace.ts
**Statut**: **RESOLVED**

Contenu confirmé:
```ts
import { defineWorkspace } from 'vitest/config';
export default defineWorkspace(['vitest.unit.config.ts', 'vitest.integration.config.ts']);
```
Rôle: split les tests en 2 configs (unit + integration). Cohérent avec TEST_AUTHORITY_MAP. Aucune ambiguïté.

---

### UNKNOWN-4: storybook/chromatic CI integration
**Statut**: **QUALIFIED — LABS_OPS, non bloquant**

`.storybook/` existe dans le repo. Non intégré dans le pipeline CI principal (`pnpm run verify`).
`chromatic` dans package.json: si présent, c'est en devDependencies.
**Décision**: LABS_OPS — pas dans le chemin critique. Non prioritaire.

---

## UNKNOWNS NON RÉDUITS (différés)

| UNKNOWN | Raison | Gate |
|---------|--------|------|
| better-sqlite3 Node.js vs Tauri WebView compat | BLOCKED_ENV — nécessite test runtime Tauri | Runtime Tauri disponible |
| DEEP/ARCHITECT/OMEGA runtime proof | BLOCKED_ENV — nécessite desktop E2E | wdio+tauri-driver |
| Physical Core/Labs/Ops moves | DEFERRED P3 — régression risk | Test baseline 100% + regression suite |
| MemoryIntelligenceEngine migration | DEFERRED P2 — interface incompatible | Session dédiée |
| Ollama streaming SSE | DEFERRED P3 — feature work | Session dédiée |
| TimePage flowState wiring | DEFERRED P2 — feature work | Session dédiée |

---

## ACTIONS SUITE

1. **features/conversation/ migration P2**: session dédiée avec branch + tsc gate
2. **better-sqlite3 compat**: tester en runtime Tauri réel quand disponible
3. **storybook**: laisser en LABS_OPS, ne pas intégrer en CI sans décision explicite
