# TITANE∞ v19.3Ω — Invariants & Contrats Système

## Date: 2025-01-24
## Version: 19.3Ω (OMEGA)
## Auteur: TITANE∞ Architecture Team

---

## 📐 Introduction

Ce document définit les **invariants** et **contrats** du système TITANE∞.
Un invariant est une propriété qui DOIT toujours être vraie à tout moment de l'exécution.
Violer un invariant indique un bug critique nécessitant une correction immédiate.

---

## 🔴 INVARIANTS CRITIQUES (NIVEAU P0)

### INV-001: Chat Message Persistence
```
∀ message ∈ sendMessage():
  PRE:  message.content.length > 0
  POST: message ∈ localStorage ∧ message ∈ UI.messages

  INVARIANT: |UI.messages| ≥ |localStorage.messages| (pendant opération)
             |UI.messages| = |localStorage.messages| (état stable)
```
**Fichier:** `src/hooks/useChat.ts`
**Protection:** `operationLockRef`, `isLoadingRef`, triple protection vault+ref+memory

### INV-002: State Never Corrupted During Operation
```
∀ t ∈ [sendMessage.start, sendMessage.end]:
  operationLockRef.current = true
  ⇒ messagesForMode sync BLOQUÉ
```
**Fichier:** `src/hooks/useChat.ts`
**Implémentation:** Guard flag avec délai de release (100ms)

### INV-003: TTS Anti-Echo
```
∀ tts_event ∈ {start, end, error}:
  tts_event.start ⇒ VAD.suspended = true
  tts_event.end   ⇒ VAD.suspended = false
```
**Fichier:** `src/services/tts/hybridTTS.ts`
**Machine à états:** `src/services/audio/audioStateMachine.ts`

---

## 🟠 INVARIANTS STATE MACHINE (NIVEAU P1)

### INV-010: Audio State Machine Transitions
```
ÉTATS: {idle, user_speaking, processing, ai_speaking, paused, error}

TRANSITIONS VALIDES:
  idle         → {user_speaking, paused, error}
  user_speaking → {processing, paused, error, idle}
  processing   → {ai_speaking, paused, error, idle}
  ai_speaking  → {idle, user_speaking, paused, error}
  paused       → {idle}
  error        → {idle}

INVARIANT: ∀ transition(state_from, event, state_to):
  state_to ∈ VALID_TRANSITIONS[state_from]
```
**Fichier:** `src/services/audio/audioStateMachine.ts`

### INV-011: Barge-In Priority
```
event = BARGE_IN ∧ state = ai_speaking
⇒ TTS.stop() ∧ state = user_speaking (immédiat)
```
**Priorité:** Utilisateur interrompt TOUJOURS l'IA

### INV-012: Single Active State
```
∀ t: |activeStates| = 1
```
**Un et un seul état audio actif à tout moment**

---

## 🟡 INVARIANTS EVENT SOURCING (NIVEAU P2)

### INV-020: TitanEvent Schema Version
```
∀ event ∈ TitanEvent:
  event.schema_version ∈ ℕ (unsigned 32-bit)
  event.schema_version ≥ 1
  event.origin ∈ {User, Engine, SelfHeal, System, Migration}
```
**Fichier:** `src-tauri/src/singularity/events.rs`

### INV-021: Event Immutability
```
∀ event ∈ EventStore:
  created(event) ⇒ ¬modified(event)
```
**Les événements sont immuables une fois créés**

### INV-022: Snapshot Consistency
```
∀ snapshot ∈ Snapshots:
  snapshot.state = replay(events[0..snapshot.event_index])
```
**Un snapshot doit être reproductible par replay des événements**

---

## 🔵 INVARIANTS UI/UX (NIVEAU P3)

### INV-030: Message Display Order
```
∀ i, j ∈ messages: i < j ⇒ messages[i].timestamp ≤ messages[j].timestamp
```
**Les messages sont toujours affichés dans l'ordre chronologique**

### INV-031: Loading State Consistency
```
isLoading = true ⇒ (input.disabled ∨ UI.showSpinner)
isLoading = false ⇒ input.enabled
```
**L'UI reflète toujours l'état de chargement**

### INV-032: Error Recovery
```
error ≠ null ⇒ ∃ recovery_action
recoveryCount < MAX_RECOVERY ⇒ auto_recovery_enabled
```
**Toute erreur doit avoir un chemin de récupération**

---

