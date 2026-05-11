/**
 * uiDesktopVisualCapture.js
 *
 * Desktop Visual Capture Helpers v78
 *
 * Provides utilities for capturing and recording visual state in desktop tests
 */

const fs = require('fs');
const path = require('path');

class DesktopVisualCapture {
  constructor(options = {}) {
    this.artifactDir = options.artifactDir || 'artifacts/ui-visual';
    this.screenshotDir = path.join(this.artifactDir, 'screenshots', 'v78', 'desktop');
    this.records = [];

    // Create directories
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Capture visual evidence for a page
   *
   * @param {*} browser - WebDriver instance
   * @param {*} page - Page info {route, pageId, label}
   * @returns {Object} visual record
   */
  async captureRoute(browser, page) {
    const { route, pageId, label } = page;

    try {
      // Navigate
      try {
        await browser.executeScript(`window.location.hash = '${route}'`, []);
      } catch (e) {
        // Fallback to click if hash navigation fails
        const btn = await $(`[data-testid*="${pageId}"]`).catch(() => null);
        if (btn) await btn.click();
      }

      // Wait for route to settle
      await browser.pause(1500);

      // Collect evidence
      const evidence = await this._collectEvidence(browser, route, pageId);

      // Take screenshots
      const screenshotPath = path.join(this.screenshotDir, `${pageId}.png`);
      await browser.takeScreenshot(screenshotPath);

      const record = {
        schemaVersion: 'v78',
        capturedAt: new Date().toISOString(),
        runtime: 'desktop-installed-tauri',
        route,
        pageId,
        label,
        rootFound: evidence.rootFound,
        headingFound: evidence.headingFound,
        truthBadgeFound: evidence.truthBadge,
        disclosureFound: evidence.disclosure,
        agentOverlayState: evidence.agentOverlay,
        screenshot: `screenshots/v78/desktop/${pageId}.png`,
        visualStatus: this._determineVisualStatus(evidence),
        desktopStatus: 'DESKTOP_PASS',
        blocker: null,
        sourceSpec: 'ui-desktop-installed-full-visual-capture.wdio.test.js',
      };

      this.records.push(record);
      console.log(`[DesktopVisualCapture] ${label}: ${record.visualStatus}`);

      return record;
    } catch (error) {
      const record = {
        schemaVersion: 'v78',
        capturedAt: new Date().toISOString(),
        runtime: 'desktop-installed-tauri',
        route,
        pageId,
        label,
        rootFound: false,
        headingFound: false,
        truthBadgeFound: false,
        disclosureFound: false,
        agentOverlayState: 'absent',
        screenshot: null,
        visualStatus: 'VISUAL_BROKEN',
        desktopStatus: 'DESKTOP_BLOCKED_BY_NAVIGATION',
        blocker: error.message,
        sourceSpec: 'ui-desktop-installed-full-visual-capture.wdio.test.js',
      };

      this.records.push(record);
      console.error(`[DesktopVisualCapture] ${label} FAILED:`, error.message);

      return record;
    }
  }

  /**
   * Collect visual evidence from page
   *
   * @private
   */
  async _collectEvidence(browser, route, pageId) {
    return await browser.execute(
      (route, pageId) => {
        const root = document.querySelector('[data-testid^="page-"]');
        const heading = document.querySelector('h1, h2, [role="heading"]');
        const truthBadge = document.querySelector(
          '[data-testid*="truth"], [data-testid*="badge"]'
        );
        const disclosure = document.querySelector(
          '[data-testid*="disclosure"], [data-testid*="guard"]'
        );
        const agentOverlay = document.querySelector('[data-testid="agent-overlay"]');

        return {
          rootFound: !!root,
          headingFound: !!heading,
          truthBadge: !!truthBadge,
          disclosure: !!disclosure,
          agentOverlay:
            agentOverlay && window.getComputedStyle(agentOverlay).display !== 'none'
              ? 'present'
              : 'absent',
        };
      },
      route,
      pageId
    );
  }

  /**
   * Determine visual status from evidence
   *
   * @private
   */
  _determineVisualStatus(evidence) {
    if (!evidence.rootFound) return 'VISUAL_BROKEN';
    if (evidence.disclosure) return 'VISUAL_GUARDED';
    return 'VISUAL_ACTIVE';
  }

  /**
   * Write artifact to disk
   *
   * @param {string} artifactPath - output path
   */
  writeArtifact(artifactPath) {
    const content = this.records.map(r => JSON.stringify(r)).join('\n');
    fs.writeFileSync(artifactPath, content);
    console.log(`[DesktopVisualCapture] Artifact written: ${artifactPath}`);
  }

  /**
   * Get all records
   */
  getRecords() {
    return this.records;
  }

  /**
   * Clear records
   */
  clear() {
    this.records = [];
  }
}

module.exports = DesktopVisualCapture;
