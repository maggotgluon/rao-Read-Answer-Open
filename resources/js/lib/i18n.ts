import { usePage } from '@inertiajs/react';

export type Locale = 'th' | 'en';

type Replacements = Record<string, string | number>;

/**
 * Translate with the current locale's strings (shared by the server).
 * Unknown keys fall back to the key itself, so untouched English text still renders.
 * แปลข้อความตามภาษาปัจจุบัน ถ้าไม่มี key จะแสดง key เดิม
 */
export function translate(
    dict: Record<string, string>,
    key: string,
    replace: Replacements = {},
): string {
    let text = dict[key] ?? key;

    // Longest names first, so :week_total is never eaten by :week. / ชื่อยาวก่อน
    const entries = Object.entries(replace).sort(
        ([a], [b]) => b.length - a.length,
    );
    for (const [name, value] of entries) {
        text = text.replaceAll(`:${name}`, String(value));
    }

    return text;
}

export function useT() {
    const { translations, locale } = usePage().props;

    return {
        locale,
        t: (key: string, replace?: Replacements) =>
            translate(translations, key, replace),
    };
}
