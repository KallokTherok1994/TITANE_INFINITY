import type { APIRequestContext } from '@playwright/test';
import net from 'node:net';

import { E2E_TIMEOUTS, REMOTE_E2E_DEFAULTS } from '../config/constants';

export const REMOTE_E2E_SKIP_MSG =
  'Remote gateway not running — start TITANE with TITANE_REMOTE_ENABLED=1';

let cachedReachability: boolean | null = null;

export async function isRemoteGatewayReachable(url: string): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const parsed = new URL(url);
      const port = parseInt(parsed.port || '7420', 10);
      const host = parsed.hostname;
      const socket = net.createConnection({
        host,
        port,
        timeout: E2E_TIMEOUTS.network,
      });

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

export async function requireRemoteGatewayOrFail(
  suiteName: string,
  baseUrl: string = REMOTE_E2E_DEFAULTS.baseUrl
): Promise<void> {
  if (cachedReachability === null) {
    cachedReachability = await isRemoteGatewayReachable(baseUrl);
  }

  if (!cachedReachability) {
    throw new Error(`[${suiteName}] ${REMOTE_E2E_SKIP_MSG} (baseUrl=${baseUrl})`);
  }
}

export function resetRemoteReachabilityCache(): void {
  cachedReachability = null;
}

export async function getRemoteTokens(
  request: APIRequestContext,
  {
    baseUrl = REMOTE_E2E_DEFAULTS.baseUrl,
    secret = REMOTE_E2E_DEFAULTS.secret,
  }: {
    baseUrl?: string;
    secret?: string;
  } = {}
): Promise<{ accessToken: string; refreshToken: string }> {
  const resp = await request.post(`${baseUrl}/api/auth/token`, {
    data: { secret },
    timeout: E2E_TIMEOUTS.auth,
  });

  if (!resp.ok()) {
    throw new Error(`Auth token request failed: HTTP ${resp.status()}`);
  }

  const data = await resp.json();
  if (!data.ok || !data.access_token) {
    throw new Error(`Auth token request failed: ${data.error ?? 'unknown_error'}`);
  }

  return {
    accessToken: String(data.access_token),
    refreshToken: String(data.refresh_token ?? ''),
  };
}

export async function getRemoteAccessToken(
  request: APIRequestContext,
  options?: { baseUrl?: string; secret?: string }
): Promise<string> {
  const tokens = await getRemoteTokens(request, options);
  return tokens.accessToken;
}
