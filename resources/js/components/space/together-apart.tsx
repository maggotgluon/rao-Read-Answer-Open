import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { forget } from '@/routes/spaces/distance';
import type { CalendarMonth, SpaceStory } from '@/types/space';

type Props = {
    story: SpaceStory;
    calendar: CalendarMonth;
    spaceId: string;
    readOnly: boolean;
};

/**
 * Together & apart: how long you've been near or far, every period since we started keeping
 * track, and how far apart you were each day of the month shown in the calendar.
 * อยู่ใกล้ & ไกลกัน: ช่วงเวลาที่อยู่ใกล้หรือไกล และระยะห่างรายวันของเดือนที่เปิดดู
 */
export function TogetherApart({ story, calendar, spaceId, readOnly }: Props) {
    const { t, locale } = useT();
    const [all, setAll] = useState(false);
    const loc = locale === 'th' ? 'th-TH' : 'en-GB';

    if (!story.since) {
        return null;
    }

    const date = (d: string, year = false) =>
        new Date(d + 'T00:00:00').toLocaleDateString(loc, {
            day: 'numeric',
            month: 'short',
            ...(year ? { year: 'numeric' } : {}),
        });
    const length = (days: number) =>
        days < 14
            ? t('story.days', { count: days })
            : days < 61
              ? t('story.weeks', { count: Math.round(days / 7) })
              : days < 730
                ? t('story.months', { count: Math.round(days / 30.4) })
                : t('story.years', {
                      count: Math.round((days / 365.25) * 10) / 10,
                  });

    const [now, ...past] = story.periods;
    const shown = all ? past : past.slice(0, 3);

    const km = calendar.days.map((d) => d.km);
    const values = km.filter((v): v is number => v !== null);
    const max = Math.max(...values, 1);
    const avg = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : null;

    const forgetAll = () => {
        if (window.confirm(t('story.forget_confirm'))) {
            router.delete(forget.url(spaceId), { preserveScroll: true });
        }
    };

    return (
        <section className="paper flex flex-col gap-4 p-4">
            <header className="flex items-center gap-2">
                <Asset name="icons.airmail" className="size-5 text-airmail" />
                <h3 className="font-medium text-ink">{t('story.title')}</h3>
            </header>

            {now && (
                <p className="text-lg leading-snug text-ink">
                    {t(`story.now_${now.mode}`, {
                        date: date(now.from, true),
                        length: length(now.days),
                    })}
                </p>
            )}

            <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-stamp-soft px-3 py-1 text-ink">
                    {t('story.total_together', {
                        length: length(story.together_days),
                    })}
                </span>
                <span className="rounded-full bg-airmail-soft px-3 py-1 text-ink">
                    {t('story.total_apart', {
                        length: length(story.apart_days),
                    })}
                </span>
            </div>

            {past.length > 0 && (
                <ol className="flex flex-col gap-1.5 border-l-2 border-dashed border-rule-strong pl-3 text-sm">
                    {shown.map((p) => (
                        <li key={p.from} className="flex items-center gap-2">
                            <span
                                className={cn(
                                    '-ml-[1.05rem] size-2.5 shrink-0 rounded-full',
                                    p.mode === 'apart'
                                        ? 'bg-airmail'
                                        : 'bg-stamp',
                                )}
                            />
                            <span className="text-ink">
                                {t(`story.mode_${p.mode}`)}
                            </span>
                            <span className="text-ink-soft">
                                {date(p.from)} – {p.to && date(p.to, true)} ·{' '}
                                {length(p.days)}
                            </span>
                        </li>
                    ))}
                    {past.length > 3 && (
                        <li>
                            <button
                                type="button"
                                onClick={() => setAll(!all)}
                                className="press text-airmail underline underline-offset-4"
                            >
                                {all ? t('story.less') : t('story.more')}
                            </button>
                        </li>
                    )}
                </ol>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-ink">
                        {t('story.distance_title')}
                    </span>
                    {avg !== null && (
                        <span className="text-xs text-ink-soft">
                            {t('story.distance_avg', { km: avg, max })}
                        </span>
                    )}
                </div>
                {values.length > 0 ? (
                    <div
                        className="flex h-16 items-end gap-[2px]"
                        role="img"
                        aria-label={t('story.distance_avg', {
                            km: avg ?? 0,
                            max,
                        })}
                    >
                        {calendar.days.map((d) => (
                            <span
                                key={d.date}
                                title={
                                    d.km === null
                                        ? date(d.date)
                                        : `${date(d.date)} · ${t('location.apart', { km: d.km })}`
                                }
                                className={cn(
                                    'flex-1 rounded-t-[2px]',
                                    d.km === null
                                        ? 'h-px bg-rule'
                                        : 'min-h-[3px] bg-airmail/70',
                                )}
                                style={
                                    d.km === null
                                        ? undefined
                                        : {
                                              height: `${Math.max(5, (d.km / max) * 100)}%`,
                                          }
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-ink-soft">
                        {t('story.distance_none')}
                    </p>
                )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
                <span>
                    {t('story.since', { date: date(story.since, true) })}
                </span>
                {!readOnly && story.has_distance && (
                    <button
                        type="button"
                        onClick={forgetAll}
                        className="press underline underline-offset-4 hover:text-stamp"
                    >
                        {t('story.forget')}
                    </button>
                )}
            </footer>
        </section>
    );
}
