import { useState } from 'react';
import { Icon } from '@/components/Icon';

const STORAGE_KEY = 'akomapa-theme';

export function ThemeToggle() {
    const [dark, setDark] = useState(
        () =>
            typeof document !== 'undefined' &&
            document.documentElement.classList.contains('dark'),
    );

    function toggle() {
        const next = !dark;

        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={dark ? 'Light theme' : 'Dark theme'}
            className="rounded-md p-2 text-spanish-gray transition-colors duration-fast hover:bg-raisin/5 hover:text-raisin"
        >
            <Icon name={dark ? 'sun' : 'moon'} className="size-5" />
        </button>
    );
}
