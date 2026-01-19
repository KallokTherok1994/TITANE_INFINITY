# 🚀 QUICK START - Test Google Cloud Gemini Services

**Version**: TITANE∞ v19.2.3+
**Date**: 5 décembre 2025

---

## 🎯 TEST RAPIDE (5 minutes)

### Étape 1: Démarrer l'application
```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm run tauri:dev
```

### Étape 2: Ouvrir le Centre Gouvernance
1. Cliquer sur **"Centre Gouvernance & Sécurité"** dans le menu
2. Aller dans l'onglet **"Secrets & APIs"**

### Étape 3: Configurer la clé Gemini
1. Chercher **"Gemini API Key"** dans la liste
2. Coller votre clé API: `AIzaSy...`
3. Cliquer sur **"Enregistrer"**

✅ **Résultat attendu**: "✅ Clé enregistrée avec succès"

### Étape 4: Tester la connexion
Ouvrir la console navigateur (F12) et exécuter:
```javascript
// Test ping rapide
const latency = await window.__TAURI__.invoke('ping_gemini');
console.log(`✅ Gemini réponse en ${latency}ms`);

// Test complet des 22 services
const status = await window.__TAURI__.invoke('test_gemini_services');
console.log('📊 Status:', status);
console.log(`✅ Core API: ${status.coreApiAvailable}`);
console.log(`🔑 API Key: ${status.apiKeyConfigured}`);
console.log(`⚡ Latency: ${status.globalLatencyMs}ms`);
console.log(`📊 Services: ${status.totalServices} total`);
```

---

## 🧪 TEST AVEC COMPOSANT REACT

### Option A: Ajouter dans une page existante
```tsx
// Dans src/pages/Settings.tsx ou similaire
import GoogleCloudTester from '../components/GoogleCloudTester';

export function Settings() {
  return (
    <div>
      {/* ... autres settings ... */}
      <GoogleCloudTester />
    </div>
  );
}
```

### Option B: Page dédiée
Créer `src/pages/GoogleCloudServices.tsx`:
```tsx
import GoogleCloudTester from '../components/GoogleCloudTester';

export function GoogleCloudServices() {
  return (
    <div className="page-container">
      <GoogleCloudTester />
    </div>
  );
}

export default GoogleCloudServices;
```

Ajouter la route dans votre router:
```tsx
<Route path="/google-cloud" element={<GoogleCloudServices />} />
```

---

## 📊 RÉSULTATS ATTENDUS

### Test réussi ✅
```json
{
  "coreApiAvailable": true,
  "apiKeyConfigured": true,
  "totalServices": 22,
  "globalLatencyMs": 250,
  "servicesTested": [
    {
      "name": "Generative Language API (Core)",
      "available": true,
      "endpoint": "generativelanguage.googleapis.com",
      "error": null
    },
    {
      "name": "Vertex AI API",
      "available": false,
      "endpoint": "aiplatform.googleapis.com",
      "error": "Requires OAuth2 - Not tested"
    }
    // ... 20 autres services
  ]
}
```

### Clé non configurée ⚠️
```json
{
  "coreApiAvailable": false,
  "apiKeyConfigured": false,
  "totalServices": 22,
  "globalLatencyMs": 0,
  "servicesTested": []
}
```

**Action**: Retourner à l'Étape 3 et configurer la clé

### Erreur de connexion ❌
```
Error: Connection error: timeout
```

**Causes possibles**:
1. Pas de connexion internet
2. Clé API invalide
3. Quota dépassé
4. Service Google Cloud en maintenance

**Actions**:
1. Vérifier la connexion internet
2. Vérifier la clé API dans Google Cloud Console
3. Vérifier les quotas: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

---

## 🔐 OBTENIR UNE CLÉ API GEMINI

### 1. Aller sur Google AI Studio
https://makersuite.google.com/app/apikey

### 2. Se connecter avec votre compte Google

### 3. Créer une clé API
- Cliquer sur **"Create API Key"**
- Sélectionner un projet Google Cloud (ou en créer un)
- La clé commence par `AIzaSy...`

### 4. Copier la clé
⚠️ **Important**: Ne jamais partager cette clé publiquement

### 5. Restrictions (optionnel mais recommandé)
Dans Google Cloud Console → API Keys:
- Restreindre par IP
- Restreindre aux APIs spécifiques
- Définir un quota journalier

---

## 🌐 SERVICES GOOGLE CLOUD ACTIVÉS

### ✅ Services testables avec API Key
1. **Generative Language API** - ✅ TESTÉ

### ⚠️ Services nécessitant OAuth2 (21)
2. Vertex AI API
3. Gemini for Google Cloud API
4. Data Analytics API with Gemini
5. Gemini Cloud Assist API
6. Gemini Code Assist Management API
7. Google Chat API
8. Dialogflow API
9. Sensitive Data Protection (DLP)
10. API Keys API
11. App Engine
12. App Optimize API
13. AI Platform Training & Prediction API
14. Data Lineage API
15. Document AI Warehouse API
16. Geocoding API
17. Google Calendar API
18. Google Play Android Developer API
19. Google Drive API
20. Google Search Console API
21. Google Tasks API
22. Photos Library API
23. Enterprise License Manager API

**Total**: 1/22 testés, 21/22 documentés

---

## 🐛 DÉPANNAGE

### "state not managed for field `secrets`"
✅ **CORRIGÉ** dans v19.2.3+
Si l'erreur persiste, redémarrer l'application.

### "API key not configured"
Configurer la clé dans Centre Gouvernance → Secrets & APIs

### "Connection timeout"
Vérifier:
1. Connexion internet
2. Firewall (port 443 ouvert)
3. Proxy (si applicable)

### "Invalid API key"
Vérifier que la clé:
1. Commence par `AIzaSy`
2. N'a pas de caractères en trop (espaces)
3. N'est pas révoquée dans Google Cloud Console

### "Quota exceeded"
Vérifier les quotas dans Google Cloud Console:
https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consulter:
- `GOOGLE_CLOUD_SERVICES_GEMINI_v∞.md` - Liste complète des 22 services
- `STATE_MANAGEMENT_FIX_REPORT.md` - Détails du bug corrigé
- `PERFECTIONNEMENT_FINAL_REPORT_v∞.md` - Rapport complet

---

## 🎯 PROCHAINES ÉTAPES

### Après test réussi
1. ✅ Configurer les autres providers (OpenAI, Anthropic, Ollama)
2. 🔄 Implémenter OAuth2 pour débloquer 21 services
3. 🚀 Intégrer Vertex AI API
4. 🎨 Support multimodal (images + audio + video)

### OAuth2 Implementation
**Priorité**: HIGH
**Délai estimé**: 1-2 jours
**Bénéfice**: Débloque 21/22 services Google Cloud

---

## ✨ SUPPORT

En cas de problème:
1. Vérifier les logs Rust: Terminal → Rechercher "Gemini"
2. Vérifier la console navigateur (F12)
3. Consulter `STATE_MANAGEMENT_FIX_REPORT.md`

---

**Prêt à tester ? Lancez `pnpm run tauri:dev` !** 🚀

---

*Guide créé par GitHub Copilot (Claude Sonnet 4.5)*
*5 décembre 2025*
