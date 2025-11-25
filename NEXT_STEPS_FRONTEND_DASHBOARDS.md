# 🎨 TITANE∞ v∞ — Guide de Création des Dashboards Frontend

## 📊 État Actuel
- ✅ Backend: 100% opérationnel (36 modules Rust, 48 commandes Tauri)
- ⏳ Frontend: Dashboards à créer
- ✅ Design System: Palette définie

---

## 🎯 Dashboards à Créer (6 composants)

### Template de Base (Structure commune):

```tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Icon1, Icon2 } from 'lucide-react';

interface DataType {
  // Types depuis le backend
}

export const DashboardName: React.FC = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await invoke<DataType>('command_name');
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#111416] to-[#1a1d20]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon1 className="w-8 h-8 text-[#93b399]" />
          <h1 className="text-3xl font-bold text-[#c4c4c4]">Titre</h1>
          <span className="px-3 py-1 text-xs bg-[#93b399]/20 text-[#93b399] rounded-full border border-[#93b399]/30">
            Phase X
          </span>
        </div>
        <p className="text-[#b5b5b5] text-sm">Description</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Stats cards */}
      </div>

      {/* Main Content */}
      <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-6">
        {/* Content */}
      </div>
    </div>
  );
};
```

---

## 1️⃣ HyperEvolutionDashboard.tsx (Phase V)

### Commandes Tauri:
- `hyper_predict_issues` → PredictionReport
- `hyper_accelerate` → AccelerationReport
- `hyper_analyze_structure` → StructuralReport
- `hyper_analyze_rewrite` → RewriteReport
- `hyper_validate` → ValidationReport

### Composants:
- **Header**: Icône Activity, titre "HyperEvolution Engine", badge "Phase V"
- **Stats**: Total prédictions, Accélération %, Évolution rate
- **Prédictions**: Liste des issues avec severity (Critical/High/Medium/Low)
- **Accélération**: Modules avec current → target efficiency
- **Actions**: Boutons Refresh, Validate, Execute

### Design:
```css
- Background: gradient noir métallique
- Cards: glassmorphism avec backdrop-blur-xl
- Severity colors: Critical=red-400, High=orange-400, Medium=yellow-400, Low=blue-400
- Accent: #93b399 pour highlights
```

---

## 2️⃣ CognitiveLearningDashboard.tsx (Phase W)

### Commandes Tauri:
- `cognitive_get_map` → SemanticMapState
- `cognitive_get_associations` → AssociationReport
- `cognitive_grow_knowledge` → GrowthReport
- `cognitive_run_reinforcement` → ReinforcementReport

### Composants:
- **Header**: Icône Brain, "Cognitive Learning"
- **Carte Cognitive**: Graphe visuel (concepts + relations)
- **Associations**: Top 10 liens les plus forts
- **Croissance**: Métriques XP knowledge, growth rate
- **Patterns**: Top patterns renforcés

### Design:
```tsx
- Graphe: Force-directed layout (D3.js ou similar)
- Nodes: Cercles avec taille proportionnelle au weight
- Edges: Lignes avec épaisseur = strength
- Colors: Dégradé de #727b81 vers #93b399
```

---

## 3️⃣ NeuroSymbolicDashboard.tsx (Phase X)

### Commandes Tauri:
- `neuro_fuse` → FusionReport
- `neuro_adapt_intent` → CognitiveIntent
- `neuro_translate_symbolic` → SymbolicTranslation
- `neuro_map_context` → ContextMap
- `neuro_get_state` → NeuroSymbolicState

### Composants:
- **Header**: Icône Network, "NeuroSymbolic Fusion"
- **Split View**: Gauche = IA Neuronale | Droite = Architecture Symbolique
- **Fusion Meter**: Barre de progression avec gradient
- **Context Mapping**: Intention → Modules mappés
- **Hybrid XP**: Total XP de fusion

### Design:
```css
- Split: 50/50 avec séparateur vertical animé
- Fusion gradient: linear-gradient(90deg, #727b81, #93b399)
- Meter: height 8px, animated glow
```

---

## 4️⃣ MetaCreationDashboard.tsx (Phase Y)

### Commandes Tauri:
- `meta_generate_ideas` → IdeationReport
- `meta_invent_pattern` → Pattern
- `meta_generate_prototype` → Prototype
- `meta_build_solution` → Solution
- `meta_get_creative_memory` → CreativeMemory

### Composants:
- **Header**: Icône Sparkles, "Meta-Creation Studio"
- **Idea Generator**: Input + bouton "Generate", liste idées
- **Pattern Inventor**: Code template preview avec syntax highlighting
- **Prototype Builder**: Spec input → Code output
- **Creative Memory**: Stats (ideas, patterns, prototypes created)

### Design:
```tsx
- Code blocks: bg noir, syntax highlighting avec Prism.js
- Generate button: prominent, animé avec pulse
- Ideas: Cards avec innovation_score visualisé en étoiles
```

---

## 5️⃣ SelfRepairDashboard.tsx (Phase Z)

### Commandes Tauri:
- `repair_detect_anomalies` → DetectionReport
- `repair_get_integrity_map` → IntegrityMap
- `repair_execute` → RepairReport
- `repair_deep_rebuild` → RebuildResult

