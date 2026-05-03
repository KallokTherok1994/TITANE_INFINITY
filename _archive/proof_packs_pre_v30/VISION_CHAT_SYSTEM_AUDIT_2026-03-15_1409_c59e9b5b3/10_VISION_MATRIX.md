# MATRICE VISION

## Tableau de certification

| UI route/page | action | intended command | observed command | intended backend | observed backend | expected output | actual output | output_type | user-visible truth | defect class | patch applied | rerun verdict | proof_ref |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| /camera | Démarrer Caméra | Aucune Tauri cmd | navigator.mediaDevices.getUserMedia() | Tauri camera cmd | Browser MediaAPI | Flux vidéo actif | Flux dans window.__titaneVisionStream | MediaStream (BROWSER) | PARTIAL — flux sans analyse | D06 | NON | BLOCKED_HARDWARE | CameraPreview.tsx, useVisionStore.ts:~463 |
| /camera | Activer Vision Engine | Aucune Tauri cmd | State update local uniquement | Vision model computation | setIsObservationActive(true) | Landmarks calculés en continu | Valeurs défaut inchangées (0.5 / 'medium') | STATIC_DEFAULT | FAIL — aucun calcul | D03/D04 | NON | FAIL | visionAffect.ts:~182, ~274 |
| /camera | Énergie affichée | N/A (calculée localement) | getDefaultAffectEstimationState() | ML model (ONNX ou MediaPipe) | Retour valeur statique | Niveau énergie calculé dynamiquement | 'medium' constant | STATIC_DEFAULT | FAIL — mensonge visuel | D04 | NON | FAIL | visionAffect.ts:~274, CameraPage.tsx:~268 |
| /camera | Corps affiché | N/A (calculée localement) | getDefaultBodyLanguageState() | MediaPipe Holistic ou équiv. | Valeur statique 0.5 | Score posture calculé dynamiquement | 0.5 constant | STATIC_DEFAULT | FAIL — mensonge visuel | D03 | NON | FAIL | visionAffect.ts:~182 |
| /camera | analyze_image (si implementé) | analyze_image | NON ENREGISTRÉ | src-tauri/multimodal/commands.rs | Module commenté lib.rs:~319 | VisionAnalysis { brightness, edges, ... } | UNREACHABLE — Tauri error | BLOCKED | FAIL — command absente | D05 | NON | FAIL | lib.rs:~319, main.rs (absent) |
| /camera | OCR analyse | analyze_image + OcrMode | NON ENREGISTRÉ | multimodal/vision.rs:~109 | Module commenté | Texte extrait | Placeholder string | PLACEHOLDER | FAIL | D07 | NON | FAIL | vision.rs:~109 |
| /camera | Object detection | analyze_image + ObjectDetect | NON ENREGISTRÉ | multimodal/vision.rs:~116 | Module commenté | Objets détectés avec confidence | DetectedObject {label:"placeholder", confidence:0.0} | PLACEHOLDER | FAIL | D08 | NON | FAIL | vision.rs:~116 |

---

## Classification base body analysis

**Base body analysis : AUCUNE**

- `getDefaultBodyLanguageState()` retourne des constantes (0.5)
- La documentation TypeScript (visionAffect.ts) mentionne "MediaPipe Holistic" dans les commentaires
- Aucun code MediaPipe n'est importé, initialisé, ou appelé nulle part dans le projet
- Aucun package MediaPipe dans package.json ou pnpm-lock.yaml
- Feature `onnx` inactive → VisionEngine ONNX non compilé
- `updateBodyLanguage()` existe comme setter mais n'est jamais appelé avec des valeurs calculées

**Classification finale : `none` — aucune base algorithmique, aucun modèle**

---

## Classification energy claim

**Type énergie : STATIC_DEFAULT**

- `visualEnergyLevel` est initialisé à `'medium'` dans getDefaultAffectEstimationState()
- **Jamais mis à jour** par aucun algorithme dans la codebase
- `estimationCount === 0` en permanence : preuve formelle qu'aucune estimation n'a été produite
- `confidence === 0` : confirmation formelle de l'absence de modèle
- Aucun senseur, aucun modèle, aucune heuristique ne produit cette valeur
- L'affichage dans CameraPage.tsx ne conditionne PAS l'affichage sur estimationCount > 0

**Classification finale : `STATIC_DEFAULT` / `false claim`**
L'énergie affichée est une valeur de remplissage présentée comme une mesure.
