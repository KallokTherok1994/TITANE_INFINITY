/**
 * TITANE∞ — Tests chatToolsRegistry
 * Couverture: structure, exhaustivité, cohérence des données
 */

import { describe, expect, it } from 'vitest';
import {
  CHAT_TOOLS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ORDER,
  type ChatToolCategory,
} from '../chatToolsRegistry';

const VALID_CATEGORIES: ChatToolCategory[] = [
  'generate',
  'research',
  'reflect',
  'config',
];

describe('chatToolsRegistry — CHAT_TOOLS', () => {
  it('contient exactement 10 outils', () => {
    expect(CHAT_TOOLS).toHaveLength(10);
  });

  it('chaque outil a un id non-vide unique', () => {
    const ids = CHAT_TOOLS.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(CHAT_TOOLS.length);
    for (const id of ids) {
      expect(id.trim().length).toBeGreaterThan(0);
    }
  });

  it('chaque outil a une icône non-vide', () => {
    for (const tool of CHAT_TOOLS) {
      expect(tool.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it('chaque outil a un label non-vide', () => {
    for (const tool of CHAT_TOOLS) {
      expect(tool.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('chaque outil a un templateText non-vide', () => {
    for (const tool of CHAT_TOOLS) {
      expect(tool.templateText.trim().length).toBeGreaterThan(0);
    }
  });

  it('chaque outil a une catégorie valide', () => {
    for (const tool of CHAT_TOOLS) {
      expect(VALID_CATEGORIES).toContain(tool.category);
    }
  });

  it('les outils autoSend=true ont un templateText complet (pas de placeholder)', () => {
    const autoTools = CHAT_TOOLS.filter(t => t.autoSend);
    expect(autoTools.length).toBeGreaterThan(0);
    for (const tool of autoTools) {
      // Un template autoSend ne doit pas se terminer par ": " (placeholder utilisateur attendu)
      expect(tool.templateText.trim()).not.toMatch(/:\s*$/);
    }
  });

  it('les outils autoSend=false ont un templateText terminant par espace ou "https://"', () => {
    const manualTools = CHAT_TOOLS.filter(t => !t.autoSend);
    expect(manualTools.length).toBeGreaterThan(0);
    for (const tool of manualTools) {
      const text = tool.templateText;
      const endsWithPlaceholder =
        text.endsWith(' ') || text.endsWith('https://') || text.endsWith(': ');
      expect(endsWithPlaceholder).toBe(true);
    }
  });

  it('la propriété autoSend est un booléen', () => {
    for (const tool of CHAT_TOOLS) {
      expect(typeof tool.autoSend).toBe('boolean');
    }
  });
});

describe('chatToolsRegistry — TOOL_CATEGORIES', () => {
  it('contient une entrée pour chaque catégorie valide', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(TOOL_CATEGORIES[cat]).toBeDefined();
      expect(TOOL_CATEGORIES[cat].label.trim().length).toBeGreaterThan(0);
      expect(TOOL_CATEGORIES[cat].icon.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('chatToolsRegistry — TOOL_CATEGORY_ORDER', () => {
  it('contient les 4 catégories exactement une fois', () => {
    expect(TOOL_CATEGORY_ORDER).toHaveLength(4);
    expect(new Set(TOOL_CATEGORY_ORDER).size).toBe(4);
    for (const cat of VALID_CATEGORIES) {
      expect(TOOL_CATEGORY_ORDER).toContain(cat);
    }
  });
});
