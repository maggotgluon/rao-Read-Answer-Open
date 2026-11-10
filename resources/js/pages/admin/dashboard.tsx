import { AdminShell, StatCard } from '@/components/admin/admin-shell';
import { useT } from '@/lib/i18n';

type Ranked = {
    id: number;
    key: string | null;
    kind: string;
    text: string;
    up: number;
    down: number;
    score: number;
};

type Props = {
    stats: {
        users: {
            total: number;
            new_7d: number;
            dau: number;
            wau: number;
            mau: number;
            push_on: number;
            location_on: number;
        };
        spaces: {
            paired: number;
            waiting: number;
            frozen: number;
            long_distance: number;
            premium: number;
        };
        engagement: {
            answer_rate_7d: number | null;
            avg_streak: number | null;
            best_streak: number;
            answers_7d: number;
            moments_7d: number;
        };
        series: {
            date: string;
            active: number;
            answers: number;
            moments: number;
        }[];
        prompts: { best: Ranked[]; worst: Ranked[]; total_ratings: number };
    };
};

const pct = (n: number, of: number) =>
    of ? `${Math.round((100 * n) / of)}%` : '—';

/** Admin dashboard: numbers and trends only — never content. / สถิติภาพรวม (ไม่มีเนื้อหาส่วนตัว) */
export default function AdminDashboard({ stats }: Props) {
    const { t } = useT();
    const { users, spaces, engagement, series, prompts } = stats;

    return (
        <AdminShell tab="dashboard" title={t('admin.tab.dashboard')}>
            <p className="text-sm text-muted-foreground">
                {t('admin.dash.privacy')}
            </p>

            <Section title={t('admin.dash.people')}>
                <StatCard
                    label={t('admin.dash.users')}
                    value={users.total}
                    hint={t('admin.dash.new_7d', { count: users.new_7d })}
                />
                <StatCard
                    label={t('admin.dash.dau')}
                    value={users.dau}
                    hint={pct(users.dau, users.total)}
                />
                <StatCard
                    label={t('admin.dash.wau')}
                    value={users.wau}
                    hint={pct(users.wau, users.total)}
                />
                <StatCard
                    label={t('admin.dash.mau')}
                    value={users.mau}
                    hint={pct(users.mau, users.total)}
                />
                <StatCard
                    label={t('admin.dash.push_on')}
                    value={users.push_on}
                    hint={pct(users.push_on, users.total)}
                />
                <StatCard
                    label={t('admin.dash.location_on')}
                    value={users.location_on}
                    hint={pct(users.location_on, users.total)}
                />
            </Section>

            <Section title={t('admin.dash.spaces')}>
                <StatCard
                    label={t('admin.dash.paired')}
                    value={spaces.paired}
                />
                <StatCard
                    label={t('admin.dash.waiting')}
                    value={spaces.waiting}
                />
                <StatCard
                    label={t('admin.dash.frozen')}
                    value={spaces.frozen}
                />
                <StatCard
                    label={t('admin.dash.long_distance')}
                    value={spaces.long_distance}
                    hint={pct(spaces.long_distance, spaces.paired)}
                />
                <StatCard
                    label={t('admin.dash.premium')}
                    value={spaces.premium}
                />
            </Section>

            <Section title={t('admin.dash.engagement')}>
                <StatCard
                    label={t('admin.dash.answer_rate')}
                    value={
                        engagement.answer_rate_7d === null
                            ? '—'
                            : `${engagement.answer_rate_7d}%`
                    }
                    hint={t('admin.dash.answer_rate_hint')}
                />
                <StatCard
                    label={t('admin.dash.avg_streak')}
                    value={engagement.avg_streak ?? '—'}
                    hint={t('admin.dash.best', {
                        count: engagement.best_streak,
                    })}
                />
                <StatCard
                    label={t('admin.dash.answers_7d')}
                    value={engagement.answers_7d}
                />
                <StatCard
                    label={t('admin.dash.moments_7d')}
                    value={engagement.moments_7d}
                />
            </Section>

            <section className="paper flex flex-col gap-3 p-4">
                <h2 className="font-medium">{t('admin.dash.last_30')}</h2>
                <Bars series={series} />
            </section>

            <section className="grid gap-3 md:grid-cols-2">
                <Ranking
                    title={`👍 ${t('admin.dash.best_prompts')}`}
                    rows={prompts.best}
                />
                <Ranking
                    title={`👎 ${t('admin.dash.worst_prompts')}`}
                    rows={prompts.worst}
                />
            </section>
            <p className="text-xs text-muted-foreground">
                {t('admin.dash.ratings_total', {
                    count: prompts.total_ratings,
                })}
            </p>
        </AdminShell>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
                {title}
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                {children}
            </div>
        </section>
    );
}

/** Simple bar chart (no chart library): active people per day, answers + moments in the tooltip. */
function Bars({ series }: { series: Props['stats']['series'] }) {
    const { t } = useT();
    const max = Math.max(
        1,
        ...series.map((d) => Math.max(d.active, d.answers)),
    );

    return (
        <div className="flex flex-col gap-2">
            <div className="flex h-40 items-end gap-[3px]">
                {series.map((d) => (
                    <div
                        key={d.date}
                        className="group relative flex flex-1 items-end gap-px"
                        title={`${d.date} · ${t('admin.dash.active')} ${d.active} · ${t('admin.dash.answers')} ${d.answers} · ${t('admin.dash.moments')} ${d.moments}`}
                    >
                        <div
                            className="flex-1 rounded-t bg-primary"
                            style={{
                                height: `${(100 * d.active) / max}%`,
                                minHeight: d.active ? 2 : 0,
                            }}
                        />
                        <div
                            className="flex-1 rounded-t bg-primary/35"
                            style={{
                                height: `${(100 * d.answers) / max}%`,
                                minHeight: d.answers ? 2 : 0,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{series[0]?.date}</span>
                <span className="flex gap-3">
                    <span className="flex items-center gap-1">
                        <i className="size-2 rounded-sm bg-primary" />{' '}
                        {t('admin.dash.active')}
                    </span>
                    <span className="flex items-center gap-1">
                        <i className="size-2 rounded-sm bg-primary/35" />{' '}
                        {t('admin.dash.answers')}
                    </span>
                </span>
                <span>{series[series.length - 1]?.date}</span>
            </div>
        </div>
    );
}

function Ranking({ title, rows }: { title: string; rows: Ranked[] }) {
    const { t } = useT();

    return (
        <div className="paper flex flex-col gap-2 p-4">
            <h2 className="font-medium">{title}</h2>
            {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('admin.dash.no_ratings')}
                </p>
            ) : (
                <ol className="flex flex-col gap-2 text-sm">
                    {rows.map((r) => (
                        <li key={r.id} className="flex gap-2">
                            <span className="flex-1">{r.text}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                👍 {r.up} · 👎 {r.down}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
