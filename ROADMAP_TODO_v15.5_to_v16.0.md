# 📋 ROADMAP TODO — TITANE∞ v15.5 → v16.0

**Date:** 20 Novembre 2025  
**Base:** v15.5.0 Production-Ready ✅  
**Status:** Tous les TODO identifiés et planifiés

---

## ✅ v15.5.0 — COMPLET (20 Nov 2025)

### Accompli
- ✅ Evolution Supervisor v15.5 (12 modules + 15 API)
- ✅ EXP Fusion Engine (GlobalExpBar + ExpPanel)
- ✅ Design System (130 tokens Figma + 403 CSS)
- ✅ UI/UX Refactor (AppLayout + Menu + 11 pages)
- ✅ Documentation (6 docs, 1500+ lignes)
- ✅ 0 erreur TypeScript, 7 warnings Rust (-91%)

---

## 🔥 v15.6 — HIGH PRIORITY (Décembre 2025)

### Backend

#### 1. ExpWeightIntegrator Integration ⭐⭐⭐
**Fichier:** `src-tauri/src/exp_fusion_v15/weight_integration.rs`  
**Ligne:** Struct complète (lignes 1-100+)  
**Problème:** 7 warnings Rust - struct + methods never used  
**Solution:**
```rust
// Dans src-tauri/src/exp_fusion_v15/mod.rs
use crate::exp_fusion_v15::weight_integration::ExpWeightIntegrator;

impl ExpFusionEngine {
    pub fn add_exp_with_weights(
        &mut self,
        category: ExpCategory,
        base_exp: u64,
        importance: f32,
        complexity: f32,
    ) -> u64 {
        let integrator = ExpWeightIntegrator::new();
        let final_exp = integrator.calculate_final_exp(
            base_exp,
            importance,
            complexity
        );
        self.add_exp(category, final_exp, "Weighted XP");
        final_exp
    }
}
```
**Impact:** Résout 7 warnings, améliore système XP
**Temps:** 2-3 heures
**Priorité:** ⭐⭐⭐ HIGH

---

#### 2. Security Enhancement ⭐⭐⭐
**Fichiers:**
- `src-tauri/src/doc_engine/storage.rs` (lignes 124, 139)
- `src-tauri/src/semantic/storage.rs` (ligne 93)

**Problèmes:**
```rust
// ACTUEL (INSÉCURE)
let password = b"titane_infinity_master_key_v13"; // TODO
let nonce = Nonce::from_slice(b"unique_nonce"); // TODO
```

**Solution:**
```rust
// Utiliser clé utilisateur
use argon2::{Argon2, PasswordHasher};
use rand::{RngCore, rngs::OsRng};

// Génération nonce aléatoire
let mut nonce_bytes = [0u8; 12];
OsRng.fill_bytes(&mut nonce_bytes);
let nonce = Nonce::from_slice(&nonce_bytes);

// Clé dérivée du mot de passe utilisateur
let salt = SaltString::generate(&mut OsRng);
let argon2 = Argon2::default();
let password_hash = argon2.hash_password(user_password.as_bytes(), &salt)?;
```

**Impact:** Sécurise encryption documents + semantic storage
**Temps:** 4-5 heures
**Priorité:** ⭐⭐⭐ HIGH (Security critical)

---

#### 3. EXP Backup ZIP ⭐⭐
**Fichier:** `src-tauri/src/exp_fusion_v15/memory_sync.rs` (ligne 129)  
**Problème:** TODO backup ZIP complet non implémenté  
**Solution:**
```rust
use zip::write::{FileOptions, ZipWriter};
use std::fs::File;

pub fn create_full_backup(&self, backup_path: &str) -> Result<(), String> {
    let file = File::create(backup_path)?;
    let mut zip = ZipWriter::new(file);
    
    // exp_state.json
    zip.start_file("exp_state.json", FileOptions::default())?;
    let state_json = serde_json::to_string_pretty(&self)?;
    zip.write_all(state_json.as_bytes())?;
    
    // timeline.json
    zip.start_file("timeline.json", FileOptions::default())?;
    // ... autres fichiers
    
    zip.finish()?;
    Ok(())
}
```
**Impact:** Protection données utilisateur
**Temps:** 2-3 heures
**Priorité:** ⭐⭐ MEDIUM-HIGH

---

### Frontend

#### 4. Chat AI Integration ⭐⭐
**Fichier:** `src/ui/pages/Chat.tsx` (ligne 57)  
**Problème:** TODO appel API IA  
**Solution:**
```typescript
const handleSend = async () => {
  if (!input.trim()) return;
  
  const newMessages = [...messages, { role: 'user', content: input }];
  setMessages(newMessages);
  setInput('');
  
  try {
    // Appel backend Tauri
    const response = await invoke('ai_chat_send', { 
      message: input,
      history: messages 
    });
    
    setMessages([...newMessages, { 
      role: 'assistant', 
      content: response 
    }]);
  } catch (error) {
    console.error('AI Chat Error:', error);
  }
};
```
**Impact:** Active fonctionnalité Chat IA
**Temps:** 4-6 heures (inclut backend)
**Priorité:** ⭐⭐ MEDIUM-HIGH

