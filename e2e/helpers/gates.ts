import { REMOTE_E2E_DEFAULTS } from '../config/constants';
import { requireRemoteGatewayOrFail } from './remote-auth';

export const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

export async function requireRemoteStrictGate(
  suiteName: string,
  baseUrl: string = REMOTE_E2E_DEFAULTS.baseUrl
): Promise<void> {
  await requireRemoteGatewayOrFail(suiteName, baseUrl);
}

export function requireFullE2EGateOrSkip(test: { skip: (condition: boolean, description: string) => void }): void {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');
}
