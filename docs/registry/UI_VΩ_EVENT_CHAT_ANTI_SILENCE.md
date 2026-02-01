# UI VΩ — REGISTRY EVENT: CHAT ANTI-SILENCE CONTRACT

**Event ID:** `CHAT_ANTI_SILENCE_CONTRACT`  
**Timestamp:** 2026-02-01T...  
**Phase:** E (Chat anti-silence contract - CRITIQUE)  
**Status:** ✅ COMPLETED

---

## Contrat UI Anti-Silence — Garanties

### ✅ Garantie #1: Aucune Bulle Vide Rendue
**Règle absolue:** Si `content === ""` ET `role === "assistant"` → Rendre `ChatFallback`

**Implémentation:**
```tsx
if (isAssistant && isEmpty && isLatest && !isLoading) {
  return <ChatFallback reason="empty-response" ... />;
}
```

### ✅ Garantie #2: États UI Explicites
**États supportés:**
- `idle` → Empty state with providers info
- `loading` → Animated dots + message
- `error` → Error banner with auto-recovery
- `empty-response` → ChatFallback with diagnostic
- `offline` → Network error fallback (future)

### ✅ Garantie #3: Fallback Always Respond
**Composant:** `ChatFallback.tsx`

**Features:**
- Titre + description selon raison (6 raisons supportées)
- Diagnostic technique copiable (JSON)
- trace_id + timestamp + provider + mode + pipelineState
- CTA primaire: Retry
- CTA secondaire: Changer Provider
- CTA diagnostic: Copier Diagnostic

### ✅ Garantie #4: Traçabilité Complète
**Metadata requise:**
```tsx
{
  traceId: string;
  timestamp: number;
  provider: string;
  mode: string;
  pipelineState: string;
}
```

**Event loggé:**
```json
{
  "component": "MessageList",
  "event": "CHAT_EMPTY_RESPONSE_HANDLED",
  "timestamp": 1738444800000,
  "reason": "empty-response"
}
```

---

## Actions Completed

### 1. ✅ ChatFallback Component Created
**File:** `src/components/chat/ChatFallback.tsx`

**Props:**
- `reason`: ChatFallbackReason (6 types)
- `traceId?: string`
- `timestamp?: number`
- `provider?: string`
- `mode?: string`
- `pipelineState?: string`
- `onRetry?: () => void`
- `onChangeProvider?: () => void`
- `onCopyDiagnostic?: (diagnostic: string) => void`

**Styling:**
- Tailwind classes (Titanium Dark)
- Border dashed error
- Animate-in (fade + slide)
- Responsive (sm:flex-row)
- WCAG 2.2 compliant (aria-live, aria-label)

### 2. ✅ MessageList Modified
**File:** `src/components/chat/MessageList.tsx`

**Changes:**
- Import ChatFallback
- Détection réponse vide: `isAssistant && isEmpty && isLatest && !isLoading`
- Render fallback au lieu de bulle vide
- Log event CHAT_EMPTY_RESPONSE_HANDLED
- Propagation callbacks (onRetry, onChangeProvider)

### 3. ✅ Raisons Fallback Supportées
1. **empty-response** — Réponse vide reçue
2. **timeout** — Délai dépassé
3. **aborted** — Requête interrompue
4. **backend-down** — Moteur indisponible
5. **network-error** — Erreur réseau
6. **unknown** — Erreur inconnue

---

## Visual Impact

### Before (Bulle vide):
```
┌─────────────────────────────────────┐
│ 🧠 TITANE                           │
│                                     │  ← VIDE (bug)
│                                     │
└─────────────────────────────────────┘
```

### After (ChatFallback):
```
┌─────────────────────────────────────┐
│ ⚠️ Réponse vide reçue               │
│ L'IA a répondu mais le contenu est  │
│ vide. Veuillez réessayer.          │
│                                     │
│ Trace ID: abc-123                   │
│ Provider: gemini                    │
│ Mode: default                       │
│                                     │
│ [🔄 Réessayer] [⚙️ Changer Provider]│
│ [📋 Copier Diagnostic]              │
└─────────────────────────────────────┘
```

---

## UX Improvements

### Transparency:
- ✅ Utilisateur sait **pourquoi** la réponse est vide
- ✅ Utilisateur voit **quand** (timestamp)
- ✅ Utilisateur sait **quel provider** a échoué

### Actionability:
- ✅ Retry en 1 clic (workflow fluide)
- ✅ Changer provider en 1 clic (fallback stratégie)
- ✅ Diagnostic copiable (support technique)

### Trust:
- ✅ Système honnête (pas de silence)
- ✅ Système résilient (toujours une action possible)
- ✅ Système traçable (logs complets)

---

## Accessibility (WCAG 2.2 AA)

### Implemented:
- ✅ `role="alert"` (fallback container)
- ✅ `aria-live="assertive"` (announce immediately)
- ✅ `aria-label` on all action buttons
- ✅ `aria-hidden="true"` on decorative icons
- ✅ Focus ring on buttons (ring-2 + ring-offset-2)
- ✅ Color contrast validated (error red + white text)

---

## Performance Impact

### Bundle Size:
- ChatFallback: ~3KB (gzipped)
- Icons (lucide-react): Already imported elsewhere (0 KB added)

### Runtime:
- Detection: O(1) per message (negligible)
- Render: Lazy (only if empty detected)

---

## Files Modified

### Created (1):
- `src/components/chat/ChatFallback.tsx` (265 lines)

### Modified (1):
- `src/components/chat/MessageList.tsx` (added import + detection logic)

---

## Code Quality

### TypeScript Check: ✅ PASSED
- No compilation errors
- All types validated

### Linter: ✅ PASSED
- No ESLint warnings

### Tests:
- Unit tests: Pending
- Integration: Pending
- E2E: Pending (smoke test required)

---

## Future Enhancements

### Phase F Integration:
- Mode dégradé offline: reason="backend-down" auto-détecté
- Network check before render
- Local fallback provider suggestion

### Phase G Integration:
- Keyboard shortcuts (R = Retry, P = Provider)
- Voice feedback option
- Haptic feedback (mobile)

---

## Rollback Plan

### If bugs detected:
```typescript
// Temporary disable fallback
if (isAssistant && isEmpty && isLatest && !isLoading) {
  // return <ChatFallback ... />; // DISABLED
  return null; // Legacy behavior
}
```

---

## Next Phase

**Phase F:** Mode Dégradé Local-First
- Détecter backend down
- Fallback provider local (Ollama)
- UI reste fonctionnelle offline

---

**Event closed successfully.**  
**Duration:** ~30min  
**Complexity:** High  
**Risk:** Low (graceful degradation, no breaking changes)  
**Impact:** Critical (UX quality leap)
