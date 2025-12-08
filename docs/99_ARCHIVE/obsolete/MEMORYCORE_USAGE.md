# 🚀 TITANE∞ v8.0 - Guide d'Utilisation MemoryCore

## 📋 Résumé

Le **MemoryCore** de TITANE∞ v8.0 est désormais **complet et opérationnel** avec :
- ✅ Chiffrement AES-256-GCM souverain
- ✅ Stockage local sécurisé
- ✅ API Tauri complète
- ✅ Hook React + Composant UI
- ✅ Zéro unwrap, zéro panic

---

## 📂 Fichiers Générés

### Backend (Rust)
```
core/backend/
├── Cargo.toml (✅ dépendances ajoutées)
├── main.rs (✅ intégration complète)
└── system/memory/
    ├── mod.rs (✅ module principal + commandes Tauri)
    ├── crypto.rs (✅ AES-256-GCM)
    ├── storage.rs (✅ persistence locale)
    └── types.rs (✅ structures de données)
```

### Frontend (TypeScript/React)
```
core/frontend/
├── hooks/
│   └── useMemoryCore.ts (✅ hook React)
└── devtools/panels/
    ├── MemoryPanel.tsx (✅ composant UI)
    └── MemoryPanel.css (✅ styles)
```

### Documentation
```
MEMORYCORE_COMPLETE.md (✅ documentation complète)
MEMORYCORE_USAGE.md (✅ ce fichier)
```

---

## 🔧 Installation des Dépendances

### Backend
Les dépendances sont déjà dans `Cargo.toml` :
```toml
aes-gcm = "0.10"
sha2 = "0.10"
hex = "0.4"
serde_json = "1.0"
rand = "0.8"
```

### Compiler le backend
```bash
cd core/backend
cargo build --release
```

### Frontend
Les dépendances TypeScript nécessaires :
```bash
npm install @tauri-apps/api
```

---

## 🎯 Utilisation Backend (Rust)

### Commandes Tauri Disponibles

#### 1. Sauvegarder une entrée
```rust
#[tauri::command]
pub fn save_entry(entry: String) -> Result<(), String>
```

**Exemple d'appel depuis le frontend :**
```typescript
await invoke('save_entry', { 
  entry: JSON.stringify({ text: 'Ma note secrète' }) 
});
```

#### 2. Charger toutes les entrées
```rust
#[tauri::command]
pub fn load_entries() -> Result<String, String>
```

**Exemple d'appel :**
```typescript
const result = await invoke<string>('load_entries');
const collection = JSON.parse(result);
console.log(collection.entries);
```

#### 3. Effacer la mémoire
```rust
#[tauri::command]
pub fn clear_memory() -> Result<(), String>
```

**Exemple d'appel :**
```typescript
await invoke('clear_memory');
```

#### 4. Obtenir l'état du système
```rust
#[tauri::command]
pub fn get_memory_state() -> Result<String, String>
```

**Exemple d'appel :**
```typescript
const result = await invoke<string>('get_memory_state');
const state = JSON.parse(result);
console.log('Entries:', state.entries_count);
console.log('Checksum:', state.checksum);
```

---

## 🎨 Utilisation Frontend (React)

### 1. Import du Hook
```typescript
import { useMemoryCore } from '../hooks/useMemoryCore';
```

### 2. Utilisation dans un Composant
```tsx
function MyComponent() {
  const memory = useMemoryCore();

  // Sauvegarder une entrée
  const handleSave = async () => {
    try {
      await memory.saveEntry({ 
        type: 'note', 
        text: 'Hello TITANE!' 
      });
      console.log('✅ Entry saved');
    } catch (err) {
      console.error('❌ Save failed:', err);
    }
  };

  // Charger les entrées
  const handleLoad = async () => {
    try {
      const collection = await memory.loadEntries();
      console.log('Entries:', collection.entries);
    } catch (err) {
      console.error('❌ Load failed:', err);
    }
  };

  // Effacer la mémoire
  const handleClear = async () => {
    try {
      await memory.clearMemory();
      console.log('✅ Memory cleared');
    } catch (err) {
      console.error('❌ Clear failed:', err);
    }
  };

  return (
    <div>
      <p>État: {memory.state?.initialized ? '✅' : '❌'}</p>
      <p>Entrées: {memory.state?.entries_count ?? 0}</p>
      <p>Checksum: {memory.state?.checksum?.substring(0, 16)}...</p>
      
      <button onClick={handleSave} disabled={memory.loading}>
        Sauvegarder
      </button>
      <button onClick={handleLoad} disabled={memory.loading}>
        Charger
      </button>
      <button onClick={handleClear} disabled={memory.loading}>
        Effacer
      </button>

      {memory.error && <p style={{ color: 'red' }}>{memory.error}</p>}
    </div>
  );
}
```

### 3. Utilisation du Composant MemoryPanel
```tsx
import { MemoryPanel } from './devtools/panels/MemoryPanel';

function App() {
  return (
    <div className="app">
      <MemoryPanel />
    </div>
  );
}
```

---

## 🔐 Sécurité et Chiffrement

