# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ v∞.26.0 — HYBRID ENGINE DOCUMENTATION
# Super Prompt #16: AI Bubble + Dev Console Fusion
# ═══════════════════════════════════════════════════════════════════════════

## 🧠⚡ VISION GLOBALE

Le **Hybrid Engine** est la fusion ultime de l'AI Bubble (Super Prompt #14) et d'une console dev technique. Il crée un **copilote omniprésent** capable de :

- **Détecter l'intention** (chat IA / commande dev / healing / introspection)
- **Router automatiquement** vers le bon système
- **Exécuter des commandes** shell, Rust, TypeScript, etc.
- **Auto-réparer** le code avec patches intelligents
- **Suivre l'utilisateur** sur toutes les pages
- **Se synchroniser** avec Singularity, Memory Eternal, Self-Healing

---

## 🏗️ ARCHITECTURE

### 📂 Structure des fichiers

```
src/
├── modules/hybrid/
│   └── HybridEngine.ts             # Core logic (intent, commands, execution)
├── components/
│   ├── AIChatBubble.tsx             # Original AI Bubble (Super Prompt #14)
│   └── HybridBubble.tsx             # Nouveau composant hybride
├── hooks/
│   ├── useGlobalAIChat.ts           # Global state AI Bubble
│   └── useHybridEngine.ts           # React hook pour Hybrid Engine
└── modules/devSudo/
    └── devSudoHandler.ts            # +10 nouvelles commandes SUDO

src-tauri/src/
├── main.rs                          # +5 commandes Tauri
└── commands/
    └── hybrid.rs                    # Backend Rust pour dev operations
```

---

## 🎯 FONCTIONNALITÉS

### 1. 🔍 **Intent Detection System**

Le moteur détecte automatiquement l'intention de l'utilisateur avec **5 types** :

| Intent | Mots-clés | Exemples | Confiance |
|--------|-----------|----------|-----------|
| **chat** | none (default) | "Explique-moi React", "Comment ça marche ?" | 0.5 |
| **dev** | fix, patch, compile, build, rust, cargo, npm, install, run, test, debug | "fix le module X", "cargo check", "npm install" | 0.75-0.95 |
| **heal** | repair, heal, correct, bug, error, crash, broken | "repair le composant", "auto-heal" | 0.8 |
| **introspection** | analyze, inspect, diagnostic, status, health, check, scan | "inspect system", "analyze module" | 0.7 |
| **diagnostic** | logs, errors, warnings, issues, problems | "show logs", "check errors" | 0.7 |

**Bonus** : Commandes avec préfixe `sudo`, `!`, `>`, `$` → **0.95 confiance** (commande explicite)

#### Code example (HybridEngine.ts)

```typescript
const intent = hybridEngine.detectIntent("fix le composant Audio");
// { type: 'dev', confidence: 0.85, keywords: ['fix'], suggestedAction: 'patch' }

const intent2 = hybridEngine.detectIntent("sudo cargo check");
// { type: 'dev', confidence: 0.95, keywords: ['sudo', 'cargo'], suggestedAction: 'run' }
```

---

### 2. ⚡ **Command Execution System**

Le moteur parse et exécute des commandes avec **5 opérations dev** :

| Opération | Action | Backend Tauri | Exemple |
|-----------|--------|---------------|---------|
| **inspect** | Inspecte un fichier ou module | `dev_inspect_file` | `inspect src/main.rs` |
| **patch** | Applique un patch de réparation | `dev_apply_patch` | `fix module Audio` |
| **logs** | Récupère les logs système | `dev_get_logs` | `logs filter=error` |
| **diagnostic** | Analyse le code (health check) | `hybrid_analyze_code` | `diagnostic all` |
| **run** | Exécute une commande shell | `dev_run_command` | `run cargo test` |

#### Parsing des commandes

```typescript
const command = hybridEngine.parseCommand("sudo inspect src/main.rs");
// {
//   raw: "sudo inspect src/main.rs",
//   parsed: {
//     action: "inspect",
//     target: "src/main.rs",
//     params: {}
//   },
//   requiresSudo: true
// }
```

