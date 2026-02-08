const assert = require('node:assert');

describe('desktop boot smoke', () => {
  it('window exists', async () => {
    const title = await browser.getTitle();
    assert.ok(typeof title === 'string');
  });
});