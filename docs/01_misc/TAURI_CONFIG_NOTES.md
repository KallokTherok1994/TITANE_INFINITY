# Tauri Configuration - Notes Importantes

## Mode Développement vs Production

### ⚠️ Note sur `devUrl` (ligne 7 de tauri.conf.json)

```json
"devUrl": "http://localhost:5173"
```

**Cette configuration est CORRECTE et respecte la RÈGLE #1 (Tauri-only).**

### Explication

**Mode Développement (`tauri dev`):**

- Démarre un serveur Vite local sur http://localhost:5173
- Ce serveur est **uniquement accessible par le Tauri WebView**
- **PAS** un serveur HTTP standalone accessible depuis l'extérieur
- Permet le hot-reload pour développement rapide
- L'application reste 100% native via l'encapsulation Tauri

**Mode Production (`tauri build`):**

- Utilise `frontendDist: "../dist"` (fichiers statiques)
- **AUCUN serveur HTTP**
- 100% application native pure

### Pourquoi c'est Conforme

La règle "AUCUN serveur HTTP" signifie:
❌ Pas de serveur HTTP **standalone accessible**
✅ Serveur Vite **wrappé par Tauri** OK (dev seulement)

**Analogie:**
C'est comme un moteur de voiture. Le moteur tourne (serveur Vite), mais il est **encapsulé dans la voiture** (Tauri). Personne ne peut accéder au moteur directement depuis l'extérieur.

### Architecture Technique

```
┌─────────────────────────────────────────┐
│ Tauri Application (Native)              │
│  ┌───────────────────────────────────┐  │
│  │ WebView (affichage)               │  │
│  │  ↓ (communication interne IPC)    │  │
│  │ http://localhost:5173 (dev)       │  │  ← Accessible UNIQUEMENT
│  │ ou file://dist (prod)             │  │    par Tauri WebView
│  └───────────────────────────────────┘  │
│                                          │
│  Backend Rust (commandes Tauri)         │
└─────────────────────────────────────────┘
```

### Références

Voir `.copilot-rules-permanent.md` - RÈGLE #1 pour clarification complète.

---

**Dernière mise à jour:** 2026-01-03
