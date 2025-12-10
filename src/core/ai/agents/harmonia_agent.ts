/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * AGENT HARMONIA — Emotional / Relational / Tonality
 * Calibre ton, style, cohérence expressive, fluidité conversationnelle
 * ═══════════════════════════════════════════════════════════════════
 */

import type {
  Agent,
  AgentState,
  AgentEvent,
  AgentResponse,
  AgentRole,
} from '../multi_agent_engine';

type ToneProfile = {
  warmth: number; // 0-100
  precision: number; // 0-100
  intensity: number; // 0-100
  rhythm: number; // 0-100 (slow to fast)
  formality: number; // 0-100
};

export class HarmoniaAgent implements Agent {
  id = 'harmonia';
  name = 'Harmonia';
  role: AgentRole = 'emotional';
  permissions = ['chat:tone', 'chat:style', 'chat:calibration'];

  state: AgentState = {
    status: 'idle',
    lastTick: 0,
    cycleCount: 0,
    health: 100,
    load: 0,
    errors: [],
    metrics: {},
  };

  private toneProfile: ToneProfile = {
    warmth: 70,
    precision: 85,
    intensity: 60,
    rhythm: 65,
    formality: 50,
  };

  private conversationHistory: Array<{
    role: string;
    tone: ToneProfile;
    timestamp: number;
  }> = [];

  async initialize(): Promise<void> {
    console.log('🎼 [HARMONIA] Initializing emotional calibration agent...');
    this.state.status = 'active';
    this.state.health = 100;
    this.updateMetrics();
  }

  async tick(): Promise<void> {
    this.state.cycleCount++;
    this.state.lastTick = Date.now();

    // Analyze conversation coherence
    this.analyzeCoherence();

    // Adjust tone if needed
    this.calibrateTone();

    // Update metrics
    this.updateMetrics();

    // Calculate health
    this.calculateHealth();
  }

  private analyzeCoherence(): void {
    if (this.conversationHistory.length < 2) return;

    const recent = this.conversationHistory.slice(-5);
    const variations = this.calculateToneVariations(recent);

    // Detect inconsistencies
    if (variations.warmth > 30) {
      this.emit({
        type: 'tone_inconsistency',
        source: this.id,
        timestamp: Date.now(),
        payload: { aspect: 'warmth', variation: variations.warmth },
        priority: 'medium',
      });
    }

    if (variations.intensity > 40) {
      this.emit({
        type: 'tone_inconsistency',
        source: this.id,
        timestamp: Date.now(),
        payload: { aspect: 'intensity', variation: variations.intensity },
        priority: 'medium',
      });
    }
  }

  private calculateToneVariations(history: typeof this.conversationHistory): ToneProfile {
    if (history.length === 0)
      return { warmth: 0, precision: 0, intensity: 0, rhythm: 0, formality: 0 };

    const ranges: ToneProfile = {
      warmth: 0,
      precision: 0,
      intensity: 0,
      rhythm: 0,
      formality: 0,
    };

    for (const key of Object.keys(ranges) as Array<keyof ToneProfile>) {
      const values = history.map(h => h.tone[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      ranges[key] = max - min;
    }

    return ranges;
  }

  private calibrateTone(): void {
    // Gradually adjust tone toward ideal profile
    const ideal: ToneProfile = {
      warmth: 70,
      precision: 85,
      intensity: 60,
      rhythm: 65,
      formality: 50,
    };

    for (const key of Object.keys(this.toneProfile) as Array<keyof ToneProfile>) {
      const current = this.toneProfile[key];
      const target = ideal[key];
      const diff = target - current;

      // Move 10% toward target each tick
      this.toneProfile[key] = current + diff * 0.1;
    }
  }

  private updateMetrics(): void {
    this.state.metrics = {
      warmth: this.toneProfile.warmth,
      precision: this.toneProfile.precision,
      intensity: this.toneProfile.intensity,
      rhythm: this.toneProfile.rhythm,
      formality: this.toneProfile.formality,
      conversationLength: this.conversationHistory.length,
    };
  }

  private calculateHealth(): void {
    // Health based on tone consistency
    const variations = this.calculateToneVariations(this.conversationHistory.slice(-10));
    const avgVariation = Object.values(variations).reduce((a, b) => a + b, 0) / 5;

    // Low variation = high health
    this.state.health = Math.max(0, 100 - avgVariation);
    this.state.load = Math.min(100, this.conversationHistory.length / 10);
  }

  async handle(event: AgentEvent): Promise<AgentResponse> {
    if (event.type === 'analyze_message') {
      const message = event.payload as { role: string; content: string };
      const tone = this.analyzeTone(message.content);

      this.conversationHistory.push({
        role: message.role,
        tone,
        timestamp: Date.now(),
      });

      // Keep only last 50 messages
      if (this.conversationHistory.length > 50) {
        this.conversationHistory.shift();
      }

      return {
        success: true,
        data: { tone, suggestions: this.generateSuggestions(tone) },
      };
    }

    if (event.type === 'get_tone_profile') {
      return {
        success: true,
        data: this.toneProfile,
      };
    }

    return { success: false, error: 'Unknown event type' };
  }

  private analyzeTone(content: string): ToneProfile {
    // Simple heuristic analysis (in real impl, use NLP)
    const length = content.length;
    const exclamations = (content.match(/!/g) || []).length;
    const _questions = (content.match(/\?/g) || []).length;
    const formalWords = (content.match(/\b(donc|ainsi|néanmoins|toutefois)\b/gi) || [])
      .length;

    return {
      warmth: Math.min(100, 50 + exclamations * 10),
      precision: Math.min(100, 70 + (length > 200 ? 20 : 0)),
      intensity: Math.min(100, 40 + exclamations * 15),
      rhythm: Math.min(100, length < 100 ? 80 : 60),
      formality: Math.min(100, 30 + formalWords * 15),
    };
  }

  private generateSuggestions(tone: ToneProfile): string[] {
    const suggestions: string[] = [];

    if (tone.warmth < 40) {
      suggestions.push("Augmenter la chaleur du ton (utiliser plus d'empathie)");
    }

    if (tone.precision < 60) {
      suggestions.push('Améliorer la précision (être plus spécifique)');
    }

    if (tone.intensity > 80) {
      suggestions.push("Réduire l'intensité (adopter un ton plus mesuré)");
    }

    return suggestions;
  }

  emit(event: AgentEvent): void {
    console.log(`🎼 [HARMONIA] Emitting event: ${event.type}`);
  }

  async pause(): Promise<void> {
    this.state.status = 'paused';
    console.log('⏸️  [HARMONIA] Paused');
  }

  async resume(): Promise<void> {
    this.state.status = 'active';
    console.log('▶️  [HARMONIA] Resumed');
  }

  async shutdown(): Promise<void> {
    this.state.status = 'idle';
    console.log('🔻 [HARMONIA] Shutdown');
  }

  getHealth(): number {
    return this.state.health;
  }

  getMetrics(): Record<string, number> {
    return this.state.metrics;
  }
}
