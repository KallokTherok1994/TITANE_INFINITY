# TITANE∞ v26.2.1 - Configuration Gemini API

## 📊 Status Actuel

**F12 DevTools:** ✅ Configuré et fonctionnel
- Permission Tauri: `core:webview:allow-internal-toggle-devtools`
- Raccourci clavier: F12 (géré automatiquement par Tauri)
- Mode dev: DevTools toggle actif
- Console logs: `[WindowControls] F12 pressed` pour debug

**Gemini API:** ⚠️ Configuration requise
- Chiffrement: AES-256-GCM + Argon2id ✅
- Backend Rust: SecureSecretsEngine implémenté ✅
- Frontend: Interface Governance Center ✅
- Problème: TITANE_SECRETS_PASSPHRASE non défini

---

## 🔐 Configuration Sécurisée Gemini

### Architecture de Sécurité

```
┌─────────────────────────────────────────────┐
│         1. Passphrase (.env)                │
│      TITANE_SECRETS_PASSPHRASE (16+ chars)  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      2. Dérivation Argon2id                 │
│   • Salt: 16 bytes aléatoires               │
│   • Iterations: Memory-hard                 │
│   • Output: 256-bit master key              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      3. Chiffrement AES-256-GCM             │
│   • Algorithm: AEAD (authenticated)         │
│   • Nonce: 12 bytes uniques                 │
│   • Tag: 128-bit MAC                        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│      4. Stockage Chiffré                    │
│   ~/.local/share/titane-infinity/secrets.enc│
│   Permissions: 600 (owner read/write only)  │
└─────────────────────────────────────────────┘
```

### Méthode 1: Script Automatique (Recommandé)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./scripts/setup-gemini.sh
```

Le script:
1. Vérifie/crée .env depuis .env.example
2. Configure TITANE_SECRETS_PASSPHRASE (interactive)
3. Explique les méthodes de configuration Gemini
4. Vérifie la sécurité du setup

### Méthode 2: Configuration Manuelle

#### Étape 1: Configurer la Passphrase

```bash
# Éditer .env
nano .env

# Ajouter (remplacer par une vraie passphrase ≥16 chars):
TITANE_SECRETS_PASSPHRASE=VoTr3P4ssPhr4s3S3cur1s33!

# Optionnel: Ajouter Gemini pour migration automatique
GEMINI_API_KEY=votre_cle_google_gemini_ici
```

**Recommandations passphrase:**
- Longueur: ≥16 caractères (24-32 recommandé)
- Composition: lettres, chiffres, symboles
- Éviter: mots du dictionnaire, informations personnelles
- Exemple: `K8v!mP2x#nQ7rT9w&L4e`

#### Étape 2: Configurer Gemini

**Option A: Via Governance Center UI (Préféré)**

1. Lancer Titan-Dev:
   ```bash
   pnpm run dev
   ```

2. Naviguer: `Governance Center` → Onglet `Secrets`

3. Section "🌐 Gemini API Key":
   - Statut actuel: "Gemini configuré (inactif)" ou "non configuré"
   - Champ masqué (type password)
   - Bouton "Sauvegarder"

4. Entrer la clé Gemini → Sauvegarder

5. Vérifier: Statut devient "Gemini opérationnel ✅"

**Option B: Via Console DevTools (F12)**

```javascript
// Ouvrir console (F12)
const { invoke } = window.__TAURI__.core;

// Configurer Gemini
await invoke('chat_set_gemini_key', {
  apiKey: 'votre_cle_gemini_ici'
});

// Vérifier status
const status = await invoke('get_gemini_key_status');
console.log(status);
// { configured: true, provider_enabled: true, masked_key: "••••••ours" }
```

**Option C: Migration .env Automatique**

Si `GEMINI_API_KEY` est défini dans `.env`:
- Au démarrage, détecté automatiquement
- Migré vers coffre chiffré
- Purgé de `.env` pour sécurité
- Log: `[SecureCommands] Purged GEMINI_API_KEY from .env`

---

## 🧪 Vérification

### Test 1: Passphrase Configurée

```bash
source .env
echo ${#TITANE_SECRETS_PASSPHRASE}
# Devrait afficher ≥16
```

### Test 2: Coffre Chiffré Créé

```bash
ls -la ~/.local/share/titane-infinity/secrets.enc
# Devrait exister après premier démarrage
```

### Test 3: Gemini Opérationnel

```bash
# Lancer Titan-Dev
pnpm run dev

# Dans Governance Center → Secrets:
# Status: "Gemini opérationnel ✅"
# Masked key: "••••••ours" (derniers 4 chars visibles)
```

### Test 4: DevTools F12

```bash
# Dans Titan-Dev window:
# 1. Appuyer F12
# 2. DevTools s'ouvrent
# 3. Console affiche: "[WindowControls] F12 pressed - DevTools should toggle"
```

---

## 📁 Fichiers Modifiés

### Backend Rust

**src-tauri/src/security/secrets_engine.rs** (414 lignes)
```rust
// Moteur complet avec:
- SecureSecretsEngine::new(passphrase)
- Chiffrement AES-256-GCM
- Dérivation Argon2id
- Stockage: ~/.local/share/titane-infinity/secrets.enc
- API: set_secret(), get_secret(), has_secret()
```

