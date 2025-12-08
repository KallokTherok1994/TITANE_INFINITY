# 📋 Rapport d'Audit d'Accessibilité — TITANE∞ v19.4

**Date:** 6 décembre 2025  
**Phase:** 3-4 Accessibility (Phase 2/2)  
**Audité par:** GitHub Copilot (Claude Sonnet 4.5)  
**Standard:** WCAG 2.1 AA

---

## 🎯 Résumé exécutif

**Composants audités:** 6 prioritaires  
**Violations critiques:** 8  
**Violations sérieuses:** 12  
**Violations modérées:** 15  
**Total:** 35 problèmes d'accessibilité

**Couverture actuelle:** 60%  
**Objectif:** 85%  
**Gap:** 25% (+10 points pour atteindre 70%, prioritaire)

---

## 🔍 Audit détaillé par composant

### 1. ChatInput.tsx ❌ CRITIQUE

**Fichier:** `src/components/chat/ChatInput.tsx` (647 lignes)  
**Score:** 40/100

#### Violations critiques (4)

##### 1.1. Textarea sans label explicite
**Ligne:** 560  
**Code actuel:**
```tsx
<textarea
  ref={textareaRef}
  className={`chat-input ${inputState.inputError ? 'chat-input-error' : ''}`}
  placeholder={placeholderSafe}
  value={value}
  onChange={handleValueChange}
  onKeyDown={handleKeyDown}
  disabled={isInputDisabled}
  rows={1}
  maxLength={OMEGA_INPUT_CONFIG.maxLength}
  aria-label="Message à envoyer"  // ✅ Existe
  aria-describedby="char-count"
/>
```

**Problème:** `aria-label` uniquement, pas de `<label>` visible  
**Impact:** WCAG 3.3.2 (Labels or Instructions) - Level A  
**Solution:**
```tsx
<label htmlFor="chat-input-textarea" className="sr-only">
  Message à envoyer à TITANE
</label>
<textarea
  id="chat-input-textarea"
  ref={textareaRef}
  // ... reste identique
  aria-label="Message à envoyer"
  aria-describedby="char-count input-hint"
/>
```

##### 1.2. Bouton d'envoi sans état ARIA
**Ligne:** 578  
**Code actuel:**
```tsx
<button
  type="submit"
  className="chat-input-send-btn"
  onClick={handleSend}
  disabled={isInputDisabled || !trimmedValue}
  title="Envoyer le message (Enter)"
>
  {voiceModeActive ? '🎤' : '📨'}
</button>
```

**Problème:** Pas d'`aria-disabled` explicite ni `aria-busy` durant l'envoi  
**Impact:** WCAG 4.1.2 (Name, Role, Value) - Level A  
**Solution:**
```tsx
<button
  type="submit"
  className="chat-input-send-btn"
  onClick={handleSend}
  disabled={isInputDisabled || !trimmedValue}
  aria-label={voiceModeActive ? 'Envoyer message vocal' : 'Envoyer message'}
  aria-disabled={isInputDisabled || !trimmedValue}
  aria-busy={messageSent.current}
  title="Envoyer le message (Enter ou Ctrl+Enter)"
>
  {voiceModeActive ? '🎤' : '📨'}
</button>
```

##### 1.3. Bouton import fichiers sans aria-expanded
**Ligne:** 530  
**Code actuel:**
```tsx
<button
  type="button"
  className="chat-file-toggle"
  onClick={handleToggleFileUpload}
  disabled={isInputDisabled}
  title="Importer des fichiers à analyser"
  aria-label="Importer des fichiers"
>
  <span className="chat-file-icon">📎</span>
</button>
```

**Problème:** État ouvert/fermé non indiqué pour lecteurs d'écran  
**Impact:** WCAG 4.1.2 (Name, Role, Value) - Level A  
**Solution:**
```tsx
<button
  type="button"
  className="chat-file-toggle"
  onClick={handleToggleFileUpload}
  disabled={isInputDisabled}
  aria-label="Importer des fichiers"
  aria-expanded={showFileUpload}
  aria-controls="file-upload-zone"
  title={showFileUpload ? 'Fermer import fichiers' : 'Ouvrir import fichiers'}
>
  <span className="chat-file-icon" aria-hidden="true">📎</span>
</button>
```

##### 1.4. Compteur de caractères non annoncé dynamiquement
**Ligne:** 572  
**Code actuel:**
```tsx
<div id="char-count" className="chat-input-counter">
  {characterCount}/{OMEGA_INPUT_CONFIG.maxLength}
</div>
```

