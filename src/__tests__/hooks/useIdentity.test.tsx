/**
 * Tests pour useIdentity Hook
 * Coverage: Identity management, Persistence, Validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdentity } from '@/hooks';

describe('useIdentity Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize without identity', () => {
      const { result } = renderHook(() => useIdentity());
      expect(result.current.identity).toBe(null);
    });

    it('should load existing identity', () => {
      const mockIdentity = { id: '123', name: 'Test User', avatar: '/avatar.png' };
      localStorage.setItem('identity', JSON.stringify(mockIdentity));

      const { result } = renderHook(() => useIdentity());
      expect(result.current.identity).toEqual(mockIdentity);
    });
  });

  describe('Identity Management', () => {
    it('should set identity', () => {
      const { result } = renderHook(() => useIdentity());

      const identity = { id: '456', name: 'New User', avatar: '/new.png' };

      act(() => {
        result.current.setIdentity(identity);
      });

      expect(result.current.identity).toEqual(identity);
    });

    it('should update identity', () => {
      const { result } = renderHook(() => useIdentity());

      act(() => {
        result.current.setIdentity({ id: '1', name: 'User', avatar: '/a.png' });
      });

      act(() => {
        result.current.updateIdentity({ name: 'Updated User' });
      });

      expect(result.current.identity?.name).toBe('Updated User');
      expect(result.current.identity?.id).toBe('1'); // ID unchanged
    });

    it('should clear identity', () => {
      const { result } = renderHook(() => useIdentity());

      act(() => {
        result.current.setIdentity({ id: '1', name: 'User', avatar: '/a.png' });
      });

      act(() => {
        result.current.clearIdentity();
      });

      expect(result.current.identity).toBe(null);
    });
  });

  describe('Persistence', () => {
    it('should persist identity to localStorage', () => {
      const { result } = renderHook(() => useIdentity());

      const identity = { id: '789', name: 'Persisted', avatar: '/p.png' };

      act(() => {
        result.current.setIdentity(identity);
      });

      expect(localStorage.getItem('identity')).toBe(JSON.stringify(identity));
    });

    it('should remove from localStorage on clear', () => {
      const { result } = renderHook(() => useIdentity());

      act(() => {
        result.current.setIdentity({ id: '1', name: 'User', avatar: '/a.png' });
        result.current.clearIdentity();
      });

      expect(localStorage.getItem('identity')).toBe(null);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', () => {
      const { result } = renderHook(() => useIdentity());

      expect(() => {
        act(() => {
          result.current.setIdentity({ id: '', name: '', avatar: '' });
        });
      }).toThrow();
    });

    it('should validate ID format', () => {
      const { result } = renderHook(() => useIdentity());

      expect(() => {
        act(() => {
          result.current.setIdentity({
            id: 'invalid id',
            name: 'User',
            avatar: '/a.png',
          });
        });
      }).toThrow();
    });
  });

  describe('Callbacks', () => {
    it('should call onChange callback', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useIdentity({ onChange }));

      act(() => {
        result.current.setIdentity({ id: '1', name: 'User', avatar: '/a.png' });
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Avatar Management', () => {
    it('should update avatar', () => {
      const { result } = renderHook(() => useIdentity());

      act(() => {
        result.current.setIdentity({ id: '1', name: 'User', avatar: '/old.png' });
      });

      act(() => {
        result.current.updateAvatar('/new.png');
      });

      expect(result.current.identity?.avatar).toBe('/new.png');
    });
  });
});
