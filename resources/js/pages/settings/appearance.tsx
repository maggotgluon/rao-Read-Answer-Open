import { Head, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import Heading from '@/components/heading';
import { SealIcon } from '@/components/rao/icons';
import { useT } from '@/lib/i18n';
import { setTheme, THEMES } from '@/lib/theme';
import type { Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

/**
 * Theme = time of day at the same letter desk. Each preview renders in its own theme
 * (data-theme on the preview), so what you see is exactly what you get.
 * ธีม = ช่วงเวลาของวัน ตัวอย่างแสดงด้วยธีมนั้นจริง ๆ
 */
export default function Appearance() {
    const { t } = useT();
    const { theme, features } = usePage().props;
    const current = theme as Theme;
    const allowed = features?.themes !== false;

    return (
        <>
            <Head title={t('theme.title')} />
            <div className="flex flex-col gap-6">
                <Heading
                    variant="small"
                    title={t('theme.title')}
                    description={t('theme.description')}
                />
                {!allowed && (
                    <p className="rounded-[calc(var(--radius)-2px)] border border-dashed border-postmark/60 p-3 text-sm text-ink-soft">
                        {t('feature.themes_off')}
                    </p>
                )}
                <div
                    role="radiogroup"
                    className={cn(
                        'grid gap-3 sm:grid-cols-3',
                        !allowed && 'pointer-events-none opacity-50',
                    )}
                >
                    {THEMES.map((th) => {
                        const on = current === th.id;

                        return (
                            <button
                                key={th.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                disabled={!allowed}
                                onClick={() => allowed && setTheme(th.id)}
                                className={cn(
                                    'press flex flex-col gap-2 rounded-[var(--radius)] p-1.5 text-left',
                                    on
                                        ? 'ring-2 ring-stamp'
                                        : 'ring-1 ring-rule hover:ring-rule-strong',
                                )}
                            >
                                {/* live preview in that theme / ตัวอย่างในธีมนั้น */}
                                <span
                                    data-theme={th.id}
                                    className="block rounded-[calc(var(--radius)-2px)] bg-background p-3"
                                >
                                    <span className="paper block overflow-hidden">
                                        <span className="airmail-edge block h-1" />
                                        <span className="flex items-start gap-2 p-2.5">
                                            <span className="hand flex-1 text-sm leading-snug text-ink">
                                                {t('theme.preview')}
                                            </span>
                                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-stamp text-stamp-ink">
                                                <SealIcon className="size-4" />
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                <span className="flex items-center gap-1.5 px-1.5 font-medium text-ink">
                                    {t(`theme.${th.id}`)}
                                    {on && (
                                        <Check className="size-4 text-stamp" />
                                    )}
                                </span>
                                <span className="px-1.5 pb-1 text-xs text-ink-soft">
                                    {t(`theme.${th.id}_help`)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [{ title: 'Appearance', href: editAppearance() }],
};