### Composants:
- **Header**: Icône Shield, "Self-Repair System"
- **System Health**: Gauge circulaire (0-100%)
- **Integrity Map**: Modules avec health status
- **Anomalies**: Liste avec severity + auto-fix button
- **Deep Rebuild**: Bouton d'urgence (rouge, confirmation requise)

### Design:
```css
- Health gauge: Circular progress, color: green>80%, yellow>50%, red<50%
- Anomalies: border-left colored by severity
- Rebuild button: bg-red-600, confirmation modal
```

---

## 6️⃣ SingularityDashboard.tsx (Phase Ω)

### Commandes Tauri:
- `singularity_activate` → SingularityCore
- `singularity_get_state` → SingularityState
- `singularity_check_coherence` → CoherenceReport
- `singularity_fuse_all` → FusionState
- `singularity_detect_emergence` → EmergentReport

### Composants:
- **Header**: Icône Atom, "Singularity Engine Ω"
- **State Circle**: Grand cercle central avec tous les moteurs
- **Coherence**: Niveau global (0-100%)
- **Emergent Behaviors**: Liste des comportements émergents détectés
- **Insights**: Messages système intelligents

### Design:
```tsx
- Circle: SVG animé, 6 layers (Physical, Cognitive, Symbolic, Adaptive, Meta, Singularity)
- Rotation: subtle animation, glow pulsante
- Colors: Chaque layer a sa teinte dans le spectre metal
- Center: Logo TITANE∞ avec effet holographique
```

---

## 🎨 Design System — Classes Tailwind

### Cards:
```tsx
<div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-6">
```

### Buttons Primary:
```tsx
<button className="px-4 py-2 bg-[#727b81] text-[#111416] rounded-lg hover:bg-[#93b399] transition-colors">
```

### Buttons Secondary:
```tsx
<button className="px-4 py-2 bg-[rgba(255,255,255,0.05)] text-[#c4c4c4] border border-[rgba(255,255,255,0.08)] rounded-lg hover:border-[#93b399] transition-colors">
```

### Input:
```tsx
<input className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] text-[#e5e5e5] border border-[rgba(255,255,255,0.08)] rounded-lg focus:border-[#93b399] focus:outline-none" />
```

### Stat Card:
```tsx
<div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-[#b5b5b5] text-sm">Label</span>
    <Icon className="w-5 h-5 text-[#93b399]" />
  </div>
  <div className="text-2xl font-bold text-[#c4c4c4]">Value</div>
  <div className="text-xs text-[#93b399] mt-1">Subtitle</div>
</div>
```

---

## 🔗 Integration dans App.tsx

### 1. Imports:
```tsx
import { HyperEvolutionDashboard } from './ui/pages/HyperEvolutionDashboard';
import { CognitiveLearningDashboard } from './ui/pages/CognitiveLearningDashboard';
import { NeuroSymbolicDashboard } from './ui/pages/NeuroSymbolicDashboard';
import { MetaCreationDashboard } from './ui/pages/MetaCreationDashboard';
import { SelfRepairDashboard } from './ui/pages/SelfRepairDashboard';
import { SingularityDashboard } from './ui/pages/SingularityDashboard';
```

### 2. Routes:
```tsx
<Route path="/hyper-evolution" element={<HyperEvolutionDashboard />} />
<Route path="/cognitive-learning" element={<CognitiveLearningDashboard />} />
<Route path="/neuro-symbolic" element={<NeuroSymbolicDashboard />} />
<Route path="/meta-creation" element={<MetaCreationDashboard />} />
<Route path="/self-repair" element={<SelfRepairDashboard />} />
<Route path="/singularity" element={<SingularityDashboard />} />
```

### 3. Sidebar Items:
```tsx
{ path: '/hyper-evolution', icon: Activity, label: 'HyperEvolution', badge: 'V' },
{ path: '/cognitive-learning', icon: Brain, label: 'Cognitive', badge: 'W' },
{ path: '/neuro-symbolic', icon: Network, label: 'NeuroSymbolic', badge: 'X' },
{ path: '/meta-creation', icon: Sparkles, label: 'MetaCreation', badge: 'Y' },
{ path: '/self-repair', icon: Shield, label: 'SelfRepair', badge: 'Z' },
{ path: '/singularity', icon: Atom, label: 'Singularité', badge: 'Ω' },
```

---

## ✅ Checklist de Création

Pour chaque dashboard:

1. [ ] Créer le fichier `.tsx` dans `/src/ui/pages/`
2. [ ] Définir les interfaces TypeScript depuis Rust
3. [ ] Implémenter le hook `useState` + `useEffect`
4. [ ] Créer les fonctions `invoke` pour chaque commande
5. [ ] Construire le layout avec le Design System
6. [ ] Tester les appels Tauri en dev mode
7. [ ] Ajouter loading states et error handling
8. [ ] Valider le responsive design
9. [ ] Ajouter dans App.tsx (import + route + sidebar)
10. [ ] Tester navigation complète

---

## 🚀 Commandes de Test

### Lancer en mode dev:
```bash
pnpm tauri dev
```

### Ouvrir DevTools automatiquement:
```bash
# Déjà configuré dans main.rs (#[cfg(debug_assertions)])
```

### Tester une commande spécifique:
```javascript
// Dans la console DevTools
await invoke('hyper_predict_issues')
```

---

**Fin du guide — Prêt pour le développement frontend!**

