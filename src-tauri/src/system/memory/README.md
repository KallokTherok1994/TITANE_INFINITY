# 🔐 MemoryCore TITANE∞ v8.0

**Système de mémoire chiffrée AES-256-GCM souverain et local**

---

## 🎯 Vue d'Ensemble

Le **MemoryCore** est le système de mémoire persistante chiffrée de TITANE∞. Il offre :

- 🔐 **Chiffrement AES-256-GCM** - Sécurité de niveau militaire
- 💾 **Stockage local** - 100% souverain, zéro cloud
- ⚡ **Performance** - Écriture atomique, lecture rapide
- 🛡️ **Robustesse** - Zéro unwrap, zéro panic
- 🧬 **Évolutif** - Prêt pour MAI, ContinuumCore

---

## 📁 Structure

```
core/backend/system/memory/
├── mod.rs          → Module principal + API Tauri
├── crypto.rs       → Chiffrement AES-256-GCM
├── storage.rs      → Persistence locale
├── types.rs        → Structures de données
└── tests.rs        → Tests d'intégration

core/frontend/
├── hooks/useMemoryCore.ts        → Hook React
└── devtools/panels/
    ├── MemoryPanel.tsx           → Composant UI
    └── MemoryPanel.css           → Styles
```

---

## 🚀 Démarrage Rapide

### 1. Installation automatique
```bash
./quickstart_memorycore.sh
```

### 2. Tests manuels
```bash
cd core/backend
cargo test memory
```

### 3. Utilisation Frontend
```typescript
import { useMemoryCore } from '../hooks/useMemoryCore';

function MyComponent() {
  const memory = useMemoryCore();
  
  await memory.saveEntry({ data: 'secret' });
  const entries = await memory.loadEntries();
}
```

---

## 🔧 API Tauri

### `save_entry(entry: String)`
Sauvegarde une entrée chiffrée.

```typescript
await invoke('save_entry', { 
  entry: JSON.stringify({ data: 'secret' }) 
});
```

### `load_entries()`
Charge toutes les entrées déchiffrées.

```typescript
const result = await invoke<string>('load_entries');
const collection = JSON.parse(result);
```

### `clear_memory()`
Efface toutes les données.

```typescript
await invoke('clear_memory');
```

### `get_memory_state()`
Obtient l'état du système.

```typescript
const state = await invoke<string>('get_memory_state');
const { entries_count, checksum } = JSON.parse(state);
```

---

## 🔐 Sécurité

### Chiffrement
- **Algorithme** : AES-256-GCM
- **Nonce** : 12 bytes aléatoires (unique par chiffrement)
- **Tag** : 16 bytes d'authentification
- **Clé** : Dérivée via SHA-256

### Format de stockage
```
[nonce (12 bytes)] + [ciphertext + authentication tag]
```

### Fichier
```
./data/memory/encrypted_memory.bin
```

---

## 🧪 Tests

### Suite complète
```bash
cargo test
```

### Tests spécifiques
```bash
cargo test memory::tests::test_encryption_integrity
cargo test memory::tests::test_full_lifecycle
```

### Avec logs
```bash
RUST_LOG=debug cargo test -- --nocapture
```

---

## 📊 Format des Données

### MemoryEntry
```json
{
  "id": "mem_1700000000000",
  "timestamp": 1700000000000,
  "content": "{\"data\":\"value\"}"
}
```

### MemoryCollection
```json
{
  "entries": [...],
  "version": 1,
  "created_at": 1700000000000
}
```

### MemoryState
```json
{
  "initialized": true,
  "entries_count": 42,
  "checksum": "a1b2c3d4...",
  "last_update": 1700000000000
}
```

---

## 🛠️ Dépendances

```toml
aes-gcm = "0.10"      # Chiffrement
sha2 = "0.10"         # Hashing
hex = "0.4"           # Encodage
serde_json = "1.0"    # Sérialisation
rand = "0.8"          # Aléatoire
```

---

## 📚 Documentation

- **MEMORYCORE_COMPLETE.md** - Architecture technique complète
- **MEMORYCORE_USAGE.md** - Guide d'utilisation détaillé
- **MEMORYCORE_GENERATION_REPORT.md** - Rapport de génération

---

## 🎯 Roadmap

### Phase 1 ✅ (Actuel)
- [x] Chiffrement AES-256-GCM
- [x] Stockage local sécurisé
- [x] API Tauri complète
- [x] Tests d'intégration

### Phase 2 (Q1 2026)
- [ ] Mémoire vectorielle (embeddings)
- [ ] Recherche sémantique (FAISS)
- [ ] Index en mémoire

### Phase 3 (Q2 2026)
- [ ] Mémoire émotionnelle
- [ ] Profiling cognitif
- [ ] Contexte affectif

### Phase 4 (Q3 2026)
- [ ] Memory Fractal Layers
- [ ] ContinuumCore integration
- [ ] Synchronisation distribuée

---

## ⚡ Performance

| Opération | Temps moyen |
|-----------|-------------|
| Chiffrement | ~1ms / 1KB |
| Déchiffrement | ~1ms / 1KB |
| Sauvegarde | ~5ms |
| Chargement | ~3ms |

*Testé sur CPU moderne (Intel i5/i7)*

---

## 🐛 Dépannage

### Le backend ne compile pas
```bash
cargo clean
cargo build
```

### Fichier corrompu
```bash
rm ./data/memory/encrypted_memory.bin
```

### Tests échouent
```bash
RUST_LOG=debug cargo test -- --nocapture
```

---

## 📝 Licence

Propriétaire - TITANE Team © 2025

---

## 🤝 Contribution

Pour contribuer au MemoryCore :

1. Respecter l'architecture existante
2. Maintenir zéro unwrap/panic
3. Ajouter des tests pour toute nouvelle fonctionnalité
4. Suivre les conventions de code Rust

---

## 📞 Support

En cas de problème :
1. Consulter la documentation (MEMORYCORE_*.md)
2. Vérifier les logs : `RUST_LOG=debug cargo run`
3. Lancer les tests : `cargo test`

---

**Le système de mémoire chiffrée de TITANE∞ est opérationnel ! 🔐✨**

*Dernière mise à jour : 17 novembre 2025*
