/**
 * TITANE∞ v31.3.2 — Tests Phase 25: Mode psychologie_profils
 *
 * Validates:
 *   1. Le mode 'psychologie_profils' est défini et activé dans CHAT_MODES_CONFIG
 *   2. Les propriétés clés sont conformes à la spec clinique
 *   3. Le mode apparaît dans la catégorie 'personal'
 *   4. Les outils autorisés sont corrects (pas d'accès système)
 *   5. Le system prompt contient les domaines cliniques attendus
 *   6. getModeConfig() résout le mode correctement
 */

import { describe, it, expect } from 'vitest';
import {
  CHAT_MODES_CONFIG,
  MODES_BY_CATEGORY,
  getModeConfig,
  validateModeConfig,
  ACTIVE_MODE_IDS,
} from '@/services/ai/chatModes.config';

describe('chatModes — Mode psychologie_profils (Phase 25)', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Existence et activation
  // ─────────────────────────────────────────────────────────────────────────

  it('le mode psychologie_profils est défini dans CHAT_MODES_CONFIG', () => {
    expect(CHAT_MODES_CONFIG['psychologie_profils']).toBeDefined();
  });

  it('le mode psychologie_profils est activé (enabled: true)', () => {
    expect(CHAT_MODES_CONFIG['psychologie_profils'].enabled).toBe(true);
  });

  it("le mode apparaît dans ACTIVE_MODE_IDS", () => {
    expect(ACTIVE_MODE_IDS).toContain('psychologie_profils');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Propriétés de base
  // ─────────────────────────────────────────────────────────────────────────

  it('les propriétés identitaires sont correctes', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    expect(mode.id).toBe('psychologie_profils');
    expect(mode.label).toBe('Psycho-Profils');
    expect(mode.category).toBe('personal');
    expect(mode.icon).toBe('🧠');
    expect(mode.themeColor).toBe('#7c3aed');
  });

  it('la configuration IA est dans les plages acceptables', () => {
    const mode = CHAT_MODES_CONFIG['psychologie_profils'];
    expect(mode.temperature).toBeGreaterThanOrEqual(0);
    expect(mode.temperature).toBeLessThanOrEqual(1);
    expect(mode.temperature).toBe(0.65);
    expect(mode.maxTokens).toBeGreaterThanOrEqual(2000);
    expect(mode.permissionLevel).toBe(1);
  });

  it('le responseStyle est detailed (réponses cliniques complètes)', () => {
    expect(CHAT_MODES_CONFIG['psychologie_profils'].responseStyle).toBe('detailed');
  });

  it('le tone est empathetic', () => {
    expect(CHAT_MODES_CONFIG['psychologie_profils'].tone).toBe('empathetic');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Sécurité — outils non autorisés
  // ─────────────────────────────────────────────────────────────────────────

  it("n'a pas accès au shell, filesystem ni code generation", () => {
    const tools = CHAT_MODES_CONFIG['psychologie_profils'].toolsAllowed;
    expect(tools.shellExecution).toBe(false);
    expect(tools.fileSystemAccess).toBe(false);
    expect(tools.codeGeneration).toBe(false);
    expect(tools.configModification).toBe(false);
    expect(tools.auditLogs).toBe(false);
  });

  it('a accès au context analysis et synthesis tool', () => {
    const tools = CHAT_MODES_CONFIG['psychologie_profils'].toolsAllowed;
    expect(tools.memoryAccess).toBe(true);
    expect(tools.contextAnalysis).toBe(true);
    expect(tools.synthesisTool).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Contenu du system prompt — domaines cliniques
  // ─────────────────────────────────────────────────────────────────────────

  it('le system prompt contient les tactiques de manipulation clés', () => {
    const prompt = CHAT_MODES_CONFIG['psychologie_profils'].systemPrompt;
    expect(prompt).toContain('gaslighting');
    expect(prompt).toContain('DARVO');
    expect(prompt).toContain('trauma bond');
  });

  it('le system prompt couvre les stratégies de protection', () => {
    const prompt = CHAT_MODES_CONFIG['psychologie_profils'].systemPrompt;
    expect(prompt).toContain('Grey Rock');
    expect(prompt).toContain('No Contact');
    expect(prompt).toContain('BIFF');
  });

  it('le system prompt couvre les troubles DSM-5 et dark triad', () => {
    const prompt = CHAT_MODES_CONFIG['psychologie_profils'].systemPrompt;
    expect(prompt).toContain('DSM-5');
    expect(prompt).toContain('Dark Triad');
    expect(prompt).toContain('narcissisme');
  });

  it("le system prompt inclut l'avertissement éthique (pas de diagnostic sur personne absente)", () => {
    const prompt = CHAT_MODES_CONFIG['psychologie_profils'].systemPrompt;
    expect(prompt).toContain('JAMAIS de diagnostic');
    expect(prompt).toContain('CADRE ÉTHIQUE');
  });

  it('le system prompt ordonne de répondre en français', () => {
    const prompt = CHAT_MODES_CONFIG['psychologie_profils'].systemPrompt;
    expect(prompt).toContain('Réponds TOUJOURS en français');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Catégorie et tri
  // ─────────────────────────────────────────────────────────────────────────

  it("le mode est dans la catégorie 'personal' de MODES_BY_CATEGORY", () => {
    expect(MODES_BY_CATEGORY['personal']).toContain('psychologie_profils');
  });

  it('le sortOrder est entre coach et audit (zone personnelle avancée)', () => {
    const sortOrder = CHAT_MODES_CONFIG['psychologie_profils'].sortOrder;
    const coachOrder = CHAT_MODES_CONFIG['coach'].sortOrder;
    const auditOrder = CHAT_MODES_CONFIG['audit'].sortOrder;
    expect(sortOrder).toBeGreaterThan(coachOrder);
    expect(sortOrder).toBeLessThan(auditOrder);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Validation schema
  // ─────────────────────────────────────────────────────────────────────────

  it('validateModeConfig retourne true pour psychologie_profils', () => {
    expect(validateModeConfig(CHAT_MODES_CONFIG['psychologie_profils'])).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. getModeConfig résolution
  // ─────────────────────────────────────────────────────────────────────────

  it('getModeConfig résout le mode correctement', () => {
    const resolved = getModeConfig('psychologie_profils');
    expect(resolved.id).toBe('psychologie_profils');
    expect(resolved.label).toBe('Psycho-Profils');
  });

  it('getModeConfig sur un ID inconnu retourne le mode default (fallback)', () => {
    const fallback = getModeConfig('mode_inexistant_xyz');
    expect(fallback.id).toBe('default');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Actions suggérées
  // ─────────────────────────────────────────────────────────────────────────

  it('a au moins 3 actions suggérées pertinentes', () => {
    const actions = CHAT_MODES_CONFIG['psychologie_profils'].suggestedActions;
    expect(actions.length).toBeGreaterThanOrEqual(3);
    const actionsText = actions.join(' ');
    expect(actionsText).toMatch(/prot[eé]g|red flags|trauma|analys/i);
  });
});
