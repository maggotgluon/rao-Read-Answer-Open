import { Head, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import Heading from '@/components/heading';
import { useT } from '@/lib/i18n';
import { setTheme, THEMES } from '@/lib/theme';
import type { Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

/** Theme picker — each person chooses their own. / เลือกธีมของตัวเอง */
export default function Appearance() {
    const { t } = useT();
    const { theme, features } = usePage().props;
    const current = theme as Theme;
    const allowed = features?.themes !== false;

    return (
        <>
            <Head title={t('theme.title')} />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('theme.title')}
                    description={t('theme.description')}
                />
                {!allowed && (
                    <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                        {t('feature.themes_off')}
                    </p>
                )}
                <div
                    className={cn(
                        'grid gap-3 sm:grid-cols-3',
                        !allowed && 'pointer-events-none opacity-50',
                    )}
                >
                    {THEMES.map((th) => (
                        <button
                            key={th.id}
                            type="button"
                            onClick={() => allowed && setTheme(th.id)}
                            disabled={!allowed}
                            aria-pressed={current === th.id}
                            className={cn(
                                'flex flex-col gap-3 rounded-2xl border p-4 text-left transition-shadow hover:shadow-md',
                                current === th.id
                                    ? 'border-primary ring-2 ring-primary'
                                    : 'border-border',
                            )}
                        >
                            <span className="flex gap-1.5">
                                {th.swatches.map((c) => (
                                    <span
                                        key={c}
                                        className="size-6 rounded-lg border border-black/10"
                                        style={{ background: c }}
                                    />
                                ))}
                            </span>
                            <span className="flex items-center gap-2 font-medium">
                                {t(`theme.${th.id}`)}{' '}
                                {current === th.id && (
                                    <Check className="size-4 text-primary" />
                                )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {t(`theme.${th.id}_help`)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [{ title: 'Appearance', href: editAppearance() }],
};
