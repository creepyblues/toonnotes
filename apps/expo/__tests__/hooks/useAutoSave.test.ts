/**
 * Tests for useAutoSave hook with hybrid debounce + throttle
 */

import { renderHook, act } from '@testing-library/react-native';
import { useAutoSave, AutoSaveData } from '@/hooks/editor/useAutoSave';
import { AUTO_SAVE_CONFIG } from '@/constants/autoLabeling';

// Mock the note store
const mockUpdateNote = jest.fn();
jest.mock('@/stores', () => ({
  useNoteStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ updateNote: mockUpdateNote });
    }
    return { updateNote: mockUpdateNote };
  },
}));

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Debounce behavior', () => {
    it('should debounce saves by default (500ms)', () => {
      const initialData: AutoSaveData = { title: 'Test', content: 'Initial' };

      const { rerender } = renderHook(
        ({ noteId, data }) => useAutoSave(noteId, data),
        { initialProps: { noteId: 'note1', data: initialData } }
      );

      // Change content
      rerender({ noteId: 'note1', data: { title: 'Test', content: 'Changed' } });

      // Should not save immediately
      expect(mockUpdateNote).not.toHaveBeenCalled();

      // Advance by 400ms - still shouldn't save
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(mockUpdateNote).not.toHaveBeenCalled();

      // Advance to 500ms - should save now
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
    });

    it('should save with latest content when debounce completes', () => {
      const initialData: AutoSaveData = { title: 'Test', content: 'Initial' };

      const { rerender } = renderHook(
        ({ noteId, data }) => useAutoSave(noteId, data),
        { initialProps: { noteId: 'note1', data: initialData } }
      );

      // Multiple rapid changes
      rerender({ noteId: 'note1', data: { title: 'Test', content: 'Change 1' } });
      rerender({ noteId: 'note1', data: { title: 'Test', content: 'Change 2' } });
      rerender({ noteId: 'note1', data: { title: 'Test', content: 'Final' } });

      // Wait for debounce to complete
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should have saved with final content
      expect(mockUpdateNote).toHaveBeenCalled();
      // The last call should have the latest content
      const lastCall = mockUpdateNote.mock.calls[mockUpdateNote.mock.calls.length - 1];
      expect(lastCall[1]).toEqual(expect.objectContaining({
        content: 'Final',
      }));
    });
  });

  describe('Throttle behavior', () => {
    it('should force save after throttle ceiling (5s) during continuous changes', () => {
      const initialData: AutoSaveData = { title: 'Test', content: 'Initial' };

      const { rerender } = renderHook(
        ({ noteId, data }) => useAutoSave(noteId, data),
        { initialProps: { noteId: 'note1', data: initialData } }
      );

      // Simulate continuous typing - change every 400ms (before debounce fires)
      for (let i = 0; i < 12; i++) {
        rerender({ noteId: 'note1', data: { title: 'Test', content: `Change ${i}` } });
        act(() => {
          jest.advanceTimersByTime(400);
        });
      }

      // After 4800ms of continuous changes, throttle should have forced a save
      // Throttle ceiling is 5000ms, so at least one save should have happened
      expect(mockUpdateNote).toHaveBeenCalled();
    });
  });

  describe('saveImmediately', () => {
    it('should save immediately and clear pending debounce', () => {
      const initialData: AutoSaveData = { title: 'Test', content: 'Initial' };

      const { result, rerender } = renderHook(
        ({ noteId, data }) => useAutoSave(noteId, data),
        { initialProps: { noteId: 'note1', data: initialData } }
      );

      // Change content
      rerender({ noteId: 'note1', data: { title: 'Test', content: 'Changed' } });

      // Should not have saved yet
      expect(mockUpdateNote).not.toHaveBeenCalled();

      // Call saveImmediately
      act(() => {
        result.current.saveImmediately();
      });

      // Should save immediately
      expect(mockUpdateNote).toHaveBeenCalledTimes(1);

      // Advance timers - should not save again
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
    });
  });

  describe('No unnecessary saves', () => {
    it('should not save when content has not changed', () => {
      const data: AutoSaveData = { title: 'Test', content: 'Same' };

      const { rerender } = renderHook(
        ({ noteId, data }) => useAutoSave(noteId, data),
        { initialProps: { noteId: 'note1', data } }
      );

      // Rerender with same data
      rerender({ noteId: 'note1', data });
      rerender({ noteId: 'note1', data });
      rerender({ noteId: 'note1', data });

      // Advance time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not have saved since nothing changed
      expect(mockUpdateNote).not.toHaveBeenCalled();
    });

    it('should not save when noteId is undefined', () => {
      const data: AutoSaveData = { title: 'Test', content: 'Content' };

      const { rerender } = renderHook(
        ({ noteId, data }) => useAutoSave(noteId, data),
        { initialProps: { noteId: undefined as string | undefined, data } }
      );

      // Change content
      rerender({ noteId: undefined, data: { title: 'Test', content: 'Changed' } });

      // Advance time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not save without noteId
      expect(mockUpdateNote).not.toHaveBeenCalled();
    });
  });

  describe('onContentStable callback', () => {
    it('should call onContentStable after content stabilizes', () => {
      const onContentStable = jest.fn();
      const initialData: AutoSaveData = { title: 'Test', content: 'Initial' };

      const { rerender } = renderHook(
        ({ noteId, data, options }) => useAutoSave(noteId, data, options),
        {
          initialProps: {
            noteId: 'note1',
            data: initialData,
            options: { onContentStable },
          },
        }
      );

      // Change content
      rerender({
        noteId: 'note1',
        data: { title: 'Test', content: 'Changed content' },
        options: { onContentStable },
      });

      // Should not call immediately
      expect(onContentStable).not.toHaveBeenCalled();

      // Advance past debounce time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should call onContentStable
      expect(onContentStable).toHaveBeenCalledWith({
        title: 'Test',
        content: 'Changed content',
        timestamp: expect.any(Number),
      });
    });
  });
});
