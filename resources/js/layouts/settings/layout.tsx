import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useT } from '@/lib/i18n';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editNotifications } from '@/routes/notifications';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

/**
 * Settings: one column, sections as scrollable tabs on phones.
 * ตั้งค่า: คอลัมน์เดียว แท็บเลื่อนได้บนมือถือ
 */
export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useT();
    const items = [
        { title: t('settings.profile'), href: edit() },
        { title: t('settings.notifications'), href: editNotifications() },
        { title: t('settings.appearance'), href: editAppearance() },
        { title: t('settings.security'), href: editSecurity() },
    ];

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
            <h1 className="text-3xl text-ink">{t('nav.settings')}</h1>
            <nav
                aria-label={t('nav.settings')}
                className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4"
            >
                {items.map((item) => {
                    const active = isCurrentOrParentUrl(item.href);

                    return (
                        <Link
                            key={toUrl(item.href)}
                            href={item.href}
                            prefetch
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'press shrink-0 rounded-full px-4 py-2 text-sm',
                                active
                                    ? 'bg-paper font-medium text-ink shadow-paper'
                                    : 'text-ink-soft hover:text-ink',
                            )}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
            <section className="paper flex flex-col gap-10 p-5 sm:p-6">
                {children}
            </section>
        </div>
    );
}
