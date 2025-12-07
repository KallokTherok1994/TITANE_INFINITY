import { Sanitizer } from '../security/Sanitizer';

describe('Sanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      const clean = Sanitizer.sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Hello</p>');
    });

    it('should allow safe tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const clean = Sanitizer.sanitizeHtml(html);
      expect(clean).toBe(html);
    });
  });

  describe('sanitizeUserInput', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const escaped = Sanitizer.sanitizeUserInput(input);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(Sanitizer.validateUrl('https://example.com')).toBe(true);
      expect(Sanitizer.validateUrl('http://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(Sanitizer.validateUrl('javascript:alert(1)')).toBe(false);
      expect(Sanitizer.validateUrl('file:///etc/passwd')).toBe(false);
    });
  });
});