#### Exécution

```typescript
const execution = await hybridEngine.executeCommand(command);
// {
//   command: { ... },
//   output: "File exists. 500 lines. No obvious issues.",
//   exitCode: 0,
//   duration: 120,
//   timestamp: 1735050000000,
//   errors: null
// }
```

---

### 3. 🩹 **Auto-Healing System**

Le moteur peut détecter des erreurs et générer des patches automatiquement.

```typescript
// Détection d'issues
const patches = await hybridEngine.detectIssuesAndProposePatch("Audio module");
// [
//   {
//     file: "src/audio/AudioEngine.ts",
//     lineStart: 42,
//     lineEnd: 45,
//     oldCode: "const player = undefined;",
//     newCode: "const player = new AudioPlayer();",
//     description: "Initialize AudioPlayer properly",
//     confidence: 0.85
//   }
// ]

// Application d'un patch
const success = await hybridEngine.applyAutoPatch(patches[0]);
// true
```

**Intégration avec Self-Healing Engine** : Le Hybrid Engine peut déclencher le Self-Healing Engine pour des réparations avancées.

---

### 4. 🩺 **Diagnostics System**

```typescript
const diagnostics = await hybridEngine.runFullDiagnostic();
// [
//   {
//     module: "AudioEngine",
//     health: "healthy",
//     issues: [],
//     suggestions: ["Add more tests", "Improve documentation"]
//   },
//   {
//     module: "ChatOrchestrator",
//     health: "warning",
//     issues: ["Missing error handling in sendMessage"],
//     suggestions: ["Add try-catch blocks"]
//   }
// ]
```

---

### 5. 📱 **Hybrid Bubble UI**

Le composant `HybridBubble.tsx` offre **3 modes visuels** :

| Mode | Description | Taille | Visuel |
|------|-------------|--------|--------|
| **bubble** | Bulle flottante minimale | 64x64px | 🧠⚡ |
| **chat** | Panneau chat IA classique | 480x680px | Messages + input |
| **console** | Terminal dev technique | 480x680px | Command history + input |

#### Design monochrome TITANE∞

- **Bulle** : Gradient `#727B81 → #C4C4C4`, border-radius 50%
- **Panel** : Background `#1a1f2e → #0a0e1a`, border `#727B81/30%`
- **Console** : Font monospace (Fira Code), syntax highlighting

#### Switching modes

```typescript
// Programmation
const event = new CustomEvent('titane-hybrid-console');
window.dispatchEvent(event);

// SUDO
sudo hybrid.console
```

---

## 🔌 BACKEND TAURI

### Commandes Rust (src-tauri/src/commands/hybrid.rs)

| Commande | Signature | Description |
|----------|-----------|-------------|
| `dev_run_command` | `(command: String) -> CommandResult` | Exécute une commande shell |
| `dev_inspect_file` | `(path: String) -> FileInspection` | Inspecte un fichier (metadata, content, analysis) |
| `dev_apply_patch` | `(file, lineStart, lineEnd, newCode) -> CommandResult` | Applique un patch de code |
| `dev_get_logs` | `(filter: Option<String>) -> CommandResult` | Récupère les logs système |
| `hybrid_analyze_code` | `(target: String) -> Vec<CodeDiagnostic>` | Analyse le code (health check) |

#### Exemple d'utilisation

```typescript
import { invoke } from '@tauri-apps/api/core';

// Exécuter une commande
const result = await invoke('dev_run_command', { command: 'cargo check' });
console.log(result);
// { output: "Checking...", exitCode: 0, error: null }

// Inspecter un fichier
const inspection = await invoke('dev_inspect_file', { path: 'src/main.rs' });
console.log(inspection);
// { path: "src/main.rs", exists: true, size: 5000, lines: 150, analysis: "✅ No issues" }

// Appliquer un patch
const patchResult = await invoke('dev_apply_patch', {
  file: 'src/module.ts',
  lineStart: 10,
  lineEnd: 12,
  newCode: 'const fixed = true;\n'
});
console.log(patchResult);
// { output: "✅ Patch applied", exitCode: 0, error: null }
```

