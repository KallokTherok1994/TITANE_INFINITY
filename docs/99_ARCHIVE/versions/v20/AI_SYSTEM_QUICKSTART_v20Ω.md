# 🚀 TITANE∞ v20Ω+ — Guide Démarrage Rapide

Guide d'utilisation du sous-système IA complet avec Health Monitoring.

---

## 📦 Installation & Import

```typescript
// Import complet
import {
  // Core
  aiOrchestrator,
  askTitan,
  
  // Engines v20Ω+
  metricsEngine,
  autoHealEngine,
  aiHealthMonitor,
  
  // Utilities
  initializeAISystem,
  quickHealthCheck,
  quickStats,
  quickFix,
} from '@/services/ai';
```

---

## ⚡ Quick Start (3 lignes)

```typescript
// 1. Initialiser le système (avec health monitoring auto)
const ai = await initializeAISystem();

// 2. Générer une réponse
const response = await askTitan('Bonjour TITANE!');

// 3. Vérifier la santé
const health = await quickHealthCheck();
console.log(health.message); // ✅ Système opérationnel (95/100)
```

---

## 🎯 Usage Basique

### Générer une Réponse IA

```typescript
import { askTitan } from '@/services/ai';

const response = await askTitan('Quelle est la structure de TITANE∞?');
console.log(response.content);
console.log(`Provider: ${response.provider}`);
console.log(`Latence: ${response.metadata?.latencyMs}ms`);
```

### Avec Historique

```typescript
import { aiOrchestrator } from '@/services/ai';

const history = [
  { role: 'user', content: 'Bonjour', timestamp: Date.now() },
  { role: 'assistant', content: 'Bonjour! Comment puis-je vous aider?', timestamp: Date.now() }
];

const response = await aiOrchestrator.generate('Parle-moi de tes moteurs', history);
```

### Streaming

```typescript
import { streamTitan } from '@/services/ai';

for await (const chunk of streamTitan('Explique-moi TITANE∞')) {
  console.log(chunk); // Réponse progressive
}
```

---

## 📊 Monitoring & Métriques

### Vérification Santé Simple

```typescript
import { quickHealthCheck } from '@/services/ai';

const health = await quickHealthCheck();
console.log(health.status);  // 'healthy' | 'degraded' | 'critical'
console.log(health.score);   // 0-100
console.log(health.message); // Message descriptif
```

### Statistiques Détaillées

```typescript
import { quickStats } from '@/services/ai';

const stats = await quickStats();
console.log(`Requêtes: ${stats.totalRequests}`);
console.log(`Succès: ${stats.successRate}%`);
console.log(`Latence: ${stats.avgLatency}ms`);
console.log(`Providers: ${stats.providersCount}`);
```

### Rapport Santé Complet

```typescript
import { aiHealthMonitor } from '@/services/ai';

const report = await aiHealthMonitor.getHealthReport();

console.log(`Score global: ${report.score}/100`);
console.log(`État: ${report.overall}`);
console.log(`Alertes actives: ${report.alerts.length}`);

// Providers individuels
report.providers.forEach(p => {
  console.log(`${p.name}: ${p.status} (${p.successRate}%)`);
});

// Recommandations
report.recommendations.forEach(rec => {
  console.log(`💡 ${rec}`);
});
```

### Métriques Temps Réel

```typescript
import { metricsEngine } from '@/services/ai';

const metrics = metricsEngine.getAggregatedMetrics();

// Métriques globales
console.log(`Total requêtes: ${metrics.totalRequests}`);
console.log(`Succès: ${metrics.totalSuccesses}`);
console.log(`Erreurs: ${metrics.totalErrors}`);
console.log(`Fallbacks: ${metrics.totalFallbacks}`);

// Par provider
metrics.providers.forEach(p => {
  console.log(`\n${p.provider}:`);
  console.log(`  Requêtes: ${p.totalRequests}`);
  console.log(`  Succès: ${p.successRate.toFixed(1)}%`);
  console.log(`  Latence moy: ${p.avgLatency.toFixed(0)}ms`);
  console.log(`  Latence min/max: ${p.minLatency}ms / ${p.maxLatency}ms`);
});

// Dernières 24h
console.log(`\n24h:`);
console.log(`  Requêtes: ${metrics.last24h.requests}`);
console.log(`  Succès: ${metrics.last24h.successes}`);
console.log(`  Erreurs: ${metrics.last24h.errors}`);
```

