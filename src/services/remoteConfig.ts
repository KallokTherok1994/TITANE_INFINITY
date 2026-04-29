/**
 * TITANE∞ — Remote Configuration Service
 *
 * Exposes gateway management functions for UI components and settings pages.
 * Thin re-export of remoteTransport primitives — single import point for consumers.
 */
export {
  getRemoteGatewayUrl,
  setRemoteGatewayUrl,
  clearRemoteGatewayUrl,
  isRemoteGatewayAvailable,
  remoteAuthenticate,
  probeRemoteGateway,
} from '@/api/remoteTransport';

export type { RemoteIpcResult } from '@/api/remoteTransport';
