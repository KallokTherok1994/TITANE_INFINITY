# MATRICE DES PÉRIPHÉRIQUES VIDÉO

⚠️ Classification BLOCKED_HARDWARE — runtime Tauri non actif pendant l'audit.

| device_label | device_id | kind | frontend_detected | backend_detected | selectable | preview_opens | frame_received | analysis_path_reached | restart_ok | stable_x3 | classification | proof_ref |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| (webcam système — inconnue) | INCONNU | videoinput | BLOCKED_HARDWARE | N/A (aucune cmd Tauri) | BLOCKED_HARDWARE | BLOCKED_HARDWARE | BLOCKED_HARDWARE | FAIL (module commenté) | BLOCKED_HARDWARE | BLOCKED_HARDWARE | BLOCKED_HARDWARE | useVisionStore.ts:~463, lib.rs:~319 |

## Notes architecturales

### Énumération périphériques
- Méthode : `navigator.mediaDevices.enumerateDevices()` (MediaAPI browser dans WebView Tauri)
- Avant permission : labels vides (comportement standard navigateur/WebView)
- Après permission : labels disponibles — BLOCKED_HARDWARE pendant l'audit
- Aucune commande Tauri impliquée dans l'énumération
- Stabilité device_id : dépend du navigateur/OS, non vérifiable sans runtime

### Capture frames
- `frame_received` : FAIL structurel — aucun pipeline de frames
- Pipeline attendu : getUserMedia → canvas.drawImage() → toDataURL() → invoke('analyze_image')
- Étape manquante : invoke('analyze_image') non enregistré (module commenté)
- Même si frame capturée côté WebView, le backend Rust ne peut pas la recevoir

### Condition pour STABLE_OK
Requiert : detect → select → preview → frame_received → analyze
**Aucune de ces conditions n'est vérifiable sans runtime actif.**

## Condition de succès requise
```
detect -> select -> preview -> frame_received
```
**État actuel : AUCUNE de ces étapes n'est prouvée. Classification : BLOCKED_HARDWARE.**
