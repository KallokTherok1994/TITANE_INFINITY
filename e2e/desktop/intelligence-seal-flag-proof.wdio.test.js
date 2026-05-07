import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Desktop D5 intelligence seal flag proof', () => {
  it('keeps the D5 flag contract wired and app shell reachable', async () => {
    await browser.url('tauri://localhost');
    await browser.pause(1000);
    assert.equal(await $('body').isExisting(), true, 'desktop shell should be reachable');

    const contractPath = path.resolve(process.cwd(), 'src/services/intelligence_seal/IntelligenceSealContract.ts');
    const content = fs.readFileSync(contractPath, 'utf8');

    assert.equal(
      content.includes("import.meta.env?.['VITE_TITANE_D5_INTELLIGENCE_SEAL'] === 'true'"),
      true,
      'D5 feature flag contract must keep canonical import.meta.env resolution'
    );
  });
});
