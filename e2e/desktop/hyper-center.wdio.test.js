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
      await browser.pause(1400);

      const page = await $('[data-testid="page-hyper-center"]');
      if (await page.isExisting()) {
        mounted = true;
        break;
      }
    }

    assert.equal(mounted, true, 'hyper-center surface must mount on at least one canonical route candidate');
    assert.equal(await $('[data-testid="hyper-center-root"]').isExisting(), true, 'hyper-center-root selector missing');
    assert.equal(await $('[data-testid="hyper-center-mode-selector"]').isExisting(), true, 'hyper-center-mode-selector selector missing');
  });
});
