# 🎨 GUIDE D'INTÉGRATION FRONTEND
## Super Prompts #7 & #8 — Literary Engine & Anthologie Interne

**Version :** 1.0.0
**Date :** 3 décembre 2025
**Pour :** Développeurs Frontend TypeScript/React

---

## 📋 TABLE DES MATIÈRES

1. [Types TypeScript](#types-typescript)
2. [Services](#services)
3. [Hooks](#hooks)
4. [Composants UI](#composants-ui)
5. [Exemples d'utilisation](#exemples-dutilisation)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Checklist d'intégration](#checklist-dintégration)

---

## 1️⃣ TYPES TYPESCRIPT

### `src/types/literary.ts`

```typescript
// ============================================================================
// LITERARY ENGINE TYPES (Super Prompt #7)
// ============================================================================

export type LiteraryIntensity = 'sober' | 'balanced' | 'poetic';

export type TextType =
  | 'post'
  | 'book_paragraph'
  | 'poetry'
  | 'intro'
  | 'chapter'
  | 'manifesto'
  | 'web_page'
  | { other: string };

export type WritingMode =
  | 'literary_smoothing'      // Lissage littéraire
  | 'literary_enhanced'       // Version enrichie
  | 'poetic_version'          // Transformation poétique
  | 'double_version'          // Deux versions
  | 'adapt_to_medium';        // Adaptation au support

export interface LiteraryContext {
  text_type: TextType;
  intensity: LiteraryIntensity;
  target_length?: number;
}

export interface LiteraryRequest {
  context: LiteraryContext;
  draft: string;
  reference_style?: string[];
  mode: WritingMode;
}

export interface LiteraryOptimizationScores {
  narrative_structure: number;    // 0-1
  vocabulary_richness: number;    // 0-1
  imagery_quality: number;        // 0-1
  rhythm_musicality: number;      // 0-1
  message_alignment: number;      // 0-1
}

export interface LiteraryResponse {
  main_version: string;
  alternative_version?: string;
  optimization_scores: LiteraryOptimizationScores;
  comment?: string;
  style_profile_updated: boolean;
}

export interface KevinStyleProfile {
  version: string;
  last_updated: string;
  preferred_sentence_length: [number, number];
  metaphor_types: string[];
  lexical_fields: string[];
  structural_patterns: string[];
  concrete_conceptual_ratio: number;
  dominant_tones: string[];
}
```

---

### `src/types/anthology.ts`

```typescript
// ============================================================================
// ANTHOLOGY ENGINE TYPES (Super Prompt #8)
// ============================================================================

export type AnthologyLayer =
  | 'literary_fragments'
  | 'lexical_fields'
  | 'stylistic_signatures'
  | 'metaphors_images'
  | 'founding_themes'
  | 'models_methodologies'
  | 'literary_dna';

export interface AnthologyIntegrationRequest {
  text: string;
  source: string;
  author_provided_tags?: string[];
}

export interface AnthologyIntegrationResponse {
  stylistic_summary: string;
  selected_excerpts: string[];
  tags: string[];
  layer_assignments: AnthologyLayer[];
  dna_evolution_summary: string;
}

export interface LiteraryExcerpt {
  id: string;
  text: string;
  source: string;
  layers: AnthologyLayer[];
  tags: string[];
  stylistic_score: number;
  added_date: string;
}

export interface LiteraryDNA {
  version: string;
  last_updated: string;
  core_patterns: string[];
  implicit_rules: string[];
  tone_signatures: string[];
  structural_nuances: string[];
  total_texts_analyzed: number;
  dominant_metaphors: string[];
  recurring_themes: string[];
}

export interface AnthologyStatistics {
  total_excerpts: number;
  total_unique_tags: number;
  total_lexical_entries: number;
  texts_analyzed: number;
  dna_version: string;
}
```

---

## 2️⃣ SERVICES

### `src/services/literaryService.ts`

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import type {
  LiteraryRequest,
  LiteraryResponse,
  KevinStyleProfile
} from '@/types/literary';

/**
 * Service pour le Literary Engine (Super Prompt #7)
 */
export class LiteraryService {
  /**
   * Traiter du texte avec le moteur littéraire
   */
  static async processText(request: LiteraryRequest): Promise<LiteraryResponse> {
    return invoke('literary_engine_process', {
      text_type: request.context.text_type,
      intensity: request.context.intensity,
      target_length: request.context.target_length,
      draft: request.draft,
      reference_style: request.reference_style,
      mode: request.mode
    });
  }

  /**
   * Mettre à jour le profil de style avec de nouveaux textes
   */
  static async updateStyleProfile(newTexts: string[]): Promise<KevinStyleProfile> {
    return invoke('literary_engine_update_style', { new_texts: newTexts });
  }

  /**
   * Obtenir le profil de style actuel
   */
  static async getStyleProfile(): Promise<KevinStyleProfile> {
    return invoke('literary_engine_get_style_profile');
  }

  /**
   * Amélioration rapide d'un texte (lissage par défaut)
   */
  static async quickEnhance(
    text: string,
    intensity: 'sober' | 'balanced' | 'poetic' = 'balanced'
  ): Promise<string> {
    const response = await this.processText({
      context: {
        text_type: 'post',
        intensity,
      },
      draft: text,
      mode: 'literary_smoothing'
    });
    return response.main_version;
  }

  /**
   * Transformer en poésie
   */
  static async toPoetry(text: string): Promise<string> {
    const response = await this.processText({
      context: {
        text_type: 'poetry',
        intensity: 'poetic',
      },
      draft: text,
      mode: 'poetic_version'
    });
    return response.main_version;
  }

  /**
   * Générer deux versions (claire + littéraire)
   */
  static async generateDoubleVersion(
    text: string
  ): Promise<{ clear: string; literary: string }> {
    const response = await this.processText({
      context: {
        text_type: 'post',
        intensity: 'balanced',
      },
      draft: text,
      mode: 'double_version'
    });
    return {
      clear: response.main_version,
      literary: response.alternative_version || response.main_version
    };
  }
}
```

---

### `src/services/anthologyService.ts`

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import type {
  AnthologyIntegrationRequest,
  AnthologyIntegrationResponse,
  LiteraryExcerpt,
  LiteraryDNA,
  AnthologyStatistics,
  AnthologyLayer
} from '@/types/anthology';

/**
 * Service pour l'Anthologie Interne (Super Prompt #8)
 */
export class AnthologyService {
  /**
   * Intégrer un texte dans l'anthologie
   */
  static async integrateText(
    request: AnthologyIntegrationRequest
  ): Promise<AnthologyIntegrationResponse> {
    return invoke('anthology_integrate_text', {
      text: request.text,
      source: request.source,
      author_provided_tags: request.author_provided_tags
    });
  }

  /**
   * Obtenir l'ADN littéraire actuel
   */
  static async getLiteraryDNA(): Promise<LiteraryDNA> {
    return invoke('anthology_get_literary_dna');
  }

  /**
   * Rechercher des extraits par tag
   */
  static async searchByTag(tag: string): Promise<LiteraryExcerpt[]> {
    return invoke('anthology_search_by_tag', { tag });
  }

  /**
   * Rechercher des extraits par couche
   */
  static async searchByLayer(layer: AnthologyLayer): Promise<LiteraryExcerpt[]> {
    return invoke('anthology_search_by_layer', { layer });
  }

  /**
   * Obtenir les top N champs lexicaux
   */
  static async getTopLexicalFields(n: number): Promise<[string, number][]> {
    return invoke('anthology_get_top_lexical_fields', { n });
  }

  /**
   * Obtenir les statistiques de l'anthologie
   */
  static async getStatistics(): Promise<AnthologyStatistics> {
    return invoke('anthology_get_statistics');
  }

  /**
   * Ajouter un extrait de livre
   */
  static async addBookExcerpt(
    excerpt: string,
    bookTitle: string,
    chapterNumber?: number
  ): Promise<AnthologyIntegrationResponse> {
    const source = chapterNumber
      ? `${bookTitle} - Chapitre ${chapterNumber}`
      : bookTitle;

    return this.integrateText({ text: excerpt, source });
  }

  /**
   * Obtenir tous les extraits d'une source
   */
  static async getExcerptsFromSource(source: string): Promise<LiteraryExcerpt[]> {
    // Recherche par tag du nom de la source
    return this.searchByTag(source.toLowerCase());
  }
}
```

---

## 3️⃣ HOOKS

### `src/hooks/useLiteraryEngine.ts`

```typescript
import { useState, useCallback } from 'react';
import { LiteraryService } from '@/services/literaryService';
import type {
  LiteraryRequest,
  LiteraryResponse,
  KevinStyleProfile,
  LiteraryIntensity
} from '@/types/literary';

interface UseLiteraryEngineOptions {
  defaultIntensity?: LiteraryIntensity;
  autoEnhance?: boolean;
}

export function useLiteraryEngine(options: UseLiteraryEngineOptions = {}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<LiteraryResponse | null>(null);
  const [styleProfile, setStyleProfile] = useState<KevinStyleProfile | null>(null);

  const processText = useCallback(async (request: LiteraryRequest) => {
    setProcessing(true);
    setError(null);
    try {
      const response = await LiteraryService.processText(request);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const quickEnhance = useCallback(async (text: string) => {
    const intensity = options.defaultIntensity || 'balanced';
    const enhanced = await LiteraryService.quickEnhance(text, intensity);
    return enhanced;
  }, [options.defaultIntensity]);

  const toPoetry = useCallback(async (text: string) => {
    return LiteraryService.toPoetry(text);
  }, []);

  const generateDoubleVersion = useCallback(async (text: string) => {
    return LiteraryService.generateDoubleVersion(text);
  }, []);

  const updateStyleProfile = useCallback(async (newTexts: string[]) => {
    setProcessing(true);
    try {
      const profile = await LiteraryService.updateStyleProfile(newTexts);
      setStyleProfile(profile);
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const loadStyleProfile = useCallback(async () => {
    try {
      const profile = await LiteraryService.getStyleProfile();
      setStyleProfile(profile);
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    processing,
    error,
    lastResponse,
    styleProfile,
    processText,
    quickEnhance,
    toPoetry,
    generateDoubleVersion,
    updateStyleProfile,
    loadStyleProfile,
  };
}
```

---

### `src/hooks/useAnthology.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import { AnthologyService } from '@/services/anthologyService';
import type {
  AnthologyIntegrationResponse,
  LiteraryExcerpt,
  LiteraryDNA,
  AnthologyStatistics,
  AnthologyLayer
} from '@/types/anthology';

export function useAnthology() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dna, setDna] = useState<LiteraryDNA | null>(null);
  const [statistics, setStatistics] = useState<AnthologyStatistics | null>(null);

  const integrateText = useCallback(
    async (text: string, source: string, tags?: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const response = await AnthologyService.integrateText({
          text,
          source,
          author_provided_tags: tags
        });
        // Rafraîchir DNA et stats après intégration
        await Promise.all([loadDNA(), loadStatistics()]);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadDNA = useCallback(async () => {
    try {
      const dnaData = await AnthologyService.getLiteraryDNA();
      setDna(dnaData);
      return dnaData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      const stats = await AnthologyService.getStatistics();
      setStatistics(stats);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const searchByTag = useCallback(async (tag: string) => {
    setLoading(true);
    try {
      return await AnthologyService.searchByTag(tag);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByLayer = useCallback(async (layer: AnthologyLayer) => {
    setLoading(true);
    try {
      return await AnthologyService.searchByLayer(layer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopWords = useCallback(async (n: number) => {
    setLoading(true);
    try {
      return await AnthologyService.getTopLexicalFields(n);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger DNA et stats au montage
  useEffect(() => {
    loadDNA();
    loadStatistics();
  }, [loadDNA, loadStatistics]);

  return {
    loading,
    error,
    dna,
    statistics,
    integrateText,
    loadDNA,
    loadStatistics,
    searchByTag,
    searchByLayer,
    getTopWords,
  };
}
```

---

## 4️⃣ COMPOSANTS UI

### `src/components/literary/LiteraryStyleSelector.tsx`

```typescript
import React from 'react';
import type { LiteraryIntensity } from '@/types/literary';

interface LiteraryStyleSelectorProps {
  value: LiteraryIntensity;
  onChange: (intensity: LiteraryIntensity) => void;
  disabled?: boolean;
}

export function LiteraryStyleSelector({
  value,
  onChange,
  disabled = false
}: LiteraryStyleSelectorProps) {
  const options: { value: LiteraryIntensity; label: string; description: string }[] = [
    {
      value: 'sober',
      label: 'Sobre',
      description: 'Style épuré, direct, sans fioritures'
    },
    {
      value: 'balanced',
      label: 'Équilibré',
      description: 'Juste milieu entre clarté et profondeur'
    },
    {
      value: 'poetic',
      label: 'Poétique',
      description: 'Plus lyrique, images et métaphores'
    }
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Intensité littéraire</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${value === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### `src/components/anthology/AnthologyStatsDashboard.tsx`

```typescript
import React from 'react';
import type { AnthologyStatistics } from '@/types/anthology';

interface AnthologyStatsDashboardProps {
  statistics: AnthologyStatistics | null;
  loading?: boolean;
}

export function AnthologyStatsDashboard({
  statistics,
  loading = false
}: AnthologyStatsDashboardProps) {
  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  if (!statistics) {
    return null;
  }

  const stats = [
    { label: 'Extraits', value: statistics.total_excerpts, icon: '📝' },
    { label: 'Tags uniques', value: statistics.total_unique_tags, icon: '🏷️' },
    { label: 'Mots lexique', value: statistics.total_lexical_entries, icon: '📖' },
    { label: 'Textes analysés', value: statistics.texts_analyzed, icon: '📊' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Anthologie Interne</h3>
        <span className="text-sm text-gray-500">
          ADN v{statistics.dna_version}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5️⃣ EXEMPLES D'UTILISATION

### Exemple 1 : Enrichir une réponse dans le Chat

```typescript
import { useLiteraryEngine } from '@/hooks/useLiteraryEngine';

function ChatMessage({ message }: { message: string }) {
  const { quickEnhance, processing } = useLiteraryEngine({
    defaultIntensity: 'balanced'
  });
  const [enhanced, setEnhanced] = useState<string | null>(null);

  const handleEnhance = async () => {
    const result = await quickEnhance(message);
    setEnhanced(result);
  };

  return (
    <div className="message">
      <p>{enhanced || message}</p>
      <button onClick={handleEnhance} disabled={processing}>
        ✨ Enrichir
      </button>
    </div>
  );
}
```

---

### Exemple 2 : Intégrer un texte dans l'anthologie

```typescript
import { useAnthology } from '@/hooks/useAnthology';

function BookImporter() {
  const { integrateText, loading } = useAnthology();
  const [excerpt, setExcerpt] = useState('');
  const [source, setSource] = useState('');

  const handleSubmit = async () => {
    const response = await integrateText(excerpt, source, ['livre', 'kevin']);
    console.log('Intégré:', response.stylistic_summary);
    console.log('Tags:', response.tags);
    console.log('Couches:', response.layer_assignments);
  };

  return (
    <div>
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Extrait du livre..."
      />
      <input
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Source (ex: Là où tout s'éclaircit - Chapitre 3)"
      />
      <button onClick={handleSubmit} disabled={loading}>
        Ajouter à l'anthologie
      </button>
    </div>
  );
}
```

---

### Exemple 3 : Explorer l'ADN littéraire

```typescript
import { useAnthology } from '@/hooks/useAnthology';

function LiteraryDNAViewer() {
  const { dna, loading } = useAnthology();

  if (loading || !dna) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="dna-viewer">
      <h2>ADN Littéraire Kevin Thibault</h2>
      <p>Version: {dna.version}</p>
      <p>Textes analysés: {dna.total_texts_analyzed}</p>

      <section>
        <h3>Patterns dominants</h3>
        <ul>
          {dna.core_patterns.map((pattern) => (
            <li key={pattern}>{pattern}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Métaphores récurrentes</h3>
        <ul>
          {dna.dominant_metaphors.map((metaphor) => (
            <li key={metaphor}>{metaphor}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Thèmes fondateurs</h3>
        <ul>
          {dna.recurring_themes.map((theme) => (
            <li key={theme}>{theme}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

---

### Exemple 4 : Recherche dans l'anthologie

```typescript
import { useAnthology } from '@/hooks/useAnthology';

function AnthologySearcher() {
  const { searchByTag, searchByLayer } = useAnthology();
  const [results, setResults] = useState<LiteraryExcerpt[]>([]);

  const searchClarite = async () => {
    const excerpts = await searchByTag('clarté');
    setResults(excerpts);
  };

  const searchPoetry = async () => {
    const excerpts = await searchByLayer('literary_fragments');
    setResults(excerpts);
  };

  return (
    <div>
      <button onClick={searchClarite}>Rechercher "clarté"</button>
      <button onClick={searchPoetry}>Tous les fragments littéraires</button>

      <div className="results">
        {results.map((excerpt) => (
          <div key={excerpt.id} className="excerpt">
            <p>{excerpt.text}</p>
            <small>{excerpt.source}</small>
            <div className="tags">
              {excerpt.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6️⃣ MONITORING & ANALYTICS

### Dashboard des scores littéraires

```typescript
import { useState, useEffect } from 'react';
import type { LiteraryOptimizationScores } from '@/types/literary';

function LiteraryScoresDashboard({ scores }: { scores: LiteraryOptimizationScores }) {
  const metrics = [
    { key: 'narrative_structure', label: 'Structure narrative', color: 'blue' },
    { key: 'vocabulary_richness', label: 'Richesse vocabulaire', color: 'green' },
    { key: 'imagery_quality', label: 'Qualité images', color: 'purple' },
    { key: 'rhythm_musicality', label: 'Rythme & musicalité', color: 'orange' },
    { key: 'message_alignment', label: 'Alignement message', color: 'red' },
  ];

  return (
    <div className="scores-dashboard">
      <h3>Qualité littéraire</h3>
      {metrics.map((metric) => (
        <div key={metric.key} className="metric">
          <label>{metric.label}</label>
          <div className="progress-bar">
            <div
              className={`fill bg-${metric.color}-500`}
              style={{ width: `${scores[metric.key as keyof LiteraryOptimizationScores] * 100}%` }}
            />
          </div>
          <span>{(scores[metric.key as keyof LiteraryOptimizationScores] * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 7️⃣ CHECKLIST D'INTÉGRATION

### Phase 1 : Types & Services (Jour 1)

- [ ] Créer `src/types/literary.ts`
- [ ] Créer `src/types/anthology.ts`
- [ ] Créer `src/services/literaryService.ts`
- [ ] Créer `src/services/anthologyService.ts`
- [ ] Tester les appels Tauri de base

### Phase 2 : Hooks (Jour 2)

- [ ] Créer `src/hooks/useLiteraryEngine.ts`
- [ ] Créer `src/hooks/useAnthology.ts`
- [ ] Tester chargement DNA au montage
- [ ] Tester mise à jour style profile

### Phase 3 : Composants UI (Jour 3-4)

- [ ] `LiteraryStyleSelector` (sélecteur intensité)
- [ ] `AnthologyStatsDashboard` (stats anthologie)
- [ ] `LiteraryDNAViewer` (visualisation ADN)
- [ ] `AnthologySearcher` (recherche corpus)
- [ ] `LiteraryScoresDashboard` (scores qualité)

### Phase 4 : Intégration Chat (Jour 5)

- [ ] Bouton "Enrichir" dans `ChatMessage`
- [ ] Sélecteur intensité dans paramètres
- [ ] Auto-enhance optionnel (toggle)
- [ ] Indicateur de traitement littéraire

### Phase 5 : Page Anthologie (Jour 6-7)

- [ ] Page dédiée `/anthology`
- [ ] Import de textes (formulaire)
- [ ] Recherche par tags/couches
- [ ] Visualisation graphique DNA
- [ ] Export/Import corpus

### Phase 6 : Analytics (Jour 8)

- [ ] Graphique évolution ADN
- [ ] Heatmap des couches
- [ ] Distribution lexicale
- [ ] Timeline des intégrations

### Phase 7 : Tests E2E (Jour 9-10)

- [ ] Test enrichissement bout-en-bout
- [ ] Test intégration texte
- [ ] Test recherche
- [ ] Test évolution DNA
- [ ] Test performances (textes longs)

---

## 🎯 PROCHAINE ACTION

**Commencer par Phase 1 :** Créer les types et services de base. Une fois ces fondations en place, les hooks et composants UI suivront naturellement.

```bash
# Créer les fichiers types
touch src/types/literary.ts
touch src/types/anthology.ts

# Créer les services
touch src/services/literaryService.ts
touch src/services/anthologyService.ts

# Tester un premier appel
# (dans console navigateur ou composant test)
invoke('literary_engine_get_style_profile').then(console.log);
```

---

**FIN DU GUIDE D'INTÉGRATION FRONTEND**

**TITANE∞ v24.2.0 — Super Prompts #7 & #8**

*Prêt pour l'implémentation TypeScript/React.*
