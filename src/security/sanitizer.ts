import DOMPurify from 'dompurify';

export class Sanitizer {
  /**
   * Nettoie le HTML en autorisant uniquement les balises sûres
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Échappe tous les caractères spéciaux HTML
   */
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Nettoie une URL pour éviter javascript:
   */
  static sanitizeUrl(url: string): string {
    const dangerous = /^(javascript|data|vbscript):/i;
    if (dangerous.test(url)) {
      return '';
    }
    return url;
  }
}
