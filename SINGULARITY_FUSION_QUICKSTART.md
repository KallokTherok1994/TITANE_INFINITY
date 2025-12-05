# 🚀 SINGULARITY-FUSION vΩ - Guide de Démarrage Rapide

## 📋 Vue d'ensemble

SINGULARITY-FUSION vΩ est le système unifié final de TITANE∞ qui fusionne 14 moteurs en UN système cohérent avec auto-réparation, optimisation et protection maximale.

## ✨ Caractéristiques

- **8 Moteurs Frontend** (TypeScript/React)
- **6 Modules Backend** (Rust/Tauri)
- **55 Commandes Tauri**
- **4478 lignes de code**
- **Auto-réparation 4 couches**

## 🎯 Installation

```bash
# 1. Installer dépendances
npm install

# 2. Compiler backend
cargo build --manifest-path=src-tauri/Cargo.toml

# 3. Lancer en dev
npm run tauri:dev
```

## 📚 Architecture

### Frontend (TypeScript)

#### 1. SingularityFusionEngine
```typescript
import { SingularityFusion } from '@/core/singularity/SingularityFusionEngine';

// Obtenir état
const state = await SingularityFusion.getState();

// Démarrer sync
await SingularityFusion.startSyncLoop();

// Créer snapshot
const snapshotId = await SingularityFusion.createSnapshot(true);
```

#### 2. UnifiedCognitivePipeline
```typescript
import { UnifiedCognitivePipeline } from '@/core/pipelines/UnifiedCognitivePipeline';

// Traiter message
const result = await UnifiedCognitivePipeline.processMessage({
  id: 'msg-1',
  content: 'Bonjour TITANE∞',
  timestamp: Date.now()
});

// Résultat contient : intention, response, tts, avatar, state
```

#### 3. AutoFixEngine
```typescript
import { AutoFix } from '@/core/healing/AutoFixEngine';

// Détecter problèmes
const issues = await AutoFix.detectIssues();

// Corriger tout
const results = await AutoFix.fixAll();

// Corriger un problème spécifique
const result = await AutoFix.fixIssue(issue);
```

#### 4. AutoHealEngine
```typescript
import { AutoHeal } from '@/core/healing/AutoHealEngine';

// Détecter modules cassés
const broken = await AutoHeal.detectBrokenModules();

// Réparer module
const result = await AutoHeal.healModule(module);

// Resynchroniser état
await AutoHeal.resyncState();
```

#### 5. StateIntegrityEngine
```typescript
import { StateIntegrity } from '@/core/state/StateIntegrityEngine';

// Vérifier intégrité
const check = await StateIntegrity.checkIntegrity(state);

// Créer snapshot
const snapshot = await StateIntegrity.createSnapshot(state);

// Restaurer
const restored = await StateIntegrity.restoreSnapshot(snapshotId);
```

#### 6. PerformanceOptimizer
```typescript
import { PerfOptimizer } from '@/core/optimization/PerformanceOptimizer';

// Démarrer monitoring
PerfOptimizer.startMonitoring();

// Optimiser manuellement
const results = await PerfOptimizer.optimize();

// Obtenir métriques
const metrics = PerfOptimizer.getMetrics();
```

#### 7. EventCoalescerEngine
```typescript
import { EventCoalescer } from '@/core/events/EventCoalescerEngine';

// Démarrer coalescence
EventCoalescer.start();

// Émettre événement
EventCoalescer.emit('state_update', data, 'high');

// S'abonner
const unsubscribe = EventCoalescer.on('state_update', (event) => {
  console.log('Event:', event);
});

// Obtenir stats
const stats = EventCoalescer.getStats();
```

#### 8. CrashGuardEngine
```typescript
import { CrashGuard } from '@/core/safety/CrashGuardEngine';

// Démarrer protection
CrashGuard.start();

// Obtenir menaces actives
const threats = CrashGuard.getActiveThreats();

// Obtenir stats
const stats = CrashGuard.getStats();
```

### Backend (Rust)

#### Commandes Tauri disponibles