---

## 🎮 COMMANDES SUDO

### 10 nouvelles commandes dans devSudoHandler.ts

| Commande | Alias | Description | Exemples |
|----------|-------|-------------|----------|
| **hybrid.open** | `sudo hybrid.open` | Ouvre le Hybrid Bubble en mode console | `hybrid.open`, `open hybrid` |
| **hybrid.close** | `sudo hybrid.close` | Ferme le Hybrid Bubble | `hybrid.close`, `close hybrid` |
| **hybrid.console** | `sudo hybrid.console` | Switch vers mode console | `hybrid.console`, `console mode` |
| **hybrid.bubble** | `sudo hybrid.bubble` | Switch vers mode bubble | `hybrid.bubble`, `bubble mode` |
| **hybrid.heal** | `sudo hybrid.heal target=X` | Auto-détection et réparation | `hybrid.heal`, `hybrid.heal target=Audio` |
| **hybrid.inspect** | `sudo hybrid.inspect path=X` | Inspecte un module/fichier | `hybrid.inspect path=src/main.rs` |
| **hybrid.fix** | `sudo hybrid.fix target=X` | Applique un patch de réparation | `hybrid.fix target=AudioEngine` |
| **hybrid.apply** | `sudo hybrid.apply file=X ...` | Applique un patch manuel | `hybrid.apply file=X lineStart=10 lineEnd=12 newCode="..."` |
| **hybrid.run** | `sudo hybrid.run command="X"` | Exécute une commande shell | `hybrid.run command="cargo test"` |
| **hybrid.logs** | `sudo hybrid.logs filter=X` | Récupère les logs | `hybrid.logs`, `hybrid.logs filter=error` |

#### Exemples d'utilisation dans le Chat

```markdown
User: sudo hybrid.open

AI: 🧠⚡ HYBRID BUBBLE ACTIVATED
Console dev omnipresente lancée.
Mode: Console
État: Prêt pour commandes

---

User: sudo hybrid.inspect path=src/audio/AudioEngine.ts

AI: 🔍 INSPECTION: `src/audio/AudioEngine.ts`

📊 Métadonnées:
  • Taille: 12.5 KB
  • Lignes: 450

📝 Analyse:
⚠️ Issues found:
Contains TODO comments
Contains debug statements

---

User: sudo hybrid.heal target=AudioEngine

AI: 🩹 AUTO-HEALING ACTIVÉ
Cible: `AudioEngine`
Analyse en cours... Recherche d'erreurs et génération de patches.
✅ Diagnostic lancé

---

User: sudo hybrid.run command="cargo check"

AI: 💻 COMMANDE EXÉCUTÉE
```bash
$ cargo check
```

Résultat (exit 0):
```
Checking titane_infinity v∞.26.0
Finished dev [unoptimized + debuginfo] target(s) in 2.35s
```

---

User: sudo hybrid.logs filter=error

AI: 📋 LOGS SYSTÈME
Filtre: `error`

```
[ERROR] Connection failed to API
[ERROR] Module AudioEngine: Initialization failed
```
```

---

## 🔗 INTÉGRATIONS

### 1. Singularity Engine

Le Hybrid Engine se synchronise avec Singularity pour :
- **État cognitif** : Charge mentale, focus, fatigue
- **Metrics** : Santé globale du système
- **Coherence** : Validation des actions avant exécution

```typescript
import { useSingularityState } from '@/hooks/useSingularityState';

const { cognitive, physical } = useSingularityState();
if (cognitive.charge_mentale > 80) {
  // Ne pas exécuter de commandes lourdes
}
```

### 2. Memory Eternal

Le Hybrid Engine enregistre toutes les exécutions dans Memory Eternal :
- **Commandes exécutées** : Historique des actions
- **Patches appliqués** : Changements de code
- **Diagnostics** : Résultats d'analyse

```typescript
import { useMemory } from '@/hooks/useMemory';

const { saveInteraction } = useMemory();
await saveInteraction({
  type: 'dev-command',
  content: execution.command.raw,
  result: execution.output,
  timestamp: Date.now(),
});
```

