# 🎯 TITANE∞ v24 - Refonte Complète Progression & XP

**Date** : 2025-01-XX
**Version** : v24.0.0
**Objectif** : Transformer le système de Progression d'un arbre de talents RPG gamifié vers un système de cartographie de connaissances professionnel

---

## ✅ RÉALISATIONS COMPLÈTES

### 1. **Fix AutoHeal Error** ✅

**Fichier** : `src/services/singularityConnections.ts`
**Problème** : `current.evolution.generation` pouvait être `undefined`, causant des erreurs console
**Solution** : Ajout d'un guard : `current.evolution?.generation ?? 0`

```typescript
generation: current.evolution?.generation ?? 0, // ✅ Guard
```

**Impact** : Plus d'erreurs AutoHeal, console propre

---

### 2. **Nouveau Modèle de Données XP** ✅

**Fichier** : `src/types/experience.ts` (CRÉÉ)

**Paradigme** : Cartographie de connaissances (zéro gamification)

```typescript
export interface ExperienceDomain {
  id: string;
  label: string;           // "Cognition", "Business", "Mémoire"
  description: string;
  xp: number;              // Points d'expérience
  level: number;           // Calculé : floor(sqrt(xp / 100))
  category: 'cognitive' | 'business' | 'project' | 'system' | 'memory';
  lastUpdated: number;
  position?: { x: number; y: number };
  icon?: string;
}

export interface ExperienceState {
  totalXp: number;
  level: number;
  domains: Record<string, ExperienceDomain>;
  history: ExperienceGain[];
  lastUpdated: number;
  version: string;
}
```

**Domaines par défaut** :
- 🧠 **Cognition** : Intelligence cognitive, analyse, raisonnement
- 💼 **Business** : Stratégie, management, opérations
- 📂 **Mémoire** : Ingestion de fichiers, stockage de connaissances
- 💬 **Chat IA** : Interactions conversationnelles
- ⚙️ **Système** : Événements système, auto-heal, évolution

**Formules XP** :
- Niveau : `floor(sqrt(xp / 100))`
- XP pour niveau suivant : `(level + 1)² * 100`
- Progression : `(currentXp - levelXp) / (nextLevelXp - levelXp)`

**Récompenses XP** :
```typescript
CHAT_MESSAGE: 5
FILE_IMPORT: 20
SYSTEM_EVENT: 10
MEMORY_INGESTION: 15
PROJECT_COMPLETION: 100
COGNITIVE_ANALYSIS: 25
```

---

### 3. **Service d'Expérience** ✅

**Fichier** : `src/services/experienceService.ts` (CRÉÉ)

**API Publique** :
```typescript
// Initialisation (auto-load depuis Tauri)
await initExperienceService()

// Attribution XP
await awardExperience('chat', 5, XPSource.ChatMessage, { content: '...' })

// Lecture état
const state = getExperienceState()
const domain = getDomain('cognitive')
const allDomains = getAllDomains()

// Progression
const xpNeeded = getXpForNextLevel()
const progress = getProgressToNextLevel() // 0-1

// Abonnements
const unsubscribe = subscribeToExperience((newState) => {
  console.log('XP updated!', newState)
})
```

**Features** :
- ✅ Persistence Tauri (fallback localStorage)
- ✅ Calcul automatique des niveaux
- ✅ Historique des 100 derniers gains XP
- ✅ Notifications level-up en console
- ✅ Système de listeners React-friendly

---

### 4. **Hook React useExperience** ✅

**Fichier** : `src/hooks/useExperience.ts` (CRÉÉ)

**Utilisation** :
```tsx
const {
  state,
  isLoading,
  totalXp,
  level,
  xpForNextLevel,
  progress,
  domains,
  getDomainById,
  award,
} = useExperience()

// Award XP
await award('memory', 20, XPSource.FileImport, { filename: 'doc.md' })
```

**Auto-initialisation** : Le hook charge l'état XP au mount du composant

---

### 5. **Barre XP Compacte dans Sidebar** ✅

**Fichiers** :
- `src/components/experience/CompactXPBar.tsx` (CRÉÉ)
- `src/App.tsx` (MODIFIÉ)

**Design** :
- Badge niveau (NIV. X) avec gradient métallique
- XP total affiché (`1,234 XP`)
- Barre de progression animée (Framer Motion)
- Pourcentage vers niveau suivant
- Cliquable → navigation vers `/progression`
- Couleurs v24 métalliques (`#727b81`, `#93b399`)

**Placement** : Sous logo TITANE∞ dans le header du Sidebar

```tsx
<Sidebar
  header={
    <>
      <div>TITANE∞</div>
      <CompactXPBar onClick={() => navigate('/progression')} />
    </>
  }
  {...props}
/>
```

---

### 6. **Import de Fichiers dans Chat** ✅

