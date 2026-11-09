import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Flame, Snowflake } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { show } from '@/routes/spaces';
import type { CalendarMonth, DayStatus } from '@/types/space';

const STYLE: Record<DayStatus, string> = {
    // Theme tokens (--streak / --freeze) so every theme colours the calendar its own way.
    complete: 'bg-streak font-medium text-streak-foreground',
    partial: 'bg-streak-soft',
    forgiven: 'bg-freeze text-freeze-foreground',
    missed: 'bg-muted text-muted-foreground',
    today: 'ring-2 ring-streak',
    future: 'text-muted-foreground/60',
    before: 'text-muted-foreground/40',
};

type Props = {
    calendar: CalendarMonth;
    spaceId: string;
    onPick: (date: string) => void;
};

export function MonthCalendar({ calendar, spaceId, onPick }: Props) {
    const { t, locale } = useT();
    const loc = locale === 'th' ? 'th-TH' : 'en-GB';
    const first = new Date(calendar.month + '-01T00:00:00');
    const lead = (first.getDay() + 6) % 7; // Monday-first grid
    const weekdays = Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'narrow' }),
    );
    const go = (month: string) =>
        router.get(
            show.url(spaceId),
            { month },
            { preserveScroll: true, preserveState: true, only: ['calendar'] },
        );

    return (
        <section className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <header className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label={t('calendar.prev')}
                    onClick={() => go(calendar.prev)}
                    className="rounded-full p-1.5 hover:bg-muted"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <h2 className="flex-1 text-center font-medium">
                    {first.toLocaleDateString(loc, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
                {!calendar.is_current && (
                    <button
                        type="button"
                        onClick={() => go('')}
                        className="text-xs text-primary"
                    >
                        {t('calendar.back_today')}
                    </button>
                )}
                <button
                    type="button"
                    aria-label={t('calendar.next')}
                    onClick={() => go(calendar.next)}
                    className="rounded-full p-1.5 hover:bg-muted"
                >
                    <ChevronRight className="size-4" />
                </button>
            </header>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {weekdays.map((w, i) => (
                    <span key={i}>{w}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: lead }, (_, i) => (
                    <span key={`lead-${i}`} />
                ))}
                {calendar.days.map((d) => {
                    const clickable =
                        d.status !== 'future' && d.status !== 'before';

                    return (
                        <button
                            key={d.date}
                            type="button"
                            disabled={!clickable && d.events.length === 0}
                            onClick={() => onPick(d.date)}
                            title={d.events.join(', ')}
                            className={cn(
                                'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-transform enabled:hover:scale-105',
                                STYLE[d.status],
                            )}
                        >
                            {d.status === 'forgiven' ? (
                                <Snowflake className="size-3.5" />
                            ) : (
                                Number(d.date.slice(8))
                            )}
                            <span className="absolute bottom-1 flex gap-0.5">
                                {d.events.length > 0 && (
                                    <span className="size-1.5 rounded-full bg-amber-500" />
                                )}
                                {d.moments > 0 && (
                                    <span className="size-1.5 rounded-full bg-fuchsia-500" />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            <footer className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <Legend
                    className="bg-streak"
                    label={t('calendar.legend.complete')}
                    icon={<Flame className="size-2.5 text-streak-foreground" />}
                />
                <Legend
                    className="bg-streak-soft"
                    label={t('calendar.legend.partial')}
                />
                <Legend
                    className="bg-freeze"
                    label={t('calendar.legend.forgiven')}
                />
                <Legend
                    className="bg-muted"
                    label={t('calendar.legend.missed')}
                />
                <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    {t('day.events')}
                </span>
                <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-fuchsia-500" />
                    {t('day.moments')}
                </span>
            </footer>
        </section>
    );
}

function Legend({
    className,
    label,
    icon,
}: {
    className: string;
    label: string;
    icon?: React.ReactNode;
}) {
    return (
        <span className="flex items-center gap-1">
            <span
                className={cn(
                    'flex size-3.5 items-center justify-center rounded',
                    className,
                )}
            >
                {icon}
            </span>
            {label}
        </span>
    );
}
