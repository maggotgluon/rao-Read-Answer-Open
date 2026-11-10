import { Head, Link, router } from '@inertiajs/react';
import { EnvelopeIcon, PostcardIcon, StampsIcon } from '@/components/rao/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { daily, moments, restore, show } from '@/routes/spaces';
import type { SpaceDetail } from '@/types/space';

export type SpaceTab = 'overview' | 'daily' | 'moments';

/**
 * Frame for the 3 space tabs. Phones: tabs at the bottom (thumb reach, above the iPhone
 * home bar / Android gesture bar). Desktop: tabs under the title.
 * กรอบของ 3 แท็บ: มือถือแท็บอยู่ล่าง เดสก์ท็อปอยู่ใต้ชื่อ
 */
export function SpaceShell({
    space,
    tab,
    children,
}: {
    space: SpaceDetail;
    tab: SpaceTab;
    children: React.ReactNode;
}) {
    const { t, locale } = useT();
    const title = spaceTitle(space, t);
    const tabs = [
        {
            key: 'daily',
            label: t('tabs.daily'),
            href: daily.url(space.id),
            icon: EnvelopeIcon,
        },
        {
            key: 'overview',
            label: t('tabs.overview'),
            href: show.url(space.id),
            icon: StampsIcon,
        },
        {
            key: 'moments',
            label: t('tabs.moments'),
            href: moments.url(space.id),
            icon: PostcardIcon,
        },
    ] as const;

    return (
        <>
            <Head title={`${t(`tabs.${tab}`)} · ${title}`} />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-5 pb-2 md:px-6 md:pb-6">
                {/* On phones the space name is already in the top bar. / มือถือมีชื่อในแถบบนแล้ว */}
                <h1 className="sr-only text-3xl leading-tight text-ink md:not-sr-only">
                    {title}
                </h1>

                <nav
                    className="hidden gap-1 rounded-full bg-ink/[0.05] p-1 md:flex"
                    aria-label={title}
                >
                    {tabs.map((x) => (
                        <Link
                            key={x.key}
                            href={x.href}
                            prefetch
                            aria-current={tab === x.key ? 'page' : undefined}
                            className={cn(
                                'press flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm',
                                tab === x.key
                                    ? 'bg-paper font-medium text-ink shadow-paper'
                                    : 'text-ink-soft hover:text-ink',
                            )}
                        >
                            <x.icon className="size-[18px]" />
                            {x.label}
                        </Link>
                    ))}
                </nav>

                {space.status === 'frozen' && (
                    <section className="flex flex-col gap-3 rounded-[var(--radius)] border border-dashed border-postmark/60 p-4">
                        <h2 className="text-xl text-ink">
                            {t('space.frozen.title')}
                        </h2>
                        {space.delete_after && (
                            <p className="text-sm text-ink-soft">
                                {t('space.frozen.body', {
                                    date: new Date(
                                        space.delete_after,
                                    ).toLocaleDateString(
                                        locale === 'th' ? 'th-TH' : 'en-GB',
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        },
                                    ),
                                })}
                            </p>
                        )}
                        {space.can_restore && (
                            <Button
                                className="self-start"
                                onClick={() =>
                                    router.post(restore.url(space.id))
                                }
                            >
                                {t('space.frozen.restore')}
                            </Button>
                        )}
                    </section>
                )}

                {children}
            </div>

            {/* Phone tab bar / แถบแท็บบนมือถือ */}
            <nav
                aria-label={title}
                className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
            >
                <div className="mx-auto flex max-w-md">
                    {tabs.map((x) => {
                        const active = tab === x.key;

                        return (
                            <Link
                                key={x.key}
                                href={x.href}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'press relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]',
                                    active ? 'text-stamp' : 'text-ink-soft',
                                )}
                            >
                                <span
                                    aria-hidden
                                    className={cn(
                                        'absolute top-0 h-[3px] w-8 rounded-b-full bg-stamp transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                                        active
                                            ? 'opacity-100'
                                            : 'scale-x-0 opacity-0',
                                    )}
                                />
                                <x.icon
                                    className={cn(
                                        'size-6 transition-transform',
                                        active && '-translate-y-px',
                                    )}
                                />
                                {x.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

export function spaceTitle(
    space: SpaceDetail,
    t: (k: string, r?: Record<string, string | number>) => string,
): string {
    return (
        space.name ??
        (space.partner
            ? t('spaces.with', { name: space.partner.name })
            : t('spaces.waiting'))
    );
}
