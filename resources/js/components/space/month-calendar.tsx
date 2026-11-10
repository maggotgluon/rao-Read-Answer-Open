import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from '@/components/rao/ui-icons';
import { useT } from '@/lib/i18n';
import { organic, seeded } from '@/lib/organic';
import { cn } from '@/lib/utils';
import { show } from '@/routes/spaces';
import type { CalendarMonth, DayStatus } from '@/types/space';

type Props = {
    calendar: CalendarMonth;
    spaceId: string;
    onPick: (date: string) => void;
};

/**
 * The month as a sheet of stamps. Both wrote = a red stamp cancelled by a postmark;
 * one wrote = a pale stamp; free miss = a blue "rest" stamp; missed = an empty space.
 * Each stamp is stuck on by hand: its own tilt, nudge and worn ink, seeded by the date
 * so it never jumps around between visits.
 * เดือนเป็นแผ่นแสตมป์: เขียนทั้งคู่ = แสตมป์แดงมีตราประทับ แต่ละดวงเอียงไม่เท่ากัน (คงที่ตามวันที่)
 */
export function MonthCalendar({ calendar, spaceId, onPick }: Props) {
    const { t, locale } = useT();
    const loc = locale === 'th' ? 'th-TH' : 'en-GB';
    const first = new Date(calendar.month + '-01T00:00:00');
    const lead = (first.getDay() + 6) % 7; // Monday-first
    const weekdays = Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'narrow' }),
    );
    const go = (month: string) =>
        router.get(
            show.url(spaceId),
            { month },
            { preserveScroll: true, preserveState: true, only: ['calendar'] },
        );
    const nav =
        'press grid size-10 place-items-center rounded-full text-ink-soft hover:bg-ink/5';

    return (
        <section className="flex flex-col gap-3">
            <header className="flex items-center gap-1">
                <h2 className="flex-1 text-2xl text-ink">
                    {first.toLocaleDateString(loc, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
                {!calendar.is_current && (
                    <button
                        type="button"
                        onClick={() => go('')}
                        className="press rounded-full px-3 py-2 text-sm text-stamp"
                    >
                        {t('calendar.back_today')}
                    </button>
                )}
                <button
                    type="button"
                    aria-label={t('calendar.prev')}
                    onClick={() => go(calendar.prev)}
                    className={nav}
                >
                    <ChevronLeft className="size-5" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    aria-label={t('calendar.next')}
                    onClick={() => go(calendar.next)}
                    className={nav}
                >
                    <ChevronRight className="size-5" strokeWidth={1.75} />
                </button>
            </header>

            <div className="paper p-3">
                <div className="grid grid-cols-7 gap-1.5 pb-1.5 text-center text-xs text-ink-soft">
                    {weekdays.map((w, i) => (
                        <span key={i}>{w}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: lead }, (_, i) => (
                        <span key={`lead-${i}`} />
                    ))}
                    {calendar.days.map((d) => (
                        <DayStamp
                            key={d.date}
                            date={d.date}
                            day={Number(d.date.slice(8))}
                            status={d.status}
                            events={d.events}
                            moments={d.moments}
                            onPick={() => onPick(d.date)}
                            label={new Date(
                                d.date + 'T00:00:00',
                            ).toLocaleDateString(loc, {
                                day: 'numeric',
                                month: 'long',
                            })}
                            statusLabel={t(`calendar.legend.${d.status}`)}
                        />
                    ))}
                </div>
            </div>

            <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
                <Legend
                    face="var(--stamp)"
                    mark
                    label={t('calendar.legend.complete')}
                />
                <Legend
                    face="var(--stamp-soft)"
                    label={t('calendar.legend.partial')}
                />
                <Legend
                    face="var(--airmail-soft)"
                    label={t('calendar.legend.forgiven')}
                />
                <span className="flex items-center gap-1.5">
                    <span className="size-3.5 rounded-[3px] border border-dashed border-postmark" />
                    {t('calendar.legend.missed')}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-airmail" />
                    {t('day.events')}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-kraft" />
                    {t('day.moments')}
                </span>
            </footer>
        </section>
    );
}

const FACE: Partial<Record<DayStatus, string>> = {
    complete: 'var(--stamp)',
    partial: 'var(--stamp-soft)',
    forgiven: 'var(--airmail-soft)',
};

function DayStamp({
    date,
    day,
    status,
    events,
    moments,
    onPick,
    label,
    statusLabel,
}: {
    date: string;
    day: number;
    status: DayStatus;
    events: string[];
    moments: number;
    onPick: () => void;
    label: string;
    statusLabel: string;
}) {
    const face = FACE[status];
    // stuck-on-by-hand look; today stays straighter so it reads at a glance
    // ดูเหมือนติดด้วยมือ วันนี้เอียงน้อยกว่าเพื่อให้อ่านง่าย
    const look = organic(date, {
        tilt: status === 'today' ? 2 : face ? 6 : 3,
        shift: face ? 1.6 : 0.8,
    });
    const clickable = status !== 'future' && status !== 'before';
    const dots = (
        <span className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
            {events.length > 0 && (
                <span className="size-1 rounded-full bg-airmail" />
            )}
            {moments > 0 && <span className="size-1 rounded-full bg-kraft" />}
        </span>
    );

    return (
        <button
            type="button"
            disabled={!clickable && events.length === 0}
            onClick={onPick}
            title={events.join(', ')}
            aria-label={`${label} · ${statusLabel}${events.length ? ' · ' + events.join(', ') : ''}`}
            className="press relative aspect-[5/6] disabled:cursor-default"
        >
            {face ? (
                <span
                    className="perforated inked absolute inset-0"
                    style={{
                        ...look,
                        ['--stamp-face' as string]: face,
                        ['--hole' as string]: '1.5px',
                        ['--gap' as string]: '5px',
                        padding: '2.5px',
                    }}
                >
                    <span
                        style={{ background: face }}
                        className={cn(
                            'relative grid size-full place-items-center overflow-hidden text-sm',
                            status === 'complete'
                                ? 'font-medium text-stamp-ink'
                                : 'text-ink',
                        )}
                    >
                        {day}
                        {status === 'complete' && <Postmark seed={date} />}
                    </span>
                </span>
            ) : (
                <span
                    style={
                        status === 'missed' || status === 'today'
                            ? look
                            : undefined
                    }
                    className={cn(
                        'absolute inset-0 grid place-items-center rounded-[3px] text-sm',
                        (status === 'missed' || status === 'today') && 'inked',
                        status === 'missed' &&
                            'border border-dashed border-postmark/60 text-ink-soft',
                        status === 'today' &&
                            'border-2 border-dashed border-stamp font-medium text-stamp',
                        status === 'future' && 'text-ink-soft/60',
                        status === 'before' && 'text-ink-soft/35',
                    )}
                >
                    {day}
                </span>
            )}
            {dots}
        </button>
    );
}

/**
 * Wavy cancellation lines over a completed day; each lands at its own angle and spot.
 * เส้นตราประทับบนวันที่เขียนครบ แต่ละวันประทับคนละมุม
 */
function Postmark({ seed }: { seed: string }) {
    const r = seeded(`pm-${seed}`);
    const rot = Math.round(r() * 70 - 35);
    const top = Math.round(r() * 30 - 22);
    const right = Math.round(r() * 30 - 22);

    return (
        <svg
            aria-hidden
            viewBox="0 0 30 30"
            className="pointer-events-none absolute size-[74%] opacity-60"
            style={{
                top: `${top}%`,
                right: `${right}%`,
                transform: `rotate(${rot}deg)`,
            }}
        >
            <circle
                cx="15"
                cy="15"
                r="9"
                fill="none"
                stroke="var(--stamp-ink)"
                strokeWidth="1.2"
                strokeDasharray="2 2"
            />
            <path
                d="M2 24c3-2 6 2 9 0s6 2 9 0 6 2 9 0"
                fill="none"
                stroke="var(--stamp-ink)"
                strokeWidth="1.2"
            />
        </svg>
    );
}

function Legend({
    face,
    label,
    mark,
}: {
    face: string;
    label: string;
    mark?: boolean;
}) {
    return (
        <span className="flex items-center gap-1.5">
            <span
                className="relative size-3.5 rounded-[2px]"
                style={{ background: face }}
            >
                {mark && (
                    <span className="absolute inset-[3px] rounded-full border border-dashed border-stamp-ink/70" />
                )}
            </span>
            {label}
        </span>
    );
}
