import { Head, Link, router } from '@inertiajs/react';
import { CalendarHeart, Heart, Images, Snowflake, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { daily, moments, restore, show } from '@/routes/spaces';
import type { SpaceDetail } from '@/types/space';

export type SpaceTab = 'overview' | 'daily' | 'moments';

/**
 * Shared frame for the 3 space tabs: header, frozen banner, tab bar
 * (top on desktop, fixed bottom bar on phones — feels like an app in the PWA).
 * กรอบร่วมของ 3 แท็บ: หัว, แบนเนอร์แช่แข็ง, แถบแท็บ (มือถืออยู่ด้านล่าง)
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
            key: 'overview',
            label: t('tabs.overview'),
            href: show.url(space.id),
            icon: CalendarHeart,
        },
        {
            key: 'daily',
            label: t('tabs.daily'),
            href: daily.url(space.id),
            icon: Sun,
        },
        {
            key: 'moments',
            label: t('tabs.moments'),
            href: moments.url(space.id),
            icon: Images,
        },
    ] as const;

    return (
        <>
            <Head title={`${t(`tabs.${tab}`)} · ${title}`} />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 pb-28 md:p-8 md:pb-8">
                <header className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Heart className="size-5" />
                    </span>
                    <h1 className="text-xl font-semibold md:text-2xl">
                        {title}
                    </h1>
                </header>

                <nav className="hidden gap-1 rounded-full bg-muted p-1 md:flex">
                    {tabs.map((x) => (
                        <Link
                            key={x.key}
                            href={x.href}
                            prefetch
                            preserveScroll={false}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition-colors',
                                tab === x.key
                                    ? 'bg-background font-medium shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <x.icon className="size-4" />
                            {x.label}
                        </Link>
                    ))}
                </nav>

                {space.status === 'frozen' && (
                    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted p-4">
                        <h2 className="flex items-center gap-2 font-medium">
                            <Snowflake className="size-4" />{' '}
                            {t('space.frozen.title')}
                        </h2>
                        {space.delete_after && (
                            <p className="text-sm text-muted-foreground">
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

            {/* Phone tab bar */}
            <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
                {tabs.map((x) => (
                    <Link
                        key={x.key}
                        href={x.href}
                        prefetch
                        className={cn(
                            'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
                            tab === x.key
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    >
                        <x.icon className="size-5" />
                        {x.label}
                    </Link>
                ))}
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