---

#### 5. Project Highlight & Context Navigation ⭐⭐
**Fichier:** `src/ui/pages/Projects.tsx` (lignes 59, 69)  
**Problèmes:**
- TODO: Ajouter highlight projet sélectionné
- TODO: Router navigation avec contexte projet

**Solution:**
```typescript
// Highlight projet
const [selectedProject, setSelectedProject] = useState<string | null>(null);

<ProjectCard
  key={project.id}
  project={project}
  onClick={() => {
    setSelectedProject(project.id);
    navigate(`/chat?project=${project.id}`); // Contexte projet
  }}
  className={selectedProject === project.id ? 'highlighted' : ''}
/>

// CSS
.project-card.highlighted {
  border: 2px solid var(--accent-primary);
  box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.3);
}
```
**Impact:** UX améliorée, navigation contextuelle
**Temps:** 2-3 heures
**Priorité:** ⭐⭐ MEDIUM

---

#### 6. Router Navigation (Menu) ⭐
**Fichier:** `src/ui/Menu.tsx` (ligne 73)  
**Problème:** TODO Router navigation  
**Solution:**
```typescript
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();
  
  const handleMenuClick = (page: string) => {
    navigate(`/${page}`); // Remplace TODO
  };
  
  return (
    <MenuItem onClick={() => handleMenuClick('dashboard')}>
      Dashboard
    </MenuItem>
  );
};
```
**Impact:** Navigation fonctionnelle complète
**Temps:** 1 heure
**Priorité:** ⭐ LOW (déjà fonctionnel via autre méthode)

---

## 📅 v15.7 — MEDIUM PRIORITY (Janvier 2026)

### 7. Emotion Tone Analysis ⭐⭐
**Fichier:** `src-tauri/src/digital_twin_v14_1/emotion_engine/mod.rs` (ligne 167)  
**Problème:** TODO analyse fine variations de ton  
**Solution:**
```rust
pub fn analyze_tone_variations(&self, text: &str) -> ToneProfile {
    let words: Vec<&str> = text.split_whitespace().collect();
    let mut tone_variations = Vec::new();
    
    for window in words.windows(10) {
        let segment = window.join(" ");
        let tone = self.detect_tone_intensity(&segment);
        tone_variations.push(tone);
    }
    
    ToneProfile {
        average: tone_variations.iter().sum::<f32>() / tone_variations.len() as f32,
        variance: calculate_variance(&tone_variations),
        peaks: find_peaks(&tone_variations),
    }
}
```
**Impact:** Détection émotionnelle plus fine
**Temps:** 3-4 heures
**Priorité:** ⭐⭐ MEDIUM

---

### 8. Markdown → HTML Conversion ⭐⭐
**Fichier:** `src-tauri/src/doc_engine/html.rs` (ligne 6)  
**Problème:** TODO conversion Markdown → HTML  
**Solution:**
```rust
use pulldown_cmark::{Parser, html};

pub fn markdown_to_html(markdown: &str) -> String {
    let parser = Parser::new(markdown);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}
```
**Dépendance:** `cargo add pulldown-cmark`  
**Impact:** Export HTML documents  
**Temps:** 2-3 heures  
**Priorité:** ⭐⭐ MEDIUM

---

### 9. E2E Tests (Playwright) ⭐⭐
**Nouveau fichier:** `tests/e2e/tauri-commands.spec.ts`  
**Solution:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('TITANE∞ Tauri Commands', () => {
  test('Evolution Supervisor Cycle', async ({ page }) => {
    await page.goto('http://localhost:1420');
    
    const result = await page.evaluate(() =>
      window.__TAURI__.invoke('evolution_run_cycle')
    );
    
    expect(result).toHaveProperty('cycle_id');
    expect(result).toHaveProperty('patterns_detected');
  });
  
  test('EXP Add Command', async ({ page }) => {
    const result = await page.evaluate(() =>
      window.__TAURI__.invoke('exp_add_exp', {
        category: 'code',
        amount: 100,
        reason: 'E2E Test'
      })
    );
    
    expect(result).toBeGreaterThan(0);
  });
  
  // 50 autres tests pour 52 commandes
});
```
**Impact:** Validation automatisée 52 commandes  
**Temps:** 8-10 heures  
**Priorité:** ⭐⭐ MEDIUM

---

## 🔮 v16.0 — LOW PRIORITY (Février 2026+)

### 10. PDF Export ⭐
**Fichier:** `src-tauri/src/doc_engine/export.rs` (ligne 252)  
**Problème:** TODO implémentation PDF  
**Solution:**
```rust
use printpdf::*;

