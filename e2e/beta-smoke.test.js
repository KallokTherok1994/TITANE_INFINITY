describe('Beta Smoke Test', () => {
  it('should load the app', async () => {
    try {
      await browser.url('/');
      const title = await browser.getTitle();
      console.log('Page title:', title); // Ajout pour déboguer le titre
      expect(title).toContain('TITANE');
    } catch (error) {
      console.error('Failed to load the app:', error);
      throw error;
    }
  });

  it('should have chat interface', async () => {
    try {
      const chatInput = await $('#chat-input');
      const isDisplayed = await chatInput.isDisplayed();
      console.log('Chat input displayed:', isDisplayed); // Ajout pour déboguer l'état de l'élément
      expect(isDisplayed).toBe(true);
    } catch (error) {
      console.error('Chat interface not found:', error);
      throw error;
    }
  });
});
