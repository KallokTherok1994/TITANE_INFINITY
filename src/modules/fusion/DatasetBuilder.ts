/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ DATASET BUILDER v∞
 *   Construction JSONL optimisé pour TITANE-LOCAL (Llama 3.1 Fine-Tuning)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Module spécialisé dans la construction de datasets d'entraînement
 * avec compression cognitive, formatage optimal, et validation.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type { FusionEntry, TitaneEngineCluster } from './FusionEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DatasetBuildConfig {
  format: 'jsonl' | 'json' | 'csv';
  includeMetadata: boolean;
  maxTokensPerEntry: number;
  minTokensPerEntry: number;
  targetTotalTokens: number;
  enablePromptVariations: boolean;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  systemPrompt?: string;
}

export interface JSONLEntry {
  prompt: string;
  response: string;
  metadata?: {
    cluster?: TitaneEngineCluster;
    sources?: string[];
    quality?: number;
    importance?: number;
    tokens?: number;
  };
}

export interface DatasetPackage {
  dataset: string; // JSONL content
  modelfile: string; // Ollama Modelfile
  trainingScript: string; // Shell script
  metadata: string; // JSON metadata
  stats: {
    totalEntries: number;
    totalTokens: number;
    avgTokensPerEntry: number;
    byClusters: Record<TitaneEngineCluster, number>;
    sizeInMB: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATASET BUILDER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class DatasetBuilder {
  private config: DatasetBuildConfig;

  constructor(config?: Partial<DatasetBuildConfig>) {
    this.config = {
      format: 'jsonl',
      includeMetadata: false,
      maxTokensPerEntry: 2048,
      minTokensPerEntry: 50,
      targetTotalTokens: 100000,
      enablePromptVariations: true,
      compressionLevel: 'high',
      systemPrompt: `Tu es TITANE∞, une intelligence artificielle avancée spécialisée dans l'auto-amélioration, l'apprentissage continu et la résolution de problèmes complexes.`,
      ...config,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BUILD DATASET
  // ═══════════════════════════════════════════════════════════════════════

  buildDataset(entries: FusionEntry[]): string {
    const processedEntries: JSONLEntry[] = [];

    for (const entry of entries) {
      // Vérifier tokens
      const tokens = this.estimateTokens(entry.prompt + entry.response);

      if (
        tokens < this.config.minTokensPerEntry ||
        tokens > this.config.maxTokensPerEntry
      ) {
        continue; // Skip
      }

      // Créer entrée JSONL
      const jsonlEntry: JSONLEntry = {
        prompt: this.formatPrompt(entry.prompt),
        response: this.formatResponse(entry.response),
      };

      // Ajouter metadata si activé
      if (this.config.includeMetadata) {
        jsonlEntry.metadata = {
          cluster: entry.cluster,
          sources: entry.sources,
          quality: entry.metadata?.quality,
          importance: entry.metadata?.importance,
          tokens,
        };
      }

      processedEntries.push(jsonlEntry);

      // Ajouter variations si activé
      if (this.config.enablePromptVariations) {
        const variations = this.generatePromptVariations(entry);
        processedEntries.push(...variations);
      }
    }

    // Compresser si nécessaire
    if (this.config.compressionLevel !== 'none') {
      return this.compressDataset(processedEntries);
    }

    // Export JSONL
    return processedEntries.map(e => JSON.stringify(e)).join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FORMATAGE PROMPT/RESPONSE
  // ═══════════════════════════════════════════════════════════════════════

  private formatPrompt(prompt: string): string {
    // Nettoyer prompt
    let formatted = prompt.trim();

    // Retirer préfixes inutiles
    formatted = formatted.replace(/^(Question:|Prompt:|User:)\s*/i, '');

    // Normaliser ponctuation
    if (
      !formatted.endsWith('?') &&
      !formatted.endsWith('.') &&
      !formatted.endsWith(':')
    ) {
      formatted += '.';
    }

    return formatted;
  }

  private formatResponse(response: string): string {
    // Nettoyer response
    let formatted = response.trim();

    // Retirer préfixes inutiles
    formatted = formatted.replace(/^(Réponse:|Answer:|Assistant:)\s*/i, '');

    // Retirer emojis excessifs (garder structure)
    formatted = formatted.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]{3,}/gu,
      ''
    );

    // Normaliser espaces
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GÉNÉRATION VARIATIONS
  // ═══════════════════════════════════════════════════════════════════════

  private generatePromptVariations(entry: FusionEntry): JSONLEntry[] {
    const variations: JSONLEntry[] = [];
    const basePrompt = entry.prompt;
    const response = entry.response;

    // Variation 1: Question directe
    if (!basePrompt.includes('?')) {
      variations.push({
        prompt: `Explique-moi : ${basePrompt}`,
        response,
      });
    }

    // Variation 2: Contexte TITANE∞
    if (basePrompt.length < 200) {
      variations.push({
        prompt: `Dans le contexte de TITANE∞, ${basePrompt.toLowerCase()}`,
        response,
      });
    }

    // Variation 3: Style instructionnel
    variations.push({
      prompt: `Détaille comment ${basePrompt.replace(/^(Comment|Pourquoi|Que|Qu'est-ce)/i, '')}`,
      response,
    });

    // Limiter à 2 variations max
    return variations.slice(0, 2);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COMPRESSION DATASET
  // ═══════════════════════════════════════════════════════════════════════

  private compressDataset(entries: JSONLEntry[]): string {
    const compressionLevel = this.config.compressionLevel;

    if (compressionLevel === 'low') {
      // Compression légère: retirer metadata uniquement
      return entries
        .map(e => JSON.stringify({ prompt: e.prompt, response: e.response }))
        .join('\n');
    }

    if (compressionLevel === 'medium') {
      // Compression moyenne: raccourcir responses longues
      return entries
        .map(e => {
          const compressed = {
            prompt: e.prompt,
            response: this.compressText(e.response, 0.8),
          };
          return JSON.stringify(compressed);
        })
        .join('\n');
    }

    if (compressionLevel === 'high') {
      // Compression haute: tout compresser
      return entries
        .map(e => {
          const compressed = {
            prompt: this.compressText(e.prompt, 0.9),
            response: this.compressText(e.response, 0.7),
          };
          return JSON.stringify(compressed);
        })
        .join('\n');
    }

    return entries.map(e => JSON.stringify(e)).join('\n');
  }

  private compressText(text: string, ratio: number): string {
    // Compression sémantique simple
    const lines = text.split('\n');
    const targetLength = Math.ceil(lines.length * ratio);

    // Garder lignes les plus importantes (début + fin)
    const startLines = Math.ceil(targetLength / 2);
    const endLines = targetLength - startLines;

    const compressed = [
      ...lines.slice(0, startLines),
      ...(targetLength < lines.length ? ['...'] : []),
      ...lines.slice(-endLines),
    ].join('\n');

    return compressed;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BUILD TRAINING PACKAGE
  // ═══════════════════════════════════════════════════════════════════════

  buildTrainingPackage(entries: FusionEntry[]): DatasetPackage {
    const dataset = this.buildDataset(entries);
    const modelfile = this.generateModelfile();
    const trainingScript = this.generateTrainingScript();
    const metadata = this.generateMetadata(entries);
    const stats = this.calculateStats(entries);

    return {
      dataset,
      modelfile,
      trainingScript,
      metadata,
      stats,
    };
  }

  private generateModelfile(): string {
    return `# ═══════════════════════════════════════════════════════════════════
# TITANE∞ LOCAL — Modelfile Ollama
# Llama 3.1 Fine-tuned sur dataset TITANE∞
# ═══════════════════════════════════════════════════════════════════

FROM llama3.1

# System Prompt
SYSTEM """${this.config.systemPrompt}"""

# Training dataset
ADAPTER ./dataset.jsonl

# Parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 4096

# Template
TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>

{{ .System }}<|eot_id|>{{ end }}{{ if .Prompt }}<|start_header_id|>user<|end_header_id|>

{{ .Prompt }}<|eot_id|>{{ end }}<|start_header_id|>assistant<|end_header_id|>

{{ .Response }}<|eot_id|>"""

# Message
MESSAGE assistant """Bonjour ! Je suis TITANE∞ LOCAL, prêt à t'assister."""
`;
  }

  private generateTrainingScript(): string {
    return `#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# TITANE∞ LOCAL TRAINING — Fine-tuning Llama 3.1
# ═══════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "   TITANE∞ LOCAL TRAINING v∞"
echo "   Fine-tuning Llama 3.1 avec dataset TITANE∞"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Vérifier Ollama installé
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama non installé. Installation:"
    echo "   curl -fsSL https://ollama.com/install.sh | sh"
    exit 1
fi

# Vérifier fichiers
if [ ! -f "dataset.jsonl" ]; then
    echo "❌ dataset.jsonl not found"
    exit 1
fi
echo "✅ Dataset found ($(wc -l < dataset.jsonl) entries)"

if [ ! -f "Modelfile" ]; then
    echo "❌ Modelfile not found"
    exit 1
fi
echo "✅ Modelfile found"

# Pull Llama 3.1
echo ""
echo "📥 Pulling base model llama3.1..."
ollama pull llama3.1

# Create fine-tuned model
echo ""
echo "🧠 Creating TITANE-LOCAL model..."
ollama create titane-local -f Modelfile

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "   ✅ TITANE-LOCAL CRÉÉ AVEC SUCCÈS"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "Utilisation:"
echo "  ollama run titane-local"
echo ""
echo "Stats:"
echo "  Model: titane-local"
echo "  Base: llama3.1"
echo "  Dataset: $(wc -l < dataset.jsonl) entries"
echo "  Size: $(du -h Modelfile | cut -f1)"
echo ""
`;
  }

  private generateMetadata(entries: FusionEntry[]): string {
    const stats = this.calculateStats(entries);

    return JSON.stringify(
      {
        name: 'TITANE∞ Fusion Dataset',
        version: '∞',
        created: new Date().toISOString(),
        model: 'llama3.1',
        config: this.config,
        stats,
      },
      null,
      2
    );
  }

  private calculateStats(entries: FusionEntry[]): DatasetPackage['stats'] {
    const totalTokens = entries.reduce(
      (sum, e) => sum + this.estimateTokens(e.prompt + e.response),
      0
    );

    const byClusters: Partial<Record<TitaneEngineCluster, number>> = {};
    for (const entry of entries) {
      byClusters[entry.cluster] = (byClusters[entry.cluster] || 0) + 1;
    }

    return {
      totalEntries: entries.length,
      totalTokens,
      avgTokensPerEntry: Math.round(totalTokens / entries.length),
      byClusters: byClusters as Record<TitaneEngineCluster, number>,
      sizeInMB: this.estimateSizeInMB(entries),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private estimateTokens(text: string): number {
    return Math.round(text.length / 4); // ~4 chars = 1 token
  }

  private estimateSizeInMB(entries: FusionEntry[]): number {
    const jsonString = JSON.stringify(entries);
    return jsonString.length / (1024 * 1024);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const datasetBuilder = new DatasetBuilder();
export default datasetBuilder;