### 3. Self-Healing Engine

Le Hybrid Engine peut déclencher le Self-Healing pour :
- **Réparations complexes** : Erreurs multi-modules
- **Refactoring** : Restructuration de code
- **Optimisation** : Amélioration des performances

```typescript
import { selfHealingEngine } from '@/modules/selfHealing/SelfHealingEngine';

const issues = await hybridEngine.detectIssuesAndProposePatch('all');
if (issues.length > 5) {
  // Déclencher healing profond
  await selfHealingEngine.deepHeal();
}
```

### 4. Data Collector Engine

Le Hybrid Engine contribue au Data Collector (Super Prompt #15) :
- **Corrections dev** : Données pour training
- **Commandes utilisateur** : Patterns d'usage
- **Auto-heal** : Exemples de réparation

```typescript
import { dataCollector } from '@/modules/dataCollector/DataCollectorEngine';

dataCollector.addInteraction({
  category: 'dev-correction',
  content: `Fix: ${execution.command.raw}\nResult: ${execution.output}`,
  quality: 0.9,
  importance: 0.8,
});
```

---

## 🚀 UTILISATION

### 1. Setup initial

```typescript
// App.tsx
import { HybridBubble } from '@/components/HybridBubble';

function App() {
  return (
    <div>
      {/* Votre app */}
      <HybridBubble initialMode="bubble" />
    </div>
  );
}
```

### 2. Hook React

```typescript
import { useHybridEngine } from '@/hooks/useHybridEngine';

function MyComponent() {
  const {
    mode,
    currentIntent,
    executionHistory,
    isExecuting,
    detectIntent,
    executeRawCommand,
    inspectModule,
    runDiagnostic,
  } = useHybridEngine();

  const handleCommand = async () => {
    const intent = detectIntent("fix AudioEngine");
    if (intent.type === 'dev') {
      await executeRawCommand("fix AudioEngine");
    }
  };

  return (
    <div>
      <p>Mode: {mode}</p>
      <p>Intent: {currentIntent || 'none'}</p>
      <button onClick={handleCommand}>Run Fix</button>
    </div>
  );
}
```

### 3. Commandes SUDO dans le Chat

```markdown
User: sudo hybrid.open
User: sudo hybrid.inspect path=src/main.rs
User: sudo hybrid.heal target=all
User: sudo hybrid.run command="npm test"
User: sudo hybrid.logs filter=error
```

### 4. API programmatique

```typescript
import { hybridEngine } from '@/modules/hybrid/HybridEngine';

// Détection d'intention
const intent = hybridEngine.detectIntent("compile le projet");
console.log(intent);
// { type: 'dev', confidence: 0.85, keywords: ['compile'], suggestedAction: 'build' }

// Parsing de commande
const command = hybridEngine.parseCommand("sudo cargo check");
console.log(command);
// { raw: "sudo cargo check", parsed: { action: "run", target: "cargo", params: {} }, requiresSudo: true }

// Exécution
const execution = await hybridEngine.executeCommand(command);
console.log(execution);
// { command, output: "Checking...", exitCode: 0, duration: 2350, timestamp: ..., errors: null }

// Auto-healing
const patches = await hybridEngine.detectIssuesAndProposePatch("AudioEngine");
if (patches.length > 0) {
  const success = await hybridEngine.applyAutoPatch(patches[0]);
  console.log(`Patch applied: ${success}`);
}

// Diagnostic
const diagnostics = await hybridEngine.runFullDiagnostic();
console.log(diagnostics);
// [{ module: "X", health: "healthy", issues: [], suggestions: [...] }]
```

---

## 📊 ARCHITECTURE TECHNIQUE

### State Management

```typescript
interface HybridState {
  mode: 'bubble' | 'console' | 'chat' | 'dev';
  currentIntent: IntentType | null;
  executionHistory: HybridExecution[];  // Max 50 entries
  diagnostics: DevDiagnostic[];
  pendingPatches: AutoPatch[];
  isExecuting: boolean;
  lastError: string | null;
}
```

### Subscriber Pattern

```typescript
// S'abonner aux changements
const unsubscribe = hybridEngine.subscribe((newState) => {
  console.log('State changed:', newState);
});

// Se désabonner
unsubscribe();
```

### Execution Flow

```
User Input
    ↓
Intent Detection (detectIntent)
    ↓
Command Parsing (parseCommand)
    ↓
Execution Router (executeCommand)
    ↓
Dev Operation (inspectModule, applyPatch, runDevCommand, etc.)
    ↓
Tauri Backend (invoke)
    ↓
Result → State Update → Subscribers Notified
    ↓
UI Update (React re-render)
```

---

## 🎨 DESIGN SYSTEM

### Monochrome TITANE∞

| Élément | Couleur | Utilisation |
|---------|---------|-------------|
| **Primary** | `#C4C4C4` | Texte principal, boutons actifs |
| **Secondary** | `#727B81` | Texte secondaire, borders |
| **Background Dark** | `#1a1f2e` | Panel background (top) |
| **Background Darker** | `#0a0e1a` | Panel background (bottom) |
| **Console BG** | `rgba(0, 0, 0, 0.3)` | Command output background |
| **Success** | `#4ade80` | Exit code 0 indicator |
| **Error** | `#ff6b6b` | Exit code ≠ 0 indicator |

### Typography

- **Headers** : Sans-serif, weight 600-700
- **Console** : Monospace (Fira Code, Consolas)
- **Sizes** : 11px (small) → 14px (base) → 16px (header)

---

## 🧪 TESTS

### Unit Tests (HybridEngine)

```typescript
import { hybridEngine } from '@/modules/hybrid/HybridEngine';

test('detectIntent: dev command', () => {
  const intent = hybridEngine.detectIntent('fix le module Audio');
  expect(intent.type).toBe('dev');
  expect(intent.confidence).toBeGreaterThan(0.7);
});

test('parseCommand: sudo inspect', () => {
  const cmd = hybridEngine.parseCommand('sudo inspect src/main.rs');
  expect(cmd.parsed.action).toBe('inspect');
  expect(cmd.parsed.target).toBe('src/main.rs');
  expect(cmd.requiresSudo).toBe(true);
});

test('executeCommand: mock success', async () => {
  const cmd = hybridEngine.parseCommand('run echo hello');
  const exec = await hybridEngine.executeCommand(cmd);
  expect(exec.exitCode).toBe(0);
  expect(exec.output).toContain('hello');
});
```

### Integration Tests (React)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { HybridBubble } from '@/components/HybridBubble';

test('HybridBubble: mode switching', () => {
  render(<HybridBubble initialMode="bubble" />);
  
  const bubble = screen.getByText(/🧠⚡/);
  fireEvent.click(bubble);
  
  expect(screen.getByText(/TITANE∞ HYBRID/)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter command/)).toBeInTheDocument();
});
```

### Backend Tests (Rust)

```rust
#[tokio::test]
async fn test_dev_run_command() {
    let result = dev_run_command("echo test".to_string()).await;
    assert!(result.is_ok());
    let cmd_result = result.unwrap();
    assert_eq!(cmd_result.exit_code, 0);
    assert!(cmd_result.output.contains("test"));
}

