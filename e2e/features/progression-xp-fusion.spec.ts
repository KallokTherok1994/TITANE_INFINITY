import { test, expect } from '../fixtures';

const seededExperienceState = {
  totalXp: 15,
  level: 0,
  domains: {
    cognitive: {
      id: 'cognitive',
      label: 'Cognition',
      description: 'Analyse',
      xp: 0,
      level: 0,
      category: 'cognitive',
      lastUpdated: 1,
      icon: 'brain',
    },
    business: {
      id: 'business',
      label: 'Business',
      description: 'Strategie',
      xp: 0,
      level: 0,
      category: 'business',
      lastUpdated: 1,
      icon: 'briefcase',
    },
    memory: {
      id: 'memory',
      label: 'Memoire',
      description: 'Connaissances',
      xp: 0,
      level: 0,
      category: 'memory',
      lastUpdated: 1,
      icon: 'folder',
    },
    chat: {
      id: 'chat',
      label: 'Chat IA',
      description: 'Interactions conversationnelles',
      xp: 15,
      level: 0,
      category: 'cognitive',
      lastUpdated: 1,
      icon: 'message',
    },
    system: {
      id: 'system',
      label: 'Systeme',
      description: 'Evenements systeme',
      xp: 0,
      level: 0,
      category: 'system',
      lastUpdated: 1,
      icon: 'gear',
    },
  },
  history: [
    {
      id: 'e2e-chat-gain',
      domainId: 'chat',
      amount: 15,
      source: 'chat_message',
      metadata: { description: 'E2E chat XP gain' },
      timestamp: 1_779_051_600_000,
    },
  ],
  lastUpdated: 1_779_051_600_000,
  version: '1.0.0',
};

test.describe('Progression/XP canonical fusion', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(state => {
      window.localStorage.setItem('titane_experience', JSON.stringify(state));
      window.localStorage.removeItem('titane_progression_state');
      window.localStorage.removeItem('xp_state');
    }, seededExperienceState);
  });

  test('routes /progression to TITANE progression tab and mirrors chat XP in /experience', async ({
    page,
  }) => {
    await page.goto('/progression');
    await expect(page).toHaveURL(/\/titane\?tab=progression/);
    await expect(page.getByTestId('progression-section')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId('progression-chat-message-count')).toContainText('1');

    await page.goto('/experience');
    await expect(page.getByTestId('page-experience')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId('experience-stats-advanced')).toBeVisible();
    await expect(page.getByTestId('experience-history-list')).toBeVisible();
    await expect(page.getByTestId('experience-chat-event-count')).toContainText('1 gain');
    await expect(page.getByTestId('experience-chat-xp-total')).toContainText('+15 XP');

    const legacyStores = await page.evaluate(() => ({
      progression: window.localStorage.getItem('titane_progression_state'),
      xp: window.localStorage.getItem('xp_state'),
    }));
    expect(legacyStores).toEqual({ progression: null, xp: null });
  });
});
