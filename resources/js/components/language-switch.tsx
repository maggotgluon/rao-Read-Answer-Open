import { router } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { update } from '@/routes/locale';

const LOCALES: { code: Locale; label: string }[] = [
    { code: 'th', label: 'ไทย' },
    { code: 'en', label: 'EN' },
];

export function LanguageSwitch({ className }: { className?: string }) {
    const { locale, t } = useT();

    return (
        <div
            role="group"
            aria-label={t('nav.language')}
            className={cn(
                'inline-flex rounded-full border border-border p-0.5 text-xs',
                className,
            )}
        >
            {LOCALES.map((l) => (
                <button
                    key={l.code}
                    type="button"
                    aria-pressed={locale === l.code}
                    onClick={() =>
                        router.post(
                            update.url(),
                            { locale: l.code },
                            { preserveScroll: true },
                        )
                    }
                    className={cn(
                        'rounded-full px-3 py-1 transition-colors',
                        locale === l.code
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {l.label}
                </button>
            ))}
        </div>
    );
}