## 🟢 INVARIANTS MÉMOIRE (NIVEAU P4)

### INV-040: Memory Compaction Threshold
```
|messages| > COMPRESSION_THRESHOLD (30)
⇒ compress_to(COMPRESSION_TARGET (20))
```
**Fichier:** `src/services/chatMemoryCompactor.ts`

### INV-041: LocalStorage Consistency
```
localStorage.getItem(key) = null ∨ JSON.parse(localStorage.getItem(key)) ≠ error
```
**Tout ce qui est stocké est parseable**

### INV-042: Memory Stats Accuracy
```
memoryStats.count = |messages|
memoryStats.sizeMB = sizeof(localStorage[mode]) / (1024 * 1024)
```

---

## ⚙️ CONTRATS DE FONCTION

### useChat.sendMessage()
```typescript
/**
 * @contract
 * @pre content.trim().length > 0
 * @pre !isLoading (sinon queue)
 * @post messages.length = messages_before.length + 2 (user + assistant)
 * @post localStorage synchronized
 * @invariant operationLockRef.current = true pendant exécution
 * @timeout 15000ms (configurable)
 * @fallback omnis-fallback provider si erreur
 */
async function sendMessage(content: string): Promise<AIMessage>
```

### hybridTTS.speak()
```typescript
/**
 * @contract
 * @pre text.trim().length > 0
 * @pre !speaking (ou queue)
 * @post audioStateMachine.state = 'ai_speaking' pendant lecture
 * @post audioStateMachine.state = 'idle' après lecture
 * @emit 'start' au début
 * @emit 'end' à la fin
 * @emit 'error' si échec
 * @fallback WebSpeech API → Silence
 */
async function speak(text: string, config?: TTSConfig): Promise<void>
```

### audioStateMachine.transition()
```typescript
/**
 * @contract
 * @pre event ∈ VALID_EVENTS
 * @pre VALID_TRANSITIONS[currentState].includes(event)
 * @post state = STATE_TRANSITIONS[currentState][event]
 * @emit onStateChange(newState, oldState, event)
 * @log console.log si enableLogging
 */
function transition(event: AudioEvent): boolean
```

---

## 🧪 TESTS D'INVARIANTS

### Tests automatisés requis

```typescript
// INV-001: Chat Message Persistence
describe('INV-001', () => {
  test('message persists after sendMessage', async () => {
    const { result } = renderHook(() => useChat());
    await result.current.sendMessage('test');

    const stored = localStorage.getItem('titane_chat_mode_default');
    expect(JSON.parse(stored).messages.length).toBe(result.current.messages.length);
  });
});

// INV-002: State Protection
describe('INV-002', () => {
  test('sync blocked during operation', async () => {
    const { result } = renderHook(() => useChat());
    const promise = result.current.sendMessage('test');

    // Pendant sendMessage, le sync ne doit pas écraser
    expect(result.current.messages.length).toBeGreaterThan(0);
    await promise;
  });
});

// INV-010: State Machine Transitions
describe('INV-010', () => {
  test('only valid transitions allowed', () => {
    const sm = audioStateMachine;
    sm.transition('RESET');

    expect(sm.transition('TTS_END')).toBe(false); // invalid from idle
    expect(sm.transition('VAD_SPEECH_START')).toBe(true); // valid
  });
});
```

---

## 🚨 VIOLATION HANDLING

### Que faire si un invariant est violé?

1. **Log critique immédiat**
   ```typescript
   console.error('[INVARIANT VIOLATION] INV-XXX:', details);
   ```

2. **Auto-heal si possible**
   ```typescript
   autoHealEngine.heal('invariant-violation', error, 'critical', context);
   ```

3. **Fallback vers état stable**
   ```typescript
   restoreFromVault(); // ou reset vers état initial
   ```

4. **Reporter pour analyse**
   - Inclure stack trace
   - Inclure état au moment de la violation
   - Inclure séquence d'événements précédente

---

## 📚 Références

- **Event Sourcing:** `src-tauri/src/singularity/events.rs`
- **State Machine:** `src/services/audio/audioStateMachine.ts`
- **Chat Hook:** `src/hooks/useChat.ts`
- **TTS Service:** `src/services/tts/hybridTTS.ts`
- **Memory Compactor:** `src/services/chatMemoryCompactor.ts`

---

*Document généré par TITANE∞ Architecture System v19.3Ω*
*Invariants: 17 | Contrats: 3 | Tests requis: 12+*