#[tokio::test]
async fn test_dev_inspect_file() {
    let result = dev_inspect_file("Cargo.toml".to_string()).await;
    assert!(result.is_ok());
    let inspection = result.unwrap();
    assert!(inspection.exists);
    assert!(inspection.size.is_some());
}
```

---

## 🔐 SÉCURITÉ

### Validation des commandes

- **Whitelist** : Seules les commandes autorisées sont exécutées
- **Sandboxing** : Exécution dans un environnement isolé
- **Sudo check** : Vérification des permissions avant exécution
- **Input sanitization** : Nettoyage des entrées utilisateur

### Permissions

| Action | Permission | Notes |
|--------|------------|-------|
| Lire un fichier | `USER` | Accessible à tous |
| Exécuter une commande | `SYSTEM` | Nécessite validation |
| Appliquer un patch | `SYSTEM` | Nécessite validation |
| Accès logs | `SYSTEM` | Lecture seule |

---

## 📈 PERFORMANCES

### Optimisations

- **Execution history** : Limitée à 50 entrées (LRU)
- **Command throttling** : Max 1 commande simultanée
- **Output truncation** : Limite 60KB pour les sorties
- **Lazy loading** : Components chargés à la demande

### Metrics

- **Intent detection** : < 10ms
- **Command parsing** : < 5ms
- **Shell execution** : Variable (dépend de la commande)
- **File inspection** : < 50ms (< 100KB)
- **Patch application** : < 100ms

---

## 🛠️ TROUBLESHOOTING

### Erreurs communes

#### 1. "File not found" lors de `hybrid.inspect`

**Cause** : Chemin incorrect ou fichier inexistant

**Solution** :
```typescript
// Vérifier avec ls d'abord
sudo hybrid.run command="ls -la src/"

