/**
 * V20 DOM DIAGNOSTIC — introspect actual DOM structure of 26.4.0 AppImage
 * to distinguish selector mismatches from real UI failures
 */
import fs from 'node:fs';
import path from 'node:path';

const DIAG_FILE = process.env.TITANE_V20_DIAG_FILE || '/tmp/v20_dom_diag.json';

describe('V20 DOM Diagnostic', () => {
  before(async () => {
    await browser.url('tauri://localhost');
    await browser.pause(2500);
  });

  it('DOM introspection — shell + navigate to titane', async () => {
    // Navigate to /titane
    await browser.execute(() => {
      window.location.hash = '/titane';
    });
    await browser.pause(2000);

    const diag = await browser.execute(() => {
      // Get all unique tag names
      const allEls = Array.from(document.querySelectorAll('*'));
      const tags = [...new Set(allEls.map(e => e.tagName.toLowerCase()))].sort();

      // Get all unique classes
      const allClasses = new Set();
      allEls.forEach(e => {
        e.className &&
          typeof e.className === 'string' &&
          e.className
            .split(' ')
            .filter(Boolean)
            .forEach(c => allClasses.add(c));
      });
      const classes = [...allClasses].sort().slice(0, 200);

      // Get all roles
      const roles = [...new Set(allEls.map(e => e.getAttribute('role')).filter(Boolean))];

      // Get all aria-selected elements
      const ariaSel = allEls
        .filter(e => e.hasAttribute('aria-selected'))
        .map(e => ({
          tag: e.tagName.toLowerCase(),
          cls: e.className?.toString()?.slice(0, 100),
          ariaSelected: e.getAttribute('aria-selected'),
          text: e.textContent?.slice(0, 50),
        }));

      // Get visible inputs
      const inputs = allEls
        .filter(e => ['input', 'textarea'].includes(e.tagName.toLowerCase()))
        .map(e => ({
          tag: e.tagName.toLowerCase(),
          type: e.getAttribute('type'),
          cls: e.className?.toString()?.slice(0, 100),
          placeholder: e.getAttribute('placeholder'),
          id: e.id,
          visible: !!(e.offsetWidth || e.offsetHeight),
        }));

      // Get buttons
      const buttons = allEls
        .filter(e => e.tagName.toLowerCase() === 'button')
        .slice(0, 30)
        .map(e => ({
          cls: e.className?.toString()?.slice(0, 100),
          type: e.getAttribute('type'),
          ariaLabel: e.getAttribute('aria-label'),
          text: e.textContent?.slice(0, 40),
          ariaSelected: e.getAttribute('aria-selected'),
        }));

      // Current URL
      const href = window.location.href;

      // focusvisible in stylesheets
      let hasFocusVisibleTabRule = false;
      const allFocusVisibleRules = [];
      for (const ss of Array.from(document.styleSheets)) {
        try {
          const rules = Array.from(ss.cssRules || []);
          for (const r of rules) {
            if (r.selectorText && r.selectorText.includes('focus-visible')) {
              allFocusVisibleRules.push(r.selectorText);
              if (r.selectorText.includes('titane')) hasFocusVisibleTabRule = true;
            }
          }
        } catch {}
      }

      // Check body children structure
      const bodyChildSummary = Array.from(document.body?.children || []).map(e => ({
        tag: e.tagName.toLowerCase(),
        id: e.id,
        cls: e.className?.toString()?.slice(0, 100),
      }));

      // Check #root or #app children
      const rootEl =
        document.getElementById('root') ||
        document.getElementById('app') ||
        document.body;
      const rootChildSummary = Array.from(rootEl?.children || [])
        .slice(0, 10)
        .map(e => ({
          tag: e.tagName.toLowerCase(),
          id: e.id,
          cls: e.className?.toString()?.slice(0, 80),
        }));

      return {
        href,
        tags,
        classesCount: [...allClasses].length,
        classesSample: classes,
        roles,
        ariaSel,
        inputs,
        buttons,
        bodyChildSummary,
        rootChildSummary,
        hasFocusVisibleTabRule,
        allFocusVisibleRules,
      };
    });

    fs.writeFileSync(DIAG_FILE, JSON.stringify(diag, null, 2), 'utf8');

    console.log('HREF:', diag.href);
    console.log('TAGS:', diag.tags.join(', '));
    console.log('ROLES:', diag.roles.join(', '));
    console.log('ARIA-SELECTED count:', diag.ariaSel.length);
    console.log('INPUTS:', JSON.stringify(diag.inputs));
    console.log('BUTTONS[:5]:', JSON.stringify(diag.buttons.slice(0, 5)));
    console.log('FOCUS-VISIBLE rules:', diag.allFocusVisibleRules.join(' | '));
    console.log('HAS_TITANE_FOCUS_RULE:', diag.hasFocusVisibleTabRule);
  });
});
