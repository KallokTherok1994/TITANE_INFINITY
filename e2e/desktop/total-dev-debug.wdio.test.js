/**
 * TOTAL_DEV Debug Test — Diagnose rendering issue
 */

describe('TOTAL_DEV Debug Navigation & Rendering', () => {
  it('logs DOM structure after navigation', async function () {
    this.timeout(30000);

    // Launch
    await browser.url('tauri://localhost');
    await browser.pause(4000);

    // Navigate
    await browser.execute(() => {
      window.location.hash = '#/total-dev';
    });
    await browser.pause(3000);

    // Dump DOM info
    const domInfo = await browser.execute(() => {
      const bodyHTML = document.body.innerHTML.substring(0, 1000);
      const h = document.querySelector('[data-testid="total-dev-header"]');
      const lock = document.querySelector('[data-testid="lock-badge"]');
      const panel = document.querySelector('.total-dev-unlock-panel');
      const allDataTestIds = Array.from(document.querySelectorAll('[data-testid]')).map(
        el => el.getAttribute('data-testid')
      );

      return {
        bodySnippet: bodyHTML,
        headerFound: !!h,
        lockFound: !!lock,
        panelFound: !!panel,
        allDataTestIds: allDataTestIds.slice(0, 20),
        currentHash: window.location.hash,
        bodyClass: document.body.className,
      };
    });

    console.log('DOM DEBUG INFO:', JSON.stringify(domInfo, null, 2));
  });
});
