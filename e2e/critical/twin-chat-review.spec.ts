import { test, expect } from '@playwright/test';

import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('TwinsPage expose la review chat→Twin et permet la validation explicite', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('onboarding_completed', 'true');
    window.localStorage.setItem('titane_onboarding_complete', '1');
    window.localStorage.setItem(
      'titane_twin_chat_review_queue_v1',
      JSON.stringify([
        {
          id: 'value:clarte',
          candidate: {
            id: 'value:clarte',
            kind: 'value',
            contentCompact: 'clarte',
            context: 'conversation',
            confidence: 0.88,
            evidenceSource: 'chat_turn',
            consentRisk: 'medium',
            status: 'shadow',
            canWriteTwin: false,
            route: '/titane',
            moduleId: 'conversation',
          },
          decision: {
            candidateId: 'value:clarte',
            verdict: 'review_required',
            observationType: 'value',
            validationStatus: 'requires_kevin_validation',
            riskLevel: 'medium',
            canWriteTwin: false,
            requiresKevinValidation: true,
          },
          recordedAt: '2026-05-15T12:00:00.000Z',
          lastSeenAt: '2026-05-15T12:00:00.000Z',
          writeStatus: 'pending',
        },
      ])
    );
  });

  await page.goto('/twins');
  await closeBootBeaconIfPresent(page);

  await expect(page.getByTestId('page-twins')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('twin-chat-review-queue')).toBeVisible();
  await expect(page.getByTestId('twin-chat-review-count')).toContainText('pending:1');
  await expect(page.getByTestId('twin-chat-review-item-0')).toContainText(
    'review_required'
  );
  await expect(page.getByTestId('twin-chat-review-item-content-0')).toContainText(
    'clarte'
  );
  await expect(page.getByTestId('twin-chat-review-approve-0')).toBeVisible();
  await expect(page.getByTestId('twin-chat-review-reject-0')).toBeVisible();
});
