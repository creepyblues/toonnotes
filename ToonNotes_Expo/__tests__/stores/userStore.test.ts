/**
 * Unit Tests for userStore
 *
 * Tests user economy (coins, free design), settings (dark mode, API key),
 * and design affordability checks.
 */

import { useUserStore } from '@/stores/userStore';
import { NoteColor } from '@/types';

// Mock generateUUID
jest.mock('@/utils/uuid', () => ({
  generateUUID: jest.fn(() => 'test-user-id'),
}));

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user: {
        id: 'test-user-id',
        freeDesignUsed: false,
        coinBalance: 100,
        createdAt: Date.now(),
      },
      settings: {
        darkMode: false,
        defaultNoteColor: NoteColor.White,
      },
    });
  });

  describe('User Economy - Free Design', () => {
    it('should start with free design available', () => {
      const store = useUserStore.getState();

      expect(store.user.freeDesignUsed).toBe(false);
      expect(store.canAffordDesign()).toBe(true);
      expect(store.getDesignCost()).toBe(0);
    });

    it('should use free design when spending coin for the first time', () => {
      const store = useUserStore.getState();
      const initialBalance = store.user.coinBalance;

      const success = store.spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.freeDesignUsed).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance); // Balance unchanged
    });

    it('should mark free design as used', () => {
      const store = useUserStore.getState();

      store.setFreeDesignUsed();

      expect(useUserStore.getState().user.freeDesignUsed).toBe(true);
    });

    it('should show cost as 1 after free design is used', () => {
      const store = useUserStore.getState();

      store.setFreeDesignUsed();

      expect(useUserStore.getState().getDesignCost()).toBe(1);
    });
  });

  describe('User Economy - Coins', () => {
    it('should start with initial coin balance', () => {
      const store = useUserStore.getState();

      expect(store.user.coinBalance).toBe(100);
    });

    it('should add coins to balance', () => {
      const store = useUserStore.getState();

      store.addCoins(50);

      expect(useUserStore.getState().user.coinBalance).toBe(150);
    });

    it('should add multiple coin amounts', () => {
      const store = useUserStore.getState();

      store.addCoins(10);
      store.addCoins(20);
      store.addCoins(30);

      expect(useUserStore.getState().user.coinBalance).toBe(160);
    });

    it('should spend coin after free design is used', () => {
      const store = useUserStore.getState();

      store.setFreeDesignUsed();

      const initialBalance = useUserStore.getState().user.coinBalance;

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance - 1);
    });

    it('should fail to spend coin when balance is 0', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 0 },
      }));

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
    });

    it('should handle spending last coin', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 1 },
      }));

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
    });

    it('should not allow spending when no free design and no coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 0 },
      }));

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
      expect(useUserStore.getState().user.freeDesignUsed).toBe(true);
    });
  });

  describe('Design Affordability', () => {
    it('should afford design with free design available', () => {
      const store = useUserStore.getState();

      expect(store.canAffordDesign()).toBe(true);
    });

    it('should afford design with coins after free design used', () => {
      const store = useUserStore.getState();

      store.setFreeDesignUsed();

      expect(useUserStore.getState().canAffordDesign()).toBe(true);
    });

    it('should not afford design with no free design and no coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 0 },
      }));

      expect(useUserStore.getState().canAffordDesign()).toBe(false);
    });

    it('should afford design with exactly 1 coin', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 1 },
      }));

      expect(useUserStore.getState().canAffordDesign()).toBe(true);
    });

    it('should calculate design cost correctly', () => {
      const store = useUserStore.getState();

      // Free design not used
      expect(store.getDesignCost()).toBe(0);

      store.setFreeDesignUsed();

      // Free design used
      expect(useUserStore.getState().getDesignCost()).toBe(1);
    });
  });

  describe('Settings - Dark Mode', () => {
    it('should start with dark mode disabled', () => {
      const store = useUserStore.getState();

      expect(store.settings.darkMode).toBe(false);
    });

    it('should toggle dark mode on', () => {
      const store = useUserStore.getState();

      store.toggleDarkMode();

      expect(useUserStore.getState().settings.darkMode).toBe(true);
    });

    it('should toggle dark mode off', () => {
      const store = useUserStore.getState();

      store.toggleDarkMode();
      useUserStore.getState().toggleDarkMode();

      expect(useUserStore.getState().settings.darkMode).toBe(false);
    });

    it('should toggle dark mode multiple times', () => {
      const store = useUserStore.getState();

      store.toggleDarkMode(); // true
      useUserStore.getState().toggleDarkMode(); // false
      useUserStore.getState().toggleDarkMode(); // true
      useUserStore.getState().toggleDarkMode(); // false
      useUserStore.getState().toggleDarkMode(); // true

      expect(useUserStore.getState().settings.darkMode).toBe(true);
    });
  });

  describe('Settings - Default Note Color', () => {
    it('should start with default note color as White', () => {
      const store = useUserStore.getState();

      expect(store.settings.defaultNoteColor).toBe(NoteColor.White);
    });

    it('should set default note color', () => {
      const store = useUserStore.getState();

      store.setDefaultNoteColor(NoteColor.Blue);

      expect(useUserStore.getState().settings.defaultNoteColor).toBe(NoteColor.Blue);
    });

    it('should change default note color multiple times', () => {
      const store = useUserStore.getState();

      store.setDefaultNoteColor(NoteColor.Red);
      useUserStore.getState().setDefaultNoteColor(NoteColor.Yellow);
      useUserStore.getState().setDefaultNoteColor(NoteColor.Green);

      expect(useUserStore.getState().settings.defaultNoteColor).toBe(NoteColor.Green);
    });

    it('should handle all note colors', () => {
      const colors = [
        NoteColor.White,
        NoteColor.Red,
        NoteColor.Orange,
        NoteColor.Yellow,
        NoteColor.Green,
        NoteColor.Teal,
        NoteColor.Blue,
        NoteColor.Purple,
      ];

      colors.forEach((color) => {
        useUserStore.getState().setDefaultNoteColor(color);
        expect(useUserStore.getState().settings.defaultNoteColor).toBe(color);
      });
    });
  });

  describe('Settings - Gemini API Key', () => {
    it('should start without API key', () => {
      const store = useUserStore.getState();

      expect(store.settings.geminiApiKey).toBeUndefined();
    });

    it('should set API key', () => {
      const store = useUserStore.getState();

      store.setGeminiApiKey('test-api-key-123');

      expect(useUserStore.getState().settings.geminiApiKey).toBe('test-api-key-123');
    });

    it('should trim API key whitespace', () => {
      const store = useUserStore.getState();

      store.setGeminiApiKey('  test-key-with-spaces  ');

      expect(useUserStore.getState().settings.geminiApiKey).toBe('test-key-with-spaces');
    });

    it('should clear API key when set to empty string', () => {
      const store = useUserStore.getState();

      store.setGeminiApiKey('test-key');
      expect(useUserStore.getState().settings.geminiApiKey).toBe('test-key');

      useUserStore.getState().setGeminiApiKey('');
      expect(useUserStore.getState().settings.geminiApiKey).toBeUndefined();
    });

    it('should clear API key when set to whitespace-only string', () => {
      const store = useUserStore.getState();

      store.setGeminiApiKey('test-key');
      useUserStore.getState().setGeminiApiKey('   ');

      expect(useUserStore.getState().settings.geminiApiKey).toBeUndefined();
    });

    it('should update existing API key', () => {
      const store = useUserStore.getState();

      store.setGeminiApiKey('old-key');
      expect(useUserStore.getState().settings.geminiApiKey).toBe('old-key');

      useUserStore.getState().setGeminiApiKey('new-key');
      expect(useUserStore.getState().settings.geminiApiKey).toBe('new-key');
    });
  });

  describe('Integration Tests', () => {
    it('should handle full design purchase flow with free design', () => {
      const store = useUserStore.getState();

      // Check affordability
      expect(store.canAffordDesign()).toBe(true);
      expect(store.getDesignCost()).toBe(0);

      const initialBalance = store.user.coinBalance;

      // Purchase design (uses free design)
      const success = store.spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.freeDesignUsed).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance);
      expect(useUserStore.getState().canAffordDesign()).toBe(true); // Still can afford with coins
      expect(useUserStore.getState().getDesignCost()).toBe(1); // Now costs 1 coin
    });

    it('should handle full design purchase flow with coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 5 },
      }));

      // Purchase 3 designs
      useUserStore.getState().spendCoin();
      useUserStore.getState().spendCoin();
      useUserStore.getState().spendCoin();

      expect(useUserStore.getState().user.coinBalance).toBe(2);
      expect(useUserStore.getState().canAffordDesign()).toBe(true);
    });

    it('should handle running out of coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 1 },
      }));

      // Purchase last design
      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
      expect(useUserStore.getState().canAffordDesign()).toBe(false);

      // Try to purchase another design
      const success2 = useUserStore.getState().spendCoin();

      expect(success2).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
    });

    it('should handle coin purchase and spending', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 0 },
      }));

      expect(useUserStore.getState().canAffordDesign()).toBe(false);

      // Purchase coins
      useUserStore.getState().addCoins(10);

      expect(useUserStore.getState().canAffordDesign()).toBe(true);

      // Spend all coins
      for (let i = 0; i < 10; i++) {
        useUserStore.getState().spendCoin();
      }

      expect(useUserStore.getState().user.coinBalance).toBe(0);
      expect(useUserStore.getState().canAffordDesign()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative coin amounts gracefully', () => {
      const initialBalance = useUserStore.getState().user.coinBalance;

      useUserStore.getState().addCoins(-10);

      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance - 10);
    });

    it('should handle very large coin amounts', () => {
      useUserStore.getState().addCoins(1000000);

      expect(useUserStore.getState().user.coinBalance).toBeGreaterThan(999999);
    });

    it('should handle zero coin additions', () => {
      const initialBalance = useUserStore.getState().user.coinBalance;

      useUserStore.getState().addCoins(0);

      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance);
    });

    it('should maintain state across multiple operations', () => {
      const store = useUserStore.getState();

      store.toggleDarkMode();
      useUserStore.getState().setDefaultNoteColor(NoteColor.Purple);
      useUserStore.getState().setGeminiApiKey('test-key');
      useUserStore.getState().addCoins(50);
      useUserStore.getState().spendCoin();

      const finalState = useUserStore.getState();
      expect(finalState.settings.darkMode).toBe(true);
      expect(finalState.settings.defaultNoteColor).toBe(NoteColor.Purple);
      expect(finalState.settings.geminiApiKey).toBe('test-key');
      expect(finalState.user.freeDesignUsed).toBe(true);
      expect(finalState.user.coinBalance).toBe(150); // 100 + 50, free design used
    });
  });
});
