import { AdminShell, StatCard } from '@/components/admin/admin-shell';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Count = Record<string, number>;
type Props = {
    insights: {
        consent: { users: number; opted_in: number };
        funnel: { key: string; count: number }[];
        cohorts: { week: string; size: number; weeks: (number | null)[] }[];
        hours: number[];
        opens: {
            total: number;
            people: number;
            source: Count;
            device: Count;
            os: Count;
            installed: number | null;
        };
        push: {
            sent: number;
            by_type: Count;
            opened: number;
            open_rate: number | null;
        };
        features: { name: string; count: number; people: number }[];
        survey: {
            responses: number;
            dismissed: number;
            average: number | null;
            scores: Record<string, number>;
            comments: {
                score: number;
                liked: string | null;
                change: string | null;
                at: string | null;
            }[];
        };
    };
};

/**
 * What helps couples come back. Funnel/retention: everyone, counted from core tables.
 * Opens/push/features: only people who opted in to analytics.
 * อะไรช่วยให้คู่รักกลับมาใช้ต่อ
 */
export default function AdminInsights({ insights }: Props) {
    const { t } = useT();
    const { consent, funnel, cohorts, hours, opens, push, features, survey } =
        insights;
    const top = funnel[0]?.count || 0;
    const maxHour = Math.max(1, ...hours);

    return (
        <AdminShell tab="insights" title={t('admin.tab.insights')}>
            <p className="text-sm text-ink-soft">
                {t('insights.note', {
                    n: consent.opted_in,
                    total: consent.users,
                })}
            </p>

            {/* Funnel / เส้นทางผู้ใช้ */}
            <Block
                title={t('insights.funnel')}
                hint={t('insights.funnel_hint')}
            >
                <ol className="flex flex-col gap-2">
                    {funnel.map((f, i) => {
                        const w = top ? Math.round((100 * f.count) / top) : 0;
                        const prev = i ? funnel[i - 1].count : null;

                        return (
                            <li key={f.key} className="flex flex-col gap-1">
                                <div className="flex items-baseline justify-between gap-3 text-sm">
                                    <span className="text-ink">
                                        {t(`insights.step.${f.key}`)}
                                    </span>
                                    <span className="tabular text-ink-soft">
                                        {f.count}
                                        {prev
                                            ? ` · ${Math.round((100 * f.count) / prev)}%`
                                            : ''}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-ink/[0.06]">
                                    <div
                                        className="h-2 rounded-full bg-stamp"
                                        style={{ width: `${w}%` }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </Block>

            {/* Retention / การกลับมาใช้ */}
            <Block
                title={t('insights.cohorts')}
                hint={t('insights.cohorts_hint')}
            >
                {cohorts.length === 0 ? (
                    <Empty />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-ink-soft">
                                    <th className="py-1 pr-3 font-normal">
                                        {t('insights.week_of')}
                                    </th>
                                    <th className="py-1 pr-3 font-normal">
                                        {t('insights.people')}
                                    </th>
                                    {[1, 2, 3, 4].map((w) => (
                                        <th
                                            key={w}
                                            className="py-1 pr-3 font-normal"
                                        >
                                            {t('insights.week_n', { n: w })}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cohorts.map((c) => (
                                    <tr
                                        key={c.week}
                                        className="border-t border-rule"
                                    >
                                        <td className="tabular py-1.5 pr-3">
                                            {c.week}
                                        </td>
                                        <td className="tabular py-1.5 pr-3">
                                            {c.size}
                                        </td>
                                        {c.weeks.map((v, i) => (
                                            <td key={i} className="py-1.5 pr-3">
                                                {v === null ? (
                                                    <span className="text-ink-soft">
                                                        ·
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="tabular inline-block min-w-11 rounded px-1.5 py-0.5 text-center"
                                                        style={{
                                                            background: `color-mix(in oklab, var(--stamp) ${Math.round(v * 0.6)}%, transparent)`,
                                                        }}
                                                    >
                                                        {v}%
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Block>

            {/* When people write / เวลาที่เขียน */}
            <Block title={t('insights.hours')} hint={t('insights.hours_hint')}>
                <div className="flex h-28 items-end gap-[3px]">
                    {hours.map((n, h) => (
                        <div
                            key={h}
                            className="flex flex-1 flex-col items-center gap-1"
                            title={`${h}:00 · ${n}`}
                        >
                            <div
                                className="w-full rounded-t-sm bg-airmail/70"
                                style={{
                                    height: `${(100 * n) / maxHour}%`,
                                    minHeight: n ? 2 : 0,
                                }}
                            />
                            {h % 6 === 0 && (
                                <span className="tabular text-[10px] text-ink-soft">
                                    {h}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </Block>

            {/* Opens & push (opt-in) / การเปิดแอปและแจ้งเตือน */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
                <StatCard
                    label={t('insights.opens')}
                    value={opens.total}
                    hint={t('insights.people_n', { n: opens.people })}
                />
                <StatCard
                    label={t('insights.installed')}
                    value={
                        opens.installed === null ? '—' : `${opens.installed}%`
                    }
                />
                <StatCard label={t('insights.push_sent')} value={push.sent} />
                <StatCard
                    label={t('insights.push_open_rate')}
                    value={push.open_rate === null ? '—' : `${push.open_rate}%`}
                    hint={t('insights.push_opened', { n: push.opened })}
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <Breakdown
                    title={t('insights.source')}
                    data={opens.source}
                    label={(k) => t(`insights.source.${k}`)}
                />
                <Breakdown title={t('insights.device')} data={opens.device} />
                <Breakdown
                    title={t('insights.push_types')}
                    data={push.by_type}
                    label={(k) => t(`notify.type.${k}`)}
                />
            </div>

            {/* Feature use (opt-in) / การใช้ฟีเจอร์ */}
            <Block title={t('insights.features')} hint={t('insights.last_30')}>
                {features.length === 0 ? (
                    <Empty />
                ) : (
                    <ul className="divide-y divide-rule text-sm">
                        {features.map((f) => (
                            <li
                                key={f.name}
                                className="flex justify-between gap-3 py-1.5"
                            >
                                <span className="text-ink">
                                    {t(`insights.event.${f.name}`)}
                                </span>
                                <span className="tabular text-ink-soft">
                                    {f.count} ·{' '}
                                    {t('insights.people_n', { n: f.people })}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>

            {/* Survey / แบบสอบถาม */}
            <Block
                title={t('insights.survey')}
                hint={t('insights.survey_hint', {
                    n: survey.responses,
                    d: survey.dismissed,
                })}
            >
                <div className="flex items-end gap-6">
                    <div className="flex flex-col">
                        <span className="hand text-4xl text-ink">
                            {survey.average ?? '—'}
                        </span>
                        <span className="text-xs text-ink-soft">
                            {t('insights.avg_of_5')}
                        </span>
                    </div>
                    <div className="flex flex-1 items-end gap-2">
                        {Object.entries(survey.scores).map(([s, n]) => (
                            <div
                                key={s}
                                className="flex flex-1 flex-col items-center gap-1 text-xs text-ink-soft"
                            >
                                <span className="tabular">{n}</span>
                                <span>
                                    {
                                        ['😞', '😕', '😐', '🙂', '😍'][
                                            Number(s) - 1
                                        ]
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                {survey.comments.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-3">
                        {survey.comments.map((c, i) => (
                            <li
                                key={i}
                                className="rounded-[calc(var(--radius)-2px)] bg-paper-2 p-3 text-sm"
                            >
                                <div className="text-xs text-ink-soft">
                                    {
                                        ['😞', '😕', '😐', '🙂', '😍'][
                                            c.score - 1
                                        ]
                                    }{' '}
                                    · {c.at}
                                </div>
                                {c.liked && (
                                    <p className="mt-1 text-ink">
                                        👍 {c.liked}
                                    </p>
                                )}
                                {c.change && (
                                    <p className="mt-1 text-ink">
                                        ✏️ {c.change}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Block>
        </AdminShell>
    );
}

function Block({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="paper flex flex-col gap-3 p-4">
            <header className="flex flex-col gap-0.5">
                <h2 className="text-xl leading-tight text-ink">{title}</h2>
                {hint && <p className="text-xs text-ink-soft">{hint}</p>}
            </header>
            {children}
        </section>
    );
}

function Breakdown({
    title,
    data,
    label,
}: {
    title: string;
    data: Count;
    label?: (k: string) => string;
}) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    return (
        <section className="paper flex flex-col gap-2 p-4 text-sm">
            <h3 className="font-medium text-ink">{title}</h3>
            {total === 0 ? (
                <Empty />
            ) : (
                Object.entries(data).map(([k, n]) => (
                    <div key={k} className="flex justify-between gap-2">
                        <span className={cn('text-ink-soft')}>
                            {label ? label(k) : k}
                        </span>
                        <span className="tabular text-ink">
                            {Math.round((100 * n) / total)}%
                        </span>
                    </div>
                ))
            )}
        </section>
    );
}

function Empty() {
    const { t } = useT();

    return <p className="text-sm text-ink-soft">{t('insights.empty')}</p>;
}
