// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — APPEARANCE INTEGRATION TESTS
//   Test appearance sync with Three.js materials
// ═══════════════════════════════════════════════════════════════════════════

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { AppearanceFloatingIntegration, parseColor, formalityToMetalness, energyToRoughness } from './appearanceFloatingIntegration';
import type { AvatarAppearanceState } from '../appearance/appearanceState';
import { Formality } from '../appearance/appearanceState';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock ThreeJSAvatarRenderer
const mockRenderer = {
  getRenderer: vi.fn(),
  getScene: vi.fn(() => new THREE.Scene()),
  getCamera: vi.fn(() => new THREE.PerspectiveCamera()),
  isInitialized: vi.fn(() => true),
  isRendering: vi.fn(() => true),
};

describe('AppearanceFloatingIntegration', () => {
  let integration: AppearanceFloatingIntegration;

  beforeEach(() => {
    integration = new AppearanceFloatingIntegration(mockRenderer as any);
  });

  describe('Material Initialization', () => {
    it('should initialize materials with default colors', () => {
      const mockBody = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
      mockBody.name = 'body';
      const mockHead = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
      mockHead.name = 'head';

      const materials = integration.initializeMaterials([mockBody, mockHead]);

      expect(materials.body).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(materials.head).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(materials.body.name).toBe('avatar_body');
      expect(materials.head.name).toBe('avatar_head');
    });

    it('should set correct default metalness/roughness', () => {
      const materials = integration.initializeMaterials([]);

      expect(materials.body.metalness).toBe(0.2);
      expect(materials.body.roughness).toBe(0.7);
      expect(materials.head.metalness).toBe(0.1);
      expect(materials.head.roughness).toBe(0.6);
    });
  });

  describe('Color Palette Application', () => {
    beforeEach(() => {
      integration.initializeMaterials([]);
    });

    it('should apply neutral palette correctly', () => {
      const mockAppearance: Partial<AvatarAppearanceState> = {
        style: {
          theme: 'bureau',
          formality: Formality.Formal,
          color_palette: 'neutre',
          vibe: 'professionnelle',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as AvatarAppearanceState);

      const materials = integration.getMaterials();
      expect(materials).not.toBeNull();
      // Body should use secondary color (gray)
      expect(materials!.body.color.getHex()).toBe(0x6b7280);
    });

    it('should apply pastel palette correctly', () => {
      const mockAppearance: Partial<AvatarAppearanceState> = {
        style: {
          theme: 'casual',
          formality: Formality.Casual,
          color_palette: 'pastel',
          vibe: 'calme',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as AvatarAppearanceState);

      const materials = integration.getMaterials();
      expect(materials).not.toBeNull();
      // Head should use primary color (pink-100)
      expect(materials!.head.color.getHex()).toBe(0xfce7f3);
    });
  });

  describe('Style State Application', () => {
    beforeEach(() => {
      integration.initializeMaterials([]);
    });

    it('should adjust metalness based on formality (Formal)', () => {
      const mockAppearance: Partial<AvatarAppearanceState> = {
        style: {
          theme: 'bureau',
          formality: Formality.Formal,
          color_palette: 'neutre',
          vibe: 'professionnelle',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as AvatarAppearanceState);

      const materials = integration.getMaterials();
      expect(materials!.body.metalness).toBe(0.3);
      expect(materials!.head.metalness).toBe(0.15); // metalness * 0.5
    });

    it('should adjust metalness based on formality (Casual)', () => {
      const mockAppearance: Partial<AvatarAppearanceState> = {
        style: {
          theme: 'casual',
          formality: Formality.Casual,
          color_palette: 'neutre',
          vibe: 'calme',
          epoch: 'moderne',
          energy: 'dynamique',
        },
      };

      integration.applyAppearance(mockAppearance as AvatarAppearanceState);

      const materials = integration.getMaterials();
      expect(materials!.body.metalness).toBe(0.1);
    });

    it('should adjust roughness based on energy (calme)', () => {
      const mockAppearance: Partial<AvatarAppearanceState> = {
        style: {
          theme: 'bureau',
          formality: Formality.Smart,
          color_palette: 'neutre',
          vibe: 'professionnelle',
          epoch: 'moderne',
          energy: 'calme',
        },
      };

      integration.applyAppearance(mockAppearance as AvatarAppearanceState);

      const materials = integration.getMaterials();
      expect(materials!.body.roughness).toBe(0.8);
    });

    it('should adjust roughness based on energy (dynamique)', () => {
      const mockAppearance: Partial<AvatarAppearanceState> = {
        style: {
          theme: 'sport',
          formality: Formality.Casual,
          color_palette: 'neutre',
          vibe: 'énergétique',
          epoch: 'moderne',
          energy: 'dynamique',
        },
      };

      integration.applyAppearance(mockAppearance as AvatarAppearanceState);

      const materials = integration.getMaterials();
      expect(materials!.body.roughness).toBe(0.5);
    });
  });

  describe('Material Property Updates', () => {
    beforeEach(() => {
      integration.initializeMaterials([]);
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
    it('should parse hex color correctly', () => {
      const color = parseColor('#ff5733');
      expect(color.getHex()).toBe(0xff5733);
    });

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
    it('should dispose all materials', () => {
      integration.initializeMaterials([]);
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
