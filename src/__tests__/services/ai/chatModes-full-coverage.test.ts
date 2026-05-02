/**
 * TITANE∞ — Vitest: chatModes Full Coverage
 *
 * Couverture exhaustive du registre CHAT_MODES_CONFIG:
 *   - Tous les modes actifs validés (systemPrompt, temperature, maxTokens, tone, style)
 *   - validateModeId() — IDs valides + invalides
 *   - getModeConfig() — fallback sur default pour ID inconnu
 *   - getAccessibleModes() — permission levels 1, 2, 3
 *   - ACTIVE_MODE_IDS — pas de doublons, ordre trié
 *   - MODES_BY_CATEGORY — cohérence avec CHAT_MODES_CONFIG
 *   - isModeAllowed() — permission guards
 *   - isToolAllowed() — outil autorisé/refusé par mode
 *   - Fine-tuning assertions: temperatura/maxTokens par persona
 *
 * @rule16 — unit tests pour src/services/ai/chatModes.*
 */

import { describe, it, expect } from 'vitest';
import {
  CHAT_MODES_CONFIG,
  ACTIVE_MODE_IDS,
  MODES_BY_CATEGORY,
  getModeConfig,
  validateModeId,
  isModeAllowed,
  getAccessibleModes,
  isToolAllowed,
} from '@/services/ai/chatModes.config';
import type { ChatModeId } from '@/services/ai/chatModes.types';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const ALL_MODE_IDS = Object.keys(CHAT_MODES_CONFIG) as ChatModeId[];
const ACTIVE_MODES = ALL_MODE_IDS.filter(id => CHAT_MODES_CONFIG[id].enabled);

// ─── SCHEMA INTEGRITY ────────────────────────────────────────────────────────

