# 🔥 **TITANE∞ VOICE WIRING COMPLETE — ANALYSE & SOLUTION**

## **📊 ANALYSE DU CODE EXISTANT**

### **Ce qui fonctionne ✅**

1. **VoiceEngine** (`useVoiceEngine.ts`)
   - Recording : ✅ startRecording/stopRecording via voiceService
   - ASR : ✅ transcription retournée dans onTranscript callback
   - TTS : ✅ hybridTTS.speak() disponible
   - States : ✅ 'idle' | 'listening' | 'processing' | 'speaking'

2. **Chat IA** (`useChat.ts`)
   - ✅ `sendMessage(content: string)` disponible (ligne 490)
   - ✅ OMNIS Kernel avec auto-repair
   - ✅ Retourne `AIMessage` avec content + metadata

3. **HybridTTS** (`hybridTTS.ts`)
   - ✅ 3 providers : Parler-TTS → Tauri → WebSpeech
   - ✅ `speak(text)` et `stop()` fonctionnels
   - ✅ Events TTS (start/end/error) pour synchronisation

### **Ce qui NE fonctionne PAS ❌**

1. **VoiceEngine.startTurn()** (ligne 270-280)
   ```typescript
   const startTurn = useCallback(async () => {
     await startRecordingInternal();
     // ❌ PROBLÈME : Aucun code pour traiter la transcription !
     // ❌ PROBLÈME : Aucun appel au chat IA !
     // ❌ PROBLÈME : Aucun appel TTS !
   }, []);
   ```

   **Résultat :** Le bouton micro enregistre, transcrit... et s'arrête là.

2. **VoiceConversation.tsx** (ligne 95-120)
   ```typescript
   const { status, startTurn } = useVoiceEngine({
     onTranscript: async (text) => {
       // ✅ Génère réponse via generateAIResponse()
       // ✅ Appelle speak()
       // ✅ Mais startTurn() ne gère PAS ce flux !
     }
   });
   ```

   **Problème :** Le flux IA + TTS est DANS le callback onTranscript du composant,
   PAS dans startTurn() du hook. C'est inversé !

3. **stopRecordingInternal()** (ligne 211-246)
   ```typescript
   const stopRecordingInternal = useCallback(async (): Promise<string> => {
     const transcript = await voiceService.stopRecording();

     setStatus(prev => ({ ...prev, state: 'idle' })); // ❌ RETOUR IDLE TROP TÔT
     onTranscript?.(transcript); // ✅ OK mais après idle...

     return transcript;
   }, []);
   ```

   **Problème :** L'état revient à 'idle' immédiatement, AVANT le traitement IA + TTS.

## **🎯 SOLUTION : CÂBLAGE COMPLET**

### **Architecture Cible**

```
┌─────────────────────────────────────────────────────────────────┐
│                     VOICE TURN LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER CLICKS MICRO                                          │
│     → startTurn()                                              │
│     → state: 'listening'                                       │
│                                                                 │
│  2. RECORDING                                                  │
│     → voiceService.startRecording()                            │
│     → VAD détecte fin de parole (ou manuel stop)              │
│                                                                 │
│  3. TRANSCRIPTION                                              │
│     → voiceService.stopRecording()                             │
│     → state: 'processing'                                      │
│     → transcript: "Salut, comment ça va ?"                     │
│                                                                 │
│  4. IA GENERATION ⭐ NOUVEAU                                    │
│     → chat.sendMessage(transcript)                             │
│     → state: reste 'processing'                                │
│     → response: "Je vais bien, merci !"                        │
│                                                                 │
│  5. TTS PLAYBACK ⭐ NOUVEAU                                     │
│     → hybridTTS.speak(response)                                │
│     → state: 'speaking'                                        │
│     → Audio joué via Parler-TTS/Tauri                          │
│                                                                 │
│  6. COMPLETION                                                 │
│     → TTS end event                                            │
│     → state: 'idle'                                            │
│     → Ready for next turn                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Changements Requis**

#### **1. useVoiceEngine.ts : Ajouter chatBridge**

```typescript
// ✅ NOUVEAU : Import du chat engine
import { useChat } from '@/hooks/useChat';