**Fichier** : `src/features/chat/ChatInput.tsx` (MODIFIÉ)

**Nouveau bouton** : 📂 **Fichier** (+20 XP)

**Flow complet** :
1. User clique sur bouton "Fichier"
2. Dialogue Tauri `open()` avec filtres (txt, md, json, js, ts, py, rs, etc.)
3. Sélection fichier → `invoke('memory_ingest_file', { path })`
4. Backend retourne `{ filename, size, type }`
5. Attribution automatique : **+20 XP** → domaine `memory`
6. Callback `onFileImported(filename, 20)` → affichage message système dans Chat

**Code ajouté** :
```tsx
const handleFileImport = async () => {
  const selected = await open({ multiple: false, filters: [...] })
  if (!selected) return

  const result = await invoke('memory_ingest_file', { path: selected })
  await awardExperience('memory', 20, XPSource.FileImport, result)

  onFileImported?.(result.filename, 20)
}

<Button onClick={handleFileImport} leftIcon="📂">
  {isImporting ? 'Import...' : 'Fichier'}
</Button>
```

**Extensions supportées** :
- Texte : `txt`, `md`
- Config : `json`, `toml`, `yaml`, `yml`
- Code : `js`, `ts`, `tsx`, `jsx`, `py`, `rs`
- Web : `html`, `css`, `xml`
- Data : `csv`

---

### 7. **Backend Tauri (Mock Commands)** ✅

**Fichiers** :
- `src-tauri/src/mock_commands.rs` (MODIFIÉ)
- `src-tauri/src/main.rs` (MODIFIÉ)

**Nouvelles commandes** :

#### `experience_get_state`
```rust
#[tauri::command]
pub async fn experience_get_state() -> AppResult<Option<serde_json::Value>>
```
**Comportement** : Retourne `None` en mode mock → frontend utilise état par défaut

#### `experience_update_state`
```rust
#[tauri::command]
pub async fn experience_update_state(state: serde_json::Value) -> AppResult<()>
```
**Comportement** : Log l'état en mode mock, sauvegarderait dans JSON en prod

#### `memory_ingest_file`
```rust
#[tauri::command]
pub async fn memory_ingest_file(path: String) -> AppResult<serde_json::Value>
```
**Comportement** :
- Extrait filename du path
- Détecte type de fichier (extension)
- Retourne mock :
```json
{
  "filename": "document.md",
  "size": 1024,
  "type": "markdown",
  "ingested_at": 1738000000000
}
```

**Enregistrement** :
```rust
tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![
    // ...existing commands...
    mock_commands::experience_get_state,
    mock_commands::experience_update_state,
    mock_commands::memory_ingest_file,
  ])
```

---

## 🔄 EN COURS

### 8. **Lier XP aux Messages Chat** 🔄

**TODO** :
- Hook `onSubmit` dans ChatPage/ChatWindow
- Après envoi message réussi → `await awardExperience('chat', 5, XPSource.ChatMessage)`
- Message système optionnel : "Message envoyé (+5 XP)"

**Emplacement** : `src/pages/ChatPage.tsx` ou `src/hooks/useChat.ts`

---

## 📋 À FAIRE

### 9. **Refactoriser TalentTree → KnowledgeDomains** ⏳

**Fichier cible** : `src/features/progression/TalentTree.tsx` (400+ lignes)

**Objectifs** :
1. **Supprimer complètement** :
   - `cost` (coût en points)
   - `unlocked` (état de déblocage)
   - `requirements` (prérequis)
   - `availablePoints` (points disponibles)
   - Fonction `canUnlock()`
   - Fonction `handleUnlock()`

