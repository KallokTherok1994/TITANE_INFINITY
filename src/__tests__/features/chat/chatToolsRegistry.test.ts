/**
 * Tests unitaires — chatToolsRegistry
 * Coverage: exports, structure des outils, catégories, ordre
 */

import { describe, it, expect } from 'vitest';
import {
  CHAT_TOOLS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ORDER,
  type ChatTool,
  type ChatToolCategory,
} from '@/features/chat/chatToolsRegistry';

describe('chatToolsRegistry', () => {
  // ── CHAT_TOOLS ──────────────────────────────────────────────────────────────
  describe('CHAT_TOOLS', () => {
    it('exporte un tableau de 10 outils', () => {
      expect(CHAT_TOOLS).toHaveLength(10);
    });

    it('chaque outil a les champs requis', () => {
      const requiredKeys: (keyof ChatTool)[] = [
        'id',
        'icon',
        'label',
        'description',
        'category',
        'templateText',
        'autoSend',
      ];
      CHAT_TOOLS.forEach(tool => {
        requiredKeys.forEach(key => {
          expect(tool).toHaveProperty(key);
        });
      });
    });

    it('tous les IDs sont uniques', () => {
      const ids = CHAT_TOOLS.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('toutes les catégories sont valides', () => {
      const validCategories: ChatToolCategory[] = ['generate', 'research', 'reflect', 'config'];
      CHAT_TOOLS.forEach(tool => {
        expect(validCategories).toContain(tool.category);
      });
    });

    it('contient generate_file avec category=generate', () => {
      const tool = CHAT_TOOLS.find(t => t.id === 'generate_file');
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('generate');
      expect(tool?.autoSend).toBe(false);
    });

    it('contient web_search avec category=research', () => {
      const tool = CHAT_TOOLS.find(t => t.id === 'web_search');
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('research');
    });

    it('contient save_prefs avec category=config', () => {
      const tool = CHAT_TOOLS.find(t => t.id === 'save_prefs');
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('config');
    });

    it('les outils avec autoSend=true ont un templateText non-vide', () => {
      CHAT_TOOLS.filter(t => t.autoSend).forEach(tool => {
        expect(tool.templateText.trim()).not.toBe('');
      });
    });
  });

  // ── TOOL_CATEGORIES ─────────────────────────────────────────────────────────
  describe('TOOL_CATEGORIES', () => {
    it('a les 4 catégories : generate, research, reflect, config', () => {
      expect(Object.keys(TOOL_CATEGORIES)).toEqual(
        expect.arrayContaining(['generate', 'research', 'reflect', 'config'])
      );
    });

    it('chaque catégorie a label et icon', () => {
      Object.values(TOOL_CATEGORIES).forEach(cat => {
        expect(cat).toHaveProperty('label');
        expect(cat).toHaveProperty('icon');
        expect(cat.label.trim()).not.toBe('');
        expect(cat.icon.trim()).not.toBe('');
      });
    });
  });

  // ── TOOL_CATEGORY_ORDER ──────────────────────────────────────────────────────
  describe('TOOL_CATEGORY_ORDER', () => {
    it('a 4 entrées', () => {
      expect(TOOL_CATEGORY_ORDER).toHaveLength(4);
    });

    it('chaque entrée est une catégorie valide', () => {
      const validCategories = Object.keys(TOOL_CATEGORIES) as ChatToolCategory[];
      TOOL_CATEGORY_ORDER.forEach(cat => {
        expect(validCategories).toContain(cat);
      });
    });

    it('commence par generate', () => {
      expect(TOOL_CATEGORY_ORDER[0]).toBe('generate');
    });
  });
});
