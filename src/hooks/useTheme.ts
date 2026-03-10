import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'seating-theme';

export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored !== null) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

    return { isDark, toggleTheme };
}