**src-tauri/src/secure_commands.rs** (668 lignes)
```rust
#[tauri::command]
pub async fn chat_set_gemini_key(
    api_key: String,
    secrets: State<'_, SecureSecretsEngine>,
    // ...
) -> Result<SecureResponse<GeminiKeyStatus>, String>

// Validation:
- Longueur ≥16 chars
- Stockage chiffré
- Purge .env automatique
- Mise à jour ChatOrchestrator
```

### Frontend TypeScript

**src/features/governance-center/tabs/SecretsTab.tsx** (658 lignes)
```tsx
// Interface utilisateur:
- Formulaire masked (type password)
- Status visuel avec indicateur couleur
- Validation côté client
- Feedback success/error
- Affichage clé masquée (••••••ours)
```

**src/hooks/useWindowControls.ts** (203 lignes)
```typescript
// Support F12 DevTools:
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'F12') {
    e.preventDefault();
    console.log('[WindowControls] F12 pressed - DevTools should toggle');
    return;
  }
  // ... autres raccourcis
};
```

### Configuration

**tauri.base.json** (ligne 44)
```json
"permissions": [
  "core:webview:allow-internal-toggle-devtools",
  // ... autres permissions
]
```

**.env.example**
```bash
# Passphrase obligatoire pour SecureSecretsEngine
# Longueur minimale recommandée: 16 caractères
TITANE_SECRETS_PASSPHRASE=

# Migration automatique vers coffre chiffré
GEMINI_API_KEY=
GEMINI_MODEL=gemini-pro
```

---

## 🔒 Sécurité

### Chiffrement des Secrets

| Composant | Algorithme | Paramètres |
|-----------|------------|------------|
| **Chiffrement** | AES-256-GCM | AEAD avec authentification |
| **Dérivation clé** | Argon2id | Memory-hard (résistant GPU) |
| **Salt** | 16 bytes | Aléatoire par secret |
| **Nonce** | 12 bytes | Unique par opération |
| **Tag** | 128 bits | MAC pour intégrité |

### Protection Fichier

```bash
# Permissions secrets.enc
-rw------- (600)  # Owner uniquement

# Emplacement
~/.local/share/titane-infinity/secrets.enc

# Backup recommandé avec passphrase
tar -czf secrets-backup-$(date +%Y%m%d).tar.gz \
  ~/.local/share/titane-infinity/secrets.enc
```

### Bonnes Pratiques

1. **Passphrase:**
   - ✅ Longueur ≥16 caractères
   - ✅ Mix lettres/chiffres/symboles
   - ❌ Jamais dans Git
   - ✅ Changer en production

2. **Clés API:**
   - ✅ Stockage chiffré uniquement
   - ✅ Jamais en clair dans logs
   - ✅ Frontend: affichage masqué
   - ✅ Purge .env après migration

3. **Backup:**
   - ✅ Sauvegarder secrets.enc
   - ✅ Documenter passphrase (coffre-fort)
   - ✅ Test restoration régulier

---

## 🐛 Dépannage

### Erreur: "Missing secrets passphrase"

```bash
# Vérifier .env
grep TITANE_SECRETS_PASSPHRASE .env

# Si vide ou absent:
echo "TITANE_SECRETS_PASSPHRASE=VoTr3P4ssPhr4s3" >> .env
```

### Erreur: "Decryption failed"

```bash
# Passphrase incorrecte, réinitialiser:
rm ~/.local/share/titane-infinity/secrets.enc
# Redémarrer l'app, nouveau coffre créé
```

### Status "Gemini configuré (inactif)"

```bash
# Clé stockée mais provider désactivé
# Dans console F12:
await invoke('chat_set_gemini_key', { apiKey: 'VOTRE_CLE' });
```

### DevTools F12 ne s'ouvre pas

```bash
# Vérifier permission Tauri
grep "allow-internal-toggle-devtools" src-tauri/tauri.conf.json

# Si absent, ajouter dans permissions:
"core:webview:allow-internal-toggle-devtools"
```

---

## ✅ Résumé

**F12 DevTools:**
- ✅ Configuré (permission Tauri)
- ✅ Raccourci actif (F12)
- ✅ Hook intégré (useWindowControls)

**Gemini API:**
- ✅ Backend sécurisé (AES-256-GCM + Argon2id)
- ✅ Frontend UI (Governance Center)
- ⚠️ Configuration requise:
  1. Définir TITANE_SECRETS_PASSPHRASE dans .env
  2. Configurer clé via Governance Center
  3. Vérifier status "Gemini opérationnel ✅"

**Scripts:**
```bash
# Setup automatique
./scripts/setup-gemini.sh

# Vérification
pnpm run dev
# → Governance Center → Secrets → Status Gemini
```

**Documentation:**
- [src-tauri/src/security/secrets_engine.rs](../src-tauri/src/security/secrets_engine.rs) - Backend chiffrement
- [src/features/governance-center/tabs/SecretsTab.tsx](../src/features/governance-center/tabs/SecretsTab.tsx) - Frontend UI
- [.env.example](../.env.example) - Configuration template
