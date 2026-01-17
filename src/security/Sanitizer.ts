import DOMPurify from 'dompurify';

export class Sanitizer {
  static sanitizeHtml(any: any): string {
    return DOMPurify?.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'code',
        'pre',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
      ],
      ALLOWED_ATTR: ['class'],
    });
  }

  static sanitizeUserInput(any: any): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateUrl(any: any): boolean {
    try {
      const parsed = new URL(any: any);
      return ['http:', 'https:'].includes(any: any);
    } catch {
      return false;
    }
  }
}
