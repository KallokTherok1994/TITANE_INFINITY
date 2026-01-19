# 🔴 TITANE∞ LIVE DEBUGGER VOCAL ENGINE v∞.29.0

## 📋 Vue d'ensemble

**Super Prompt #19** — Extension du Vocal Dev Console (#18) avec **analyse continue en temps réel**.

Le **LIVE DEBUGGER VOCAL ENGINE v∞** est un système de debugging vocal innovant qui écoute en continu pendant que vous parlez, analyse chaque segment de 300ms, détecte les intentions (bugs, features, questions), diagnostique les problèmes, génère des micro/macro patches, et peut appliquer automatiquement les corrections (mode auto-heal).

### 🎯 Objectifs

- **Analyse Continue** : Loop temps réel 300ms → Segment → Intent → Diagnostic → Patch
- **8 Types Intentions** : dev, bug, ui, backend, heal, diagnostic, question, command
- **5 Modes Debugging** : shadow, active, auto-heal, explain, draft
- **Micro/Macro Patches** : Corrections safe auto-applicables vs patches complexes avec review
- **Health Score** : Métrique 0-100% basée sur diagnostics + patches appliqués
- **Self-Healing** : Mode auto-heal applique corrections automatiquement pendant que vous parlez

---

## 🏗️ Architecture

### 📦 Composants Créés

#### 1. **LiveDebuggerEngine.ts** (900+ lignes)
`src/modules/liveDebugger/LiveDebuggerEngine.ts`

**Moteur principal** — Singleton gérant pipeline temps réel complet.

**Responsabilités** :
- Segment timer loop 300ms
- Intent detection (8 types + confidence scoring)
- Diagnostic engine (analysis + root cause + suggested fix)
- Micro/macro patch generation
- Auto-application patches safe
- Health score calculation
- Observable state pattern

**API Clés** :
```typescript
class LiveDebuggerEngine {
  // Lifecycle
  async activate(mode: LiveDebuggerMode): Promise<void>
  async deactivate(): Promise<void>
  async startListening(): Promise<void>
  stopListening(): void

  // Real-time loop
  private startSegmentTimer(): void
  private async processSegment(): Promise<void>
  private async analyzeSegment(segment: string): Promise<void>

  // Intent detection
  private async detectIntent(text: string): Promise<LiveIntent>
  private identifyModules(text: string): string[]
  private calculateSeverity(text, confidence): 'low'|'medium'|'high'|'critical'

  // Diagnostic
  private async diagnoseIssue(intent: LiveIntent): Promise<LiveDiagnostic>
  private analyzeContext(intent): string
  private identifyRootCause(intent, analysis): string | null

  // Patch generation
  private async generateMicroPatch(intent, rootCause): Promise<MicroPatch | null>
  private generateMacroPatch(intent, rootCause): MacroPatch | null

  // Patch application
  private async applyMicroPatch(patch: MicroPatch): Promise<void>
  private async explainDiagnostic(diagnostic: LiveDiagnostic): Promise<void>

  // Health scoring
  private updateHealthScore(): void

  // Observable
  subscribe(listener: (state) => void): () => void
  getState(): LiveDebuggerState
  getConfig(): LiveDebuggerConfig
  getStats(): LiveDebuggerStats
}
```

**Types Exportés** :
```typescript
export type LiveDebuggerMode = 'shadow' | 'active' | 'auto-heal' | 'explain' | 'draft';

export type LiveIntentType =
  | 'dev'        // Développement feature
  | 'bug'        // Bug report
  | 'ui'         // UI/UX issue
  | 'backend'    // Backend/API issue
  | 'heal'       // Auto-heal request
  | 'diagnostic' // Diagnostic request
  | 'question'   // Question
  | 'command';   // SUDO command

export interface LiveIntent {
  type: LiveIntentType;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  modules: string[];
  text: string;
}

export interface LiveDiagnostic {
  id: string;
  timestamp: number;
  intent: LiveIntent;
  analysis: string;
  rootCause: string | null;
  suggestedFix: string | null;
  microPatch: MicroPatch | null;
  macroPatch: MacroPatch | null;
  executionPlan: string[];
}

export interface MicroPatch {
  type: 'config' | 'styling' | 'simple-logic' | 'import';
  module: string;
  file: string | null;
  changes: string[];
  confidence: number;
  reason: string;
  safe: boolean;
  autoApplicable: boolean;
}

export interface MacroPatch {
  type: 'architecture' | 'refactor' | 'new-feature' | 'complex-logic';
  description: string;
  affectedModules: string[];
  estimatedComplexity: 'medium' | 'high' | 'very-high';
  requiresReview: boolean;
}
```

---

#### 2. **useLiveDebugger.ts** (200+ lignes)
`src/hooks/useLiveDebugger.ts`

**React Hook** — Interface React pour Live Debugger avec auto-subscription.

