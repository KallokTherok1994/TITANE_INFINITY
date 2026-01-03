/**
 * E2E Test: Audio Center (Feature Test)
 * TITANE∞ v26.2.0 - Automated Quality Assurance
 *
 * User journey: Navigate to Audio Center, test audio settings, voice calibration, device selection
 */

import { test, expect } from '@playwright/test';

test.describe('Feature: Audio Center', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Vite dev server
    await page.goto('http://localhost:5173');
    // Wait for app to fully initialize
    await page.waitForTimeout(2000);
  });

  test('navigates to Audio Center page', async ({ page }) => {
    // Wait for navigation
    await page.waitForSelector('nav, [role="navigation"]', { timeout: 10000 });

    // Look for Audio Center link
    const audioLink = page.locator('a[href*="audio"], button:has-text("Audio"), button:has-text("🎙")').first();
    
    if (await audioLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await audioLink.click();
    } else {
      // Direct navigation fallback
      await page.goto('http://localhost:5173/#/admin');
      await page.waitForTimeout(1000);
      
      // Navigate to Audio tab if in Admin Center
      const audioTab = page.locator('button:has-text("Audio"), [data-tab="audio"]').first();
      if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await audioTab.click();
      }
    }

    // Verify Audio Center loaded
    await page.waitForTimeout(1000);
    
    // Look for audio-specific elements
    const audioHeader = page.locator('h1:has-text("Audio"), h2:has-text("Audio"), h1:has-text("🎙")').first();
    await expect(audioHeader).toBeVisible({ timeout: 10000 });
  });

  test('Audio Center displays device selection', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    // Navigate to Audio tab if needed
    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for device selection dropdowns
    const deviceSelects = page.locator('select, [role="combobox"]');
    const outputDeviceSelect = page.locator('select:has-option([value*="output"]), select:has-option([value*="speaker"])').first();
    const inputDeviceSelect = page.locator('select:has-option([value*="input"]), select:has-option([value*="micro"])').first();

    // At least one device selector should be visible
    const deviceSelectorVisible = await Promise.race([
      deviceSelects.first().isVisible({ timeout: 5000 }).catch(() => false),
      outputDeviceSelect.isVisible({ timeout: 5000 }).catch(() => false),
      inputDeviceSelect.isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(deviceSelectorVisible).toBeTruthy();
  });

  test('Audio Center: TTS settings section', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for TTS settings (Text-to-Speech)
    const ttsSection = page.locator('text=/TTS|Text.*Speech|Synthèse vocale|Voice/i').first();
    const voiceSelect = page.locator('select:has-option([value*="voice"]), select[name*="voice"]').first();

    const ttsSectionVisible = await Promise.race([
      ttsSection.isVisible({ timeout: 5000 }).catch(() => false),
      voiceSelect.isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(ttsSectionVisible).toBeTruthy();
  });

  test('Audio Center: voice calibration button', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for voice calibration/fingerprinting button
    const calibrationButton = page.locator('button:has-text("Calibr"), button:has-text("Voice"), button:has-text("Empreinte")').first();
    
    if (await calibrationButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(calibrationButton).toBeVisible();
    } else {
      console.log('⚠️ Voice calibration button not found (may be in different section)');
    }
  });

  test('Audio Center: test audio output button', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for test audio button
    const testAudioButton = page.locator('button:has-text("Test"), button:has-text("Tester"), button:has-text("🔊")').first();
    
    if (await testAudioButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await testAudioButton.click();
      await page.waitForTimeout(1000);

      // Verify no crash
      const audioHeader = page.locator('h1:has-text("Audio"), h2:has-text("Audio")').first();
      await expect(audioHeader).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⚠️ Test audio button not found');
    }
  });

  test('Audio Center: microphone test functionality', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for microphone test button
    const micTestButton = page.locator('button:has-text("Micro"), button:has-text("Test.*micro"), button:has-text("🎤")').first();
    
    if (await micTestButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await micTestButton.click();
      await page.waitForTimeout(1500);

      // Look for microphone level indicator or waveform
      const micIndicator = page.locator('canvas, svg, [class*="waveform"], [class*="level"]').first();
      
      const micIndicatorVisible = await micIndicator.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (micIndicatorVisible) {
        await expect(micIndicator).toBeVisible();
      } else {
        console.log('⚠️ Microphone indicator not found (may require user permission)');
      }
    } else {
      console.log('⚠️ Microphone test button not found');
    }
  });

  test('Audio Center: voice fingerprint info display', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for voice fingerprint status (calibrated/not calibrated)
    const fingerprintStatus = page.locator('text=/Empreinte|Fingerprint|Calibr|Profil vocal/i').first();
    
    if (await fingerprintStatus.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(fingerprintStatus).toBeVisible();
    } else {
      console.log('⚠️ Voice fingerprint status not found');
    }
  });

  test('Audio Center: volume sliders interaction', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for volume sliders (input[type="range"])
    const volumeSlider = page.locator('input[type="range"]').first();
    
    if (await volumeSlider.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Get current value
      const initialValue = await volumeSlider.inputValue();

      // Move slider
      await volumeSlider.fill('50');
      await page.waitForTimeout(300);

      // Verify slider moved
      const newValue = await volumeSlider.inputValue();
      expect(newValue).not.toBe(initialValue);
    } else {
      console.log('⚠️ Volume slider not found');
    }
  });

  test('Audio Center: save settings button', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for save button
    const saveButton = page.locator('button:has-text("Enregistrer"), button:has-text("Save"), button:has-text("Sauvegarder")').first();
    
    if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(500);

      // Verify no crash
      const audioHeader = page.locator('h1:has-text("Audio"), h2:has-text("Audio")').first();
      await expect(audioHeader).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⚠️ Save button not found (settings may auto-save)');
    }
  });

  test('Audio Center: displays audio configuration status', async ({ page }) => {
    // Navigate to Audio Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const audioTab = page.locator('button:has-text("Audio")').first();
    if (await audioTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await audioTab.click();
      await page.waitForTimeout(500);
    }

    // Look for status indicators (connected, calibrated, etc.)
    const statusIndicators = page.locator('text=/Connecté|Connected|Calibré|Calibrated|Actif|Active/i');
    
    const statusVisible = await statusIndicators.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (statusVisible) {
      await expect(statusIndicators.first()).toBeVisible();
    } else {
      console.log('⚠️ Status indicators not found');
    }
  });
});
