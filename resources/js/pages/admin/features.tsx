import { router } from '@inertiajs/react';
import { AdminShell } from '@/components/admin/admin-shell';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { themeStyle } from '@/lib/theme';
import { update } from '@/routes/admin/features';
import { update as updateTheme } from '@/routes/admin/themes';

type Row = {
    key: string;
    scope: 'space' | 'user';
    enabled: boolean;
    tier: 'free' | 'premium';
};

/**
 * Turn features on/off for everyone and mark them free or premium.
 * Premium = only in spaces you gave premium (Users tab). No payments yet.
 * เปิด-ปิดฟีเจอร์ และกำหนดฟรี/พรีเมียม
 */
type ThemeRow = {
    id: string;
    name: string;
    extends: string | null;
    default: boolean;
    enabled: boolean;
    tier: 'free' | 'premium';
    vars: Record<string, string>;
};

export default function AdminFeatures({
    features,
    themes,
}: {
    features: Row[];
    themes: ThemeRow[];
}) {
    const { t } = useT();
    const save = (f: Row, patch: Partial<Row>) =>
        router.put(
            update.url(f.key),
            { enabled: f.enabled, tier: f.tier, ...patch },
            { preserveScroll: true },
        );

    return (
        <AdminShell tab="features" title={t('admin.tab.features')}>
            <p className="text-sm text-muted-foreground">
                {t('admin.features.help')}
            </p>
            <ul className="paper flex flex-col divide-y divide-rule">
                {features.map((f) => (
                    <li
                        key={f.key}
                        className={cn(
                            'flex flex-wrap items-center gap-3 p-4',
                            !f.enabled && 'opacity-60',
                        )}
                    >
                        <div className="flex flex-1 flex-col">
                            <span className="font-medium">
                                {t(`feature.${f.key}`)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {t(`feature.${f.key}_help`)} ·{' '}
                                {t(
                                    f.scope === 'space'
                                        ? 'admin.features.per_space'
                                        : 'admin.features.per_person',
                                )}
                            </span>
                        </div>
                        <div className="flex rounded-full bg-muted p-1 text-sm">
                            {(['free', 'premium'] as const).map((tier) => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => save(f, { tier })}
                                    className={cn(
                                        'rounded-full px-3 py-1',
                                        f.tier === tier
                                            ? 'bg-background font-medium shadow-sm'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {tier === 'premium'
                                        ? t('admin.features.premium')
                                        : t('admin.features.free')}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={f.enabled}
                            aria-label={t(`feature.${f.key}`)}
                            onClick={() => save(f, { enabled: !f.enabled })}
                            className={cn(
                                'relative h-6 w-11 rounded-full transition-colors',
                                f.enabled
                                    ? 'bg-primary'
                                    : 'bg-muted-foreground/30',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
                                    f.enabled ? 'left-[22px]' : 'left-0.5',
                                )}
                            />
                        </button>
                    </li>
                ))}
            </ul>

            {/* Theme folders in public/themes / โฟลเดอร์ธีม */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xl text-ink">{t('admin.themes.title')}</h2>
                <p className="text-sm text-ink-soft">
                    {t('admin.themes.help')}
                </p>
                <ul className="paper flex flex-col divide-y divide-rule">
                    {themes.map((th) => {
                        const saveTheme = (patch: Partial<ThemeRow>) =>
                            router.put(
                                updateTheme.url(th.id),
                                {
                                    enabled: th.enabled,
                                    tier: th.tier,
                                    ...patch,
                                },
                                { preserveScroll: true },
                            );

                        return (
                            <li
                                key={th.id}
                                className={cn(
                                    'flex flex-wrap items-center gap-3 p-4',
                                    !th.enabled && 'opacity-60',
                                )}
                            >
                                <span
                                    style={themeStyle(th)}
                                    className="flex size-10 shrink-0 items-end justify-end rounded-[8px] bg-[var(--ground)] p-1.5 ring-1 ring-rule"
                                >
                                    <span className="size-4 rounded-full bg-[var(--stamp)]" />
                                </span>
                                <div className="flex flex-1 flex-col">
                                    <span className="font-medium text-ink">
                                        {th.name}
                                    </span>
                                    <span className="text-xs text-ink-soft">
                                        public/themes/{th.id}
                                        {th.extends &&
                                            ` · ${t('admin.themes.extends', { parent: th.extends })}`}
                                    </span>
                                </div>
                                {th.default ? (
                                    <span className="text-xs text-ink-soft">
                                        {t('admin.themes.default')}
                                    </span>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                saveTheme({
                                                    tier:
                                                        th.tier === 'free'
                                                            ? 'premium'
                                                            : 'free',
                                                })
                                            }
                                            className="press rounded-full bg-ink/[0.06] px-3 py-1.5 text-xs text-ink"
                                        >
                                            {th.tier === 'premium'
                                                ? t('admin.features.premium')
                                                : t('admin.features.free')}
                                        </button>
                                        <Switch
                                            checked={th.enabled}
                                            onCheckedChange={(on: boolean) =>
                                                saveTheme({ enabled: on })
                                            }
                                            aria-label={th.name}
                                        />
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </AdminShell>
    );
}
