/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CAMERA MODULE EXPORTS
 *   Super Prompt #3 — Feature #2
 * ═══════════════════════════════════════════════════════════════
 */

// Camera Chat Handler
export {
  parseCameraCommand,
  containsCameraKeyword,
  generateCameraStatusResponse,
  type CameraCommand,
  type CameraAction,
} from './cameraChatHandler';

// Camera Chat Integration
export {
  handleCameraInChat,
  type CameraChatIntegrationResult,
} from './cameraChatIntegration';