export function useVoiceEngine(options: UseVoiceEngineOptions = {}) {
  // ✅ NOUVEAU : Accès au chat IA
  const chat = useChat();

  // ✅ MODIFIER stopRecordingInternal
  const stopRecordingInternal = useCallback(async (): Promise<string> => {
    const transcript = await voiceService.stopRecording();

    // ❌ NE PAS revenir à idle tout de suite !
    setStatus(prev => ({
      ...prev,
      transcript,
      state: 'processing', // ✅ Rester en processing
      isRecording: false,
    }));

    return transcript;
  }, []);

  // ✅ NOUVEAU : processTurnWithAI
  const processTurnWithAI = useCallback(async (transcript: string) => {
    try {
      // IA Generation
      const aiResponse = await chat.sendMessage(transcript);

      if (!mountedRef.current) return;

      // TTS Playback
      setStatus(prev => ({ ...prev, state: 'speaking' }));
      await hybridTTS.speak(aiResponse.content);

      if (!mountedRef.current) return;

      // Completion
      setStatus(prev => ({ ...prev, state: 'idle' }));

    } catch (error) {
      handleError(error, 'processTurnWithAI');
    }
  }, [chat, handleError]);

  // ✅ MODIFIER startTurn : Brancher le pipeline complet
  const startTurn = useCallback(async () => {
    try {
      await startRecordingInternal();

      // ✅ ATTENDRE transcription
      const transcript = await stopRecordingInternal();

      if (!transcript.trim()) {
        setStatus(prev => ({ ...prev, state: 'idle' }));
        return;
      }

      // ✅ TRAITER avec IA + TTS
      await processTurnWithAI(transcript);

    } catch (error) {
      handleError(error, 'startTurn');
    }
  }, [startRecordingInternal, stopRecordingInternal, processTurnWithAI]);
}
```

#### **2. VoiceConversation.tsx : Simplifier**

```typescript
// ❌ SUPPRIMER generateAIResponse (déplacé dans useVoiceEngine)
// ❌ SUPPRIMER onTranscript callback complexe

const {
  status,
  startTurn,
  cancelTurn,
} = useVoiceEngine({
  // ✅ Simple callback pour logging
  onTranscript: (text) => {
    setLastTranscript(text);
    onTranscript?.(text);
  },
});
```

## **🔧 IMPLÉMENTATION CORRECTE**

### **Fichier 1 : useVoiceEngine.ts**

**Problème actuel :** startTurn() ne fait qu'enregistrer, sans traiter la transcription.

**Solution :** Ajouter le pipeline complet IA + TTS dans startTurn().

---

### **Fichier 2 : VoiceConversation.tsx**

**Problème actuel :** Le traitement IA est dans onTranscript callback, pas dans startTurn().

**Solution :** Déléguer tout au hook useVoiceEngine.

---

## **✅ AVANTAGES DE CETTE ARCHITECTURE**

1. **Séparation des responsabilités**
   - Hook : logique métier (enregistrement → IA → TTS)
   - Component : UI + événements utilisateur

2. **États cohérents**
   - 'listening' : enregistrement en cours
   - 'processing' : IA génère réponse
   - 'speaking' : TTS joue audio
   - 'idle' : prêt pour prochain tour

3. **Pas d'annulations intempestives**
   - cancelTurn() seulement si utilisateur interrompt
   - Pas de reset automatique avant la fin du tour

4. **Réutilisabilité**
   - startTurn() utilisable depuis n'importe quel composant
   - VoiceConversation, ChatInput, VoiceControlPanel, etc.

---

## **🧪 CHECKLIST DE TEST**

### **Test 1 : Tour vocal complet**
1. Clic bouton micro
2. Parler "Bonjour TITANE"
3. ✅ Transcription affichée
4. ✅ État 'processing' visible
5. ✅ Réponse IA générée
6. ✅ État 'speaking' visible
7. ✅ Audio TTS joué
8. ✅ Retour état 'idle'

### **Test 2 : Annulation manuelle**
1. Clic bouton micro
2. Parler quelques mots
3. Clic bouton stop/cancel
4. ✅ Enregistrement annulé
5. ✅ Pas de génération IA
6. ✅ Retour état 'idle'

### **Test 3 : Erreur TTS**
1. Désactiver Parler-TTS (kill process)
2. Tour vocal complet
3. ✅ Fallback Tauri TTS utilisé
4. ✅ Audio joué malgré tout
5. ✅ Pas de crash

### **Test 4 : Transcription vide**
1. Clic bouton micro
2. Silence complet
3. Stop enregistrement
4. ✅ Pas de génération IA
5. ✅ Message "Aucune parole détectée"
6. ✅ Retour état 'idle'

---

**STATUS :** Prêt pour implémentation
**IMPACT :** Corrections dans 2 fichiers uniquement
**COMPLEXITÉ :** Moyenne (refactoring startTurn + simplification VoiceConversation)

🎤✨🚀
