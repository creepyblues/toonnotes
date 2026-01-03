/**
 * Unit Tests for userStore
 *
 * Tests user economy (coins, free designs), settings (dark mode, API key),
 * and design affordability checks.
 */

import { useUserStore, FREE_DESIGN_QUOTA } from '@/stores/userStore';
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
        freeDesignsUsed: 0, // 3 free designs available
        coinBalance: 100,
        createdAt: Date.now(),
      },
      settings: {
        darkMode: false,
        defaultNoteColor: NoteColor.White,
      },
    });
  });

  describe('User Economy - Free Designs', () => {
    it('should start with 3 free designs available', () => {
      const store = useUserStore.getState();

      expect(store.user.freeDesignsUsed).toBe(0);
      expect(store.getFreeDesignsRemaining()).toBe(3);
      expect(store.canAffordDesign()).toBe(true);
      expect(store.getDesignCost()).toBe(0);
    });

    it('should use free design when spending coin with free designs remaining', () => {
      const store = useUserStore.getState();
      const initialBalance = store.user.coinBalance;

      const success = store.spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.freeDesignsUsed).toBe(1);
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(2);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance); // Balance unchanged
    });

    it('should use all 3 free designs before spending coins', () => {
      const store = useUserStore.getState();
      const initialBalance = store.user.coinBalance;

      // Use all 3 free designs
      store.spendCoin();
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(2);

      useUserStore.getState().spendCoin();
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(1);

      useUserStore.getState().spendCoin();
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(0);

      // All free designs used, balance unchanged
      expect(useUserStore.getState().user.freeDesignsUsed).toBe(3);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance);

      // 4th design should spend a coin
      useUserStore.getState().spendCoin();
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance - 1);
    });

    it('should show cost as 0 while free designs remain', () => {
      const store = useUserStore.getState();

      expect(store.getDesignCost()).toBe(0);

      store.spendCoin(); // Use 1
      expect(useUserStore.getState().getDesignCost()).toBe(0);

      useUserStore.getState().spendCoin(); // Use 2
      expect(useUserStore.getState().getDesignCost()).toBe(0);

      useUserStore.getState().spendCoin(); // Use 3
      expect(useUserStore.getState().getDesignCost()).toBe(1); // Now costs 1
    });

    it('should show cost as 1 after all free designs are used', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA },
      }));

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

    it('should spend coin after free designs are used', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA },
      }));

      const initialBalance = useUserStore.getState().user.coinBalance;

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance - 1);
    });

    it('should fail to spend coin when balance is 0 and no free designs', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 0 },
      }));

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
    });

    it('should handle spending last coin', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 1 },
      }));

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
    });

    it('should not allow spending when no free designs and no coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 0 },
      }));

      const success = useUserStore.getState().spendCoin();

      expect(success).toBe(false);
      expect(useUserStore.getState().user.coinBalance).toBe(0);
      expect(useUserStore.getState().user.freeDesignsUsed).toBe(FREE_DESIGN_QUOTA);
    });
  });

  describe('Design Affordability', () => {
    it('should afford design with free designs available', () => {
      const store = useUserStore.getState();

      expect(store.canAffordDesign()).toBe(true);
    });

    it('should afford design with coins after free designs used', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA },
      }));

      expect(useUserStore.getState().canAffordDesign()).toBe(true);
    });

    it('should not afford design with no free designs and no coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 0 },
      }));

      expect(useUserStore.getState().canAffordDesign()).toBe(false);
    });

    it('should afford design with exactly 1 coin and no free designs', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 1 },
      }));

      expect(useUserStore.getState().canAffordDesign()).toBe(true);
    });

    it('should calculate design cost correctly', () => {
      const store = useUserStore.getState();

      // Free designs available
      expect(store.getDesignCost()).toBe(0);
      expect(store.getFreeDesignsRemaining()).toBe(3);

      // Use 2 free designs
      store.spendCoin();
      useUserStore.getState().spendCoin();

      expect(useUserStore.getState().getDesignCost()).toBe(0);
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(1);

      // Use last free design
      useUserStore.getState().spendCoin();

      expect(useUserStore.getState().getDesignCost()).toBe(1);
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(0);
    });
  });

  describe('Free Designs Remaining', () => {
    it('should return 3 when no designs used', () => {
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(3);
    });

    it('should return 2 when 1 design used', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: 1 },
      }));
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(2);
    });

    it('should return 0 when all designs used', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA },
      }));
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(0);
    });

    it('should never return negative', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: 10 }, // More than quota
      }));
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(0);
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

      store.setDefaultNoteColor(NoteColor.Sky);

      expect(useUserStore.getState().settings.defaultNoteColor).toBe(NoteColor.Sky);
    });

    it('should change default note color multiple times', () => {
      const store = useUserStore.getState();

      store.setDefaultNoteColor(NoteColor.Rose);
      useUserStore.getState().setDefaultNoteColor(NoteColor.Lavender);
      useUserStore.getState().setDefaultNoteColor(NoteColor.Mint);

      expect(useUserStore.getState().settings.defaultNoteColor).toBe(NoteColor.Mint);
    });

    it('should handle all note colors', () => {
      const colors = Object.values(NoteColor);

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
    it('should handle full design purchase flow with free designs', () => {
      const store = useUserStore.getState();

      // Check affordability
      expect(store.canAffordDesign()).toBe(true);
      expect(store.getDesignCost()).toBe(0);
      expect(store.getFreeDesignsRemaining()).toBe(3);

      const initialBalance = store.user.coinBalance;

      // Purchase 3 designs (uses all free designs)
      store.spendCoin();
      useUserStore.getState().spendCoin();
      useUserStore.getState().spendCoin();

      expect(useUserStore.getState().user.freeDesignsUsed).toBe(3);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance); // Balance unchanged
      expect(useUserStore.getState().canAffordDesign()).toBe(true); // Still can afford with coins
      expect(useUserStore.getState().getDesignCost()).toBe(1); // Now costs 1 coin
      expect(useUserStore.getState().getFreeDesignsRemaining()).toBe(0);
    });

    it('should handle full design purchase flow with coins', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 5 },
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
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 1 },
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
        user: { ...state.user, freeDesignsUsed: FREE_DESIGN_QUOTA, coinBalance: 0 },
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
      useUserStore.getState().setDefaultNoteColor(NoteColor.Violet);
      useUserStore.getState().setGeminiApiKey('test-key');
      useUserStore.getState().addCoins(50);
      useUserStore.getState().spendCoin(); // Uses 1 free design

      const finalState = useUserStore.getState();
      expect(finalState.settings.darkMode).toBe(true);
      expect(finalState.settings.defaultNoteColor).toBe(NoteColor.Violet);
      expect(finalState.settings.geminiApiKey).toBe('test-key');
      expect(finalState.user.freeDesignsUsed).toBe(1);
      expect(finalState.user.coinBalance).toBe(150); // 100 + 50, free design used
    });
  });
});