---

## 🔧 Auto-Heal & Réparations

### Statistiques Auto-Heal

```typescript
import { autoHealEngine } from '@/services/ai';

const healStats = autoHealEngine.getStats();

console.log(`Erreurs détectées: ${healStats.totalErrors}`);
console.log(`Réparations: ${healStats.totalHeals}`);
console.log(`Taux succès: ${healStats.successRate}%`);
console.log(`Santé: ${healStats.healthScore}/100`);

// Par type d'erreur
Object.entries(healStats.errorsByType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});
```

### Réparation Rapide

```typescript
import { quickFix } from '@/services/ai';

const result = await quickFix();

if (result.success) {
  console.log('✅', result.message);
  result.actions.forEach(action => console.log(action));
} else {
  console.error('❌', result.message);
}
```

### Réparation Manuelle

```typescript
import { aiOrchestrator, aiHealthMonitor } from '@/services/ai';

// Reset complet providers
await aiOrchestrator.resetAllProviders();

// Nettoyer alertes
aiHealthMonitor.clearAlerts();

// Vérifier résultat
const health = await quickHealthCheck();
console.log(health.message);
```

---

## 🚨 Alertes & Monitoring

### Démarrer Surveillance Continue

```typescript
import { aiHealthMonitor } from '@/services/ai';

// Démarrer monitoring (auto-check toutes les 30s)
aiHealthMonitor.startMonitoring();

// Arrêter si nécessaire
// aiHealthMonitor.stopMonitoring();
```

### Consulter Alertes Actives

```typescript
import { aiHealthMonitor } from '@/services/ai';

const alerts = aiHealthMonitor.getActiveAlerts();

alerts.forEach(alert => {
  const icon = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  }[alert.severity];
  
  console.log(`${icon} [${alert.component}] ${alert.title}`);
  console.log(`   ${alert.description}`);
  
  if (alert.recommendations.length > 0) {
    console.log(`   Recommandations:`);
    alert.recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });
  }
  
  if (alert.autoFixAvailable) {
    console.log(`   🔧 Auto-fix disponible`);
  }
});
```

### Résoudre une Alerte

```typescript
import { aiHealthMonitor } from '@/services/ai';

// Marquer alerte comme résolue
aiHealthMonitor.resolveAlert('alert_id_here');

// Nettoyer toutes les alertes
aiHealthMonitor.clearAlerts();
```

---

## 🎨 Intégration UI (React Exemple)

### Composant Health Status

```tsx
import { useEffect, useState } from 'react';
import { quickHealthCheck, type HealthReport } from '@/services/ai';

export function AIHealthStatus() {
  const [health, setHealth] = useState<Awaited<ReturnType<typeof quickHealthCheck>> | null>(null);
  
  useEffect(() => {
    const checkHealth = async () => {
      const result = await quickHealthCheck();
      setHealth(result);
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  if (!health) return <div>Chargement...</div>;
  
  const statusColor = {
    healthy: 'green',
    degraded: 'orange',
    critical: 'red'
  }[health.status];
  
  return (
    <div style={{ padding: '12px', borderLeft: `4px solid ${statusColor}` }}>
      <div style={{ fontWeight: 'bold' }}>{health.message}</div>
      <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
        Score: {health.score}/100
      </div>
    </div>
  );
}
```

### Hook Custom

