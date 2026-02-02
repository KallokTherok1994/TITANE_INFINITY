# Configuration Ollama + Tauri - TITANE∞

## ✅ Statut: OPÉRATIONNEL

Date de configuration: 2 février 2026

## 📋 Résumé de la Configuration

### 1. Serveur Ollama

- **URL**: `http://127.0.0.1:11434`
- **Statut**: ✅ Actif et fonctionnel
- **Version**: Détectée et testée

### 2. Modèles Installés

Les modèles suivants sont disponibles et prêts à l'emploi:

| Modèle | Taille | Statut | Recommandation |
|--------|--------|--------|----------------|
| `qwen2.5:latest` | 4.7 GB | ✅ Actif | Excellent pour code |
| `llama3.1:latest` | 4.9 GB | ✅ **CONFIGURÉ** | Modèle par défaut recommandé |
| `llama3.2:latest` | 2.0 GB | ✅ Actif | Léger et rapide |
| `codellama:latest` | 3.8 GB | ✅ Actif | Optimisé pour développement |
| `mistral:latest` | 4.4 GB | ✅ Actif | Polyvalent et performant |
| `gemma2:latest` | 5.4 GB | ✅ Actif | Performant |
| `gemma2:2b` | 1.6 GB | ✅ Actif | Ultra-léger |
| `phi3.5:latest` | 2.2 GB | ✅ Actif | Compact et efficace |
| `deepseek-coder-v2` | 8.9 GB | ✅ Actif | Expert code avancé |

### 3. Configuration TITANE∞

#### Fichier `.env.local` (créé)

```bash
# Configuration Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_DEFAULT_MODEL=llama3.1:latest
TITANE_OLLAMA_MODEL=llama3.1:latest

# Mode développement
DEBUG=true
```

#### Proxy Vite (déjà configuré)

Le fichier `vite.config.ts` contient déjà la configuration proxy:

```typescript
proxy: {
  '/api/ollama': {
    target: 'http://127.0.0.1:11434',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api\/ollama/, '/api'),
  }
}
```

### 4. Intégration Rust (Tauri)

#### Module Ollama

- **Fichier**: `src-tauri/src/ollama.rs`
- **Statut**: ✅ Opérationnel
- **Fonctionnalités**:
  - Connexion au serveur Ollama local
  - Gestion automatique des modèles disponibles
  - Fallback intelligent si modèle par défaut indisponible
  - Gestion d'erreurs robuste

#### Commandes Tauri

Les commandes suivantes sont enregistrées et fonctionnelles:

- `conversation_generate`: Génération de réponses via OMEGA Pipeline v2
- `ollama_query`: Requête directe au serveur Ollama (legacy)

## 🧪 Tests de Validation

Tous les tests passent avec succès (10/10):

1. ✅ Serveur Ollama actif
2. ✅ Modèle llama3.1:latest disponible
3. ✅ Génération de texte fonctionnelle
4. ✅ Fichier .env.local configuré
5. ✅ Variable OLLAMA_BASE_URL présente
6. ✅ Variable TITANE_OLLAMA_MODEL présente
7. ✅ Proxy Vite configuré
8. ✅ Module ollama.rs présent
9. ✅ Commande conversation_generate enregistrée
10. ✅ Build Rust compile sans erreur

### Script de Test

Un script de test automatique a été créé: `test-ollama-connection.sh`

```bash
# Exécuter les tests
bash test-ollama-connection.sh
```

## 🚀 Utilisation

### Démarrer TITANE∞ avec Ollama

```bash
# Mode développement
pnpm run dev:tauri
```

### Changer de Modèle

Pour utiliser un autre modèle, modifiez `.env.local`:

```bash
# Exemple: utiliser qwen2.5 pour le code
TITANE_OLLAMA_MODEL=qwen2.5:latest
```

### Installer un Nouveau Modèle

```bash
# Lister les modèles disponibles
ollama list

# Installer un nouveau modèle
ollama pull <nom-du-modele>

# Exemple
ollama pull llama3.3:latest
```

## 🔧 Architecture de l'Intégration

```
Frontend (React/TypeScript)
    ↓
Tauri Commands (conversation_generate)
    ↓
Conversation Engine (Rust)
    ↓
Ollama Module (src-tauri/src/ollama.rs)
    ↓
HTTP Client (reqwest)
    ↓
Serveur Ollama (127.0.0.1:11434)
    ↓
Modèle IA (llama3.1:latest)
```

## 📚 Fichiers Modifiés/Créés

### Créés
- `.env.local` - Configuration locale Ollama
- `test-ollama-connection.sh` - Script de validation

### Existants (déjà configurés)
- `src-tauri/src/ollama.rs` - Module Rust pour Ollama
- `src-tauri/src/conversation_engine/` - Engine de conversation
- `src/services/ai/providers/ollama.ts` - Provider frontend
- `vite.config.ts` - Configuration proxy Vite

## 🔒 Sécurité

- ✅ Connexion locale uniquement (127.0.0.1)
- ✅ Aucune clé API requise (modèle local)
- ✅ Validation des entrées utilisateur
- ✅ Timeout de requête configuré (60s)
- ✅ Gestion d'erreurs robuste

## 📈 Performance

- **Latence moyenne**: ~500ms - 2s (selon modèle et longueur)
- **Timeout max**: 60 secondes
- **Fallback**: Automatique vers autres providers si Ollama indisponible

## 🐛 Dépannage

### Serveur Ollama ne répond pas

```bash
# Démarrer Ollama
ollama serve

# Vérifier le statut
curl http://127.0.0.1:11434/api/tags
```

### Modèle indisponible

```bash
# Lister les modèles installés
ollama list

# Télécharger le modèle manquant
ollama pull llama3.1:latest
```

### Build Rust échoue

```bash
# Nettoyer et rebuilder
cargo clean --manifest-path src-tauri/Cargo.toml
cargo build --manifest-path src-tauri/Cargo.toml
```

## 📝 Notes

- Ollama fonctionne entièrement en local, pas besoin de connexion internet pour l'inférence
- Les modèles sont stockés localement (~/.ollama/models)
- La configuration peut être modifiée à chaud via `.env.local`
- Le proxy Vite évite les problèmes CORS en mode développement

## ✅ Validation Finale

**Configuration complète et opérationnelle!**

- Ollama: ✅ Connecté
- Tauri: ✅ Configuré
- Chat IA: ✅ Fonctionnel
- Tests: ✅ 10/10 réussis

---

*Document généré le: 2 février 2026*
*TITANE∞ v27+*
