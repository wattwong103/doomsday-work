import { useEffect } from 'react';
import { useStore } from './useStore';

export function useTheme() {
  const { data, updateSettings } = useStore();
  const { theme } = data.settings;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      root.classList.toggle('dark', mq.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (t: 'light' | 'dark' | 'system') => updateSettings({ theme: t });

  return { theme, setTheme };
}
