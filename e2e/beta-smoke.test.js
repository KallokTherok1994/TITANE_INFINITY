describe('Beta Smoke Test', () => {
  it('should load the app', async () => {
    await browser.url('/');
    const title = await browser.getTitle();
    expect(title).toContain('TITANE');
  });

  it('should have chat interface', async () => {
    const chatInput = await $('#chat-input');
    expect(await chatInput.isDisplayed()).toBe(true);
  });
});