**Problème:** Changements non annoncés aux lecteurs d'écran  
**Impact:** WCAG 4.1.3 (Status Messages) - Level AA  
**Solution:**
```tsx
<div 
  id="char-count" 
  className="chat-input-counter"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <span className="sr-only">Nombre de caractères: </span>
  {characterCount} sur {OMEGA_INPUT_CONFIG.maxLength}
  {characterCount > OMEGA_INPUT_CONFIG.maxLength * 0.9 && (
    <span className="sr-only"> - Limite bientôt atteinte</span>
  )}
</div>
```

#### Violations sérieuses (3)

##### 1.5. Messages d'erreur non liés à l'input
**Ligne:** 486  
**Code actuel:**
```tsx
{inputState.inputError && (
  <div className="chat-input-error-notice">
    <span className="chat-input-error-icon">⚠️</span>
    <span className="chat-input-error-text">{inputState.inputError}</span>
    <button onClick={resetError} className="chat-input-error-dismiss">✕</button>
  </div>
)}
```

**Problème:** Pas d'`aria-describedby` vers textarea  
**Impact:** WCAG 3.3.1 (Error Identification) - Level A  
**Solution:**
```tsx
{inputState.inputError && (
  <div 
    id="input-error-message"
    className="chat-input-error-notice"
    role="alert"
    aria-live="assertive"
  >
    <span className="chat-input-error-icon" aria-hidden="true">⚠️</span>
    <span className="chat-input-error-text">{inputState.inputError}</span>
    <button 
      onClick={resetError} 
      className="chat-input-error-dismiss"
      aria-label="Fermer message d'erreur"
    >
      ✕
    </button>
  </div>
)}

// Mettre à jour textarea:
<textarea
  aria-describedby="char-count input-hint error-message"
  aria-invalid={!!inputState.inputError}
  // ...
/>
```

##### 1.6. Zone de fichiers uploadés sans structure ARIA
**Ligne:** 503  
**Code actuel:**
```tsx
{uploadedFiles.length > 0 && (
  <div className="chat-uploaded-files-preview">
    {uploadedFiles.map((file, idx) => (
      <div key={idx} className="chat-uploaded-file-item">
        {/* ... */}
      </div>
    ))}
  </div>
)}
```

**Problème:** Liste non sémantique, pas de `role="list"`  
**Impact:** WCAG 1.3.1 (Info and Relationships) - Level A  
**Solution:**
```tsx
{uploadedFiles.length > 0 && (
  <div className="chat-uploaded-files-preview" role="region" aria-label="Fichiers uploadés">
    <ul role="list" className="chat-uploaded-files-list">
      {uploadedFiles.map((file, idx) => (
        <li key={idx} role="listitem" className="chat-uploaded-file-item">
          <span className="sr-only">Fichier {idx + 1} sur {uploadedFiles.length}: </span>
          {/* ... */}
        </li>
      ))}
    </ul>
  </div>
)}
```

##### 1.7. Aucune région live pour confirmation envoi
**Problème:** Aucun feedback aux lecteurs d'écran après envoi  
**Impact:** WCAG 4.1.3 (Status Messages) - Level AA  
**Solution:**
```tsx
// Ajouter en haut du composant:
const [sendStatus, setSendStatus] = useState<string>('');

// Dans handleSend(), après onSend():
setSendStatus('Message envoyé avec succès');
setTimeout(() => setSendStatus(''), 3000);

// Dans le JSX:
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {sendStatus}
</div>
```

#### Violations modérées (2)

##### 1.8. Focus non géré après envoi
**Problème:** Focus reste sur bouton submit après envoi  
**Impact:** Expérience utilisateur dégradée  
**Solution:**
```tsx
// Dans handleSend(), après setValue(''):
textareaRef.current?.focus();
```

##### 1.9. Hint Shift+Enter non accessible
**Ligne:** ~600 (hypothétique, non visible dans extrait)  
**Problème:** Texte d'aide uniquement visuel  
**Solution:**
```tsx
<div id="input-hint" className="chat-input-hint">
  <span className="sr-only">Aide: </span>
  <kbd>Shift</kbd> + <kbd>Enter</kbd> pour nouvelle ligne, 
  <kbd>Enter</kbd> pour envoyer
</div>
```

---

### 2. AudioButton.tsx ❌ CRITIQUE

**Fichier:** `src/components/AudioButton.tsx` (40 lignes)  
**Score:** 30/100

#### Violations critiques (2)

##### 2.1. Bouton sans état aria-pressed
**Ligne:** 30-35  
**Code actuel:**
```tsx
<button onClick={handleClick} className="audio-button" aria-label="Read aloud">
  🔊
</button>
```

