# 🗄️ Legacy Code - Politique de Gestion TITANE∞

Ce dossier contient le code legacy en cours de migration vers l'architecture OMEGA v2 (4-Ring Model).

---

## 📋 Politique de Retrait Progressive

### Cycle de vie legacy (6 mois):

1. **Mois 0-2**: Code marqué `@deprecated` + tests désactivés
2. **Mois 2-4**: Migration vers nouvelle architecture (4-Ring)
3. **Mois 4-6**: Validation extensive nouvelle implémentation
4. **Mois 6**: Retrait définitif du code legacy

### Marquage obligatoire:

```typescript
/**
 * @deprecated depuis v24.4.0 - Utiliser ConversationManager à la place
 * @see ConversationManager
 * @removal v25.0.0 (June 2025)
 */
export async function chat_send_message(text: string): Promise<string> {
  // Legacy implementation
}
```

---

## 📦 Inventaire Legacy

### 🔴 Frontend Modules (React/TS)

| Module                                      | Raison                    | Remplacement             | Statut       | Deadline |
| ------------------------------------------- | ------------------------- | ------------------------ | ------------ | -------- |
| `src/modules/chat/ChatLegacy.tsx`           | Utilise chat_send_message | ConversationManager      | ⏳ Migration | v25.0.0  |
| `src/engines/legacy/cognitiveEngine_v15.ts` | Architecture pré-v16      | CognitiveKernel (Ring 0) | ⏳ Migration | v25.0.0  |

### 🔴 Backend Commands (Rust/Tauri)

| Command                | Raison                 | Remplacement               | Statut       | Deadline |
| ---------------------- | ---------------------- | -------------------------- | ------------ | -------- |
| `chat_send_message`    | Pas OMEGA v2 compliant | conversation_send_message  | ⏳ Migration | v25.0.0  |
| `legacy_avatar_update` | Mono-thread            | fullbody_update_expression | ⏳ Migration | v25.0.0  |

### 🟡 Engines (Cognitive/AI)

| Engine                | Raison       | Remplacement        | Statut       | Deadline |
| --------------------- | ------------ | ------------------- | ------------ | -------- |
| `cognitiveEngine_v15` | Pré-OMEGA v2 | CognitiveKernel v24 | ⏳ Migration | v25.0.0  |

### 🟢 Scripts (Bash/Python)

| Script                    | Raison                  | Remplacement                     | Statut       | Deadline |
| ------------------------- | ----------------------- | -------------------------------- | ------------ | -------- |
| `validate_chat_legacy.sh` | Teste chat_send_message | validate_conversation_manager.sh | ⏳ Migration | v25.0.0  |

---

## 🛠️ Guide de Migration

### Étape 1: Identifier code legacy

```bash
# Trouver tous les @deprecated
grep -r "@deprecated" src/

# Trouver utilisation chat_send_message
grep -r "chat_send_message" src/
```

### Étape 2: Créer nouvelle implémentation (4-Ring)

```typescript
// ❌ Legacy (pré-v24.4.0)
import { chat_send_message } from '@/legacy/commands';

async function sendMessage(text: string) {
  const response = await chat_send_message(text);
  return response;
}

// ✅ OMEGA v2 (v24.4.0+)
import { sendAIMessage } from '@/services/ai/ConversationManager';

async function sendMessage(text: string) {
  const response = await sendAIMessage(text, 'conversation-id');
  return response.content;
}
```

### Étape 3: Tests de régression

```bash
# Tester ancienne implémentation
npm run test:legacy

# Tester nouvelle implémentation
npm run test:omega

# Comparer résultats
npm run test:migration-parity
```

### Étape 4: Déploiement progressif

1. ✅ Feature flag (activer nouvelle version pour 10% users)
2. ✅ Monitoring (comparer métriques legacy vs new)
3. ✅ Rollout 50% → 100%
4. ✅ Retrait legacy après 2 semaines sans incidents

---

## 📊 Statistiques Legacy

### État actuel (v24.4.0):

- **Modules frontend legacy**: 2
- **Commands Tauri legacy**: 2
- **Engines legacy**: 1
- **Scripts legacy**: 1
- **Total fichiers**: 6

### Progression migration:

- ⏳ En cours: 100% (6/6)
- ✅ Migrés: 0% (0/6)
- ❌ Bloqués: 0% (0/6)

**Objectif v25.0.0**: 0 fichiers legacy restants

---

## 🚫 Règles Strictes

### ❌ Interdictions

1. **Pas de nouveau code legacy**:
   - Toute nouvelle feature doit utiliser architecture v24 (4-Ring)
   - Pas d'ajouts dans `legacy/`

2. **Pas de modifications legacy sauf bugfixes critiques**:
   - Legacy est en mode "maintenance only"
   - Nouveaux développements interdits

3. **Pas de dépendances entre legacy et nouveau code**:
   - `legacy/` doit être isolé
   - Nouvelle architecture NE DOIT PAS importer depuis `legacy/`

### ✅ Autorisations

1. **Bugfixes critiques uniquement** (sécurité, crashes)
2. **Documentation** (pour faciliter migration)
3. **Tests** (pour validation migration)

---

## 📝 Logs de Migration

### v24.4.0 (Décembre 2024)

- ✅ Création `ConversationManager` (remplacement `chat_send_message`)
- ✅ Création tests OMEGA v2 compliance
- ⏳ Migration `ChatLegacy.tsx` → `Chat.tsx` (en cours)

### v24.5.0 (Janvier 2025) - Prévu

- ⏳ Migration `cognitiveEngine_v15` → `CognitiveKernel` (planifié)
- ⏳ Retrait `legacy_avatar_update` (planifié)

### v25.0.0 (Juin 2025) - Objectif

- ❌ **Retrait complet legacy/** (objectif)
- ❌ Suppression dossier `legacy/` (objectif)

---

## 🔗 Ressources

- **Architecture v24**: [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Guide de contribution**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Code Style**: [CODE_STYLE.md](../CODE_STYLE.md)
- **OMEGA v2 Spec**: [docs/OMEGA_v2_SPEC.md](../docs/OMEGA_v2_SPEC.md)

---

**⚠️ Attention**: Code legacy est maintenu pour compatibilité rétroactive UNIQUEMENT. Utilisez OMEGA v2 pour tout nouveau développement.
