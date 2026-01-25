import assert from 'node:assert/strict';

describe('Desktop (Tauri) Smoke', () => {
  it('loads the app root document', async () => {
    await browser.url('/');
    await browser.pause(750);

    const exists = await $('body').isExisting();
    assert.equal(exists, true);
  });
});
