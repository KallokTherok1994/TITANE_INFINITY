// E2E test - Explainability Dashboard
import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('Explainability dashboard visible et selectors présents', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('omega-chat-preferred-provider', 'ollama');
    window.localStorage.setItem('titane_active_conversation_id', 'conv-explainability-e2e');
    window.localStorage.setItem(
      'titane_conversation_conv-explainability-e2e',
      JSON.stringify({
        id: 'conv-explainability-e2e',
        title: 'Explainability E2E',
        status: 'active',
        created_at: 1,
        updated_at: 2,
        messages: [
          {
            role: 'assistant',
            content: 'Trace explainability visible',
            timestamp: 2,
            metadata: {
              providerMeta: {
                provider_used: 'Ollama (OMEGA+Singularity)',
                provider_class: 'local',
                mode: 'LOCAL',
                reason_code: 'OK',
                latency_ms_total: 55,
                timeout_ms: 30000,
                retries: 0,
                attempts: [
                  {
                    provider_id: 'ollama',
                    provider_class: 'local',
                    latency_ms: 55,
                    outcome: 'success',
                    reason_code: 'OK',
                    network_used_attempt: false,
                  },
                ],
                network_used: false,
                cache_hit: false,
                policy: 'default',
              },
            },
          },
        ],
      })
    );
  });

  await page.goto('/titane');
  await closeBootBeaconIfPresent(page);
  await expect(page.getByTestId('explainability-dashboard')).toBeVisible();
  await expect(page.getByTestId('explainability-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('explainability-dashboard-status')).toContainText(
    'PARTIAL'
  );
  await expect(page.getByTestId('explainability-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('explainability-dashboard-inference-chain')).toBeVisible();
  await expect(page.getByTestId('explainability-dashboard-inference-chain-1')).toContainText(
    'Used: Ollama'
  );
  await expect(page.getByTestId('explainability-dashboard-inference-report')).toBeVisible();
  await expect(page.getByTestId('explainability-dashboard-next-step')).toContainText(
    'historique horodate'
  );
});
