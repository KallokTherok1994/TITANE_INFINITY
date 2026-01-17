// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v26.3.0 — APPEARANCE INTEGRATION TESTS
//   Test appearance sync with Three.js materials
//   NOTE: These tests require WebGL/Three.js. Skipped when unavailable.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Check if Three.js can load properly
let hasThreeJS = false;
let THREE: typeof import('three');
let AppearanceFloatingIntegration: typeof import('./appearanceFloatingIntegration').AppearanceFloatingIntegration;
let formalityToMetalness: typeof import('./appearanceFloatingIntegration').formalityToMetalness;
let energyToRoughness: typeof import('./appearanceFloatingIntegration').energyToRoughness;
let Formality: typeof import('../appearance/appearanceState').Formality;

try {
  THREE = await import('three');
  const integrationModule = await import('./appearanceFloatingIntegration');
  AppearanceFloatingIntegration = integrationModule.AppearanceFloatingIntegration;
  formalityToMetalness = integrationModule.formalityToMetalness;
  energyToRoughness = integrationModule.energyToRoughness;
  const appearanceModule = await import('../appearance/appearanceState');
  Formality = appearanceModule.Formality;
  hasThreeJS = true;
} catch {
  hasThreeJS = false;
}

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock ThreeJSAvatarRenderer (only if THREE loaded)
const mockRenderer = hasThreeJS
  ? {
      getRenderer: vi.fn(),
      getScene: vi.fn(() => new THREE.Scene()),
      getCamera: vi.fn(() => new THREE.PerspectiveCamera()),
      isInitialized: vi.fn(() => true),
      isRendering: vi.fn(() => true),
    }
  : null;

