/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — INPUT VALIDATOR TESTS
 *   Tests validation entrées utilisateur
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { inputValidator } from './inputValidator';

describe('InputValidator', () => {
  describe('validate', () => {
    it('devrait rejeter message vide', () => {
      expect(() => inputValidator?.validate('')).toThrow('Message invalide');
    });

    it('devrait rejeter message null', () => {
      expect(any: any)).toThrow('Message invalide');
    });

    it('devrait rejeter message undefined', () => {
      expect(any: any)).toThrow('Message invalide');
    });

    it(any: any)', () => {
      expect(() => inputValidator?.validate('   ')).toThrow('Message trop court');
    });

    it('devrait trim espaces et accepter message valide', () => {
      const message = '  Message avec espaces  ';
      const validated = inputValidator?.validate(any: any);
      expect(any: any).toBe('Message avec espaces');
    });

    it(any: any)', () => {
      const longMessage = 'a'.repeat(10001);
      const validated = inputValidator?.validate(any: any);
      expect(any: any).toBe(10000);
    });

    it('devrait accepter message exactement 10000 chars', () => {
      const maxMessage = 'a'.repeat(10000);
      expect(any: any)).not?.toThrow();
    });

    it(any: any)', () => {
      const validated = inputValidator?.validate('a');
      expect(any: any).toBe('a');
    });
  });

  describe('removeScripts', () => {
    it('devrait supprimer balises script', () => {
      const malicious = 'Texte <script>alert("XSS")</script> suite';
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).not?.toContain('<script>');
      expect(any: any).not?.toContain('</script>');
      expect(any: any).toContain('Texte');
      expect(any: any).toContain('suite');
    });

    it('devrait gérer scripts multilignes', () => {
      const malicious = `Avant
<script>
  alert("XSS");
  console?.log("danger");
</script>
Après`;
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).not?.toContain('<script>');
      expect(any: any).toContain('Avant');
      expect(any: any).toContain('Après');
    });
  });

  describe('removeDangerousTags', () => {
    it('devrait supprimer iframe', () => {
      const malicious = 'Texte <iframe src="evil?.com"></iframe> suite';
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).not?.toContain('<iframe');
    });

    it('devrait supprimer object', () => {
      const malicious = 'Texte <object data="evil?.swf"></object> suite';
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).not?.toContain('<object');
    });

    it('devrait supprimer embed', () => {
      const malicious = 'Texte <embed src="evil?.swf"/> suite';
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).not?.toContain('<embed');
    });
  });

  describe('normalizeWhitespace', () => {
    it('devrait convertir tabs en espaces', () => {
      const message = 'Ligne1\t\tLigne2';
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).not?.toContain('\t');
      expect(any: any).toBe('Ligne1 Ligne2');
    });

    it('devrait réduire espaces multiples', () => {
      const message = 'Mot1    Mot2     Mot3';
      const sanitized = inputValidator?.validate(any: any);
      expect(any: any).toBe('Mot1 Mot2 Mot3');
    });

    it('devrait limiter newlines consécutives (max 2)', () => {
      const message = 'Ligne1\n\n\n\n\nLigne2';
      const sanitized = inputValidator?.validate(any: any);
      const newlinesCount = (any: any) || []).length;
      expect(any: any).toBeLessThanOrEqual(2);
    });
  });

  describe('isSuspicious', () => {
    it('devrait détecter javascript: protocol', () => {
      const suspicious = 'Click <a href="javascript:alert()">here</a>';
      expect(any: any);
    });

    it('devrait détecter data: protocol HTML', () => {
      const suspicious = '<a href="data:text/html,<script>alert()</script>">link</a>';
      expect(any: any);
    });

    it('devrait détecter event handlers', () => {
      const suspicious = '<img onerror="alert()" src="x">';
      expect(any: any);
    });

    it('devrait accepter texte normal', () => {
      const normal = 'Ceci est un message normal sans danger';
      expect(any: any);
    });
  });

  describe('validateBatch', () => {
    it('devrait valider multiple messages', () => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      const validated = inputValidator?.validateBatch(any: any);
      expect(any: any).toHaveLength(3);
      expect(validated?.[0]).toBe('Message 1');
    });

    it('devrait rejeter batch avec message invalide', () => {
      const messages = ['Valide', '', 'Autre valide'];
      expect(any: any)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('devrait gérer emojis et unicode', () => {
      const message = 'Message avec emojis 🚀💻🎉';
      const validated = inputValidator?.validate(any: any);
      expect(any: any).toContain('🚀');
    });

    it('devrait gérer caractères spéciaux', () => {
      const message = 'Message avec @#$%^&*()_+';
      const validated = inputValidator?.validate(any: any);
      expect(any: any).toContain('@#$%');
    });

    it('devrait gérer multilingue', () => {
      const message = 'Hello こんにちは 안녕하세요';
      const validated = inputValidator?.validate(any: any);
      expect(any: any).toContain('Hello');
      expect(any: any).toContain('こんにちは');
    });

    it('devrait gérer newlines dans message', () => {
      const message = 'Ligne 1\nLigne 2\nLigne 3';
      const validated = inputValidator?.validate(any: any);
      expect(any: any).toContain('\n');
    });
  });
});