2. **Créer KnowledgeDomains.tsx** :
   - Afficher tous les domaines (toujours actifs)
   - Visualisation graphique (canvas ou layout CSS)
   - Afficher XP et niveau par domaine
   - Barres de progression par domaine
   - Tooltips : sources XP, dernière mise à jour
   - Style professionnel (pas d'esthétique RPG)

3. **Mettre à jour ProgressionPage.tsx** :
   - Supprimer état `availablePoints`
   - Supprimer handler `handleUnlockTalent`
   - Remplacer `<TalentTree />` par `<KnowledgeDomains />`
   - Intégrer `useExperience()` hook

**Proposition de structure** :
```tsx
interface KnowledgeDomainsProps {
  domains: ExperienceDomain[];
  onDomainClick?: (domain: ExperienceDomain) => void;
}

export const KnowledgeDomains = ({ domains, onDomainClick }: KnowledgeDomainsProps) => {
  return (
    <Card>
      <h3>🗺️ Cartographie des Connaissances</h3>
      <div className="domains-grid">
        {domains.map(domain => (
          <DomainCard
            key={domain.id}
            domain={domain}
            onClick={() => onDomainClick?.(domain)}
          />
        ))}
      </div>
    </Card>
  )
}
```

---

## 📊 IMPACT SYSTÈME

### Fichiers Créés (6)
1. `src/types/experience.ts`
2. `src/services/experienceService.ts`
3. `src/hooks/useExperience.ts`
4. `src/components/experience/CompactXPBar.tsx`
5. *(À créer)* `src/components/progression/KnowledgeDomains.tsx`
6. *(À créer)* `src/components/progression/DomainCard.tsx`

### Fichiers Modifiés (5)
1. `src/services/singularityConnections.ts` (fix AutoHeal)
2. `src/features/chat/ChatInput.tsx` (bouton import fichier)
3. `src/App.tsx` (sidebar header avec CompactXPBar)
4. `src-tauri/src/mock_commands.rs` (3 nouvelles commandes)
5. `src-tauri/src/main.rs` (register commands)

### Fichiers À Modifier (2)
1. `src/pages/ChatPage.tsx` (lier XP aux messages)
2. `src/pages/ProgressionPage.tsx` (remplacer TalentTree)

### Fichiers À Supprimer (1)
- `src/features/progression/TalentTree.tsx` (ou renommer backup)

---

## 🎨 DESIGN SYSTEM

**Couleurs v24 Métalliques** :
- Primary : `#727b81` (gris métallique)
- Light : `#c4c4c4` (métal clair)
- Accent : `#93b399` (vert métal oxydé)

**Gradients** :
```css
background: linear-gradient(135deg, #727b81, #93b399);
```

**Shadows** :
```css
box-shadow: 0 0 8px rgba(147, 179, 153, 0.5);
```

---

## 🚀 PROCHAINES ÉTAPES

1. **Tester le système XP** :
   ```bash
   pnpm run dev
   ```
   - Vérifier barre XP sous logo TITANE∞
   - Importer un fichier via Chat
   - Observer +20 XP dans barre
   - Cliquer barre → navigation vers /progression

2. **Lier XP aux messages Chat** :
   - Hook `useChat` ou ChatPage
   - Après `sendMessage()` success → `award('chat', 5)`

3. **Refactoriser Progression** :
   - Créer KnowledgeDomains component
   - Remplacer TalentTree
   - Tester visualisation des 5 domaines

4. **Tests End-to-End** :
   - Envoyer 20 messages → Niveau 1 Chat
   - Importer 5 fichiers → Niveau 1 Mémoire
   - XP total = 200 → Niveau 1 global

---

## 📝 NOTES TECHNIQUES

### Persistance XP

**Mode Tauri** : État sauvegardé dans fichier JSON via commands Rust
**Mode Browser** : Fallback sur `localStorage`

**Fichier de persistence (prod)** :
```
~/.local/share/titane_infinity/experience_state.json
```

### Calcul de Niveau

**Formule** : `level = floor(sqrt(xp / 100))`

**Progression** :
- Niveau 0 → 1 : 100 XP (20 messages ou 5 fichiers)
- Niveau 1 → 2 : 400 XP total (300 XP supplémentaires)
- Niveau 2 → 3 : 900 XP total (500 XP supplémentaires)
- Niveau 3 → 4 : 1600 XP total (700 XP supplémentaires)

**Courbe** : Progression exponentielle (comme Dark Souls, pas linéaire)

### Historique XP

**Limite** : 100 derniers événements
**Structure** :
```typescript
{
  id: "uuid",
  domainId: "chat",
  amount: 5,
  source: "chat_message",
  metadata: { content: "..." },
  timestamp: 1738000000000
}
```

---

## ✅ VALIDATION

### Tests Manuels

- [x] Barre XP visible sous logo TITANE∞
- [x] Bouton "📂 Fichier" dans Chat
- [x] Import fichier ouvre dialogue
- [ ] Import fichier incrémente XP (+20)
- [ ] Clic barre XP → navigation /progression
- [ ] Envoi message → +5 XP (après hook)
- [ ] XP persiste entre sessions (après impl prod)

### Tests Automatiques (TODO)

```typescript
describe('ExperienceService', () => {
  it('should award XP and calculate level', async () => {
    await awardExperience('chat', 100, XPSource.ChatMessage)
    const domain = getDomain('chat')
    expect(domain.level).toBe(1)
  })

  it('should track history', async () => {
    await awardExperience('memory', 20, XPSource.FileImport)
    const state = getExperienceState()
    expect(state.history.length).toBe(1)
  })
})
```

---

## 📚 DOCUMENTATION

**Guides utilisateur** :
- "Comment gagner de l'XP dans TITANE∞"
- "Comprendre la cartographie des connaissances"

**Guides développeur** :
- API experienceService
- Hook useExperience
- Types ExperienceDomain & ExperienceState

---

**Fin du rapport** 🎯