describe.skipIf(!hasThreeJS)('AppearanceFloatingIntegration', () => {
  let integration: InstanceType<typeof AppearanceFloatingIntegration>;

  beforeEach(() => {
    integration = new AppearanceFloatingIntegration(mockRenderer as any);
  });

  describe('Material Initialization', () => {
    it('should initialize materials with default colors', async () => {
      const mockBody = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial()
      );
      mockBody.name = 'body';
      const mockHead = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial()
      );
      mockHead.name = 'head';

      const materials = await integration.initializeMaterials([mockBody, mockHead]);

      expect(materials.body).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(materials.head).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(materials.body.name).toBe('avatar_body');
      expect(materials.head.name).toBe('avatar_head');
    });

    it('should set correct default metalness/roughness', async () => {
      const materials = await integration.initializeMaterials([]);

      expect(materials.body.metalness).toBe(0.2);
      expect(materials.body.roughness).toBe(0.7);
      expect(materials.head.metalness).toBe(0.1);
      expect(materials.head.roughness).toBe(0.6);
    });
  });

  describe('Color Palette Application', () => {
    beforeEach(async () => {
      await integration.initializeMaterials([]);
    });

    it('should apply neutral palette correctly', () => {
      const mockAppearance = {
        style: {
          theme: 'bureau',
          formality: Formality.Formal,
          color_palette: 'neutre',
          vibe: 'professionnelle',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as any);

      const materials = integration.getMaterials();
      expect(materials).not.toBeNull();
      // Body should use secondary color (gray)
      expect(materials!.body.color.getHex()).toBe(0x6b7280);
    });

    it('should apply pastel palette correctly', () => {
      const mockAppearance = {
        style: {
          theme: 'casual',
          formality: Formality.Casual,
          color_palette: 'pastel',
          vibe: 'calme',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as any);

      const materials = integration.getMaterials();
      expect(materials).not.toBeNull();
      // Head should use primary color (pink-100)
      expect(materials!.head.color.getHex()).toBe(0xfce7f3);
    });
  });

  describe('Style State Application', () => {
    beforeEach(async () => {
      await integration.initializeMaterials([]);
    });

    it('should adjust metalness based on formality (Formal)', () => {
      const mockAppearance = {
        style: {
          theme: 'bureau',
          formality: Formality.Formal,
          color_palette: 'neutre',
          vibe: 'professionnelle',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as any);

      const materials = integration.getMaterials();
      expect(materials!.body.metalness).toBe(0.3);
      expect(materials!.head.metalness).toBe(0.15); // metalness * 0.5
    });

    it('should adjust metalness based on formality (Casual)', () => {
      const mockAppearance = {
        style: {
          theme: 'casual',
          formality: Formality.Casual,
          color_palette: 'neutre',
          vibe: 'calme',
          epoch: 'moderne',
          energy: 'dynamique',
        },
      };

      integration.applyAppearance(mockAppearance as any);

      const materials = integration.getMaterials();
      expect(materials!.body.metalness).toBe(0.1);
    });

    it('should adjust roughness based on energy (calme)', () => {
      const mockAppearance = {
        style: {
          theme: 'bureau',
          formality: Formality.Smart,
          color_palette: 'neutre',
          vibe: 'professionnelle',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as any);

      const materials = integration.getMaterials();
      expect(materials!.body.roughness).toBe(0.8);
    });

    it('should adjust roughness based on energy (dynamique)', () => {
      const mockAppearance = {
        style: {
          theme: 'sport',
          formality: Formality.Casual,
          color_palette: 'neutre',
          vibe: 'énergétique',
          epoch: 'moderne',
          energy: 'dynamique',
        },
      };

      integration.applyAppearance(mockAppearance as any);

      const materials = integration.getMaterials();
      expect(materials!.body.roughness).toBe(0.5);
    });
  });

  describe('Material Property Updates', () => {
    beforeEach(async () => {
      await integration.initializeMaterials([]);
    });

    it('should update body color', () => {
      const newColor = new THREE.Color(0xff0000);
      integration.updateMaterialProperty('body', 'color', newColor);

      const materials = integration.getMaterials();
      expect(materials!.body.color.getHex()).toBe(0xff0000);
    });

    it('should update head metalness', () => {
      integration.updateMaterialProperty('head', 'metalness', 0.8);

      const materials = integration.getMaterials();
      expect(materials!.head.metalness).toBe(0.8);
    });

    it('should clamp metalness to [0, 1]', () => {
      integration.updateMaterialProperty('body', 'metalness', 1.5);

      const materials = integration.getMaterials();
      expect(materials!.body.metalness).toBe(1.0); // clamped
    });

    it('should clamp roughness to [0, 1]', () => {
      integration.updateMaterialProperty('body', 'roughness', -0.2);

      const materials = integration.getMaterials();
      expect(materials!.body.roughness).toBe(0.0); // clamped
    });
  });

  describe('Helper Functions', () => {
    it('should convert formality to metalness (Formal)', () => {
      expect(formalityToMetalness('Formal')).toBe(0.3);
    });

    it('should convert formality to metalness (Smart)', () => {
      expect(formalityToMetalness('Smart')).toBe(0.2);
    });

    it('should convert formality to metalness (Casual)', () => {
      expect(formalityToMetalness('Casual')).toBe(0.1);
    });

    it('should convert energy to roughness (calme)', () => {
      expect(energyToRoughness('calme')).toBe(0.8);
    });

    it('should convert energy to roughness (dynamique)', () => {
      expect(energyToRoughness('dynamique')).toBe(0.5);
    });

    it('should convert energy to roughness (enracinée)', () => {
      expect(energyToRoughness('enracinée')).toBe(0.7);
    });
  });

  describe('Cleanup', () => {
    it('should dispose all materials', async () => {
      await integration.initializeMaterials([]);
      const materials = integration.getMaterials();

      const bodySpy = vi.spyOn(materials!.body, 'dispose');
      const headSpy = vi.spyOn(materials!.head, 'dispose');

      integration.dispose();

      expect(bodySpy).toHaveBeenCalled();
      expect(headSpy).toHaveBeenCalled();
      expect(integration.getMaterials()).toBeNull();
    });
  });
});
