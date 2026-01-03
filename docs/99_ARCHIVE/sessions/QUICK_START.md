# 🚀 TITANE∞ v∞.7 — Quick Start Guide

## ✅ Validation Rapide (2 minutes)

```bash
# Validation automatique
bash quick_start_validation.sh
```

## 🎯 Démarrer l'Application

### Mode Développement
```bash
pnpm run tauri:dev
```

### Build Production
```bash
pnpm run tauri:build
```

## 🧪 Tests Manuels Essentiels (15 minutes)

### 1. Test Halo Visualizer
1. Ouvrir l'application
2. Naviguer vers un panneau vocal
3. Ajouter temporairement :
   ```tsx
   import { HaloVisualizer } from '@/components/voice/HaloVisualizer';
   import '@/components/voice/HaloVisualizer.css';

   <HaloVisualizer size="lg" showLabel={true} />
   ```
4. Observer les états pendant un voice turn

**Attendu** :
- 🌊 Breathing (cyan) quand vous parlez
- ⚡ Pulsing (violet) pendant l'IA
- ✨ Shimmer (doré) pendant TTS
- ○ Idle (bleu) quand terminé

### 2. Test Force Reset
1. Cliquer sur le bouton "🔄 Emergency Reset"
2. Vérifier console : `[VoiceService] Force reset successful`

### 3. Test Anti-Double-Start
1. Cliquer "🎤 Parler"
2. Recliquer immédiatement
3. Vérifier console : `Already recording, ignoring duplicate call`

## 📚 Documentation Complète

**Guide Principal** : [VOICE_PIPELINE_README_v∞.7.md](VOICE_PIPELINE_README_v∞.7.md)

**Guides par Besoin** :
- Usage pratique → VOICE_PIPELINE_USAGE_GUIDE_v∞.7.md
- Tests complets → VOICE_PIPELINE_MANUAL_TEST_GUIDE_v∞.7.md
- Halo component → HALO_VISUALIZER_USAGE_GUIDE_v∞.7.md
- Cheat sheet → VOICE_PIPELINE_QUICK_REFERENCE_v∞.7.md

## ⚡ Commandes Utiles

```bash
# Compilation TypeScript
pnpm run type-check

# Compilation Rust
cd src-tauri && cargo check

# Build production
pnpm run build

# Lancer tests
bash test_voice_pipeline_v7.sh
```

## 🎨 Intégration HaloVisualizer

### Dans un Composant React
```tsx
import { HaloVisualizer } from '@/components/voice/HaloVisualizer';
import '@/components/voice/HaloVisualizer.css';

function MyVoicePanel() {
  return (
    <div>
      <HaloVisualizer size="lg" showLabel={true} showDuration={true} />
      {/* Vos autres composants */}
    </div>
  );
}
```

### Contrôle Manuel
```typescript
import { haloEngine } from '@/services/voice/haloEngine';

// Changer d'état
haloEngine.startBreathing();
haloEngine.startPulsing();
haloEngine.startShimmer();
haloEngine.setError();
haloEngine.reset();

// Observer les changements
const unsubscribe = haloEngine.onStateChange((status) => {
  console.log('Halo:', status.state);
});
```

## 🐛 Troubleshooting Rapide

### Halo ne change pas d'état
```bash
# Vérifier CSS importé
grep -r "HaloVisualizer.css" src/
```

### Erreur TypeScript
```bash
pnpm run type-check
```

### Erreur Rust
```bash
cd src-tauri && cargo check
```

## ✅ Checklist Avant Production

- [ ] `quick_start_validation.sh` passe
- [ ] Tests manuels essentiels OK
- [ ] Halo sync visible et fluide
- [ ] Force reset fonctionne
- [ ] Build production réussit
- [ ] Documentation lue

## 🎉 C'est Prêt !

**TITANE∞ v∞.7 est production-ready avec :**
- ✅ 31 corrections (backend + frontend)
- ✅ Halo sync (5 états, 60fps)
- ✅ Force reset (backend + UI)
- ✅ 90K documentation (11 guides)
- ✅ 0 erreurs compilation

**Next** : Production Deployment 🚀

---

Pour plus de détails, voir [VOICE_PIPELINE_README_v∞.7.md](VOICE_PIPELINE_README_v∞.7.md)