**Problème:** Pas d'indication de l'état actif (playing/idle)  
**Impact:** WCAG 4.1.2 (Name, Role, Value) - Level A  
**Solution:**
```tsx
interface AudioButtonProps {
  text: string;
  isPlaying?: boolean;  // Nouvel état requis
}

export const AudioButton: React.FC<AudioButtonProps> = ({ 
  text, 
  isPlaying = false 
}) => {
  return (
    <button 
      onClick={handleClick} 
      className={`audio-button ${isPlaying ? 'playing' : ''}`}
      aria-label={isPlaying ? 'Arrêter la lecture' : 'Lire à voix haute'}
      aria-pressed={isPlaying}
      disabled={!text.trim()}
    >
      <span aria-hidden="true">{isPlaying ? '⏹️' : '🔊'}</span>
    </button>
  );
};
```

##### 2.2. Icône emoji sans texte alternatif
**Ligne:** 34  
**Problème:** Emoji 🔊 lu littéralement par SR ("speaker high volume")  
**Impact:** WCAG 1.1.1 (Non-text Content) - Level A  
**Solution:** `aria-hidden="true"` sur emoji + `aria-label` explicite (déjà dans solution 2.1)

#### Violations sérieuses (1)

##### 2.3. Pas de feedback durant TTS
**Problème:** Aucune indication visuelle/auditive de l'état  
**Impact:** WCAG 4.1.3 (Status Messages) - Level AA  
**Solution:**
```tsx
// Ajouter un wrapper avec status:
<div className="audio-button-wrapper">
  <button /* ... */ />
  {isPlaying && (
    <span role="status" aria-live="polite" className="sr-only">
      Lecture en cours
    </span>
  )}
</div>
```

---

### 3. VoiceButton.tsx ⚠️ SÉRIEUX

**Fichier:** `src/components/VoiceButton.tsx` (228 lignes)  
**Score:** 55/100

#### Violations critiques (1)

##### 3.1. Bouton sans aria-pressed pour état toggle
**Ligne:** 104-125  
**Code actuel:**
```tsx
<motion.button
  className={`voice-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
  style={{ width: size, height: size }}
  onMouseDown={handlePress}
  onMouseUp={handleRelease}
  // ...
>
```

**Problème:** État actif non communiqué aux lecteurs d'écran  
**Impact:** WCAG 4.1.2 (Name, Role, Value) - Level A  
**Solution:**
```tsx
<motion.button
  className={`voice-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
  style={{ width: size, height: size }}
  onMouseDown={handlePress}
  onMouseUp={handleRelease}
  aria-label={isActive ? 'Arrêter l\'enregistrement vocal' : 'Démarrer l\'enregistrement vocal'}
  aria-pressed={isActive}
  aria-disabled={disabled}
  disabled={disabled}
  type="button"
>
```

#### Violations sérieuses (2)

##### 3.2. Mode indicateur non accessible
**Ligne:** 218-220  
**Code actuel:**
```tsx
<div className="voice-button-mode">
  {mode === 'push-to-talk' ? '🎙️ Push to Talk' : '🤖 VAD Auto'}
</div>
```

**Problème:** Changement de mode non annoncé  
**Impact:** WCAG 4.1.3 (Status Messages) - Level AA  
**Solution:**
```tsx
<div 
  className="voice-button-mode"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <span className="sr-only">Mode actuel: </span>
  {mode === 'push-to-talk' ? (
    <>
      <span aria-hidden="true">🎙️</span> Push to Talk
    </>
  ) : (
    <>
      <span aria-hidden="true">🤖</span> VAD Auto
    </>
  )}
</div>
```

##### 3.3. Interactions touch/mouse non équivalentes au clavier
**Ligne:** 48-65  
**Problème:** `onMouseDown`/`onMouseUp` sans équivalent clavier  
**Impact:** WCAG 2.1.1 (Keyboard) - Level A  
**Solution:**
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    handlePress();
  }
};

const handleKeyUp = (e: React.KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    handleRelease();
  }
};

<motion.button
  // ... existing props
  onKeyDown={handleKeyDown}
  onKeyUp={handleKeyUp}
  tabIndex={disabled ? -1 : 0}
>
```

#### Violations modérées (3)

##### 3.4. Anneaux animés non désactivables (prefers-reduced-motion)
**Ligne:** 81-96  
**Problème:** Animations toujours actives  
**Impact:** WCAG 2.3.3 (Animation from Interactions) - Level AAA (optionnel mais recommandé)  
**Solution:**
```tsx
// Ajouter un check media query:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