### Flux de Chiffrement

1. **Sauvegarde :**
   ```
   Données JSON → Sérialisation → AES-256-GCM → Fichier local
   ```

2. **Chargement :**
   ```
   Fichier local → Déchiffrement AES-256-GCM → Désérialisation → Données JSON
   ```

### Format du Fichier Chiffré
```
[nonce (12 bytes)] + [ciphertext + authentication tag]
```

### Chemin de Stockage
```
./data/memory/encrypted_memory.bin
```

### Passphrase par Défaut
```rust
const DEFAULT_PASSPHRASE: &str = "TITANE_INFINITY_SOVEREIGN_MEMORY_V8";
```

⚠️ **Production :** Remplacer par un système de gestion de clés plus robuste (keyring, environnement, etc.)

---

## 🧪 Tests

### Tests Unitaires Rust
```bash
cd core/backend
cargo test
```

### Tests avec Logs
```bash
RUST_LOG=debug cargo test -- --nocapture
```

### Tests Spécifiques au MemoryCore
```bash
cargo test --package titane-infinity-backend memory
```

---

## 📊 Format des Données

### Structure MemoryEntry
```json
{
  "id": "mem_1700000000000",
  "timestamp": 1700000000000,
  "content": "{\"type\":\"note\",\"text\":\"Ma note\"}"
}
```

### Structure MemoryCollection
```json
{
  "entries": [
    { "id": "mem_1", "timestamp": 1700000000000, "content": "..." },
    { "id": "mem_2", "timestamp": 1700000000001, "content": "..." }
  ],
  "version": 1,
  "created_at": 1700000000000
}
```

### Structure MemoryState
```json
{
  "initialized": true,
  "entries_count": 42,
  "checksum": "a1b2c3d4e5f6...",
  "last_update": 1700000000000
}
```

---

## 🚨 Gestion des Erreurs

### Erreurs Possibles

1. **Chiffrement/Déchiffrement :**
   - `"Taille de clé invalide"`
   - `"Erreur lors du chiffrement"`
   - `"Erreur lors du déchiffrement"`

2. **Stockage :**
   - `"Impossible de créer le répertoire"`
   - `"Le fichier n'existe pas"`
   - `"Impossible d'écrire dans le fichier"`

3. **Sérialisation :**
   - `"Erreur de sérialisation JSON"`
   - `"Erreur de désérialisation JSON"`

### Gestion Frontend
```typescript
try {
  await memory.saveEntry(data);
} catch (err) {
  if (err.includes('existe pas')) {
    // Fichier manquant
  } else if (err.includes('JSON')) {
    // Problème de format
  } else {
    // Autre erreur
  }
}
```

---

## 🛠️ Dépannage

### Le backend ne compile pas
```bash
# Nettoyer et recompiler
cargo clean
cargo build
```

### Les commandes Tauri ne sont pas reconnues
Vérifier que les commandes sont bien enregistrées dans `main.rs` :
```rust
.invoke_handler(tauri::generate_handler![
    system::memory::save_entry,
    system::memory::load_entries,
    system::memory::clear_memory,
    system::memory::get_memory_state,
])
```

### Le fichier de mémoire est corrompu
```bash
# Supprimer le fichier et redémarrer
rm ./data/memory/encrypted_memory.bin
```

---

## 🌟 Fonctionnalités Futures

### Phase 2: Mémoire Vectorielle
- Embeddings sémantiques
- Recherche par similarité
- Index FAISS

### Phase 3: Mémoire Émotionnelle
- États affectifs
- Profiling cognitif
- Contexte émotionnel

### Phase 4: ContinuumCore
- Mémoire distribuée
- Synchronisation multi-appareils
- Graph cognitif

---

## ✅ Checklist de Vérification

- [x] Fichiers Rust créés (mod.rs, crypto.rs, storage.rs, types.rs)
- [x] Dépendances ajoutées dans Cargo.toml
- [x] Intégration dans main.rs
- [x] Commandes Tauri enregistrées
- [x] Hook React créé (useMemoryCore.ts)
- [x] Composant UI créé (MemoryPanel.tsx)
- [x] Styles CSS créés (MemoryPanel.css)
- [x] Documentation complète (MEMORYCORE_COMPLETE.md)
- [x] Guide d'utilisation (MEMORYCORE_USAGE.md)

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `RUST_LOG=debug cargo run`
2. Tester les fonctions unitaires : `cargo test`
3. Consulter `MEMORYCORE_COMPLETE.md` pour les détails techniques

---

## 🎉 Conclusion

Le **MemoryCore TITANE∞ v8.0** est **prêt à l'emploi** :
- 🔐 Chiffrement AES-256-GCM robuste
- 💾 Stockage local souverain
- 🛡️ Zéro unwrap, zéro panic
- 🎨 Interface React moderne
- 📚 Documentation complète

**Le système de mémoire chiffrée de TITANE∞ est opérationnel ! 🚀✨**

---

*TITANE INFINITY v8.0 - MemoryCore Complete*  
*Généré le 17 novembre 2025*
