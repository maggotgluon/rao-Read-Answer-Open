import { Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Globe,
    LogOut,
    Settings,
    Shield,
} from 'lucide-react';
import { MailboxIcon } from '@/components/rao/icons';
import { Wordmark } from '@/components/rao/logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { dashboard as adminHome } from '@/routes/admin';
import { update as setLocale } from '@/routes/locale';
import { edit as settings } from '@/routes/profile';

const icon = { strokeWidth: 1.75, className: 'size-4 text-ink-soft' };

/**
 * App top bar: logo, which space you're in (switch between spaces), and your menu.
 * Sits under the iPhone status bar / Android notch (safe area). Airmail stripe under it.
 * แถบด้านบน: โลโก้, เลือก space, เมนูของคุณ
 */
export function TopBar() {
    const { spaces, isAdmin, auth } = usePage().props;
    const { url } = usePage();
    const { t, locale } = useT();
    const current = spaces.find((s) => url.startsWith(new URL(s.url).pathname));
    const label = (s: (typeof spaces)[number]) =>
        s.name ??
        (s.partner
            ? t('spaces.with', { name: s.partner })
            : t('spaces.waiting'));
    const initial = (auth.user?.name ?? '?').trim().charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-30 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
            <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-2 px-4">
                <Link
                    href={dashboard({ query: { all: 1 } })}
                    prefetch
                    className="press -ml-1 rounded-lg p-1"
                    aria-label={t('nav.spaces')}
                >
                    <Wordmark />
                </Link>

                {spaces.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="press ml-auto flex max-w-[52vw] items-center gap-1.5 rounded-full bg-paper px-3 py-2 text-sm text-ink shadow-paper">
                            <span className="truncate">
                                {current ? label(current) : t('nav.spaces')}
                            </span>
                            <ChevronDown {...icon} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel className="text-xs font-normal text-ink-soft">
                                {t('nav.spaces')}
                            </DropdownMenuLabel>
                            {spaces.map((s) => (
                                <DropdownMenuItem key={s.id} asChild>
                                    <Link
                                        href={s.url}
                                        prefetch
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                s.status === 'frozen'
                                                    ? 'bg-postmark'
                                                    : 'bg-stamp',
                                            )}
                                        />
                                        <span className="flex-1 truncate">
                                            {label(s)}
                                        </span>
                                        {current?.id === s.id && (
                                            <Check {...icon} />
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={dashboard({ query: { all: 1 } })}
                                    className="flex items-center gap-2"
                                >
                                    <MailboxIcon className="size-4 text-ink-soft" />
                                    {t('nav.all_spaces')}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn(
                            'press grid size-10 shrink-0 place-items-center rounded-full bg-airmail text-sm font-medium text-airmail-ink',
                            spaces.length === 0 && 'ml-auto',
                        )}
                        aria-label={t('nav.menu')}
                    >
                        {initial}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuLabel className="flex flex-col">
                            <span className="truncate text-sm">
                                {auth.user?.name}
                            </span>
                            <span className="truncate text-xs font-normal text-ink-soft">
                                {auth.user?.email}
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href={settings()}
                                prefetch
                                className="flex items-center gap-2"
                            >
                                <Settings {...icon} /> {t('nav.settings')}
                            </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={adminHome()}
                                    prefetch
                                    className="flex items-center gap-2"
                                >
                                    <Shield {...icon} /> {t('admin.menu')}
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                router.post(
                                    setLocale.url(),
                                    { locale: locale === 'th' ? 'en' : 'th' },
                                    { preserveScroll: true },
                                );
                            }}
                            className="flex items-center gap-2"
                        >
                            <Globe {...icon} />
                            {locale === 'th' ? 'English' : 'ภาษาไทย'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href={logout()}
                                as="button"
                                onClick={() => router.flushAll()}
                                className="flex w-full items-center gap-2"
                                data-test="logout-button"
                            >
                                <LogOut {...icon} /> {t('nav.logout')}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="airmail-edge h-[3px] opacity-80" />
        </header>
    );
}
