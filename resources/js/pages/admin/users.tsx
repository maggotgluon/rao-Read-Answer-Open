import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Fragment, useState } from 'react';
import { AdminShell, fmtDate } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { premium } from '@/routes/admin/spaces';
import { index } from '@/routes/admin/users';

type Row = {
    id: number;
    name: string;
    email: string;
    verified: boolean;
    is_admin: boolean;
    locale: string | null;
    joined_at: string | null;
    last_seen_at: string | null;
    spaces_count: number;
    spaces: {
        id: string;
        members: string[];
        status: string;
        premium: boolean;
        long_distance: boolean;
    }[];
};

type Props = {
    users: {
        data: Row[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { q?: string };
};

/** Users (no content, no locations). Premium is given per space. / ผู้ใช้ (ไม่มีเนื้อหาส่วนตัว) */
export default function AdminUsers({ users, filters }: Props) {
    const { t, locale } = useT();
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState<number | null>(null);

    return (
        <AdminShell tab="users" title={t('admin.tab.users')}>
            <form
                className="flex gap-1"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get(
                        index.url(),
                        { q: q || undefined },
                        { preserveState: true },
                    );
                }}
            >
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('admin.users.search')}
                    className="w-72"
                />
                <Button
                    type="submit"
                    variant="secondary"
                    size="icon"
                    aria-label={t('admin.search')}
                >
                    <Search />
                </Button>
            </form>
            <p className="text-xs text-muted-foreground">
                {t('admin.users.count', { count: users.total })} ·{' '}
                {t('admin.users.privacy')}
            </p>

            <div className="paper overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                        <tr className="border-b border-border">
                            <th className="p-3">{t('admin.users.name')}</th>
                            <th className="p-3">{t('admin.users.joined')}</th>
                            <th className="p-3">
                                {t('admin.users.last_seen')}
                            </th>
                            <th className="p-3">{t('admin.users.spaces')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((u) => (
                            <Fragment key={u.id}>
                                <tr className="border-b border-border last:border-0">
                                    <td className="p-3">
                                        <div className="flex flex-wrap items-center gap-1.5 font-medium">
                                            {u.name}
                                            {u.is_admin && <Badge>admin</Badge>}
                                            {!u.verified && (
                                                <Badge variant="secondary">
                                                    {t(
                                                        'admin.users.unverified',
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {u.email} · {u.locale ?? '—'}
                                        </div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {fmtDate(u.joined_at, locale)}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {fmtDate(u.last_seen_at, locale, true)}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            className="underline"
                                            onClick={() =>
                                                setOpen(
                                                    open === u.id ? null : u.id,
                                                )
                                            }
                                        >
                                            {u.spaces_count}
                                        </button>
                                    </td>
                                </tr>
                                {open === u.id && (
                                    <tr className="border-b border-border bg-muted/40">
                                        <td colSpan={4} className="p-3">
                                            <ul className="flex flex-col gap-2">
                                                {u.spaces.map((s) => (
                                                    <li
                                                        key={s.id}
                                                        className="flex flex-wrap items-center gap-2"
                                                    >
                                                        <span className="flex-1">
                                                            {s.members.join(
                                                                ' + ',
                                                            )}
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                {t(
                                                                    `admin.users.status_${s.status}`,
                                                                )}
                                                                {s.long_distance &&
                                                                    ' · ✈️'}
                                                            </span>
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                s.premium
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            onClick={() =>
                                                                router.put(
                                                                    premium.url(
                                                                        s.id,
                                                                    ),
                                                                    {
                                                                        on: !s.premium,
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            {s.premium
                                                                ? `⭐ ${t('admin.users.premium')}`
                                                                : t(
                                                                      'admin.users.give_premium',
                                                                  )}
                                                        </Button>
                                                    </li>
                                                ))}
                                                {u.spaces.length === 0 && (
                                                    <li className="text-muted-foreground">
                                                        —
                                                    </li>
                                                )}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <nav className="flex flex-wrap gap-1">
                {users.links.map((l, i) =>
                    l.url ? (
                        <Link
                            key={i}
                            href={l.url}
                            className={cn(
                                'rounded-lg px-3 py-1 text-sm',
                                l.active
                                    ? 'bg-ink text-paper'
                                    : 'hover:bg-muted',
                            )}
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        </Link>
                    ) : null,
                )}
            </nav>
        </AdminShell>
    );
}
