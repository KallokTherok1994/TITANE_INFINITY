// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — FLOATING WINDOW CHAT HANDLER TESTS
//   Unit tests for NLP pattern matching
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import {
  parseFloatingWindowCommand,
  containsFloatingWindowKeyword,
} from '../floatingWindowChatHandler';
import { AnchorPosition } from '../floating/AvatarDisplayState';

describe('FloatingWindowChatHandler', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // SCALE COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Scale Commands (FR)', () => {
    it('should parse "deviens plus petite"', () => {
      const result = parseFloatingWindowCommand('deviens plus petite');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(0.5);
    });

    it('should parse "réduis ta taille"', () => {
      const result = parseFloatingWindowCommand('réduis ta taille');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(0.7);
    });

    it('should parse "deviens plus grande"', () => {
      const result = parseFloatingWindowCommand('deviens plus grande');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(1.5);
    });

    it('should parse "taille normale"', () => {
      const result = parseFloatingWindowCommand('taille normale');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(1.0);
    });

    it('should parse "taille à 80%"', () => {
      const result = parseFloatingWindowCommand('taille à 80%');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(0.8);
    });
  });

  describe('Scale Commands (EN)', () => {
    it('should parse "make yourself smaller"', () => {
      const result = parseFloatingWindowCommand('make yourself smaller');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(0.5);
    });

    it('should parse "get bigger"', () => {
      const result = parseFloatingWindowCommand('get bigger');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(1.5);
    });

    it('should parse "normal size"', () => {
      const result = parseFloatingWindowCommand('normal size');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('scale');
      expect(result.value).toBe(1.0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // OPACITY COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Opacity Commands (FR)', () => {
    it('should parse "deviens plus transparente"', () => {
      const result = parseFloatingWindowCommand('deviens plus transparente');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('opacity');
      expect(result.value).toBe(0.5);
    });

    it('should parse "réduis ton opacité"', () => {
      const result = parseFloatingWindowCommand('réduis ton opacité');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('opacity');
      expect(result.value).toBe(0.6);
    });

    it('should parse "deviens opaque"', () => {
      const result = parseFloatingWindowCommand('deviens opaque');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('opacity');
      expect(result.value).toBe(1.0);
    });

    it('should parse "opacité à 50%"', () => {
      const result = parseFloatingWindowCommand('opacité à 50%');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('opacity');
      expect(result.value).toBe(0.5);
    });
  });

  describe('Opacity Commands (EN)', () => {
    it('should parse "become transparent"', () => {
      const result = parseFloatingWindowCommand('become transparent');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('opacity');
      expect(result.value).toBe(0.5);
    });

    it('should parse "opacity to 70%"', () => {
      const result = parseFloatingWindowCommand('opacity to 70%');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('opacity');
      expect(result.value).toBe(0.7);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ANCHOR COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Anchor Commands (FR)', () => {
    it('should parse "va au coin haut gauche"', () => {
      const result = parseFloatingWindowCommand('va au coin haut gauche');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.TopLeft);
    });

    it('should parse "mets-toi dans le coin haut droite"', () => {
      const result = parseFloatingWindowCommand('mets-toi dans le coin haut droite');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.TopRight);
    });

    it('should parse "place-toi au coin bas gauche"', () => {
      const result = parseFloatingWindowCommand('place-toi au coin bas gauche');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.BottomLeft);
    });

    it('should parse "va au centre"', () => {
      const result = parseFloatingWindowCommand('va au centre');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.Center);
    });

    it('should parse "en haut à droite"', () => {
      const result = parseFloatingWindowCommand('en haut à droite');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.TopRight);
    });
  });

  describe('Anchor Commands (EN)', () => {
    it('should parse "go to top left corner"', () => {
      const result = parseFloatingWindowCommand('go to top left corner');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.TopLeft);
    });

    it('should parse "move to bottom right"', () => {
      const result = parseFloatingWindowCommand('move to bottom right');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.BottomRight);
    });

    it('should parse "go to center"', () => {
      const result = parseFloatingWindowCommand('go to center');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('anchor');
      expect(result.value).toBe(AnchorPosition.Center);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Screen Commands (FR)', () => {
    it('should parse "va sur écran 2"', () => {
      const result = parseFloatingWindowCommand('va sur écran 2');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('screen');
      expect(result.value).toBe(1); // 0-indexed
    });

    it('should parse "passe sur l\'écran numéro 3"', () => {
      const result = parseFloatingWindowCommand('passe sur l\'écran numéro 3');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('screen');
      expect(result.value).toBe(2);
    });

    it('should parse "reviens sur écran principal"', () => {
      const result = parseFloatingWindowCommand('reviens sur écran principal');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('screen');
      expect(result.value).toBe(0);
    });
  });

  describe('Screen Commands (EN)', () => {
    it('should parse "go to screen 2"', () => {
      const result = parseFloatingWindowCommand('go to screen 2');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('screen');
      expect(result.value).toBe(1);
    });

    it('should parse "move back to main screen"', () => {
      const result = parseFloatingWindowCommand('move back to main screen');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('screen');
      expect(result.value).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Mode Commands (FR)', () => {
    it('should parse "deviens fenêtre flottante"', () => {
      const result = parseFloatingWindowCommand('deviens fenêtre flottante');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('floating');
    });

    it('should parse "détache-toi"', () => {
      const result = parseFloatingWindowCommand('détache-toi');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('floating');
    });

    it('should parse "reviens dans la fenêtre principale"', () => {
      const result = parseFloatingWindowCommand('reviens dans la fenêtre principale');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('embed');
    });

    it('should parse "cache-toi"', () => {
      const result = parseFloatingWindowCommand('cache-toi');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('hidden');
    });
  });

  describe('Mode Commands (EN)', () => {
    it('should parse "become floating"', () => {
      const result = parseFloatingWindowCommand('become floating');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('floating');
    });

    it('should parse "detach"', () => {
      const result = parseFloatingWindowCommand('detach');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('floating');
    });

    it('should parse "dock back to main window"', () => {
      const result = parseFloatingWindowCommand('dock back to main window');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('mode');
      expect(result.value).toBe('embed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Toggle Commands (FR)', () => {
    it('should parse "verrouille-toi"', () => {
      const result = parseFloatingWindowCommand('verrouille-toi');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_locked');
      expect(result.value).toBe(true);
    });

    it('should parse "déverrouille-toi"', () => {
      const result = parseFloatingWindowCommand('déverrouille-toi');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_locked');
      expect(result.value).toBe(false);
    });

    it('should parse "reste toujours au-dessus"', () => {
      const result = parseFloatingWindowCommand('reste toujours au-dessus');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_always_on_top');
      expect(result.value).toBe(true);
    });

    it('should parse "active le mode miroir"', () => {
      const result = parseFloatingWindowCommand('active le mode miroir');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_mirror');
      expect(result.value).toBe(true);
    });

    it('should parse "laisse les clics passer"', () => {
      const result = parseFloatingWindowCommand('laisse les clics passer');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_click_through');
      expect(result.value).toBe(true);
    });
  });

  describe('Toggle Commands (EN)', () => {
    it('should parse "lock yourself"', () => {
      const result = parseFloatingWindowCommand('lock yourself');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_locked');
      expect(result.value).toBe(true);
    });

    it('should parse "stay on top"', () => {
      const result = parseFloatingWindowCommand('stay on top');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_always_on_top');
      expect(result.value).toBe(true);
    });

    it('should parse "enable mirror mode"', () => {
      const result = parseFloatingWindowCommand('enable mirror mode');
      expect(result.handled).toBe(true);
      expect(result.type).toBe('toggle_mirror');
      expect(result.value).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // KEYWORD DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Keyword Detection', () => {
    it('should detect "taille"', () => {
      expect(containsFloatingWindowKeyword('peux-tu changer ta taille?')).toBe(true);
    });

    it('should detect "opacité"', () => {
      expect(containsFloatingWindowKeyword('modifie ton opacité')).toBe(true);
    });

    it('should detect "coin"', () => {
      expect(containsFloatingWindowKeyword('va dans le coin')).toBe(true);
    });

    it('should detect "écran"', () => {
      expect(containsFloatingWindowKeyword('change d\'écran')).toBe(true);
    });

    it('should detect "floating"', () => {
      expect(containsFloatingWindowKeyword('switch to floating mode')).toBe(true);
    });

    it('should not detect unrelated message', () => {
      expect(containsFloatingWindowKeyword('comment vas-tu?')).toBe(false);
    });

    it('should not detect appearance-only message', () => {
      expect(containsFloatingWindowKeyword('change ta coiffure')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NO MATCH
  // ═══════════════════════════════════════════════════════════════════════════

  describe('No Match Cases', () => {
    it('should return handled=false for unrelated message', () => {
      const result = parseFloatingWindowCommand('Bonjour TITANE, comment vas-tu?');
      expect(result.handled).toBe(false);
      expect(result.type).toBe('none');
    });

    it('should return handled=false for appearance command', () => {
      const result = parseFloatingWindowCommand('change ta tenue de bureau');
      expect(result.handled).toBe(false);
      expect(result.type).toBe('none');
    });
  });
});
