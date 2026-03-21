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

  it('checks BrowserRouter native route strategies', async function () {
    this.timeout(60000);

    const strategies = [];

    await browser.url('tauri://localhost');
    await browser.pause(4000);

    await browser.url('tauri://localhost/total-dev');
    await browser.pause(3000);

    const deepLinkInfo = await browser.execute(() => ({
      href: window.location.href,
      pathname: window.location.pathname,
      header: !!document.querySelector('[data-testid="total-dev-header"]'),
      lock: !!document.querySelector('[data-testid="lock-badge"]'),
      panel: !!document.querySelector('.total-dev-unlock-panel'),
    }));
    strategies.push({ name: 'deep-link', ...deepLinkInfo });

    await browser.url('tauri://localhost/titane');
    await browser.pause(3000);

    await browser.execute(() => {
      window.history.pushState({}, '', '/total-dev');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await browser.pause(3000);

    const pushStateInfo = await browser.execute(() => ({
      href: window.location.href,
      pathname: window.location.pathname,
      header: !!document.querySelector('[data-testid="total-dev-header"]'),
      lock: !!document.querySelector('[data-testid="lock-badge"]'),
      panel: !!document.querySelector('.total-dev-unlock-panel'),
    }));
    strategies.push({ name: 'history-pushstate', ...pushStateInfo });

    console.log('TOTAL_DEV ROUTE STRATEGIES:', JSON.stringify(strategies, null, 2));
  });

  it('checks how the More menu can reveal nav-total-dev', async function () {
    this.timeout(60000);

    const snapshots = [];

    await browser.url('tauri://localhost/titane');
    await browser.pause(4000);

    const captureState = async name => {
      const state = await browser.execute(() => {
        const more = document.querySelector('[data-testid="btn-nav-more"]');
        const totalDev = document.querySelector('[data-testid="nav-total-dev"]');
        const menu = document.querySelector('[role="menu"]');
        return {
          expanded: more?.getAttribute('aria-expanded') ?? null,
          totalDev: !!totalDev,
          menu: !!menu,
          href: window.location.href,
          navIds: Array.from(document.querySelectorAll('[data-testid^="nav-"]'))
            .map(el => el.getAttribute('data-testid'))
            .slice(0, 20),
          name,
        };
      });
      snapshots.push(state);
    };

    await captureState('before');

    const moreBtn = await $('[data-testid="btn-nav-more"]');
    await browser.execute(element => element?.click(), moreBtn);
    await browser.pause(1500);
    await captureState('after-dom-click');

    await moreBtn.click();
    await browser.pause(500);
    await browser.keys(['Enter']);
    await browser.pause(1500);
    await captureState('after-enter');

    await browser.execute(element => {
      if (!element) return;
      element.focus();
      element.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      );
      element.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, cancelable: true })
      );
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }, moreBtn);
    await browser.pause(1500);
    await captureState('after-full-mouse-sequence');

    console.log('TOTAL_DEV MORE MENU STRATEGIES:', JSON.stringify(snapshots, null, 2));
  });
});
