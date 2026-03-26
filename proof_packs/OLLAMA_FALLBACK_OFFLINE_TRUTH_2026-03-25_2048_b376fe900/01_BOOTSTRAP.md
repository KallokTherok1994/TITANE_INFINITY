# BOOTSTRAP — État initial

## Signal reçu
- Requested: Ollama
- Provider: fallback
- Mode: ERROR
- Reason: FALLBACK_OFFLINE
- Network: false
- policy: tauri_protector_runtime_fallback

## Hypothèse de départ
Le vrai lock n'est pas "Ollama cassé" abstraitement. Le lock est que le `tauriProtector` retourne un objet fallback qui court-circuite la cascade d'erreur normale.
