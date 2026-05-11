import assert from 'node:assert/strict';

describe('Desktop HyperCenter route truth', () => {
  it('loads /hyper-center and exposes stable selectors', async () => {
    const routeCandidates = [
      'tauri://localhost/hyper-center',
      'tauri://localhost/#/hyper-center',
      'tauri://localhost',
    ];

    let mounted = false;

    for (const route of routeCandidates) {
      await browser.url(route);
      // Wait up to 8s for the page to mount (lazy-loaded route)
      await browser.waitUntil(
        async () => (await $('[data-testid="page-hyper-center"]').isExisting()),
        { timeout: 8000, interval: 300, timeoutMsg: 'page-hyper-center not mounted after 8s' }
      ).catch(() => null);

      const page = await $('[data-testid="page-hyper-center"]');
      if (await page.isExisting()) {
        mounted = true;
        break;
      }
    }

    assert.equal(
      mounted,
      true,
      'hyper-center surface must mount on at least one canonical route candidate'
    );
    assert.equal(
      await $('[data-testid="hyper-center-root"]').isExisting(),
      true,
      'hyper-center-root selector missing'
    );
    assert.equal(
      await $('[data-testid="hyper-center-mode-selector"]').isExisting(),
      true,
      'hyper-center-mode-selector selector missing'
    );
  });
});
