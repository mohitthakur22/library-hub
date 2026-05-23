import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: 'aspirants-library-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
        else applyTheme('dark');
      },
    }
  )
);

// Apply before first paint when possible
const stored = localStorage.getItem('aspirants-library-theme');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    applyTheme(parsed.state?.theme === 'light' ? 'light' : 'dark');
  } catch {
    applyTheme('dark');
  }
} else {
  applyTheme('dark');
}
