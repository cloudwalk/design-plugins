import '../styles/theme.css';

export type ThemeMode = 'light' | 'dark';

export const setThemeMode = (mode: ThemeMode) => {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getThemeMode = (): ThemeMode => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}; 