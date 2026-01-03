# Accessibility (a11y) - TITANE

## WCAG 2.1 AA Compliance

### Implemented Features

1. **Keyboard Navigation**
   - Full keyboard support
   - Focus trap in modals
   - Skip links
   - Visible focus indicators

2. **Screen Reader Support**
   - ARIA labels on all interactive elements
   - Live regions for dynamic content
   - Screen reader only text
   - Proper heading structure

3. **Visual Design**
   - WCAG AA color contrast (4.5:1 minimum)
   - Dark mode support
   - Reduced motion support
   - Responsive font sizes (rem units)

## Usage

```tsx
import { useFocusTrap, ScreenReaderOnly, LiveRegion } from '@/a11y';

function Modal({ isOpen }) {
  const trapRef = useFocusTrap(isOpen);

  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <ScreenReaderOnly>Modal content</ScreenReaderOnly>
    </div>
  );
}
```

## Testing

Run accessibility checks:

```bash
pnpm run test:a11y
```