**API Exposée** (30+ méthodes/props) :
```typescript
interface UseLiveDebuggerReturn {
  // Lifecycle
  activate: (mode?: LiveDebuggerMode) => Promise<void>;
  deactivate: () => Promise<void>;

  // Listening
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;

  // Analysis
  isAnalyzing: boolean;
  isPatching: boolean;

  // Diagnostics
  diagnostics: LiveDiagnostic[];
  recentDiagnostics: LiveDiagnostic[]; // 5 derniers
  lastDiagnostic: LiveDiagnostic | null;

  // Patches
  appliedPatches: MicroPatch[];
  recentPatches: MicroPatch[]; // 5 derniers

  // Modes
  mode: LiveDebuggerMode;
  setMode: (mode: LiveDebuggerMode) => void;

  // Health
  healthScore: number; // 0-100%

  // Transcript
  currentTranscript: string;
  segmentBuffer: string[];

  // Stats
  sessionDuration: number;
  totalSegments: number;
  totalDiagnostics: number;
  totalPatches: number;
  averageConfidence: number;

  // Utilities
  reset: () => void;
  clearDiagnostics: () => void;
  configure: (config: Partial<LiveDebuggerConfig>) => void;
}
```

**Usage** :
```typescript
import { useLiveDebugger } from '@/hooks/useLiveDebugger';

function MyComponent() {
  const {
    activate,
    startListening,
    isListening,
    diagnostics,
    healthScore,
    mode
  } = useLiveDebugger();

  return (
    <div>
      <p>Mode: {mode}</p>
      <p>Health: {healthScore}%</p>
      <p>Diagnostics: {diagnostics.length}</p>
      <button onClick={() => activate('auto-heal')}>Activate</button>
      <button onClick={startListening}>Start Listening</button>
    </div>
  );
}
```

---

#### 3. **LiveDebuggerConsole.tsx** (400+ lignes)
`src/components/LiveDebuggerConsole.tsx`

**UI Console Temps Réel** — Interface graphique streaming diagnostics.

**Sections UI** :

1. **Header** :
   - Mode badge (shadow/active/auto-heal/explain/draft)
   - Indicators : 🎤 LISTENING, 🔍 ANALYZING, 🔧 PATCHING

2. **Health Bar** :
   - 0-100% avec couleurs dynamiques
   - Vert >80%, Orange >50%, Rouge <50%

3. **Mode Selector** :
   - 5 boutons toggle (shadow, active, auto-heal, explain, draft)
   - 3 checkboxes : Auto-Heal, TTS, Explain

4. **Transcript Stream** :
   - Display transcription en temps réel
   - Segment count
   - 50-100px height, scrollable

5. **Diagnostics Stream** :
   - Liste diagnostics avec auto-scroll
   - Expandable details
   - Severity icons : 🟢 low, 🟡 medium, 🟠 high, 🔴 critical
   - Intent icons : 💻 dev, 🐛 bug, 🎨 ui, 🦀 backend, 🔧 heal, 🔍 diagnostic, ❓ question, ⚡ command
   - Preview micro/macro patches

6. **Applied Patches** :
   - 5 derniers patches
   - Confidence badge
   - Green background

7. **Controls** :
   - Bouton START/STOP LISTENING
   - Gradient rouge (idle) → vert (listening)

**DiagnosticItem Component** :
```typescript
function DiagnosticItem({ diagnostic }: { diagnostic: LiveDiagnostic }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`diagnostic-item severity-${diagnostic.intent.severity}`}>
      <div className="diagnostic-header" onClick={() => setExpanded(!expanded)}>
        <span>{getSeverityIcon(diagnostic.intent.severity)}</span>
        <span>{getIntentIcon(diagnostic.intent.type)}</span>
        <span>{diagnostic.intent.type}</span>
        <span>{(diagnostic.intent.confidence * 100).toFixed(0)}%</span>
      </div>
      {expanded && (
        <div className="diagnostic-details">
          <p><strong>Analysis:</strong> {diagnostic.analysis}</p>
          {diagnostic.rootCause && (
            <p><strong>Root Cause:</strong> {diagnostic.rootCause}</p>
          )}
          {diagnostic.suggestedFix && (
            <p><strong>Suggested Fix:</strong> {diagnostic.suggestedFix}</p>
          )}
          {/* Micro/macro patch preview */}
        </div>
      )}
    </div>
  );
}
```

---

#### 4. **LiveDebuggerConsole.css** (500+ lignes)
`src/components/LiveDebuggerConsole.css`

**Styles Complets** — Design system rouge theme.

