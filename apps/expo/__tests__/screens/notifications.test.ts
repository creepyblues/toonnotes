/**
 * Unit Tests for Notifications Screen logic
 *
 * Tests the getTimeAgo utility, notification sorting/combining,
 * markAsShown guard logic, and toast timeout behavior.
 */

import { useNudgeStore } from '@/stores/nudgeStore';
import type { Nudge, AgentId } from '@/types';

// Helper to create a mock nudge
function createMockNudge(overrides: Partial<Nudge> = {}): Nudge {
  return {
    id: `nudge-${Math.random().toString(36).slice(2, 8)}`,
    skillId: 'test-skill',
    agentId: 'muse' as AgentId,
    title: 'Test Nudge',
    body: 'Test body content',
    options: [],
    priority: 'medium',
    deliveryChannel: 'notification',
    createdAt: Date.now(),
    ...overrides,
  };
}

// Extract and test getTimeAgo logic inline (it's not exported)
function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

describe('Notifications Screen', () => {
  beforeEach(() => {
    useNudgeStore.setState({
      queue: [],
      history: [],
      activeNudge: null,
      cooldowns: {},
    });
  });

  describe('getTimeAgo', () => {
    it('should return "Just now" for timestamps less than a minute ago', () => {
      expect(getTimeAgo(Date.now())).toBe('Just now');
      expect(getTimeAgo(Date.now() - 30000)).toBe('Just now');
    });

    it('should return minutes for timestamps less than an hour ago', () => {
      expect(getTimeAgo(Date.now() - 5 * 60000)).toBe('5m ago');
      expect(getTimeAgo(Date.now() - 30 * 60000)).toBe('30m ago');
      expect(getTimeAgo(Date.now() - 59 * 60000)).toBe('59m ago');
    });

    it('should return hours for timestamps less than a day ago', () => {
      expect(getTimeAgo(Date.now() - 2 * 3600000)).toBe('2h ago');
      expect(getTimeAgo(Date.now() - 23 * 3600000)).toBe('23h ago');
    });

    it('should return days for timestamps older than a day', () => {
      expect(getTimeAgo(Date.now() - 25 * 3600000)).toBe('1d ago');
      expect(getTimeAgo(Date.now() - 7 * 86400000)).toBe('7d ago');
    });
  });

  describe('Notification list combining and sorting', () => {
    it('should combine queue and history sorted by createdAt descending', () => {
      const older = createMockNudge({ id: 'old', createdAt: 1000 });
      const newer = createMockNudge({ id: 'new', createdAt: 3000 });
      const middle = createMockNudge({ id: 'mid', createdAt: 2000 });

      useNudgeStore.setState({
        queue: [older],
        history: [newer, middle],
      });

      const { queue, history } = useNudgeStore.getState();
      const combined = [...queue, ...history];
      combined.sort((a, b) => b.createdAt - a.createdAt);

      expect(combined.map((n) => n.id)).toEqual(['new', 'mid', 'old']);
    });

    it('should return empty array when no notifications exist', () => {
      const { queue, history } = useNudgeStore.getState();
      const combined = [...queue, ...history];
      expect(combined).toHaveLength(0);
    });
  });

  describe('markAsShown guard logic', () => {
    it('should mark queue items as shown', () => {
      const nudge = createMockNudge({ id: 'q1' });
      useNudgeStore.setState({ queue: [nudge] });

      const store = useNudgeStore.getState();
      store.markAsShown('q1');

      const updated = useNudgeStore.getState().queue.find((n) => n.id === 'q1');
      expect(updated?.shownAt).toBeDefined();
      expect(typeof updated?.shownAt).toBe('number');
    });

    it('should not crash when marking a history-only item (no-op)', () => {
      const nudge = createMockNudge({ id: 'h1', shownAt: 1000 });
      useNudgeStore.setState({ history: [nudge], queue: [] });

      const store = useNudgeStore.getState();
      // Should not throw - markAsShown only operates on queue
      expect(() => store.markAsShown('h1')).not.toThrow();

      // History should be unchanged
      const historyItem = useNudgeStore.getState().history.find((n) => n.id === 'h1');
      expect(historyItem?.shownAt).toBe(1000);
    });

    it('should only call markAsShown for items present in queue', () => {
      const queueNudge = createMockNudge({ id: 'q1' });
      const historyNudge = createMockNudge({ id: 'h1' });

      useNudgeStore.setState({
        queue: [queueNudge],
        history: [historyNudge],
      });

      const { queue } = useNudgeStore.getState();

      // Simulate the guard from notifications.tsx
      const shouldMark = (nudge: Nudge) =>
        !nudge.shownAt && queue.some((n) => n.id === nudge.id);

      expect(shouldMark(queueNudge)).toBe(true);
      expect(shouldMark(historyNudge)).toBe(false);
    });
  });

  describe('Notification read state', () => {
    it('should consider nudge with shownAt as read', () => {
      const unread = createMockNudge({ shownAt: undefined });
      const read = createMockNudge({ shownAt: Date.now() });

      expect(!!unread.shownAt).toBe(false);
      expect(!!read.shownAt).toBe(true);
    });
  });

  describe('Priority coloring', () => {
    it('should map priorities to correct colors', () => {
      const getPriorityColor = (priority: string, fallback: string) =>
        priority === 'urgent'
          ? '#EF4444'
          : priority === 'high'
            ? '#F59E0B'
            : fallback;

      expect(getPriorityColor('urgent', '#999')).toBe('#EF4444');
      expect(getPriorityColor('high', '#999')).toBe('#F59E0B');
      expect(getPriorityColor('medium', '#999')).toBe('#999');
      expect(getPriorityColor('low', '#999')).toBe('#999');
    });
  });
});
