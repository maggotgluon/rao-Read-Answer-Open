import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    Lightbulb,
    Library,
    ToggleRight,
    Users,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, insights } from '@/routes/admin';
import { index as features } from '@/routes/admin/features';
import { index as prompts } from '@/routes/admin/prompts';
import { index as schedule } from '@/routes/admin/schedule';
import { index as users } from '@/routes/admin/users';

export type AdminTab =
    | 'dashboard'
    | 'insights'
    | 'users'
    | 'prompts'
    | 'schedule'
    | 'features';

/** Frame + tabs for every admin page. / กรอบและแท็บของหน้าแอดมิน */
export function AdminShell({
    tab,
    title,
    actions,
    children,
}: {
    tab: AdminTab;
    title: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { t } = useT();
    const tabs = [
        { key: 'dashboard', href: dashboard.url(), icon: BarChart3 },
        { key: 'insights', href: insights.url(), icon: Lightbulb },
        { key: 'users', href: users.url(), icon: Users },
        { key: 'prompts', href: prompts.url(), icon: Library },
        { key: 'schedule', href: schedule.url(), icon: CalendarDays },
        { key: 'features', href: features.url(), icon: ToggleRight },
    ] as const;

    return (
        <>
            <Head title={`${title} · Admin`} />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] md:px-8">
                <nav className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
                    {tabs.map((x) => (
                        <Link
                            key={x.key}
                            href={x.href}
                            prefetch
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors',
                                tab === x.key
                                    ? 'bg-background font-medium shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <x.icon className="size-4" strokeWidth={1.75} />
                            {t(`admin.tab.${x.key}`)}
                        </Link>
                    ))}
                </nav>
                <header className="flex flex-wrap items-end gap-3">
                    <h1 className="flex-1 text-3xl text-ink">{title}</h1>
                    {actions}
                </header>
                {children}
            </div>
        </>
    );
}

export function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: React.ReactNode;
    hint?: string;
}) {
    return (
        <div className="flex flex-col gap-0.5 border-t-2 border-ink/80 pt-2">
            <span className="text-xs text-ink-soft">{label}</span>
            <span className="tabular text-2xl font-semibold text-ink">
                {value}
            </span>
            {hint && (
                <span className="text-xs text-muted-foreground">{hint}</span>
            )}
        </div>
    );
}

export function fmtDate(
    iso: string | null,
    locale: string,
    withTime = false,
): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(locale === 'th' ? 'th-TH' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
}