**Design Tokens** :
- **Theme** : Dark gradient (#1a1a1a → #2a2a2a)
- **Primary** : Rouge #ff0000
- **Position** : Fixed bottom-right
- **Width** : 700px
- **Max-height** : 85vh

**Animations** :
```css
@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 25px rgba(255, 0, 0, 0.9); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse-listening {
  0%, 100% { border-color: rgba(0, 255, 0, 0.5); }
  50% { border-color: rgba(0, 255, 0, 1); }
}

@keyframes critical-pulse {
  0%, 100% { border-left-color: #ff0000; }
  50% { border-left-color: #ff5555; box-shadow: 0 0 15px rgba(255, 0, 0, 0.5); }
}
```

**Mode Badges** :
- shadow : gris #555
- active : vert #00ff00
- auto-heal : orange #ff8800
- explain : bleu #0088ff
- draft : violet #8800ff

**Health Bar** :
```css
.health-good { background: linear-gradient(90deg, #00ff00, #00cc00); }
.health-medium { background: linear-gradient(90deg, #ff8800, #ff6600); }
.health-low { background: linear-gradient(90deg, #ff0000, #cc0000); }
```

**Diagnostic Items** :
- Border-left colors par severity
- Critical items → critical-pulse animation
- Hover → scale(1.02)

**Responsive** :
```css
@media (max-width: 768px) {
  .live-debugger-console {
    width: calc(100vw - 40px);
    max-height: 70vh;
  }
}
```

---

## 🔄 Pipeline Temps Réel

### Loop 300ms — 10 Étapes

**1. Segment Timer Tick** (300ms)
```typescript
private startSegmentTimer(): void {
  this.segmentTimer = setInterval(() => {
    this.processSegment();
  }, 300);
}
```

**2. Récupération Transcription**
```typescript
const vocalState = vocalDevConsole.getState();
const currentTranscript = vocalState.transcript || '';
```

**3. Extraction Nouveau Segment**
```typescript
const newSegment = currentTranscript.slice(this.lastProcessedLength);
if (newSegment.trim().length === 0) return;
this.lastProcessedLength = currentTranscript.length;
```

**4. Ajout Buffer**
```typescript
this.state.segmentBuffer.push(newSegment);
if (this.state.segmentBuffer.length > 20) {
  this.state.segmentBuffer.shift();
}
```

**5. Ajout Analysis Queue**
```typescript
this.analysisQueue.push(newSegment);
this.state.totalSegments++;
```

**6. Analyse Segment → Detect Intent**
```typescript
private async detectIntent(text: string): Promise<LiveIntent> {
  const intentScores = {
    dev: this.calculateDevScore(text),
    bug: this.calculateBugScore(text),
    ui: this.calculateUIScore(text),
    backend: this.calculateBackendScore(text),
    heal: this.calculateHealScore(text),
    diagnostic: this.calculateDiagnosticScore(text),
    question: this.calculateQuestionScore(text),
    command: this.calculateCommandScore(text),
  };

  const topIntent = Object.entries(intentScores)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    type: topIntent[0] as LiveIntentType,
    confidence: topIntent[1],
    severity: this.calculateSeverity(text, topIntent[1]),
    modules: this.identifyModules(text),
    text: text,
  };
}
```

**7. Confidence Check (≥ 0.6)**
```typescript
if (intent.confidence < 0.6) {
  console.log('[LiveDebugger] Low confidence, skipping diagnostic');
  return;
}
```

**8. Génération Diagnostic**
```typescript
private async diagnoseIssue(intent: LiveIntent): Promise<LiveDiagnostic> {
  const analysis = this.analyzeContext(intent);
  const rootCause = this.identifyRootCause(intent, analysis);
  const suggestedFix = this.generateSuggestedFix(intent, rootCause);

  const microPatch = await this.generateMicroPatch(intent, rootCause);
  const macroPatch = this.generateMacroPatch(intent, rootCause);
  const executionPlan = this.createExecutionPlan(intent, microPatch, macroPatch);

  return {
    id: `diag-${Date.now()}`,
    timestamp: Date.now(),
    intent,
    analysis,
    rootCause,
    suggestedFix,
    microPatch,
    macroPatch,
    executionPlan,
  };
}
```

**9. Auto-Application Patch (si auto-heal + safe)**
```typescript
if (
  this.state.mode === 'auto-heal' &&
  this.config.autoHealEnabled &&
  diagnostic.microPatch &&
  diagnostic.microPatch.safe &&
  diagnostic.microPatch.autoApplicable
) {
  await this.applyMicroPatch(diagnostic.microPatch);
}
```

**10. Update Health Score**
```typescript
private updateHealthScore(): void {
  let healthScore = 100;

  this.state.diagnostics.slice(-10).forEach(d => {
    if (d.intent.severity === 'critical') healthScore -= 20;
    else if (d.intent.severity === 'high') healthScore -= 10;
    else if (d.intent.severity === 'medium') healthScore -= 5;
    else healthScore -= 2;
  });

  healthScore += this.state.appliedPatches.length * 5;

  this.state.healthScore = Math.max(0, Math.min(100, healthScore));
}
```

---

## 🎮 Modes Debugging

### 1. **Shadow Mode** (Écoute Passive)
**Objectif** : Monitoring discret, n'intervient que si critique.

**Comportement** :
- Analyse continue
- N'intervient que si `confidence > shadowModeThreshold` (défaut 0.8)
- Pas de patches automatiques
- Logs silencieux

**Usage** :
```bash
sudo live.on shadow
sudo live.setMode shadow
```

**Configuration** :
```typescript
liveDebugger.configure({ shadowModeThreshold: 0.85 });
```

---

### 2. **Active Mode** (Debug Interactif)
**Objectif** : Analyse temps réel + propositions corrections.

**Comportement** :
- Analyse tous segments
- Affiche diagnostics
- Propose patches
- Pas d'application automatique → validation manuelle requise

**Usage** :
```bash
sudo live.on active
sudo live.setMode active
```

---

### 3. **Auto-Heal Mode** (Self-Healing Automatique)
**Objectif** : Corrections automatiques instantanées pendant que vous parlez.

**Comportement** :
- Analyse temps réel
- Applique micro-patches safe automatiquement
- Seuls patches avec `safe: true` + `autoApplicable: true`
- Health score mis à jour en direct

**Usage** :
```bash
sudo live.on auto-heal
sudo live.heal
```

**Configuration** :
```typescript
liveDebugger.configure({ autoHealEnabled: true });
```

**⚠️ Attention** : Les corrections sont appliquées sans confirmation.

---

### 4. **Explain Mode** (Learning Mode Vocal)
**Objectif** : Explications vocales en direct pendant debug.

**Comportement** :
- Analyse temps réel
- Explications vocales TTS pour chaque diagnostic
- Narration des root causes + suggested fixes
- Commentaires en direct

**Usage** :
```bash
sudo live.on explain
sudo live.setMode explain
```

**Configuration** :
```typescript
liveDebugger.configure({
  explainWhileDebugging: true,
  ttsEnabled: true
});
```

---

### 5. **Draft Mode** (Coding Vocal Assisté)
**Objectif** : Génération patches vocale, voice-driven code writing.

**Comportement** :
- Commandes vocales "Crée une fonction X..."
- Génération code via voice intent
- Patches macro pour new features
- Validation avant application

**Usage** :
```bash
sudo live.on draft
sudo live.setMode draft
```

---

## 🧩 Types Intentions (8 Types)

### 1. **dev** (Développement Feature)
**Mots-clés** : `ajoute`, `crée`, `implémente`, `nouvelle feature`, `module`, `function`

**Exemples** :
- "Ajoute un bouton pour sauvegarder"
- "Crée une nouvelle fonction calculateTotal"
- "Implémente un module de cache"

**Severity** : Low → Medium (rarement critical)

---

### 2. **bug** (Bug Report)
**Mots-clés** : `bug`, `erreur`, `crash`, `ne fonctionne pas`, `problème`, `broken`

**Exemples** :
- "Bug dans le module AudioEngine"
- "Erreur 500 sur l'API backend"
- "Crash quand je clique sur le bouton"

**Severity** : Medium → Critical

---

### 3. **ui** (UI/UX Issue)
**Mots-clés** : `interface`, `design`, `bouton`, `couleur`, `layout`, `styling`, `CSS`

**Exemples** :
- "Le bouton est trop petit"
- "Couleur de fond pas lisible"
- "Layout cassé sur mobile"

**Severity** : Low → Medium (rarement high)

---

### 4. **backend** (Backend/API Issue)
**Mots-clés** : `backend`, `API`, `database`, `Rust`, `Tauri`, `command`, `endpoint`

**Exemples** :
- "L'API ne répond pas"
- "Erreur Tauri command vad_process_frame"
- "Database connection timeout"

**Severity** : Medium → Critical

---

### 5. **heal** (Auto-Heal Request)
**Mots-clés** : `répare`, `fix`, `corrige`, `auto-heal`, `healing`, `patch`

**Exemples** :
- "Répare automatiquement ce problème"
- "Auto-heal ce bug"
- "Corrige en temps réel"

**Severity** : Variable selon problème

---

### 6. **diagnostic** (Diagnostic Request)
**Mots-clés** : `inspecte`, `analyse`, `diagnostic`, `check`, `status`, `vérifie`

**Exemples** :
- "Inspecte le module AudioEngine"
- "Analyse le backend"
- "Diagnostic complet"

**Severity** : Low (request, pas problème)

---

### 7. **question** (Question)
**Mots-clés** : `comment`, `pourquoi`, `qu'est-ce que`, `question`, `explique`, `?`

**Exemples** :
- "Comment fonctionne le VAD ?"
- "Pourquoi ce module crash ?"
- "Qu'est-ce que le Health Score ?"

**Severity** : Low

---

### 8. **command** (SUDO Command)
**Mots-clés** : `sudo`, `live.on`, `live.off`, `live.heal`, `commande`, `execute`

**Exemples** :
- "Sudo live.on auto-heal"
- "Execute live.patch"
- "Live.setMode explain"

**Severity** : Low

---

## 🩹 Micro vs Macro Patches

### Micro Patches (Safe, Auto-Applicable)

**Types** : `config`, `styling`, `simple-logic`, `import`

**Critères Safety** :
- ✅ Modifications <20 lignes
- ✅ Pas d'impact architecture
- ✅ Changements idempotents
- ✅ Rollback simple

**Exemples** :
```typescript
// Config change
{
  type: 'config',
  module: 'AudioEngine',
  file: 'src/config/audioConfig.ts',
  changes: ['vadThreshold: 0.02 → 0.03'],
  confidence: 0.85,
  reason: 'VAD trop sensible',
  safe: true,
  autoApplicable: true
}

// Styling fix
{
  type: 'styling',
  module: 'VocalConsole',
  file: 'src/components/VocalConsole.css',
  changes: ['button { min-height: 44px; }'],
  confidence: 0.9,
  reason: 'Bouton trop petit (accessibility)',
  safe: true,
  autoApplicable: true
}

// Import fix
{
  type: 'import',
  module: 'VoiceService',
  file: 'src/services/voiceService.ts',
  changes: ['import { VADConfig } from "@/types/audio";'],
  confidence: 0.95,
  reason: 'Missing import VADConfig',
  safe: true,
  autoApplicable: true
}
```

**Application Automatique** (auto-heal mode) :
```typescript
if (
  mode === 'auto-heal' &&
  patch.safe &&
  patch.autoApplicable
) {
  await autoHealEngine.heal();
  console.log(`[LiveDebugger] Auto-applied patch: ${patch.reason}`);
}
```

---

### Macro Patches (Complex, Requires Review)

**Types** : `architecture`, `refactor`, `new-feature`, `complex-logic`

**Critères Complexity** :
- ❌ Modifications >50 lignes
- ❌ Impact architecture
- ❌ Changements multiples modules
- ❌ Nécessite tests complets

**Exemples** :
```typescript
// Architecture change
{
  type: 'architecture',
  description: 'Migrer AudioEngine vers pattern Observer',
  affectedModules: ['AudioEngine', 'VAD', 'TTS', 'VoiceService'],
  estimatedComplexity: 'very-high',
  requiresReview: true
}

// Refactor
{
  type: 'refactor',
  description: 'Extraire useVAD logic vers AudioEngine.ts',
  affectedModules: ['useVAD', 'AudioEngine'],
  estimatedComplexity: 'medium',
  requiresReview: true
}

// New feature
{
  type: 'new-feature',
  description: 'Implémenter noise cancellation avancée',
  affectedModules: ['AudioEngine', 'VAD', 'Backend'],
  estimatedComplexity: 'high',
  requiresReview: true
}
```

**Workflow Manual Review** :
1. Agent génère macro-patch
2. User review description + affected modules
3. User approuve → Agent exécute patch
4. Tests complets post-application

---

## 📊 Health Score Algorithm

### Calcul (0-100%)

**Base** : 100%

**Pénalités Diagnostics** (10 derniers) :
- Critical : -20%
- High : -10%
- Medium : -5%
- Low : -2%

**Bonus Patches** :
- +5% par patch appliqué

**Formule** :
```typescript
healthScore = 100
  - (criticalCount * 20)
  - (highCount * 10)
  - (mediumCount * 5)
  - (lowCount * 2)
  + (patchesApplied * 5);

healthScore = Math.max(0, Math.min(100, healthScore));
```

**Exemples** :
```
Cas 1 : Aucun diagnostic
→ Health: 100%

Cas 2 : 2 medium diagnostics
→ Health: 100 - (2 * 5) = 90%

Cas 3 : 1 critical, 2 high, 3 medium
→ Health: 100 - 20 - 20 - 15 = 45%

Cas 4 : 1 critical, 2 patches appliqués
→ Health: 100 - 20 + 10 = 90%
```

**Visual Health Bar** :
- 🟢 **Vert** : >80% (healthy)
- 🟡 **Orange** : 50-80% (degraded)
- 🔴 **Rouge** : <50% (critical)

---

## 💻 Commandes SUDO (10 Commandes)

### 1. **live.on [mode]** — Active Live Debugger

**Syntaxe** :
```bash
sudo live.on [shadow|active|auto-heal|explain|draft]
```

**Exemples** :
```bash
sudo live.on
sudo live.on shadow
sudo live.on auto-heal
sudo active live debugger en mode active
sudo start live debugger
sudo debug vocal on
```

**Réponse** :
```
🔴 TITANE∞ LIVE DEBUGGER v∞ — ACTIVÉ

✅ Mode: shadow
✅ Analyse temps réel activée
✅ Segment interval: 300ms
✅ Intent analyzer prêt

Modes disponibles:
  • shadow — Écoute sans intervenir (seuil 80%)
  • active — Analyse et propose corrections
  • auto-heal — Corrections automatiques instantanées
  • explain — Explications vocales en direct
  • draft — Génération patches vocale

🎙️ Démarrez listening: `sudo live.console` puis bouton START LISTENING

💡 Changez mode: `sudo live.setMode [mode]`
```

---

### 2. **live.off** — Désactive Live Debugger

**Syntaxe** :
```bash
sudo live.off
```

**Exemples** :
```bash
sudo live.off
sudo désactive live debugger
sudo stop live debugger
sudo debug vocal off
```

**Réponse** :
```
🔴 TITANE∞ LIVE DEBUGGER v∞ — DÉSACTIVÉ

✅ Debugger arrêté
✅ Listening stoppé

Session Statistics:
  - Duration: 247s
  - Total segments: 82
  - Diagnostics: 12
  - Patches applied: 3
  - Avg confidence: 75%

💡 Réactivez: `sudo live.on [mode]`
```

---

### 3. **live.heal** — Déclenche Auto-Healing

**Syntaxe** :
```bash
sudo live.heal
```

**Exemples** :
```bash
sudo live.heal
sudo live auto-heal on
sudo répare en temps réel
sudo active auto-healing
```

**Réponse** :
```
🔧 LIVE DEBUGGER AUTO-HEAL ACTIVÉ

✅ Mode auto-heal actif
✅ Corrections automatiques instantanées
✅ Micro-patches appliqués en temps réel

Current State:
  - Health Score: 85%
  - Diagnostics: 5
  - Patches applied: 2

Le Live Debugger corrigera automatiquement les problèmes simples détectés pendant que vous parlez.

⚠️ Seulement patches sûrs (safe: true) sont appliqués automatiquement.

💡 Désactivez auto-heal: `sudo live.setMode active`
```

---

### 4. **live.inspect [target]** — Inspecte Module

**Syntaxe** :
```bash
sudo live.inspect [module]
```

**Exemples** :
```bash
sudo live.inspect AudioEngine
sudo inspecte live VocalConsole
sudo debug inspect Backend
```

**Réponse** :
```
🔍 LIVE INSPECT → "AudioEngine"

Related Diagnostics: 3 trouvés

Diagnostic 1:
  - Intent: bug
  - Severity: high
  - Confidence: 82%
  - Analysis: VAD threshold trop sensible, false positives
  - Root Cause: vadThreshold = 0.02 (trop bas)
  - Fix: Augmenter vadThreshold à 0.03

Diagnostic 2:
  ...

Health Score: 75%
```

---

### 5. **live.patch** — Applique Dernier Patch

**Syntaxe** :
```bash
sudo live.patch
```

**Exemples** :
```bash
sudo live.patch
sudo applique patch live
sudo patch temps réel
```

**Réponse** :
```
✅ LIVE PATCH APPLIQUÉ

Patch:
  - Module: AudioEngine
  - Confidence: 85%
  - Reason: VAD threshold adjustment
  - Safe: ✅ true

✅ Corrections appliquées automatiquement

Health Score: 90%

💡 Vérifiez: `sudo diagnostic` ou testez l'application
```

---

### 6. **live.logs** — Affiche Diagnostics Récents

**Syntaxe** :
```bash
sudo live.logs
```

**Exemples** :
```bash
sudo live.logs
sudo show live logs
sudo diagnostics live
```

**Réponse** :
```
📋 TITANE∞ LIVE DEBUGGER LOGS (10 récents)

Severity Breakdown:
  - 🟢 Low: 3
  - 🟡 Medium: 4
  - 🟠 High: 2
  - 🔴 Critical: 1

Session Stats:
  - Duration: 180s
  - Total segments: 60
  - Total diagnostics: 10
  - Patches applied: 2
  - Avg confidence: 72%
  - Health Score: 80%

Recent Diagnostics (5 derniers):
1. [HIGH] bug — 82%
   VAD threshold trop sensible
   → vadThreshold = 0.02 (trop bas)

2. [MEDIUM] ui — 68%
   Bouton trop petit
   → min-height: 44px requis (accessibility)

...

💡 Console UI complète: `sudo live.console`
```

---

### 7. **live.restart** — Redémarre Pipeline IA

**Syntaxe** :
```bash
sudo live.restart
```

**Exemples** :
```bash
sudo live.restart
sudo restart live debugger
sudo redémarre debugger
```

**Réponse** :
```
♻️ LIVE DEBUGGER REDÉMARRÉ

✅ Pipeline IA réinitialisé
✅ Segment timer relancé
✅ Intent analyzer reset
✅ Mode restauré: active

État après restart:
  - Health Score: 100%
  - Diagnostics: 0
  - Patches: 0
  - Listening: false

💡 Redémarrez listening: `sudo live.console` puis START LISTENING
```

---

### 8. **live.reset** — Reset Session

**Syntaxe** :
```bash
sudo live.reset
```

**Exemples** :
```bash
sudo live.reset
sudo reset live debugger
sudo clear live
```

**Réponse** :
```
♻️ LIVE DEBUGGER SESSION RESET

✅ Diagnostics effacés
✅ Patches history cleared
✅ Segment buffer vidé
✅ Health Score: 100%
✅ Stats reset

État après reset:
  - Total segments: 0
  - Total diagnostics: 0
  - Total patches: 0
  - Session time: 0s

Le Live Debugger est prêt pour une nouvelle session.

💡 Continuez listening si actif, ou redémarrez avec `sudo live.on [mode]`
```

---

### 9. **live.console** — Toggle Console UI

**Syntaxe** :
```bash
sudo live.console
```

**Exemples** :
```bash
sudo live.console
sudo toggle live console
sudo show live debugger
```

**Réponse** :
```
📖 LIVE DEBUGGER CONSOLE UI

La console Live Debugger apparaîtra automatiquement dans l'interface React.

Features Console:
  - 🔴 Mode indicator (shadow/active/auto-heal/explain/draft)
  - 🎙️ Transcript stream en temps réel
  - 🔍 Diagnostics feed avec sévérité
  - ✅ Applied patches history
  - 📊 Health bar
  - ⚙️ Mode selector + options (Auto-Heal, TTS, Explain)
  - 🎤 START/STOP LISTENING button

Si la console n'apparaît pas:
1. Vérifiez que le composant <LiveDebuggerConsole /> est dans votre App
2. Activez le debugger: `sudo live.on`
3. La console s'ouvrira automatiquement

💡 Position: Bottom-right, 700px width
```

---

### 10. **live.setMode [mode]** — Change Mode

**Syntaxe** :
```bash
sudo live.setMode [shadow|active|auto-heal|explain|draft]
```

**Exemples** :
```bash
sudo live.setMode auto-heal
sudo live.setMode shadow
sudo mode live active
```

**Réponse** :
```
🎯 LIVE DEBUGGER MODE CHANGED → `auto-heal`

✅ Auto-Heal Mode activé
  - Corrections automatiques activées ✅
  - Micro-patches appliqués instantanément
  - Seuls patches sûrs (safe: true)
  - Health score mis à jour en direct

⚠️ Attention: Les corrections sont appliquées sans confirmation
💡 Usage: Self-healing automatique continu

Mode actif: auto-heal
```

---

## 🔌 Intégration dans App

### 1. **Ajouter LiveDebuggerConsole Component**

**App.tsx** :
```tsx
import { LiveDebuggerConsole } from '@/components/LiveDebuggerConsole';
import '@/components/LiveDebuggerConsole.css';

function App() {
  return (
    <div className="app">
      {/* Votre application */}

      {/* Live Debugger Console (bottom-right) */}
      <LiveDebuggerConsole />
    </div>
  );
}
```

---

### 2. **Utiliser Hook dans Composant Custom**

**MyDebugComponent.tsx** :
```tsx
import { useLiveDebugger } from '@/hooks/useLiveDebugger';
import { useEffect } from 'react';

function MyDebugComponent() {
  const {
    activate,
    startListening,
    stopListening,
    isListening,
    diagnostics,
    healthScore,
    mode,
    recentDiagnostics,
  } = useLiveDebugger();

  useEffect(() => {
    // Auto-activate on mount
    activate('shadow');
  }, []);

  return (
    <div>
      <h2>Live Debugger Status</h2>
      <p>Mode: <strong>{mode}</strong></p>
      <p>Health: <strong>{healthScore}%</strong></p>
      <p>Listening: {isListening ? '🎤' : '⏸️'}</p>

      <button onClick={startListening}>Start Listening</button>
      <button onClick={stopListening}>Stop Listening</button>

      <h3>Recent Diagnostics ({recentDiagnostics.length})</h3>
      <ul>
        {recentDiagnostics.map(d => (
          <li key={d.id}>
            [{d.intent.severity}] {d.intent.type} — {d.analysis}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 3. **Utiliser Engine Directement (Singleton)**

**customScript.ts** :
```typescript
import { liveDebugger } from '@/modules/liveDebugger/LiveDebuggerEngine';

// Activer
await liveDebugger.activate('auto-heal');

// Configurer
liveDebugger.configure({
  autoHealEnabled: true,
  ttsEnabled: true,
  explainWhileDebugging: true,
  shadowModeThreshold: 0.85,
});

// Subscribe aux changements
const unsubscribe = liveDebugger.subscribe((state) => {
  console.log('Live Debugger State Updated:', state);
  console.log('Health Score:', state.healthScore);
  console.log('Total Diagnostics:', state.totalDiagnostics);
});

// Start listening
await liveDebugger.startListening();

// ... Later
liveDebugger.stopListening();
await liveDebugger.deactivate();
unsubscribe();
```

---

## 🐛 Troubleshooting

### Problème 1 : **Console UI ne s'affiche pas**

**Symptômes** : Aucune console bottom-right visible.

**Solutions** :
1. Vérifier import CSS :
   ```tsx
   import '@/components/LiveDebuggerConsole.css';
   ```

2. Vérifier composant ajouté dans App :
   ```tsx
   <LiveDebuggerConsole />
   ```

3. Vérifier z-index (9999) pas écrasé par autre composant

4. Activer debugger :
   ```bash
   sudo live.on active
   ```

---

### Problème 2 : **Listening ne démarre pas**

**Symptômes** : Bouton START LISTENING inactif.

**Solutions** :
1. Activer Live Debugger avant :
   ```typescript
   await liveDebugger.activate('active');
   ```

2. Vérifier Vocal Dev Console actif :
   ```typescript
   import { vocalDevConsole } from '@/modules/vocalDevConsole/VocalDevConsoleEngine';
   await vocalDevConsole.startRecording();
   ```

3. Vérifier permissions micro :
   - Browser doit autoriser microphone access
   - Tauri permissions audio dans `tauri.conf.json`

4. Vérifier VAD configured :
   ```bash
   sudo audio.status
   ```

---

### Problème 3 : **Aucun diagnostic généré**

**Symptômes** : Listening actif, mais diagnostics vides.

**Solutions** :
1. Vérifier confidence threshold :
   ```typescript
   // Diagnostics générés seulement si confidence ≥ 0.6
   liveDebugger.configure({ shadowModeThreshold: 0.5 }); // Abaisser seuil
   ```

2. Vérifier transcription non vide :
   ```bash
   sudo vocal.transcript
   ```

3. Parler plus clairement keywords intent :
   - "Bug dans AudioEngine"
   - "Erreur VAD"
   - "Ajoute une fonction X"

4. Vérifier segment processing :
   ```typescript
   const state = liveDebugger.getState();
   console.log('Segments processed:', state.totalSegments);
   console.log('Segment buffer:', state.segmentBuffer);
   ```

---

### Problème 4 : **Auto-heal ne corrige pas**

**Symptômes** : Mode auto-heal actif, mais patches pas appliqués.

**Solutions** :
1. Vérifier mode auto-heal :
   ```bash
   sudo live.setMode auto-heal
   ```

2. Vérifier config autoHealEnabled :
   ```typescript
   liveDebugger.configure({ autoHealEnabled: true });
   ```

3. Vérifier patches safety :
   - Seulement patches `safe: true` + `autoApplicable: true` appliqués
   - Patches complexes nécessitent review manuelle

4. Logs patches :
   ```bash
   sudo live.logs
   ```
   Vérifier si patches générés mais `safe: false`.

---

### Problème 5 : **Health Score reste bas**

**Symptômes** : Health score <50% malgré patches appliqués.

**Solutions** :
1. Vérifier diagnostics critiques récents :
   ```bash
   sudo live.logs
   ```
   Severity breakdown → traiter critical issues prioritairement.

2. Reset session :
   ```bash
   sudo live.reset
   ```
   Efface diagnostics → health score retourne 100%.

3. Appliquer patches manuellement :
   ```bash
   sudo live.patch
   sudo auto-heal
   ```

4. Vérifier formule health score :
   - Critical : -20% chacun
   - High : -10%
   - Medium : -5%
   - Low : -2%
   - Patches : +5% chacun

---

### Problème 6 : **Intent mal détecté**

**Symptômes** : Intent détecté incorrect (ex: "bug" détecté comme "question").

**Solutions** :
1. Améliorer keywords matching :
   - Parler plus explicitement : "Bug AudioEngine VAD" au lieu de "Problème audio"

2. Vérifier confidence score :
   ```typescript
   const intent = await liveDebugger.detectIntent(text);
   console.log('Intent confidence:', intent.confidence);
   ```
   Si confidence <0.7 → améliorer phrasing.

3. Analyser intent scores :
   ```typescript
   // Dans detectIntent()
   console.log('Intent scores:', {
     dev: devScore,
     bug: bugScore,
     ui: uiScore,
     // ...
   });
   ```

4. Ajuster patterns intent detection :
   - Éditer `LiveDebuggerEngine.ts` → méthodes `calculateXScore()`
   - Ajouter keywords spécifiques projet

---

## 📚 Références Croisées

### Super Prompts Connexes

**#18 — Vocal Dev Console v∞** :
- Base recording + transcription
- VAD integration
- Voice commands
- LiveDebugger utilise VocalDevConsole pour transcription

**#11 — Memory & Context Engine v∞** :
- Analyse context files
- Code archaeology
- LiveDebugger utilise context pour root cause analysis

**#17 — Fusion Architecture v∞** :
- Hybrid architecture
- Module identification
- LiveDebugger identifie modules affectés via Fusion map

**#15 — Auto-Heal Engine v∞** :
- Self-healing automatic
- Patch application
- LiveDebugger appelle autoHealEngine.heal() pour micro-patches

---

## 📈 Statistiques Implémentation

**Fichiers Créés** : 4
- LiveDebuggerEngine.ts : 900+ lignes
- useLiveDebugger.ts : 200+ lignes
- LiveDebuggerConsole.tsx : 400+ lignes
- LiveDebuggerConsole.css : 500+ lignes

**Total TypeScript** : ~1500 lignes
**Total CSS** : ~500 lignes
**Total Ajouté** : ~2000+ lignes

**Commandes SUDO** : +10 (134 total)
- live.on, live.off, live.heal, live.inspect, live.patch
- live.logs, live.restart, live.reset, live.console, live.setMode

**Patterns Regex** : +60 patterns (6 moyenne par commande)

**Handlers Functions** : +10 (640 lignes)

**Documentation** : 1 fichier (LIVE_DEBUGGER_VOCAL_v∞.md)

---

## 🎯 Prochaines Évolutions

### Phase 2 (Future)

1. **ML Intent Classification** :
   - Remplacer regex scoring par ML model
   - Training dataset diagnostics réels
   - Accuracy >90%

2. **Advanced Patch Generation** :
   - AST parsing pour micro-patches
   - Code diff generation automatique
   - Multi-file patches

3. **Voice Commands Extended** :
   - Draft mode full voice coding
   - "Crée une fonction calculateTotal qui prend un array..."
   - Voice-driven refactoring

4. **Real-time Collaboration** :
   - Multi-user live debugging
   - Shared diagnostics stream
   - Collaborative auto-heal

5. **Performance Monitoring** :
   - Segment processing metrics
   - Intent detection latency <50ms
   - Health score trending graphs

---

## ✅ Checklist Déploiement

**Frontend** :
- [x] LiveDebuggerEngine.ts créé
- [x] useLiveDebugger.ts créé
- [x] LiveDebuggerConsole.tsx créé
- [x] LiveDebuggerConsole.css créé
- [ ] Intégrer <LiveDebuggerConsole /> dans App.tsx

**SUDO Commands** :
- [x] 10 types DevSudoAction ajoutés
- [x] 60 patterns regex ajoutés
- [x] 10 case handlers ajoutés
- [x] 10 handler functions implémentées

**Documentation** :
- [x] LIVE_DEBUGGER_VOCAL_v∞.md créé

**Tests** :
- [ ] Test live.on → activation OK
- [ ] Test startListening → segment processing OK
- [ ] Test intent detection → 8 types OK
- [ ] Test micro-patch generation → safe patches OK
- [ ] Test auto-heal mode → patches appliqués OK
- [ ] Test health score → calculation OK
- [ ] Test SUDO commands → 10 commandes OK

**Git** :
- [ ] Commit: `feat(live-debugger): Super Prompt #19 - LIVE DEBUGGER VOCAL ENGINE v∞ 🔴`

---

## 📞 Support

**Issues** : Si problème Live Debugger, exécutez :
```bash
sudo live.logs
sudo diagnostic
sudo memory.context
```

**Contact** : TITANE∞ Development Team

---

**TITANE∞ LIVE DEBUGGER VOCAL ENGINE v∞.29.0** — Debugger vocal temps réel avec analyse continue 300ms, 8 intentions, 5 modes, micro/macro patches, auto-heal, health score 🔴
