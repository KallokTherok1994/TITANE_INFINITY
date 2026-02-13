/**
 * Direct WDIO Connection Test
 * Minimal test to isolate WebDriver session hang point
 * Bypasses orchestrator; runs directly via wdio CLI
 */

describe('Direct WebDriver Connection Test', () => {
  it('should connect and get initial URL', async () => {
    console.log('🧪 DIRECT TEST: Attempting browser.url()...');
    const url = await browser.getUrl();
    console.log(`✅ DIRECT TEST: Got URL: ${url}`);
    expect(url).toBeDefined();
  });

  it('should detect about:blank and navigate', async () => {
    console.log('🧪 DIRECT TEST: Checking current URL...');
    const currentUrl = await browser.getUrl();
    console.log(`📍 DIRECT TEST: Current URL: ${currentUrl}`);

    if (currentUrl === 'about:blank') {
      console.warn('⚠️ DIRECT TEST: Detected about:blank, navigating...');
      await browser.url('http://127.0.0.1:1420/');
      await browser.pause(1000);
      const newUrl = await browser.getUrl();
      console.log(`✅ DIRECT TEST: After navigation: ${newUrl}`);
    }
  });

  it('should get page title', async () => {
    console.log('🧪 DIRECT TEST: Getting title...');
    const title = await browser.getTitle();
    console.log(`✅ DIRECT TEST: Title: ${title}`);
    expect(title).toBeDefined();
  });
});
