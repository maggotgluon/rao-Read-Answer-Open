import { router } from '@inertiajs/react';

/** A theme folder as the browser sees it (from public/themes/<id>/theme.json). */
export type ClientTheme = {
    id: string;
    name: string;
    description: string;
    dark: boolean;
    status_bar: string;
    vars: Record<string, string>;
};

/**
 * Apply instantly (CSS variables on <html>), then save; the server answers with the new
 * theme's pictures. / เปลี่ยนทันที แล้วบันทึก เซิร์ฟเวอร์ส่งภาพของธีมใหม่กลับมา
 */
export function setTheme(theme: ClientTheme): void {
    const html = document.documentElement;
    html.dataset.theme = theme.id;
    html.classList.toggle('dark', theme.dark);
    html.style.colorScheme = theme.dark ? 'dark' : 'light';
    for (const [k, v] of Object.entries(theme.vars))
        html.style.setProperty(`--${k}`, v);
    html.style.backgroundColor = theme.vars.ground ?? '';
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme.status_bar);

    router.put(
        '/settings/theme',
        { theme: theme.id },
        { preserveScroll: true, preserveState: true },
    );
}

/** Inline style that renders a preview in another theme. / สไตล์สำหรับแสดงตัวอย่างธีมอื่น */
export function themeStyle(
    theme: Pick<ClientTheme, 'vars'>,
): React.CSSProperties {
    return Object.fromEntries(
        Object.entries(theme.vars).map(([k, v]) => [`--${k}`, v]),
    ) as React.CSSProperties;
}