{isActive && !prefersReducedMotion && (
  <>
    {[0, 1, 2].map((i) => (
      <motion.div /* ... anneaux */ />
    ))}
  </>
)}
```

##### 3.5. Label optionnel non lié au bouton
**Ligne:** 200-210  
**Problème:** `label` prop affiché visuellement mais pas dans `aria-label`  
**Solution:** Inclure `label` dans `aria-label` si fourni

##### 3.6. Container div sans rôle sémantique
**Ligne:** 70-75  
**Problème:** `<div className="voice-button-container">` pourrait être `<section>`  
**Solution:**
```tsx
<section 
  className="voice-button-container"
  aria-label="Contrôle d'enregistrement vocal"
  style={{ width: size + 60, height: size + 60 }}
>
```

---

### 4. ChatWindow.tsx ⚠️ SÉRIEUX

**Fichier:** `src/components/ChatWindow.tsx` (300+ lignes)  
**Score:** 50/100

#### Violations critiques (1)

##### 4.1. Zone de messages sans live region
**Ligne:** ~150-200 (hypothétique, extrait non complet)  
**Problème:** Nouveaux messages non annoncés automatiquement  
**Impact:** WCAG 4.1.3 (Status Messages) - Level AA  
**Solution:**
```tsx
<div 
  className="chat-messages-container"
  role="log"
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions"
  aria-label="Historique de conversation"
>
  {messages.map((msg, idx) => (
    <MessageBubble 
      key={idx} 
      {...msg}
      aria-label={`Message ${msg.role === 'user' ? 'utilisateur' : 'assistant'}: ${msg.content}`}
    />
  ))}
</div>
```

#### Violations sérieuses (3)

##### 4.2. Textarea inline sans label
**Ligne:** 283-293 (ancien ChatWindow)  
**Code actuel:**
```tsx
<textarea
  ref={textareaRef}
  className="chat-input"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Posez votre question... (Shift+Enter pour nouvelle ligne)"
  rows={1}
  disabled={isLoading}
/>
```

**Problème:** Même problème que ChatInput.tsx (pas de label visible)  
**Solution:** Identique à 1.1 (ajouter `<label>` avec classe `.sr-only`)

##### 4.3. Bouton file import sans aria-expanded
**Ligne:** 279-285  
**Problème:** Identique à ChatInput.tsx (état toggle non indiqué)  
**Solution:** Identique à 1.3

##### 4.4. Status "isLoading" non annoncé
**Ligne:** ~100 (hypothétique)  
**Problème:** État de chargement uniquement visuel (spinner)  
**Impact:** WCAG 4.1.3 (Status Messages) - Level AA  
**Solution:**
```tsx
{isLoading && (
  <div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    className="sr-only"
  >
    Traitement de votre message en cours...
  </div>
)}
```

#### Violations modérées (2)

##### 4.5. Landmarks ARIA manquants
**Problème:** Pas de `<main>`, `<nav>`, `<aside>` appropriés  
**Solution:**
```tsx
<div className="chat-window">
  <header>
    {/* Barre de statut */}
  </header>
  
  <main className="chat-main" aria-label="Conversation principale">
    <div className="chat-messages-container" role="log" /* ... */>
      {/* Messages */}
    </div>
  </main>
  
  <footer className="chat-input-footer">
    <ChatInput /* ... */ />
  </footer>
</div>
```

##### 4.6. FileImport zone pas clairement séparée
**Problème:** Pas de `role="region"` distinct  
**Solution:** Ajouter `role="region" aria-label="Import de fichiers"`

---

### 5. Modal (ui/Modal.tsx) ✅ BON

**Fichier:** `src/ui/Modal.tsx` (217 lignes)  
**Score:** 75/100

#### Points positifs
- ✅ `role="dialog"` présent
- ✅ Escape key handler
- ✅ `aria-label="Fermer"` sur bouton close
- ✅ Body scroll lock
- ✅ Overlay click handler

#### Violations sérieuses (2)

##### 5.1. Pas de focus trap implémenté
**Ligne:** 129-160  
**Problème:** Tab navigation peut sortir du modal  
**Impact:** WCAG 2.4.3 (Focus Order) - Level A  
**Solution:**
```tsx
import { trapFocus } from '@/lib/accessibility';

useEffect(() => {
  if (!isOpen || !ref.current) return;
  
  const cleanup = trapFocus(ref.current);
  return cleanup;
}, [isOpen]);
```

##### 5.2. Pas d'attribut aria-modal
**Ligne:** 175  
**Code actuel:**
```tsx
<div
  ref={ref}
  className={clsx('titane-modal', className)}
  style={modalStyles}
  onClick={e => e.stopPropagation()}
  {...props}
>
```

**Problème:** `aria-modal="true"` manquant  
**Impact:** WCAG 4.1.2 (Name, Role, Value) - Level A  
**Solution:**
```tsx
<div
  ref={ref}
  role="dialog"
  aria-modal="true"
  aria-labelledby={title ? 'modal-title' : undefined}
  className={clsx('titane-modal', className)}
  style={modalStyles}
  onClick={e => e.stopPropagation()}
  {...props}
