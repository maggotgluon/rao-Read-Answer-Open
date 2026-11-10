import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Asset } from '@/components/rao/asset';
import { Check } from '@/components/rao/ui-icons';
import { useT } from '@/lib/i18n';
import { setTheme, themeStyle } from '@/lib/theme';
import type { ClientTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

/**
 * Pick a theme. The list comes from the theme folders (public/themes/*); each preview is
 * painted with that theme's own colours. / รายการธีมมาจากโฟลเดอร์ธีม ตัวอย่างใช้สีของธีมนั้นจริง
 */
export default function Appearance({ themes }: { themes: ClientTheme[] }) {
    const { t } = useT();
    const current = usePage().props.theme as string;

    return (
        <>
            <Head title={t('theme.title')} />
            <div className="flex flex-col gap-6">
                <Heading
                    variant="small"
                    title={t('theme.title')}
                    description={t('theme.description')}
                />
                <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
                    {themes.map((th) => {
                        const on = current === th.id;

                        return (
                            <button
                                key={th.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => setTheme(th)}
                                className={cn(
                                    'press flex flex-col gap-2 rounded-[var(--radius)] p-1.5 text-left',
                                    on
                                        ? 'ring-2 ring-stamp'
                                        : 'ring-1 ring-rule hover:ring-rule-strong',
                                )}
                            >
                                <span
                                    style={themeStyle(th)}
                                    className="block rounded-[calc(var(--radius)-2px)] bg-[var(--ground)] [background-image:var(--ground-image)] bg-cover p-3"
                                >
                                    <span className="paper block overflow-hidden">
                                        <span className="airmail-edge block h-1" />
                                        <span className="flex items-start gap-2 p-2.5">
                                            <span className="hand flex-1 text-sm leading-snug text-[var(--ink)]">
                                                {t('theme.preview')}
                                            </span>
                                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--stamp)] text-[var(--stamp-ink)]">
                                                <Asset
                                                    name="icons.seal"
                                                    className="size-4"
                                                />
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                <span className="flex items-center gap-1.5 px-1.5 font-medium text-ink">
                                    {th.name}
                                    {on && (
                                        <Check className="size-4 text-stamp" />
                                    )}
                                </span>
                                <span className="px-1.5 pb-1 text-xs text-ink-soft">
                                    {th.description}
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