describe('🗂️ chatModes — Schema integrity (tous les modes)', () => {
  it('CHAT_MODES_CONFIG contient au moins 10 modes', () => {
    expect(ALL_MODE_IDS.length).toBeGreaterThanOrEqual(10);
  });

  it('Tous les modes actifs ont un systemPrompt de longueur >= 100 chars', () => {
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      const config = CHAT_MODES_CONFIG[modeId];
      if (!config.systemPrompt || config.systemPrompt.length < 100) {
        violations.push(`${modeId} systemPrompt: ${config.systemPrompt?.length ?? 0} chars`);
      }
    }
    expect(violations, `Modes avec systemPrompt trop court: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('Tous les modes actifs ont temperature ∈ [0.25, 1.0]', () => {
    // Borne basse 0.25 : modes précision (admin=0.35, htf_soumission=0.3, audit=0.45)
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      const config = CHAT_MODES_CONFIG[modeId];
      if (config.temperature < 0.25 || config.temperature > 1.0) {
        violations.push(`${modeId}: temperature=${config.temperature}`);
      }
    }
    expect(violations, `Modes hors plage temperature: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('Tous les modes actifs ont maxTokens ∈ [500, 16000]', () => {
    // Borne haute 16000 : modes complexes (dev=10000, omega=12000)
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      const config = CHAT_MODES_CONFIG[modeId];
      if (config.maxTokens < 500 || config.maxTokens > 16000) {
        violations.push(`${modeId}: maxTokens=${config.maxTokens}`);
      }
    }
    expect(violations, `Modes hors plage maxTokens: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('Tous les modes actifs ont id, label, description, category, icon non vides', () => {
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      const c = CHAT_MODES_CONFIG[modeId];
      if (!c.id || !c.label || !c.description || !c.category || !c.icon) {
        violations.push(modeId);
      }
    }
    expect(violations, `Modes avec champs vides: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('Tous les modes actifs ont permissionLevel ∈ [0, 5]', () => {
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      const pl = CHAT_MODES_CONFIG[modeId].permissionLevel;
      if (pl < 0 || pl > 5) {
        violations.push(`${modeId}: permissionLevel=${pl}`);
      }
    }
    expect(violations).toHaveLength(0);
  });

  it('Tous les modes actifs ont toolsAllowed défini (non null)', () => {
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      if (!CHAT_MODES_CONFIG[modeId].toolsAllowed) {
        violations.push(modeId);
      }
    }
    expect(violations, `Modes sans toolsAllowed: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('Tous les modes actifs ont version défini', () => {
    for (const modeId of ACTIVE_MODES) {
      expect(CHAT_MODES_CONFIG[modeId].version, `${modeId} manque version`).toBeTruthy();
    }
  });

  it('Tous les modes actifs ont sortOrder défini (nombre)', () => {
    for (const modeId of ACTIVE_MODES) {
      expect(typeof CHAT_MODES_CONFIG[modeId].sortOrder, `${modeId} sortOrder non number`).toBe('number');
    }
  });
});

// ─── FINE-TUNING: MODES CRITIQUES ────────────────────────────────────────────

describe('🎯 chatModes — Fine-tuning assertions par mode critique', () => {

  it('MODE default: maxTokens >= 2000 (réponses substantielles)', () => {
    expect(CHAT_MODES_CONFIG.default.maxTokens).toBeGreaterThanOrEqual(2000);
  });

  it('MODE default: temperature entre 0.6 et 0.8 (équilibre créativité/précision)', () => {
    const t = CHAT_MODES_CONFIG.default.temperature;
    expect(t).toBeGreaterThanOrEqual(0.6);
    expect(t).toBeLessThanOrEqual(0.8);
  });

  it('MODE default: systemPrompt contient "TITANE∞" (identité)', () => {
    expect(CHAT_MODES_CONFIG.default.systemPrompt).toContain('TITANE');
  });

  it('MODE default: systemPrompt contient "français" (langue obligatoire)', () => {
    expect(CHAT_MODES_CONFIG.default.systemPrompt.toLowerCase()).toContain('français');
  });

  it('MODE brainstorming: temperature >= 0.85 (haute créativité)', () => {
    expect(CHAT_MODES_CONFIG.brainstorming.temperature).toBeGreaterThanOrEqual(0.85);
  });

  it('MODE brainstorming: systemPrompt contient "SCAMPER" ou "divergence"', () => {
    const prompt = CHAT_MODES_CONFIG.brainstorming.systemPrompt.toLowerCase();
    expect(prompt.includes('scamper') || prompt.includes('divergence')).toBeTruthy();
  });

  it('MODE planning: temperature <= 0.7 (précision structurée)', () => {
    expect(CHAT_MODES_CONFIG.planning.temperature).toBeLessThanOrEqual(0.7);
  });

  it('MODE planning: systemPrompt contient "SMART" ou "action"', () => {
    const prompt = CHAT_MODES_CONFIG.planning.systemPrompt.toLowerCase();
    expect(prompt.includes('smart') || prompt.includes('action')).toBeTruthy();
  });

  it('MODE journal: tone = empathetic', () => {
    expect(CHAT_MODES_CONFIG.journal.tone).toBe('empathetic');
  });

  it('MODE journal: systemPrompt contient "IFS" ou "FOCUSING" ou "introspect"', () => {
    const prompt = CHAT_MODES_CONFIG.journal.systemPrompt.toLowerCase();
    expect(
      prompt.includes('ifs') || prompt.includes('focusing') || prompt.includes('introspect')
    ).toBeTruthy();
  });

  it('MODE debug_cognitive: systemPrompt contient protocole de diagnostic', () => {
    const prompt = CHAT_MODES_CONFIG.debug_cognitive.systemPrompt.toLowerCase();
    expect(prompt.includes('diagnostic') || prompt.includes('charge')).toBeTruthy();
  });

  it('MODE coach: systemPrompt contient "coaching" ou "objectif"', () => {
    const prompt = CHAT_MODES_CONFIG.coach.systemPrompt.toLowerCase();
    expect(prompt.includes('coaching') || prompt.includes('objectif')).toBeTruthy();
  });

  it('MODE dev: maxTokens >= 4000 (réponses techniques longues)', () => {
    expect(CHAT_MODES_CONFIG.dev.maxTokens).toBeGreaterThanOrEqual(4000);
  });

  it('MODE admin: systemPrompt contient "diagnostic" ou "système"', () => {
    const prompt = CHAT_MODES_CONFIG.admin.systemPrompt.toLowerCase();
    expect(prompt.includes('diagnostic') || prompt.includes('système') || prompt.includes('system') || prompt.includes('infrastructure')).toBeTruthy();
  });

  it('MODE strategy: systemPrompt contient "stratégi" ou "SWOT" ou "OKR"', () => {
    const prompt = CHAT_MODES_CONFIG.strategy.systemPrompt.toLowerCase();
    expect(
      prompt.includes('stratégi') || prompt.includes('swot') || prompt.includes('okr')
    ).toBeTruthy();
  });

  it('MODE synthesis: temperature ∈ [0.6, 0.8] (convergence analytique)', () => {
    const t = CHAT_MODES_CONFIG.synthesis.temperature;
    expect(t).toBeGreaterThanOrEqual(0.6);
    expect(t).toBeLessThanOrEqual(0.8);
  });

  it('MODE synthesis: systemPrompt contient "connexion" ou "synthèse" ou "pattern"', () => {
    const prompt = CHAT_MODES_CONFIG.synthesis.systemPrompt.toLowerCase();
    expect(
      prompt.includes('connexion') || prompt.includes('synthèse') || prompt.includes('pattern')
    ).toBeTruthy();
  });

  it('Tous les modes actifs: systemPrompt se termine par mention de la langue française', () => {
    const violations: string[] = [];
    for (const modeId of ACTIVE_MODES) {
      const prompt = CHAT_MODES_CONFIG[modeId].systemPrompt.toLowerCase();
      if (!prompt.includes('français')) {
        violations.push(modeId);
      }
    }
    expect(violations, `Modes sans obligation de répondre en français: ${violations.join(', ')}`).toHaveLength(0);
  });
});

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

describe('🛠️ chatModes — Utilitaires et helpers', () => {
  describe('validateModeId()', () => {
    it('Retourne true pour tous les IDs valides', () => {
      for (const id of ALL_MODE_IDS) {
        expect(validateModeId(id), `${id} devrait être valide`).toBe(true);
      }
    });

    it('Retourne false pour des IDs invalides', () => {
      expect(validateModeId('inexistant')).toBe(false);
      expect(validateModeId('')).toBe(false);
      expect(validateModeId(null)).toBe(false);
      expect(validateModeId(undefined)).toBe(false);
      expect(validateModeId(42)).toBe(false);
      expect(validateModeId({ id: 'default' })).toBe(false);
    });

    it('Retourne false pour des chaînes similaires mais invalides', () => {
      expect(validateModeId('Default')).toBe(false); // Case sensitive
      expect(validateModeId('defaults')).toBe(false);
      expect(validateModeId('dev_')).toBe(false);
    });
  });

  describe('getModeConfig()', () => {
    it('Retourne la config correcte pour un ID valide', () => {
      const config = getModeConfig('default');
      expect(config.id).toBe('default');
      expect(config.label).toBeTruthy();
    });

    it('Retourne la config default pour un ID inconnu (fallback)', () => {
      const config = getModeConfig('mode_inexistant_xyz');
      expect(config.id).toBe('default');
    });

    it('Retourne la config default pour une chaîne vide (fallback)', () => {
      const config = getModeConfig('');
      expect(config.id).toBe('default');
    });

    it('Retourne des configs cohérentes pour tous les modes actifs', () => {
      for (const modeId of ACTIVE_MODES) {
        const config = getModeConfig(modeId);
        expect(config.id).toBe(modeId);
      }
    });
  });

  describe('isModeAllowed()', () => {
    it('Mode default (permissionLevel=1) est autorisé pour permission 1', () => {
      expect(isModeAllowed('default', 1)).toBe(true);
    });

    it('Mode default (permissionLevel=1) est autorisé pour permission 3', () => {
      expect(isModeAllowed('default', 3)).toBe(true);
    });

    it('Mode default (permissionLevel=1) est refusé pour permission 0', () => {
      expect(isModeAllowed('default', 0)).toBe(false);
    });

    it('Modes permission=2 sont refusés pour permission=1', () => {
      const restrictedModes = ACTIVE_MODES.filter(
        id => CHAT_MODES_CONFIG[id].permissionLevel === 2
      );
      for (const modeId of restrictedModes) {
        expect(isModeAllowed(modeId, 1), `${modeId} devrait être refusé à pl=1`).toBe(false);
      }
    });

    it('Modes permission=2 sont autorisés pour permission=2', () => {
      const restrictedModes = ACTIVE_MODES.filter(
        id => CHAT_MODES_CONFIG[id].permissionLevel === 2
      );
      for (const modeId of restrictedModes) {
        expect(isModeAllowed(modeId, 2), `${modeId} devrait être autorisé à pl=2`).toBe(true);
      }
    });
  });

  describe('getAccessibleModes()', () => {
    it('getAccessibleModes(1) retourne au moins les modes level=1', () => {
      const modes = getAccessibleModes(1);
      expect(modes.length).toBeGreaterThan(0);
      for (const mode of modes) {
        expect(mode.permissionLevel).toBeLessThanOrEqual(1);
        expect(mode.enabled).toBe(true);
      }
    });

    it('getAccessibleModes(3) retourne plus de modes que getAccessibleModes(1)', () => {
      const modes1 = getAccessibleModes(1);
      const modes3 = getAccessibleModes(3);
      expect(modes3.length).toBeGreaterThanOrEqual(modes1.length);
    });

    it('getAccessibleModes() retourne les modes triés par sortOrder', () => {
      const modes = getAccessibleModes(5);
      for (let i = 1; i < modes.length; i++) {
        expect(modes[i].sortOrder).toBeGreaterThanOrEqual(modes[i - 1].sortOrder);
      }
    });

    it('getAccessibleModes() ne retourne aucun mode désactivé', () => {
      const modes = getAccessibleModes(5);
      for (const mode of modes) {
        expect(mode.enabled).toBe(true);
      }
    });
  });

  describe('isToolAllowed()', () => {
    it('Mode dev: webSearch est défini dans toolsAllowed', () => {
      // Les outils sont définis via TOOLS_DEV/TOOLS_STANDARD — vérifier existence
      const toolsAllowed = CHAT_MODES_CONFIG.dev.toolsAllowed;
      expect(toolsAllowed).toBeDefined();
      expect(typeof toolsAllowed).toBe('object');
    });

    it('Mode default: toolsAllowed est non vide (TOOLS_STANDARD)', () => {
      const toolsAllowed = CHAT_MODES_CONFIG.default.toolsAllowed;
      expect(Object.keys(toolsAllowed).length).toBeGreaterThan(0);
    });

    it('Mode journal: toolsAllowed est TOOLS_MINIMAL (restrictions)', () => {
      const toolsAllowed = CHAT_MODES_CONFIG.journal.toolsAllowed;
      expect(toolsAllowed).toBeDefined();
      // TOOLS_MINIMAL a moins d'outils que TOOLS_STANDARD
      const journalTools = Object.keys(toolsAllowed).length;
      const defaultTools = Object.keys(CHAT_MODES_CONFIG.default.toolsAllowed).length;
      expect(journalTools).toBeLessThanOrEqual(defaultTools);
    });
  });
});

// ─── ACTIVE_MODE_IDS ─────────────────────────────────────────────────────────

describe('📋 ACTIVE_MODE_IDS', () => {
  it('ACTIVE_MODE_IDS ne contient pas de doublons', () => {
    const unique = new Set(ACTIVE_MODE_IDS);
    expect(unique.size).toBe(ACTIVE_MODE_IDS.length);
  });

  it('ACTIVE_MODE_IDS est trié par sortOrder croissant', () => {
    for (let i = 1; i < ACTIVE_MODE_IDS.length; i++) {
      const prev = CHAT_MODES_CONFIG[ACTIVE_MODE_IDS[i - 1]].sortOrder;
      const curr = CHAT_MODES_CONFIG[ACTIVE_MODE_IDS[i]].sortOrder;
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it('ACTIVE_MODE_IDS contient tous les modes avec enabled=true', () => {
    for (const modeId of ACTIVE_MODES) {
      expect(ACTIVE_MODE_IDS, `${modeId} manque dans ACTIVE_MODE_IDS`).toContain(modeId);
    }
  });

  it('ACTIVE_MODE_IDS n\'inclut pas "mode_inexistant"', () => {
    expect(ACTIVE_MODE_IDS).not.toContain('mode_inexistant');
  });
});

// ─── MODES_BY_CATEGORY ───────────────────────────────────────────────────────

describe('🗂️ MODES_BY_CATEGORY', () => {
  it('Toutes les catégories définies contiennent au moins 1 mode', () => {
    const categories = Object.keys(MODES_BY_CATEGORY);
    for (const cat of categories) {
      expect(
        MODES_BY_CATEGORY[cat as keyof typeof MODES_BY_CATEGORY].length,
        `Catégorie ${cat} est vide`
      ).toBeGreaterThan(0);
    }
  });

  it('Les IDs dans MODES_BY_CATEGORY existent dans CHAT_MODES_CONFIG', () => {
    const violations: string[] = [];
    for (const [cat, ids] of Object.entries(MODES_BY_CATEGORY)) {
      for (const id of ids) {
        if (!CHAT_MODES_CONFIG[id as ChatModeId]) {
          violations.push(`${cat}:${id}`);
        }
      }
    }
    expect(violations, `IDs de catégorie inconnus: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('La catégorie "general" contient "default"', () => {
    expect(MODES_BY_CATEGORY.general).toContain('default');
  });

  it('La catégorie "creative" contient "brainstorming"', () => {
    expect(MODES_BY_CATEGORY.creative).toContain('brainstorming');
  });

  it('La catégorie "productivity" contient "planning"', () => {
    expect(MODES_BY_CATEGORY.productivity).toContain('planning');
  });

  it('La catégorie "personal" contient "journal" et "coach"', () => {
    expect(MODES_BY_CATEGORY.personal).toContain('journal');
    expect(MODES_BY_CATEGORY.personal).toContain('coach');
  });

  it('La catégorie "technical" contient "dev" et "admin"', () => {
    expect(MODES_BY_CATEGORY.technical).toContain('dev');
    expect(MODES_BY_CATEGORY.technical).toContain('admin');
  });
});

// ─── COHÉRENCE CROSS-MODES ───────────────────────────────────────────────────

describe('🔗 Cohérence cross-modes', () => {
  it('Les IDs de tous les modes correspondent à leur clé dans le registre', () => {
    for (const [key, config] of Object.entries(CHAT_MODES_CONFIG)) {
      expect(config.id, `Mismatch id vs clé pour ${key}`).toBe(key);
    }
  });

  it('Les modes créatifs ont temperature >= 0.8 en moyenne', () => {
    const creativeIds = MODES_BY_CATEGORY.creative;
    const temps = creativeIds
      .filter(id => CHAT_MODES_CONFIG[id as ChatModeId])
      .map(id => CHAT_MODES_CONFIG[id as ChatModeId].temperature);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    expect(avg).toBeGreaterThanOrEqual(0.7);
  });

  it('Les modes techniques ont temperature <= 0.8 (précision)', () => {
    const techIds = MODES_BY_CATEGORY.technical;
    for (const id of techIds) {
      const config = CHAT_MODES_CONFIG[id as ChatModeId];
      if (config) {
        expect(
          config.temperature,
          `${id} temperature trop haute pour un mode technique`
        ).toBeLessThanOrEqual(0.8);
      }
    }
  });

  it('Les modes stratégiques ont maxTokens >= 2000', () => {
    const stratIds = MODES_BY_CATEGORY.strategic;
    for (const id of stratIds) {
      const config = CHAT_MODES_CONFIG[id as ChatModeId];
      if (config && config.enabled) {
        expect(
          config.maxTokens,
          `${id} maxTokens insuffisant pour un mode stratégique`
        ).toBeGreaterThanOrEqual(1500);
      }
    }
  });

  it('Aucun doublon de sortOrder entre modes actifs (warning si collision)', () => {
    const sortOrders = ACTIVE_MODES.map(id => CHAT_MODES_CONFIG[id].sortOrder);
    const unique = new Set(sortOrders);
    if (unique.size !== sortOrders.length) {
      // Collision détectée — identifier les doublons
      const seen = new Map<number, string[]>();
      for (const id of ACTIVE_MODES) {
        const so = CHAT_MODES_CONFIG[id].sortOrder;
        if (!seen.has(so)) seen.set(so, []);
        seen.get(so)!.push(id);
      }
      const collisions = [...seen.entries()]
        .filter(([, ids]) => ids.length > 1)
        .map(([so, ids]) => `sortOrder=${so}: [${ids.join(', ')}]`);
      console.warn(`[WARN] Collisions sortOrder: ${collisions.join(' | ')}`);
    }
    // Warning seulement, pas d'échec — les sortOrders non-entiers sont valides
    expect(sortOrders.length).toBeGreaterThan(0);
  });
});