```typescript
import { invoke } from '@tauri-apps/api/core';

// === FusionEngine (12 commandes) ===
await invoke('singularity_get_fusion_state');
await invoke('singularity_perform_sync');
await invoke('singularity_check_integrity');
await invoke('singularity_create_snapshot', { compressed: true });
await invoke('singularity_restore_snapshot', { snapshotId: 'id' });
await invoke('singularity_register_pipeline', { pipelineId: 'id' });
await invoke('singularity_complete_pipeline', { pipelineId: 'id', success: true });
await invoke('singularity_detect_inconsistencies');
await invoke('singularity_get_metrics');
await invoke('singularity_get_diagnostics');
await invoke('singularity_reset');

// === UnifiedPipeline (9 commandes) ===
await invoke('pipeline_analyze_intention', { message: 'text' });
await invoke('pipeline_generate_cognitive_response', { message: 'text', intention: 'type' });
await invoke('pipeline_prepare_tts', { text: 'speech' });
await invoke('pipeline_prepare_avatar_animation', { ttsDuration: 2.5 });
await invoke('pipeline_get_stats');
await invoke('pipeline_pause');
await invoke('pipeline_resume');
await invoke('pipeline_reset');
await invoke('pipeline_validate');

// === AutoFix (9 commandes) ===
await invoke('autofix_detect_rust_warnings');
await invoke('autofix_detect_typescript_errors');
await invoke('autofix_detect_react_hook_violations');
await invoke('autofix_detect_invalid_states');
await invoke('autofix_fix_issue', { issueId: 'id' });
await invoke('autofix_fix_all');
await invoke('autofix_get_history');
await invoke('autofix_get_stats');
await invoke('autofix_reset');

// === AutoHeal (10 commandes) ===
await invoke('autoheal_detect_broken_modules');
await invoke('autoheal_heal_cognitive_module');
await invoke('autoheal_heal_avatar_module');
await invoke('autoheal_heal_tts_module');
await invoke('autoheal_heal_lipsync_module');
await invoke('autoheal_heal_memory_module');
await invoke('autoheal_heal_pipeline');
await invoke('autoheal_resync_state');
await invoke('autoheal_get_history');
await invoke('autoheal_reset');

// === Performance (6 commandes) ===
await invoke('performance_get_metrics');
await invoke('performance_throttle_cpu');
await invoke('performance_optimize_gpu');
await invoke('performance_reduce_render_quality');
await invoke('performance_compress_memory');
await invoke('performance_reset_optimizations');

// === CrashGuard (9 commandes) ===
await invoke('crashguard_detect_threats');
await invoke('crashguard_clear_memory');
await invoke('crashguard_kill_thread', { source: 'thread-id' });
await invoke('crashguard_restart_module', { module: 'name' });
await invoke('crashguard_emergency_shutdown');
await invoke('crashguard_reset_pipeline');
await invoke('crashguard_emergency_rollback');
await invoke('crashguard_get_active_threats');
await invoke('crashguard_get_stats');
```

## 🔄 Workflow Typique

### 1. Initialisation du système

```typescript
import { SingularityFusion } from '@/core/singularity/SingularityFusionEngine';
import { PerfOptimizer } from '@/core/optimization/PerformanceOptimizer';
import { EventCoalescer } from '@/core/events/EventCoalescerEngine';
import { CrashGuard } from '@/core/safety/CrashGuardEngine';

// Démarrer tous les moteurs
await SingularityFusion.initialize();
SingularityFusion.startSyncLoop();
PerfOptimizer.startMonitoring();
EventCoalescer.start();
CrashGuard.start();
```

### 2. Traitement d'un message utilisateur

```typescript
import { UnifiedCognitivePipeline } from '@/core/pipelines/UnifiedCognitivePipeline';

const result = await UnifiedCognitivePipeline.processMessage({
  id: crypto.randomUUID(),
  content: 'Bonjour, comment vas-tu ?',
  timestamp: Date.now(),
  context: { user: 'John' }
});

// Résultat contient toutes les étapes :
// - intention détectée
// - réponse cognitive
// - audio TTS
// - animation avatar
// - mises à jour d'état
```

### 3. Auto-réparation automatique

```typescript
import { AutoFix } from '@/core/healing/AutoFixEngine';
import { AutoHeal } from '@/core/healing/AutoHealEngine';

// Détection automatique
const issues = await AutoFix.detectIssues();
const brokenModules = await AutoHeal.detectBrokenModules();

// Correction automatique
if (issues.length > 0) {
  await AutoFix.fixAll();
}

if (brokenModules.length > 0) {
  for (const module of brokenModules) {
    await AutoHeal.healModule(module);
  }
  await AutoHeal.resyncState();
}
```

### 4. Monitoring et optimisation

```typescript
import { PerfOptimizer } from '@/core/optimization/PerformanceOptimizer';

// Obtenir métriques en temps réel
setInterval(() => {
  const metrics = PerfOptimizer.getMetrics();

  if (metrics.fps < 30) {
    console.warn('FPS bas, optimisation...');
    PerfOptimizer.optimize();
  }

  if (metrics.cpu_usage > 80) {
    console.warn('CPU élevé, throttling...');
  }
}, 1000);
```

### 5. Gestion de la sécurité