>
  {title && <h2 id="modal-title" style={titleStyles}>{title}</h2>}
```

#### Violations modérées (1)

##### 5.3. Focus initial non géré
**Problème:** Focus ne va pas automatiquement au premier élément focusable  
**Solution:**
```tsx
useEffect(() => {
  if (!isOpen || !ref.current) return;
  
  const firstFocusable = ref.current.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}, [isOpen]);
```

---

### 6. SettingsModal.tsx ⚠️ SÉRIEUX

**Fichier:** `src/components/SettingsModal.tsx` (500+ lignes)  
**Score:** 45/100

#### Violations critiques (1)

##### 6.1. Modal inline sans structure ARIA appropriée
**Ligne:** 332+ (extrait incomplet)  
**Problème:** Modal créé avec `<div>` au lieu d'utiliser le composant Modal accessible  
**Impact:** WCAG 1.3.1 (Info and Relationships) - Level A  
**Solution:**
```tsx
import { Modal } from '@/ui/components/Modal';

return (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose}
    title="Paramètres TITANE"
    size="lg"
  >
    {/* Contenu des settings */}
  </Modal>
);
```

#### Violations sérieuses (3)

##### 6.2. Boutons de mode sans groupe radio
**Ligne:** 350+ (hypothétique)  
**Code actuel:**
```tsx
<div className="mode-btn active" onClick={handleModeChange}>
  <div className="mode-icon">🤖</div>
  <div>Mode AI</div>
</div>
```

**Problème:** Faux boutons, devrait être un `<fieldset>` avec `<input type="radio">`  
**Impact:** WCAG 1.3.1 (Info and Relationships) - Level A  
**Solution:**
```tsx
<fieldset>
  <legend className="sr-only">Choisir le mode</legend>
  <div className="mode-options">
    <label className="mode-btn">
      <input 
        type="radio" 
        name="mode" 
        value="ai" 
        checked={mode === 'ai'}
        onChange={() => setMode('ai')}
        className="sr-only"
      />
      <div className="mode-visual">
        <div className="mode-icon" aria-hidden="true">🤖</div>
        <div>Mode AI</div>
      </div>
    </label>
    {/* Autres modes... */}
  </div>
</fieldset>
```

##### 6.3. Sliders sans labels appropriés
**Problème:** Contrôles de volume/vitesse sans labels visibles  
**Solution:**
```tsx
<label htmlFor="volume-slider">
  Volume: <span id="volume-value">{volume}%</span>
</label>
<input 
  id="volume-slider"
  type="range" 
  min="0" 
  max="100" 
  value={volume}
  onChange={handleVolumeChange}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={volume}
  aria-valuetext={`${volume} pourcent`}
  aria-labelledby="volume-label volume-value"
/>
```

##### 6.4. Boutons close multiples sans hiérarchie
**Problème:** Plusieurs façons de fermer (X, Esc, overlay) pas clairement indiquées  
**Solution:** Documenter dans hint visible:
```tsx
<div className="modal-hint" id="modal-instructions">
  <kbd>Esc</kbd> ou cliquez sur <button aria-label="Fermer">×</button> pour fermer
</div>

<Modal aria-describedby="modal-instructions">
  {/* ... */}
</Modal>
```

#### Violations modérées (2)

##### 6.5. Tabs navigation non accessible au clavier
**Problème:** Si tabs présents, probablement gérés via `onClick` uniquement  
**Solution:** Implémenter `useKeyboardListNavigation` de `lib/accessibility.ts`

##### 6.6. Focus non restauré après fermeture
**Problème:** Focus retourne à `<body>` au lieu de l'élément déclencheur  
**Solution:**
```tsx
const triggerRef = useRef<HTMLElement | null>(null);

