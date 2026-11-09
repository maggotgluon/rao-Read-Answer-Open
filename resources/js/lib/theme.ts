import { router } from '@inertiajs/react';

export type Theme = 'blush' | 'paper' | 'candle';

export const THEMES: { id: Theme; swatches: string[] }[] = [
    { id: 'blush', swatches: ['#fff1ec', '#fbeaf6', '#f06aa8', '#ff8a7a'] },
    { id: 'paper', swatches: ['#fbf6ee', '#f4e7d8', '#c0583b', '#3b2a22'] },
    { id: 'candle', swatches: ['#1d1424', '#3a2140', '#ffb36b', '#f3e6dc'] },
];

/** Apply instantly, then save (user setting, or a cookie for guests). / เปลี่ยนทันทีแล้วบันทึก */
export function setTheme(theme: Theme): void {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.classList.toggle('dark', theme === 'candle');
    html.style.colorScheme = theme === 'candle' ? 'dark' : 'light';
    router.put(
        '/settings/theme',
        { theme },
        { preserveScroll: true, preserveState: true },
    );
}
