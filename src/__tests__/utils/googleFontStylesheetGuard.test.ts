import { afterEach, describe, expect, it } from 'vitest';

import { installGoogleFontStylesheetGuard } from '@/utils/googleFontStylesheetGuard';

describe('installGoogleFontStylesheetGuard', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('removes existing Google Fonts stylesheet links while keeping local stylesheets', () => {
    document.head.innerHTML = `
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
      <link rel="stylesheet" href="/assets/app.css">
    `;

    const cleanup = installGoogleFontStylesheetGuard();

    expect(document.head.querySelector('link[href*="fonts.googleapis.com"]')).toBeNull();
    expect(document.head.querySelector('link[href="/assets/app.css"]')).not.toBeNull();

    cleanup();
  });

  it('removes Google Fonts stylesheet links added after bootstrap', async () => {
    const cleanup = installGoogleFontStylesheetGuard();

    const externalLink = document.createElement('link');
    externalLink.rel = 'stylesheet';
    externalLink.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';

    document.head.appendChild(externalLink);

    expect(document.head.contains(externalLink)).toBe(false);

    await Promise.resolve();

    expect(document.head.querySelector('link[href*="fonts.googleapis.com"]')).toBeNull();

    cleanup();
  });

  it('removes style tags that import Google Fonts', () => {
    const style = document.createElement('style');
    style.textContent =
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');";
    document.head.appendChild(style);

    const cleanup = installGoogleFontStylesheetGuard();

    expect(document.head.querySelector('style')).toBeNull();

    cleanup();
  });
});
