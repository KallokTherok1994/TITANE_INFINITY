# REGISTRE DES DÉFAUTS

## D01 — STUB : send_message retourne réponse hardcodée

**Classe :** D01 (UI_ONLY_ILLUSION via stub IPC)
**Sévérité :** HAUTE
**Fichier :** src-tauri/src/commands/chat.rs:~40
**Preuve directe :**
```rust
// FIXME: stub response — replace with real chat provider dispatch
Ok(json!({ "ok": true, "content": "response", "error": null }))
```
**Cause racine :** Commande jamais implémentée, laissée en stub après extraction vers `conversation_generate`.
**Impact :** Tout frontend utilisant `send_message` reçoit une réponse fictive identique quelle que soit la requête.
**Correction requise :** Rediriger vers `conversation_generate` ou supprimer du invoke_handler.

---

## D02 — INCOMPLET : ChatPage sans rendu de messages

**Classe :** D02 (ROUTE_PRESENT_RUNTIME_DEAD)
**Sévérité :** HAUTE
**Fichier :** src/pages/ChatPage.tsx:~83-87
**Preuve directe :**
```tsx
<div className="flex-1 overflow-auto">
  {/* Chat interface will be rendered here */}
</div>
```
**Cause racine :** Page créée (route présente, sélecteur provider présent) mais composant de messages jamais monté.
**Impact :** L'utilisateur voit une page chat vide. Aucune interaction visible possible.

---

## D03 — ABSENCE MODÈLE : Body language = valeurs statiques

**Classe :** D03 (INVOKE_MISMATCH — affichage sans calcul)
**Sévérité :** CRITIQUE
**Fichier :** src/types/visionAffect.ts:~182 + src/pages/CameraPage.tsx:~268-316
**Preuve directe :**
```typescript
export const getDefaultBodyLanguageState = (): BodyLanguageState => ({
  postureScore: 0.5,        // constant
  movementScore: 0.5,       // constant
  gazeStabilityScore: 0.5,  // constant
  confidence: 0,            // 0 = aucun modèle
  landmarksDetected: false, // false = aucun tracking
  ...
});
```
Aucun appel `updateBodyLanguage()` avec des valeurs calculées trouvé dans toute la codebase.
**Cause racine :** MediaPipe mentionné dans les types TS mais jamais intégré. Feature ONNX inactive.
**Impact :** Affichage trompeur permanent — "Posture 50%, Mouvement 50%" affiché comme si mesuré.

---

## D04 — ABSENCE MODÈLE : Affect estimation = défaut 'medium' statique

**Classe :** D04 (HANDLER_MISMATCH — UI claim sans base calculée)
**Sévérité :** CRITIQUE
**Fichier :** src/types/visionAffect.ts:~274 + src/pages/CameraPage.tsx:~268
**Preuve directe :**
```typescript
export const getDefaultAffectEstimationState = (): AffectEstimationState => ({
  visualEnergyLevel: 'medium',    // constant — jamais mis à jour
  visualTensionLevel: 'medium',   // constant — jamais mis à jour
  visualEngagementLevel: 'medium', // constant — jamais mis à jour
  confidence: 0,                  // 0 = aucun modèle
  estimationCount: 0,             // 0 = preuve formelle d'absence d'estimation
  ...
});
```
**Cause racine :** Aucun modèle ML activé. Feature `onnx` désactivée. MediaPipe absent.
**Impact :** Jauges "Énergie", "Tension", "Engagement" sont des ornements visuels présentés comme mesures.
**Violation stopline :** S5 — "Energy presented as real measured output without proof"

---

## D05 — MODULE DÉSACTIVÉ : multimodal commenté dans lib.rs

**Classe :** D05 (BACKEND_UNREACHABLE)
**Sévérité :** MOYENNE
**Fichier :** src-tauri/src/lib.rs:~319
**Preuve directe :**
```rust
// TEMPORARILY COMMENTED: API incomplete (Phase 1 Stabilisation)
// pub mod multimodal;
```
**Cause racine :** Module en cours de développement, désactivé volontairement.
**Impact :** analyze_image, fuse_multimodal — inaccessibles depuis le frontend.

---

## D06 — ARCHITECTURE : Caméra bypasse Tauri IPC

**Classe :** D06 (PROVIDER_META_LIE — architectural deviation)
**Sévérité :** BASSE (acceptable dans Tauri v2)
**Fichier :** src/stores/useVisionStore.ts:~388
**Preuve directe :**
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ video: { ... } });
```
**Cause racine :** Décision architecturale — MediaAPI browser dans WebView Tauri.
**Impact :** Aucun contrôle Rust sur le flux caméra. Frames non transmissibles au backend Rust sans IPC supplémentaire.

---

## D07 — PLACEHOLDER : OCR non implémenté

**Classe :** D07 (MEMORY_META_LIE — placeholders actifs)
**Sévérité :** FAIBLE
**Fichier :** src-tauri/src/multimodal/vision.rs:~109
**Preuve directe :**
```rust
Some("[OCR placeholder - requires tesseract integration]".to_string())
```

---

## D08 — PLACEHOLDER : Object detection non implémenté

**Classe :** D08 (CAMERA_ENUM_LIE — placeholder résultat)
**Sévérité :** FAIBLE
**Fichier :** src-tauri/src/multimodal/vision.rs:~116
**Preuve directe :**
```rust
vec![DetectedObject { label: "placeholder".to_string(), confidence: 0.0, ... }]
```

---

## Résumé défauts

| ID | Classe | Sévérité | Statut |
|----|--------|----------|--------|
| D01 | STUB send_message | HAUTE | FAIL — non corrigé |
| D02 | ChatPage UI vide | HAUTE | FAIL — non corrigé |
| D03 | Body analysis statique | CRITIQUE | FAIL — non corrigé |
| D04 | Énergie fictive | CRITIQUE | FAIL — non corrigé |
| D05 | Module multimodal mort | MOYENNE | FAIL — volontaire |
| D06 | Caméra bypass Tauri | BASSE | DOCUMENTED |
| D07 | OCR placeholder | FAIBLE | FAIL — volontaire |
| D08 | ObjectDetect placeholder | FAIBLE | FAIL — volontaire |