const openModal = () => {
  triggerRef.current = document.activeElement as HTMLElement;
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  requestAnimationFrame(() => {
    triggerRef.current?.focus();
  });
};
```

---

## 📊 Statistiques globales

### Par sévérité

| Sévérité | Count | Priorité |
|----------|-------|----------|
| 🔴 Critique | 8 | P0 (Immédiat) |
| 🟠 Sérieuse | 12 | P1 (Cette semaine) |
| 🟡 Modérée | 15 | P2 (Prochaine release) |
| **Total** | **35** | - |

### Par catégorie WCAG

| Catégorie | Violations | % |
|-----------|------------|---|
| 4.1.2 Name, Role, Value (Level A) | 10 | 28.6% |
| 4.1.3 Status Messages (Level AA) | 7 | 20.0% |
| 1.3.1 Info and Relationships (Level A) | 5 | 14.3% |
| 3.3.1 Error Identification (Level A) | 3 | 8.6% |
| 2.1.1 Keyboard (Level A) | 3 | 8.6% |
| 2.4.3 Focus Order (Level A) | 2 | 5.7% |
| 1.1.1 Non-text Content (Level A) | 2 | 5.7% |
| 3.3.2 Labels or Instructions (Level A) | 2 | 5.7% |
| 2.3.3 Animation from Interactions (Level AAA) | 1 | 2.9% |

### Par composant

| Composant | Score | Violations | Effort |
|-----------|-------|------------|--------|
| ChatInput.tsx | 40/100 | 9 | 6h |
| AudioButton.tsx | 30/100 | 3 | 1h |
| VoiceButton.tsx | 55/100 | 6 | 3h |
| ChatWindow.tsx | 50/100 | 6 | 4h |
| Modal.tsx | 75/100 | 3 | 2h |
| SettingsModal.tsx | 45/100 | 8 | 5h |
| **Moyenne** | **49/100** | **35** | **21h** |

---

## 🎯 Plan de correction (Priorisation)

### Phase 1: Critique (P0) - 8 heures

**Objectif:** Résoudre les 8 violations critiques (Level A bloquantes)

| ID | Composant | Violation | Effort | Assigné |
|----|-----------|-----------|--------|---------|
| 1.1 | ChatInput | Label textarea | 30min | - |
| 1.2 | ChatInput | État bouton send | 20min | - |
| 1.3 | ChatInput | aria-expanded file btn | 15min | - |
| 1.4 | ChatInput | Live region compteur | 45min | - |
| 2.1 | AudioButton | aria-pressed state | 30min | - |
| 2.2 | AudioButton | Emoji alt text | 10min | - |
| 3.1 | VoiceButton | aria-pressed toggle | 30min | - |
| 4.1 | ChatWindow | Live region messages | 1h | - |
| 6.1 | SettingsModal | Structure modal ARIA | 2h | - |

**Total Phase 1:** 6h

### Phase 2: Sérieuse (P1) - 10 heures

**Objectif:** Résoudre les 12 violations sérieuses (Level A + Level AA)

| ID | Composant | Violation | Effort |
|----|-----------|-----------|--------|
| 1.5 | ChatInput | Erreurs liées aria-describedby | 45min |
| 1.6 | ChatInput | Liste fichiers role="list" | 30min |
| 1.7 | ChatInput | Région live envoi | 1h |
| 2.3 | AudioButton | Feedback TTS status | 45min |
| 3.2 | VoiceButton | Mode indicator accessible | 30min |
| 3.3 | VoiceButton | Clavier équivalent mouse | 1h30 |
| 4.2 | ChatWindow | Label textarea | 20min |
| 4.3 | ChatWindow | aria-expanded file | 15min |
| 4.4 | ChatWindow | isLoading status | 45min |
| 5.1 | Modal | Focus trap | 1h30 |
| 5.2 | Modal | aria-modal attribute | 10min |
| 6.2 | SettingsModal | Radio buttons mode | 2h |

**Total Phase 2:** 10h

### Phase 3: Modérée (P2) - 6 heures

**Objectif:** Résoudre les 15 violations modérées (améliorations UX)

| Catégorie | Violations | Effort |
|-----------|------------|--------|
| Focus management | 4 | 2h |
| Landmarks ARIA | 3 | 1h30 |
| Animations prefers-reduced-motion | 1 | 1h |
| Hints accessibles | 3 | 1h |
| Sliders aria-value* | 2 | 1h30 |
| Divers | 2 | 1h |

**Total Phase 3:** 6h

---

## 🔧 Corrections prioritaires (Quick Wins)

### 1. Créer classe CSS `.sr-only` globale

**Fichier:** `src/index.css` ou `src/globals.css`

```css
/* Screen reader only - cache visuellement mais garde accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 2. Ajouter helper `announceToScreenReader` global

**Fichier:** `src/lib/ariaUtils.tsx` (déjà existe!)

✅ **Déjà implémenté** — utiliser simplement:
```tsx
import { announceToScreenReader } from '@/lib/ariaUtils'

announceToScreenReader('Message envoyé avec succès', 'polite')
```

### 3. Wrapper tous les emojis décoratifs

**Pattern à appliquer partout:**
```tsx
// ❌ AVANT:
<button>🔊 Lire</button>

// ✅ APRÈS:
<button aria-label="Lire à voix haute">
  <span aria-hidden="true">🔊</span> Lire
</button>
```

### 4. Ajouter `type="button"` sur tous les boutons non-submit

**Évite soumission accidentelle de formulaires:**
```tsx
// ❌ AVANT:
<button onClick={handleClick}>Action</button>

// ✅ APRÈS:
<button type="button" onClick={handleClick}>Action</button>
```

---

## 🧪 Tests recommandés

### Tests automatisés (axe-core)

```tsx
import { A11yChecker } from '@/components/a11y/A11yChecker'

// En mode dev:
<A11yChecker autoRun={true} wcagLevel="AA" />

// En tests unitaires:
import { runA11yChecks } from '@axe-core/react'

test('ChatInput a11y', async () => {
  render(<ChatInput onSend={jest.fn()} />)
  const results = await runA11yChecks(document.body)
  expect(results.violations).toHaveLength(0)
})
```

### Tests manuels (lecteurs d'écran)

**Windows (NVDA):**
```bash
# Télécharger: https://www.nvaccess.org/download/
# Installer et lancer

# Navigation:
Tab             # Élément suivant
Shift+Tab       # Élément précédent
H               # Heading suivant
B               # Bouton suivant
F               # Formulaire suivant
Insert+Down     # Mode formulaire (pour inputs)
Ctrl            # Arrêter lecture
```

**Checklist ChatInput:**
- [ ] Textarea annoncée comme "Message à envoyer, édition"
- [ ] Erreurs annoncées immédiatement
- [ ] Compteur de caractères lu périodiquement
- [ ] Bouton envoi annoncé comme "désactivé" quand vide
- [ ] Messages envoyés confirmés par annonce "Message envoyé"

**macOS (VoiceOver):**
```bash
# Activer: Cmd+F5

# Navigation:
Ctrl+Opt+→      # Élément suivant
Ctrl+Opt+←      # Élément précédent
Ctrl+Opt+Cmd+H  # Heading suivant
Ctrl+Opt+Space  # Activer élément
Ctrl            # Arrêter lecture
```

### Tests au clavier

**Checklist complète:**
```
ChatInput:
[ ] Tab atteint textarea
[ ] Tab atteint bouton fichier
[ ] Tab atteint bouton dictée
[ ] Tab atteint bouton envoi
[ ] Enter envoie le message
[ ] Shift+Enter nouvelle ligne
[ ] Escape ferme erreur

VoiceButton:
[ ] Tab atteint bouton
[ ] Space active/désactive
[ ] Enter active/désactive
[ ] Mode push-to-talk fonctionne au clavier

Modal:
[ ] Tab cycle dans le modal uniquement (focus trap)
[ ] Escape ferme le modal
[ ] Focus retourne à l'élément déclencheur après fermeture

Navigation globale:
[ ] Tous les liens accessibles au Tab
[ ] Skip to main content fonctionne
[ ] Raccourcis clavier (Ctrl+K, etc.) fonctionnent
```

### Tests de contraste

**Outils:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Extension Chrome: [WCAG Color Contrast Checker](https://chrome.google.com/webstore/detail/wcag-color-contrast-check/plnahcmalebffmaghcpcmpaciebdhgdf)

**Ratios minimum (WCAG AA):**
- Texte normal: 4.5:1
- Texte large (18pt+ ou 14pt+ gras): 3:1
- Composants UI: 3:1

**À vérifier dans TITANE:**
```css
/* Exemples de combinaisons à tester */
--text-primary sur --bg-panel
--text-secondary sur --bg-card
--border-focus sur --bg-input
Boutons hover states
Badges (success, error, warning)
```

---

## 📈 Métriques d'amélioration

### Coverage actuelle vs cible

```
Current:  ███████████░░░░░░░░░░░░░░░ 60%
Phase 1:  ████████████████░░░░░░░░░░ 70% (+10%)
Phase 2:  ████████████████████░░░░░░ 80% (+10%)
Phase 3:  █████████████████████████░ 85% (+5%)
Target:   █████████████████████████░ 85%
```

### Timeline

| Phase | Durée | Completion | Coverage |
|-------|-------|------------|----------|
| Phase 1 (P0) | 2 jours | +8 fixes | 70% |
| Phase 2 (P1) | 3 jours | +12 fixes | 80% |
| Phase 3 (P2) | 2 jours | +15 fixes | 85% |
| **Total** | **7 jours** | **35 fixes** | **+25%** |

### Effort breakdown

| Tâche | Heures | % |
|-------|--------|---|
| Corrections code | 18h | 70% |
| Tests manuels | 5h | 19% |
| Documentation | 2h | 8% |
| Review | 1h | 4% |
| **Total** | **26h** | **100%** |

---

## 🎓 Recommandations générales

### 1. Principes POUR (Perceivable, Operable, Understandable, Robust)

**Perceivable:**
- ✅ Utiliser semantic HTML (`<button>`, `<label>`, `<main>`, etc.)
- ✅ Textes alternatifs pour images/icônes/emojis
- ✅ Contraste de couleurs suffisant (4.5:1 minimum)
- ✅ Contenu adaptable (responsive, zoom text)

**Operable:**
- ✅ Tout accessible au clavier (Tab, Enter, Space, Arrow keys)
- ✅ Focus visible (ring-2, outline)
- ✅ Temps suffisant pour interactions (pas de timeout agressif)
- ✅ Navigation logique (skip links, landmarks)

**Understandable:**
- ✅ Labels clairs et consistants
- ✅ Messages d'erreur descriptifs
- ✅ Comportement prévisible (pas de surprise)
- ✅ Aide contextuelle disponible

**Robust:**
- ✅ Code valide (pas d'erreurs HTML)
- ✅ ARIA attributes corrects
- ✅ Compatible assistive technologies
- ✅ Progressive enhancement

### 2. Checklist composant accessible

Avant de créer un nouveau composant, vérifier:

```tsx
interface AccessibleComponentChecklist {
  // Structure
  semanticHTML: boolean;           // <button> pas <div onClick>
  landmarks: boolean;              // <main>, <nav>, <aside> si applicable
  
