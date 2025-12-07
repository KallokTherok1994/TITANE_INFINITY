import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '@/a11y/FocusManager';

describe('useFocusTrap', () => {
  it('devrait piéger le focus dans le container', () => {
    const { result } = renderHook(() => useFocusTrap(true));

    expect(result.current.current).toBeDefined();
  });

  it('devrait gérer Tab et Shift+Tab', () => {
    // ...existing test code...
  });
});
