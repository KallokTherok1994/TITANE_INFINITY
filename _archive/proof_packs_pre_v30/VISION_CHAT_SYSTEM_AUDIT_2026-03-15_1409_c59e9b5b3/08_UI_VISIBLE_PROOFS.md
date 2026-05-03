# PREUVES UI VISIBLE vs BACKEND RÉEL

## CameraPage — Section "Analyse en Temps Réel"

### Ce que l'UI affiche (quand isObservationActive=true) :
```
🎭 Indices Visuels (Approximatifs)
  Énergie    [████████████░░░░░░░░] medium
  Tension    [████████████░░░░░░░░] medium
  Engagement [████████████░░░░░░░░] medium

🧍 Langage Corporel
  Posture          50%
  Mouvement        50%
  Stabilité regard 50%
  Confiance         0%
```

### Ce que le backend calcule réellement :
```typescript
// src/types/visionAffect.ts:~274
export const getDefaultAffectEstimationState = (): AffectEstimationState => ({
  visualEnergyLevel: 'medium',   // STATIQUE — jamais mis à jour
  visualTensionLevel: 'medium',  // STATIQUE — jamais mis à jour
  visualEngagementLevel: 'medium', // STATIQUE — jamais mis à jour
  confidence: 0,                 // 0 = aucun modèle n'a calculé quoi que ce soit
  estimationCount: 0,            // 0 = aucune estimation jamais produite
  ...
});

// src/types/visionAffect.ts:~182
export const getDefaultBodyLanguageState = (): BodyLanguageState => ({
  postureScore: 0.5,      // STATIQUE — constant
  movementScore: 0.5,     // STATIQUE — constant
  gazeStabilityScore: 0.5, // STATIQUE — constant
  confidence: 0,
  landmarksDetected: false, // false = aucun landmark jamais détecté
  ...
});
```

### Verdict : **MENSONGE VISUEL** (D03, D04)
- `estimationCount === 0` est la preuve formelle qu'aucune analyse n'a jamais été exécutée
- `confidence === 0` confirme l'absence de tout modèle actif
- `landmarksDetected === false` confirme l'absence de tout tracking corporel
- Les jauges affichées ne correspondent à aucune mesure réelle

---

## ChatPage — Section rendu messages

### Ce que l'UI affiche :
```
TITANE∞ Chat
[Sélecteur provider : Gemini ✨ / Ollama 🦙 / Custom ⚙️]
[Zone messages : VIDE]
[Zone saisie : présente]
```

### Ce qui est dans le code source (ChatPage.tsx:~83-87) :
```tsx
<div className="flex-1 overflow-auto">
  {/* Chat interface will be rendered here */}
</div>
```

### Verdict : **UI INCOMPLÈTE** (D02)
Aucun composant de rendu des messages n'est monté.
L'utilisateur ne peut pas voir les réponses.

---

## send_message — Réponse fictive

### Ce que l'UI reçoit :
```json
{ "ok": true, "content": "response", "error": null }
```

### Ce qui est dans le code (src-tauri/src/commands/chat.rs:~40) :
```rust
// FIXME: stub response — replace with real chat provider dispatch
Ok(json!({ "ok": true, "content": "response", "error": null }))
```

### Verdict : **STUB ACTIF** (D01)
FIXME explicite dans le code. Réponse identique quelle que soit la requête.

---

## Module multimodal — Commandes inaccessibles

### Ce que l'invoker attend :
```
invoke('analyze_image', { imageData: base64String })
```

### Ce qui existe dans lib.rs:~319 :
```rust
// TEMPORARILY COMMENTED: API incomplete (Phase 1 Stabilisation)
// pub mod multimodal;
```

### Verdict : **MODULE DÉSACTIVÉ** (D05)
L'IPC path est mort. Tout appel à analyze_image retourne une erreur Tauri "command not found".