// Puis inspecter avec chemin absolu
sudo hybrid.inspect path=/absolute/path/to/file
```

#### 2. "Command failed" lors de `hybrid.run`

**Cause** : Commande non autorisée ou erreur d'exécution

**Solution** :
```typescript
// Vérifier les permissions
sudo hybrid.logs filter=error

// Tester avec une commande simple
sudo hybrid.run command="echo test"
```

#### 3. "Patch failed" lors de `hybrid.apply`

**Cause** : Lignes invalides ou conflit de code

**Solution** :
```typescript
// Inspecter d'abord
sudo hybrid.inspect path=file.ts

// Vérifier les numéros de lignes
// lineStart et lineEnd doivent être valides (1-indexed)
```

---

## 🔮 ROADMAP

### v∞.27.0 (Q1 2025)

- [ ] **Multi-language support** : Python, Go, Java
- [ ] **Git integration** : Commit, push, pull depuis le Hybrid
- [ ] **Terminal multiplexing** : Plusieurs consoles simultanées
- [ ] **Code generation** : Génération de modules complets
- [ ] **AI-assisted debugging** : Suggestions IA pour les erreurs

### v∞.28.0 (Q2 2025)

- [ ] **Voice commands** : Contrôle vocal du Hybrid
- [ ] **Visual diff** : Comparaison visuelle avant/après patch
- [ ] **Collaborative mode** : Partage de session entre devs
- [ ] **Plugin system** : Extensions custom pour le Hybrid

---

## 📚 RÉFÉRENCES

- **Super Prompt #14** : AI Bubble Engine (CHAT_BUBBLE_ENGINE_v∞.md)
- **Super Prompt #15** : Data Collector Engine (DATA_COLLECTOR_ENGINE_v∞.md)
- **Super Prompt #16** : HYBRID ENGINE (ce document)
- **Singularity Engine** : SINGULARITY_ARCHITECTURE_v∞.md
- **Memory Eternal** : MEMORY_ETERNAL_ENGINE_v∞.md
- **Self-Healing Engine** : SELF_HEALING_ENGINE_v∞.md

---

## 🎉 CONCLUSION

Le **Hybrid Engine** v∞.26.0 représente la **fusion ultime** entre l'intelligence conversationnelle (AI Bubble) et la puissance technique (Dev Console). Il offre :

✅ **Omnipresence** : Toujours accessible, sur toutes les pages
✅ **Intelligence** : Détection automatique de l'intention
✅ **Puissance** : Exécution de commandes shell, Rust, TypeScript
✅ **Auto-réparation** : Healing automatique des erreurs
✅ **Intégration** : Synchronisation avec Singularity, Memory, Self-Healing
✅ **Extensibilité** : 10 commandes SUDO + 5 commandes Tauri + API ouverte

**TITANE∞ v∞.26.0 — L'IA qui code avec vous.** 🧠⚡

---

**Documentation mise à jour le** : 2025-01-10
**Version** : v∞.26.0
**Auteur** : TITANE TEAM
**License** : Proprietary (Humain Total / Kevin Thibault)