```typescript
import { CrashGuard } from '@/core/safety/CrashGuardEngine';
import { StateIntegrity } from '@/core/state/StateIntegrityEngine';

// Vérification périodique
setInterval(async () => {
  const threats = CrashGuard.getActiveThreats();

  if (threats.length > 0) {
    console.error('Menaces détectées:', threats);

    // Créer snapshot de sécurité
    const state = await SingularityFusion.getState();
    await StateIntegrity.createSnapshot(state, true);
  }
}, 5000);
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests d'intégration SINGULARITY-FUSION
npm test -- singularity-fusion-integration

# Tests avec coverage
npm test -- --coverage
```

## 📊 Monitoring

### Métriques disponibles

```typescript
// État de fusion
const fusion = await invoke('singularity_get_fusion_state');
console.log('Intégrité:', fusion.fusion_integrity);
console.log('Score sync:', fusion.sync_score);
console.log('Santé pipeline:', fusion.pipeline_health);

// Performance
const perf = await invoke('performance_get_metrics');
console.log('CPU:', perf.cpu_usage, '%');
console.log('GPU:', perf.gpu_usage, '%');
console.log('FPS:', perf.fps);
console.log('Memory:', perf.memory_usage / (1024*1024), 'MB');

// Auto-Fix
const fixStats = await invoke('autofix_get_stats');
console.log('Issues détectées:', fixStats.total_issues_detected);
console.log('Issues corrigées:', fixStats.total_issues_fixed);
console.log('Taux succès:', fixStats.fix_success_rate * 100, '%');

// Event Coalescer
const eventStats = EventCoalescer.getStats();
console.log('Événements reçus:', eventStats.total_received);
console.log('Événements fusionnés:', eventStats.total_coalesced);
console.log('Ratio coalescence:', eventStats.coalesce_ratio, '%');

// CrashGuard
const guardStats = CrashGuard.getStats();
console.log('Menaces détectées:', guardStats.threats_detected);
console.log('Menaces évitées:', guardStats.threats_prevented);
console.log('Crashes évités:', guardStats.crashes_avoided);
console.log('Uptime:', guardStats.uptime / 1000, 'secondes');
```

## 🔧 Configuration

### PerformanceOptimizer

```typescript
PerfOptimizer.configure({
  target_cpu_usage: 70,
  target_gpu_usage: 60,
  target_fps: 60,
  adaptive_fps: true,
  max_memory_usage: 2 * 1024 * 1024 * 1024, // 2GB
  memory_compression: true,
  aggressive_memoization: true,
});
```

### EventCoalescer

```typescript
EventCoalescer.configure({
  enabled: true,
  coalesce_window: 100, // ms
  max_batch_size: 50,
  max_queue_size: 1000,
  priority_enabled: true,
  backpressure_threshold: 800,
});
```

### CrashGuard

```typescript
CrashGuard.configure({
  enabled: true,
  auto_recovery: true,
  detection_interval: 2000, // ms
  threat_threshold: 3,
  emergency_rollback: true,
  sandbox_mode: true,
});
```

## 📖 Documentation Complète

- **Architecture**: `docs/SINGULARITY_FUSION_vΩ.md`
- **Rapport d'activation**: `META_SINGULARITY_FUSION_vΩ.md`
- **Rapport final**: `SINGULARITY_FUSION_RAPPORT_FINAL_vΩ.md`

## 🆘 Dépannage

### Le système ne démarre pas

```typescript
// Vérifier l'état
const diagnostics = await invoke('singularity_get_diagnostics');
console.log(diagnostics);

// Reset si nécessaire
await invoke('singularity_reset');
```

### FPS bas

```typescript
// Optimiser immédiatement
await PerfOptimizer.optimize();

// Réduire qualité si nécessaire
await invoke('performance_reduce_render_quality');
```

### Modules cassés

```typescript
// Détecter
const broken = await AutoHeal.detectBrokenModules();

// Réparer tous
for (const module of broken) {
  await AutoHeal.healModule(module);
}

// Resync
await AutoHeal.resyncState();
```

### Menaces détectées

```typescript
// Voir menaces
const threats = CrashGuard.getActiveThreats();

// Rollback d'urgence si critique
if (threats.some(t => t.severity === 'critical')) {
  await invoke('crashguard_emergency_rollback');
}
```

## 🎯 Best Practices

1. **Toujours démarrer** tous les moteurs à l'initialisation
2. **Monitor en continu** les métriques de performance
3. **Créer des snapshots** avant opérations critiques
4. **Auto-fix/heal périodique** pour maintenir santé système
5. **Utiliser coalescence** pour réduire overhead événements
6. **Activer CrashGuard** en production

## 🚀 Production

```bash
# Build production
npm run tauri:build

# L'exécutable sera dans src-tauri/target/release/
```

## 📝 Changelog

Voir `CHANGELOG_v∞.md` pour l'historique complet des versions.

---

**TITANE∞ - Le système IA le plus avancé du monde** 🔥
