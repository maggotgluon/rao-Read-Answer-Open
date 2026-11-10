import { router } from '@inertiajs/react';

export type Theme = 'blush' | 'paper' | 'candle';

/** Three times of day of the same letter desk (ids kept for stored settings). */
export const THEMES: { id: Theme; color: string }[] = [
    { id: 'blush', color: '#f3e3e7' }, // dusk / ยามเย็น (default)
    { id: 'paper', color: '#eef2f8' }, // daytime / กลางวัน
    { id: 'candle', color: '#121a2c' }, // night / กลางคืน
];

/** Apply instantly, then save (user setting, or a cookie for guests). / เปลี่ยนทันทีแล้วบันทึก */
export function setTheme(theme: Theme): void {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.classList.toggle('dark', theme === 'candle');
    html.style.colorScheme = theme === 'candle' ? 'dark' : 'light';
    // Status bar colour on phones follows the theme. / สีแถบสถานะตามธีม
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute(
            'content',
            THEMES.find((x) => x.id === theme)?.color ?? '',
        );
    router.put(
        '/settings/theme',
        { theme },
        { preserveScroll: true, preserveState: true },
    );
}
