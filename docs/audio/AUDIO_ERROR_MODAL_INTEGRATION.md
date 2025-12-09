# AudioErrorModal - Guide d'intégration

## Vue d'ensemble

Le système `AudioErrorModal` + `useAudioError` fournit une gestion conviviale des erreurs audio avec guidance utilisateur.

## Architecture

```
┌─────────────────────────────────────────┐
│         useAudioError Hook              │
│  - Classification automatique erreurs   │
│  - État modal (open/close)              │
│  - showError() / clearError()           │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│       AudioErrorModal Component         │
│  - UI conviviale (icônes, messages)     │
│  - Troubleshooting guidance             │
│  - Actions (retry, settings, close)     │
└─────────────────────────────────────────┘
```

## Types d'erreurs supportés

| Type                  | Cause                        | Classification automatique                |
|-----------------------|------------------------------|-------------------------------------------|
| `MicrophoneNotFound`  | Aucun micro détecté          | `NotFoundError`, `DevicesNotFoundError`   |
| `PermissionDenied`    | Permission refusée           | `NotAllowedError`, `PermissionDeniedError`|
| `DeviceBusy`          | Micro utilisé ailleurs       | `NotReadableError`, `TrackStartError`     |
| `AudioContextFailed`  | Erreur AudioContext          | `InvalidStateError`, `NotSupportedError`  |
| `StreamError`         | Flux interrompu              | `AbortError`, `OverconstrainedError`      |
| `Unknown`             | Erreur non classée           | Toutes les autres                         |

## Exemple d'intégration avec useVAD

### 1. Intégration dans un composant vocal

```typescript
import React from 'react';
import { useVAD } from '@/hooks/useVAD';
import { useAudioError } from '@/hooks/useAudioError';
import { AudioErrorModal } from '@/components/audio/AudioErrorModal';

export function VoiceChat() {
  // Hook gestion erreurs audio
  const { error, isModalOpen, showError, closeModal } = useAudioError();

  // Hook VAD avec capture d'erreurs
  const vad = useVAD({
    enabled: true,
    volumeThreshold: 0.01,
    silenceDelayMs: 1500,
  });

  // Lancer la détection vocale avec gestion d'erreur
  const handleStartListening = async () => {
    try {
      await vad.startListening();
    } catch (err) {
      // Affiche la modal d'erreur automatiquement
      showError(err);
    }
  };

  // Réessayer après erreur
  const handleRetry = async () => {
    try {
      // Fermer le flux existant si ouvert
      vad.stopListening();
      // Réessayer
      await vad.startListening();
    } catch (err) {
      // Re-afficher l'erreur si échec
      showError(err);
      throw err; // Propager pour que la modal sache que le retry a échoué
    }
  };

  return (
    <div>
      <button onClick={handleStartListening} disabled={vad.isListening}>
        {vad.isListening ? 'En écoute...' : 'Commencer'}
      </button>

      <button onClick={() => vad.stopListening()} disabled={!vad.isListening}>
        Arrêter
      </button>

      {/* Status */}
      {vad.error && <p style={{ color: 'red' }}>Erreur: {vad.error}</p>}

      {/* Modal d'erreur */}
      <AudioErrorModal
        error={error}
        isOpen={isModalOpen}
        onClose={closeModal}
        onRetry={handleRetry}
      />
    </div>
  );
}
```

### 2. Intégration dans useVAD directement (optionnel)

Si vous souhaitez que `useVAD` affiche automatiquement la modal, vous pouvez modifier `useVAD.ts` :

```typescript
// Dans useVAD.ts
import { useAudioError } from './useAudioError';

export function useVAD(config?: Partial<VADConfig>): UseVADReturn {
  // ... état existant ...

  // Ajouter le hook d'erreur
  const { showError } = useAudioError();

  const startListening = useCallback(async () => {
    try {
      // ... code existant ...

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // ... reste du code ...

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);

      // Afficher la modal automatiquement
      showError(err);

      console.error('[useVAD] ❌ Failed to start listening:', err);
    }
  }, [/* deps */]);

  // ... reste du hook ...
}
```