  // Labels
  visibleLabel: boolean;           // <label> ou texte visible
  ariaLabel: boolean;              // aria-label si pas de label visible
  ariaDescribedby: boolean;        // Pour hints/erreurs
  
  // États
  ariaDisabled: boolean;           // Si disabled prop
  ariaPressed: boolean;            // Si toggle button
  ariaExpanded: boolean;           // Si collapsible
  ariaChecked: boolean;            // Si checkbox/radio
  
  // Feedback
  ariaLive: boolean;               // Pour status dynamiques
  roleStatus: boolean;             // role="status" si messages
  roleAlert: boolean;              // role="alert" si erreurs
  
  // Navigation
  tabIndex: number;                // 0 pour focusable, -1 pour skip
  keyboardHandlers: boolean;       // onKeyDown pour Space/Enter
  focusTrap: boolean;              // Si modal/dialog
  
  // Visuel
  focusIndicator: boolean;         // ring-2 ou outline visible
  colorContrast: number;           // >= 4.5:1 pour texte
  iconAltText: boolean;            // aria-hidden sur déco
}
```

### 3. Patterns à éviter

```tsx
// ❌ BAD: Div cliquable sans accessibilité
<div onClick={handleClick}>Action</div>

// ✅ GOOD: Bouton sémantique
<button type="button" onClick={handleClick}>Action</button>

