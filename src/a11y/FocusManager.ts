// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Focus Manager (Accessibility)
// ═══════════════════════════════════════════════════════════════

export class FocusManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;

  constructor() {
    this.updateFocusableElements();
  }

  updateFocusableElements() {
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(document.querySelectorAll(selector));
  }

  focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  focusPrevious() {
    this.currentIndex =
      (this.currentIndex - 1 + this.focusableElements.length) %
      this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  focusFirst() {
    this.currentIndex = 0;
    this.focusableElements[0]?.focus();
  }

  trapFocus(container: HTMLElement) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    container.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
}

export const focusManager = new FocusManager();
