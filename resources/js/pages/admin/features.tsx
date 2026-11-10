import { router } from '@inertiajs/react';
import { AdminShell } from '@/components/admin/admin-shell';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { update } from '@/routes/admin/features';

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
export default function AdminFeatures({ features }: { features: Row[] }) {
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
                                        ? `⭐ ${t('admin.features.premium')}`
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
        </AdminShell>
    );
}