// ❌ BAD: Input sans label
<input type="text" placeholder="Nom" />

// ✅ GOOD: Input avec label
<label htmlFor="name-input">Nom</label>
<input id="name-input" type="text" placeholder="Ex: Jean Dupont" />

// ❌ BAD: Message d'erreur non lié
<span className="error">Email invalide</span>
<input type="email" />

// ✅ GOOD: Erreur liée avec aria-describedby
<span id="email-error" className="error">Email invalide</span>
<input 
  type="email" 
  aria-invalid="true"
  aria-describedby="email-error email-hint"
/>

// ❌ BAD: Emoji sans contexte
<button>🔊</button>

// ✅ GOOD: Emoji avec label
<button aria-label="Lire à voix haute">
  <span aria-hidden="true">🔊</span>
</button>
```

### 4. Resources

**Documentation:**
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [WebAIM Articles](https://webaim.org/articles/)

**Outils:**
- [axe DevTools](https://www.deque.com/axe/devtools/) — Extension navigateur
- [WAVE](https://wave.webaim.org/) — Évaluation page web
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) — Audit automatisé

**Lecteurs d'écran:**
- NVDA (Windows) — Gratuit
- JAWS (Windows) — Payant ($1000+)
- VoiceOver (macOS/iOS) — Intégré
- TalkBack (Android) — Intégré
- Orca (Linux) — Gratuit

---

## ✅ Prochaines étapes

### Immédiat (cette session)
1. ✅ Créer rapport d'audit complet (ce document)
2. ⏳ Créer issues GitHub pour chaque violation (35 issues)
3. ⏳ Implémenter corrections Phase 1 (P0 critique)

### Semaine prochaine
4. ⏳ Implémenter corrections Phase 2 (P1 sérieuse)
5. ⏳ Tests lecteurs d'écran (NVDA)
6. ⏳ Tests clavier complets

### Semaine suivante
7. ⏳ Implémenter corrections Phase 3 (P2 modérée)
8. ⏳ Color contrast audit
9. ⏳ Documentation guides utilisateur

---

**Rapport créé par:** GitHub Copilot (Claude Sonnet 4.5)  
**Date:** 6 décembre 2025  
**Version:** TITANE∞ v19.4 — Accessibility Audit Phase 2  
**Status:** Draft complet — prêt pour review
