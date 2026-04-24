/**
 * @module src/security/constants
 * @description Security module constants (whitelists, policies)
 */

/**
 * HTML tags allowed in sanitized content
 * Used by Sanitizer.ts for XSS prevention
 */
export const ALLOWED_HTML_TAGS = [
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
  'h4',
  'h5',
  'h6',
  'blockquote',
  'a',
  'span',
  'div',
];

/**
 * HTML attributes allowed in sanitized content
 */
export const ALLOWED_HTML_ATTRIBUTES = [
  'href', // Links
  'class', // Styling
  'id', // Identification
  'data-*', // Custom data
  'title', // Tooltips
  'rel', // Link relationships (noopener, noreferrer)
];

/**
 * CSP (Content Security Policy) default directives
 * TITANE frontend operates in Tauri WebView with restricted scope
 */
export const CSP_DEFAULT_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Tauri requires inline scripts
  'style-src': ["'self'", "'unsafe-inline'"], // Dynamic styles from Tauri
  'img-src': ["'self'", 'data:', 'blob:'], // Local + generated images
  'connect-src': ["'self'"], // Ollama access is routed through governed IPC transport
  'font-src': ["'self'"], // Local fonts only
  'frame-src': ["'none'"], // No iframes allowed
  'media-src': ["'self'"], // Local audio/video only
  'object-src': ["'none'"], // No plugins
  'base-uri': ["'self'"], // Base URL restriction
};

/**
 * Disallowed URL schemes for link validation
 */
export const DISALLOWED_URL_SCHEMES = [
  'javascript:',
  'data:text/html',
  'vbscript:',
  'file:',
];

/**
 * Maximum lengths for input validation
 */
export const INPUT_LIMITS = {
  apiKey: 2048,
  chatMessage: 10000,
  userName: 256,
  url: 2048,
  command: 512,
};

/**
 * Session timeout in milliseconds
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Session warning threshold (show "still here?" prompt)
 */
export const SESSION_WARNING_MS = 25 * 60 * 1000; // 25 minutes

/**
 * Patterns for detecting potential threats
 */
export const THREAT_PATTERNS = {
  sqlInjection: /('|(--)|;|\/\*|\*\/|xp_|sp_)/gi,
  commandInjection: /[;&|`$()]/g,
  pathTraversal: /\.\.\//g,
  xss: /<script|<iframe|javascript:|onerror=|onload=/gi,
};
