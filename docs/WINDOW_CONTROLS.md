# TITANE∞ - Contrôles de Fenêtre

## Raccourcis Clavier v26.2.1

### Zoom
- **CTRL + Molette haut** : Zoom avant (+10%)
- **CTRL + Molette bas** : Zoom arrière (-10%)
- **CTRL + 0** : Réinitialiser zoom (100%)
- **CTRL + +** : Zoom avant (+10%)
- **CTRL + -** : Zoom arrière (-10%)

### Plein Écran
- **F11** : Basculer plein écran/fenêtré

### Utilisation Programmatique

```typescript
import { windowControls } from '@/hooks/useWindowControls';

// Zoom manuel
await windowControls.zoomIn();
await windowControls.zoomOut();
await windowControls.resetZoom();

// Niveau de zoom
const currentZoom = await windowControls.getZoom();
await windowControls.setZoom(1.5); // 150%

// Plein écran
await windowControls.toggleFullscreen();
await windowControls.setFullscreen(true);
const isFs = await windowControls.isFullscreen();
```

### Hook React

```typescript
import { useWindowControls } from '@/hooks/useWindowControls';

function MyComponent() {
  // Active automatiquement les raccourcis clavier
  useWindowControls({
    enableZoom: true,
    enableFullscreen: true
  });
  
  return <div>Les raccourcis sont actifs!</div>;
}
```

## Architecture Technique

### Backend Rust (Tauri Commands)

**Fichier:** `src-tauri/src/commands/window_controls_commands.rs`

8 commandes exposées:
- `window_get_zoom` / `window_set_zoom`
- `window_zoom_in` / `window_zoom_out` / `window_zoom_reset`
- `window_toggle_fullscreen` / `window_set_fullscreen` / `window_is_fullscreen`

### Frontend TypeScript

**Fichier:** `src/hooks/useWindowControls.ts`

- Hook React avec gestionnaires d'événements clavier
- Objet utilitaire `windowControls` pour usage manuel
- Gestion d'erreurs avec logs détaillés

### Support Multiplateforme

| Plateforme | Zoom | Plein Écran |
|-----------|------|-------------|
| **Linux** | ✅ webkit2gtk | ✅ Tauri Window API |
| **Windows** | ✅ webview2 | ✅ Tauri Window API |
| **macOS** | ✅ cocoa | ✅ Tauri Window API |

## Notes de Sécurité

- Zoom limité: 50% - 500% (0.5 - 5.0)
- Gestion d'erreurs robuste avec logs
- Aucune donnée sensible exposée
- Commandes sandboxées par Tauri

## Intégration dans App.tsx

```typescript
// L'integration est automatique dans App.tsx (ligne ~257)
useWindowControls({ enableZoom: true, enableFullscreen: true });
```

## Logs de Débogage

Console navigateur:
```
[WindowControls] Zoom: 120%
[WindowControls] Fullscreen toggled: true
[WindowControls] Error: window_zoom_in invocation failed
```

## Version
- **Créé:** v26.2.1 (2026-01-02)
- **Status:** ✅ Production Ready
- **Tests:** Automatiques via React hook