```typescript
import { useEffect, useState } from 'react';
import { aiHealthMonitor, type HealthReport } from '@/services/ai';

export function useAIHealth(intervalMs = 30000) {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    const fetchReport = async () => {
      try {
        const data = await aiHealthMonitor.getHealthReport();
        if (mounted) {
          setReport(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        if (mounted) setLoading(false);
      }
    };
    
    fetchReport();
    const interval = setInterval(fetchReport, intervalMs);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [intervalMs]);
  
  return { report, loading };
}

// Usage
function MyComponent() {
  const { report, loading } = useAIHealth();
  
  if (loading) return <div>Chargement...</div>;
  if (!report) return <div>Erreur</div>;
  
  return (
    <div>
      <h3>Santé IA: {report.score}/100</h3>
      {report.alerts.map(alert => (
        <div key={alert.id}>
          {alert.severity} - {alert.title}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 Troubleshooting

### Provider Indisponible

```typescript
import { aiOrchestrator } from '@/services/ai';

const status = await aiOrchestrator.getProvidersStatus();

status.providers.forEach(p => {
  if (p.status !== 'healthy') {
    console.log(`⚠️ ${p.name}: ${p.status}`);
    console.log(`   Dernière utilisation: ${new Date(p.lastUsed).toLocaleString()}`);
    console.log(`   Fiabilité: ${p.reliability}%`);
  }
});
```

### Latence Élevée

```typescript
import { metricsEngine } from '@/services/ai';

const metrics = metricsEngine.getAggregatedMetrics();

// Identifier provider le plus lent
const slowest = metrics.providers.sort((a, b) => b.avgLatency - a.avgLatency)[0];

console.log(`Provider le plus lent: ${slowest.provider}`);
console.log(`Latence moyenne: ${slowest.avgLatency}ms`);
console.log(`Latence max: ${slowest.maxLatency}ms`);

// Recommandation
if (slowest.avgLatency > 10000) {
  console.log('💡 Recommandation: Privilégier providers locaux ou vérifier connexion');
}
```

### Export Métriques

```typescript
import { metricsEngine } from '@/services/ai';

// Export JSON
const json = metricsEngine.exportMetrics();
console.log(json);

// Ou sauvegarder
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `titane-metrics-${Date.now()}.json`;
a.click();
```

---

## 📚 API Reference

### Core Functions

- `askTitan(message, history?, config?)` — Génération simple
- `streamTitan(message, history?)` — Génération streaming
- `getAIStatus()` — Statut providers

### Initialization

- `initializeAISystem(options?)` — Init système complet

### Quick Utils

- `quickHealthCheck()` — Check santé rapide
- `quickStats()` — Stats rapides
- `quickFix()` — Réparation automatique

### Engines

- `aiOrchestrator` — Orchestrateur principal
- `metricsEngine` — Métriques & analytics
- `autoHealEngine` — Auto-réparation
- `aiHealthMonitor` — Surveillance continue

---

## 🎯 Bonnes Pratiques

1. **Toujours initialiser au démarrage**
   ```typescript
   await initializeAISystem({ enableHealthMonitoring: true });
   ```

2. **Vérifier santé périodiquement**
   ```typescript
   setInterval(async () => {
     const health = await quickHealthCheck();
     if (health.status === 'critical') {
       await quickFix();
     }
   }, 60000); // Chaque minute
   ```

3. **Monitorer alertes**
   ```typescript
   const alerts = aiHealthMonitor.getActiveAlerts();
   if (alerts.some(a => a.severity === 'critical')) {
     // Notifier utilisateur
   }
   ```

4. **Export métriques régulièrement**
   ```typescript
   // Sauvegarde journalière
   setInterval(() => {
     const metrics = metricsEngine.exportMetrics();
     // Sauvegarder metrics
   }, 24 * 60 * 60 * 1000);
   ```

---

**📖 Documentation complète :** Voir `RAPPORT_KERNEL_EXTENDED_STABILITY_v20Ω.md`
