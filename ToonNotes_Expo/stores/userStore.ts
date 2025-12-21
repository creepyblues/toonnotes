import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AppSettings, NoteColor } from '@/types';
import { generateUUID } from '@/utils/uuid';

interface UserState {
  user: User;
  settings: AppSettings;

  // User actions
  setFreeDesignUsed: () => void;
  addCoins: (amount: number) => void;
  spendCoin: () => boolean; // Returns false if insufficient balance
  canAffordDesign: () => boolean;
  getDesignCost: () => number; // 0 if free design available, 1 otherwise

  // Settings actions
  toggleDarkMode: () => void;
  setDefaultNoteColor: (color: NoteColor) => void;
  setGeminiApiKey: (key: string) => void;
}

const INITIAL_USER: User = {
  id: generateUUID(),
  freeDesignUsed: false,
  coinBalance: 100, // Testing: start with 100 coins
  createdAt: Date.now(),
};

const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  defaultNoteColor: NoteColor.White,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      settings: INITIAL_SETTINGS,

      setFreeDesignUsed: () => {
        set((state) => ({
          user: { ...state.user, freeDesignUsed: true },
        }));
      },

      addCoins: (amount) => {
        set((state) => ({
          user: { ...state.user, coinBalance: state.user.coinBalance + amount },
        }));
      },

      spendCoin: () => {
        const { user } = get();

        // If free design not used, use it instead of coins
        if (!user.freeDesignUsed) {
          set((state) => ({
            user: { ...state.user, freeDesignUsed: true },
          }));
          return true;
        }

        // Otherwise, spend a coin
        if (user.coinBalance >= 1) {
          set((state) => ({
            user: { ...state.user, coinBalance: state.user.coinBalance - 1 },
          }));
          return true;
        }

        return false;
      },

      canAffordDesign: () => {
        const { user } = get();
        return !user.freeDesignUsed || user.coinBalance >= 1;
      },

      getDesignCost: () => {
        const { user } = get();
        return user.freeDesignUsed ? 1 : 0;
      },

      toggleDarkMode: () => {
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode },
        }));
      },

      setDefaultNoteColor: (color) => {
        set((state) => ({
          settings: { ...state.settings, defaultNoteColor: color },
        }));
      },

      setGeminiApiKey: (key) => {
        set((state) => ({
          settings: { ...state.settings, geminiApiKey: key.trim() || undefined },
        }));
      },
    }),
    {
      name: 'toonnotes-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