## Personnalisation

### Ajouter un nouveau type d'erreur

1. **Ajouter le type dans `AudioErrorModal.tsx`** :

```typescript
export type AudioErrorType =
  | 'MicrophoneNotFound'
  | 'PermissionDenied'
  | 'DeviceBusy'
  | 'AudioContextFailed'
  | 'StreamError'
  | 'CustomErrorType'  // ← Nouveau type
  | 'Unknown';
```

2. **Ajouter les métadonnées** :

```typescript
const ERROR_METADATA: Record<AudioErrorType, ErrorMetadata> = {
  // ... erreurs existantes ...

  CustomErrorType: {
    icon: AlertCircle,
    iconColor: 'text-purple-500',
    title: 'Erreur personnalisée',
    description: 'Description de l\'erreur personnalisée.',
    troubleshooting: [
      'Étape 1 de résolution',
      'Étape 2 de résolution',
    ],
    actions: [
      { label: 'Réessayer', action: 'retry', primary: true },
      { label: 'Fermer', action: 'close' },
    ],
  },
};
```

3. **Ajouter la classification dans `useAudioError.ts`** :

```typescript
function classifyError(error: unknown): AudioErrorType {
  // ... classification existante ...

  // Nouvelle classification
  if (error instanceof CustomException) {
    return 'CustomErrorType';
  }

  return 'Unknown';
}
```

### Personnaliser les actions

```typescript
// Ouvrir les paramètres système
const openSystemSettings = () => {
  if (navigator.platform.includes('Mac')) {
    alert('Ouvrez Préférences Système > Sécurité et confidentialité > Microphone');
  } else if (navigator.platform.includes('Win')) {
    alert('Ouvrez Paramètres > Confidentialité > Microphone');
  } else {
    alert('Vérifiez les paramètres de confidentialité de votre système');
  }
};

<AudioErrorModal
  error={error}
  isOpen={isModalOpen}
  onClose={closeModal}
  onRetry={handleRetry}
  onOpenSettings={openSystemSettings}  // ← Custom action
/>
```

## Tests manuels

### Tester PermissionDenied
1. Refusez l'autorisation micro dans le navigateur
2. Lancez `startListening()`
3. Vérifiez que la modal s'affiche avec guidance "Permission refusée"

### Tester MicrophoneNotFound
1. Débranchez tous les micros
2. Lancez `startListening()`
3. Vérifiez la modal "Microphone introuvable"

### Tester DeviceBusy
1. Ouvrez un onglet avec visioconférence (Zoom, Teams)
2. Lancez TITANE∞ dans un autre onglet
3. Tentez `startListening()`
4. Vérifiez la modal "Microphone occupé"

## Intégration avec performanceEngine

Les erreurs audio sont automatiquement trackées dans `VoiceMetrics` :

```typescript
import { metricsCollector } from '@/services/performanceEngine/metricsCollector';

// Dans useVAD ou useAudioError
const handleError = (err: unknown) => {
  showError(err);

  // Enregistrer l'erreur dans performanceEngine
  metricsCollector.recordASRRequest(
    0,  // latency (failed)
    0,  // confidence (failed)
    false  // success = false
  );
};
```

## Accessibilité

- **Rôles ARIA** : `role="dialog"`, `aria-labelledby`, `aria-describedby`
- **Focus trap** : Modal piège le focus (fermeture avec `X` ou `Escape`)
- **Keyboard navigation** : Navigation clavier complète (Tab, Enter, Escape)
- **Screen reader** : Titres et descriptions lus par lecteurs d'écran

## Performance

- **Lazy loading** : Modal ne se monte que si `isOpen={true}`
- **No re-renders** : Utilise `useCallback` pour actions stables
- **Lightweight** : ~3 KB gzipped (composant + hook)

---

**Statut** : ✅ P1-8 Complete (Phase 3 — Pauffinage UX)
