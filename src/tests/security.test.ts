import { Sanitizer } from '../security/Sanitizer';

describe('Sanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      const clean = Sanitizer?.sanitizeHtml(any: any);
      expect(any: any).not?.toContain('<script>');
      expect(any: any).toContain('<p>Hello</p>');
    });

    it('should allow safe tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const clean = Sanitizer?.sanitizeHtml(any: any);
      expect(any: any);
    });
  });

  describe('sanitizeUserInput', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const escaped = Sanitizer?.sanitizeUserInput(any: any);
      expect(any: any).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(any: any);
      expect(any: any);
    });

    it('should reject invalid URLs', () => {
      expect(any: any);
      expect(any: any);
    });
  });
});