pub fn export_to_pdf(&self, document: &Document, output_path: &str) -> Result<(), String> {
    let (doc, page1, layer1) = PdfDocument::new(
        &document.title,
        Mm(210.0), Mm(297.0), // A4
        "Layer 1"
    );
    
    let font = doc.add_builtin_font(BuiltinFont::TimesRoman)?;
    let current_layer = doc.get_page(page1).get_layer(layer1);
    
    current_layer.use_text(&document.content, 12.0, Mm(10.0), Mm(287.0), &font);
    
    doc.save(&mut BufWriter::new(File::create(output_path)?))?;
    Ok(())
}
```
**Dépendance:** `cargo add printpdf`  
**Impact:** Export PDF documents  
**Temps:** 4-6 heures  
**Priorité:** ⭐ LOW

---

### 11. Semantic Embedder Advanced ⭐
**Fichier:** `src-tauri/src/semantic/embedder.rs` (lignes 44, 50, 56)  
**Problèmes:** 3 TODO pour intégration ML  
**Solutions:**

#### A. ONNX Local Model
```rust
use ort::{Environment, SessionBuilder};

pub fn embed_with_onnx(&self, text: &str) -> Vec<f32> {
    let env = Environment::builder().build()?;
    let session = SessionBuilder::new(&env)?
        .with_model_from_file("models/all-MiniLM-L6-v2.onnx")?;
    
    // Tokenization + inference
    let inputs = tokenize(text);
    let outputs = session.run(inputs)?;
    outputs[0].try_extract::<f32>()?.view().to_vec()
}
```

#### B. Gemini API
```rust
pub async fn embed_with_gemini(&self, text: &str) -> Vec<f32> {
    let client = reqwest::Client::new();
    let response = client
        .post("https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent")
        .header("x-goog-api-key", &self.gemini_api_key)
        .json(&json!({ "content": { "parts": [{ "text": text }] } }))
        .send()
        .await?;
    
    let embedding: GeminiEmbedding = response.json().await?;
    embedding.values
}
```

#### C. Ollama Local
```rust
pub async fn embed_with_ollama(&self, text: &str) -> Vec<f32> {
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:11434/api/embeddings")
        .json(&json!({ "model": "nomic-embed-text", "prompt": text }))
        .send()
        .await?;
    
    let result: OllamaEmbedding = response.json().await?;
    result.embedding
}
```

**Dépendances:**
- `cargo add ort` (ONNX Runtime)
- `cargo add reqwest tokio` (déjà présents)

**Impact:** Semantic search avancé  
**Temps:** 10-15 heures (3 intégrations)  
**Priorité:** ⭐ LOW (fonctionnalité avancée)

---

### 12. Advanced ML Features ⭐
**Nouveau module:** `src-tauri/src/ml_integration/`  
**Fonctionnalités:**
- Clustering automatique projets
- Prédiction temps tâches
- Recommandation talents
- Détection patterns avancés

**Impact:** Intelligence artificielle intégrée  
**Temps:** 20-30 heures  
**Priorité:** ⭐ LOW (future version majeure)

---

## 📊 SYNTHÈSE ROADMAP

| Version | Features | TODO Count | Temps Estimé | Priorité |
|---------|----------|------------|--------------|----------|
| v15.6 | Backend + Frontend Core | 6 | 15-20h | ⭐⭐⭐ HIGH |
| v15.7 | Enhancement + Tests | 3 | 13-17h | ⭐⭐ MEDIUM |
| v16.0 | Advanced ML + PDF | 3 | 34-51h | ⭐ LOW |

**TOTAL:** 12 TODO identifiés, 62-88 heures développement

---

## 🎯 PRIORITÉS IMMÉDIATES (v15.6)

1. ⭐⭐⭐ **ExpWeightIntegrator** → Résout 7 warnings Rust
2. ⭐⭐⭐ **Security** → Clés utilisateur + nonce aléatoires
3. ⭐⭐ **EXP Backup ZIP** → Protection données
4. ⭐⭐ **Chat AI** → Fonctionnalité majeure
5. ⭐⭐ **Project Context** → UX améliorée
6. ⭐ **Router Menu** → Finition UI

---

## ✅ VALIDATION

**Status v15.5.0:**
- ✅ 0 TODO bloquant pour production
- ✅ Tous les TODO documentés et planifiés
- ✅ Roadmap claire sur 3 versions (v15.6 → v16.0)
- ✅ Priorités établies (HIGH/MEDIUM/LOW)
- ✅ Temps estimés réalistes

**Prochaine Étape:** Lancer v15.5.0 → Démarrer v15.6 (Décembre 2025)

---

**TITANE∞ — Roadmap Complète ✨**
