import { router } from '@inertiajs/react';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { mood as moodRoute } from '@/routes/spaces';
import type { Moods } from '@/types/space';

/**
 * Today's mood as a small stamp: pick yours, see your partner's.
 * แสตมป์อารมณ์วันนี้: เลือกของเรา เห็นของอีกฝ่าย
 */
export function MoodStamps({
    moods,
    spaceId,
    partnerName,
    readOnly,
}: {
    moods: Moods;
    spaceId: string;
    partnerName: string;
    readOnly: boolean;
}) {
    const { t } = useT();
    const set = (key: string) =>
        router.put(
            moodRoute.url(spaceId),
            { mood: moods.mine === key ? null : key },
            { preserveScroll: true, only: ['moods'] },
        );

    return (
        <section className="flex flex-col gap-3" aria-labelledby="mood-title">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id="mood-title" className="text-lg leading-tight text-ink">
                    {t('mood.title')}
                </h2>
                <p className="text-sm text-ink-soft">
                    {moods.partner ? (
                        <>
                            {t('mood.partner', { name: partnerName })}{' '}
                            <Asset
                                name={`moods.${moods.partner}`}
                                className="animate-thunk size-5 align-[-4px] text-stamp"
                            />{' '}
                            {t(`mood.${moods.partner}`)}
                        </>
                    ) : (
                        t('mood.partner_none', { name: partnerName })
                    )}
                </p>
            </div>
            <div
                role="radiogroup"
                aria-labelledby="mood-title"
                className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
            >
                {Object.keys(moods.options).map((key) => {
                    const on = moods.mine === key;
                    const face = on ? 'var(--stamp-soft)' : 'var(--paper)';

                    return (
                        <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            disabled={readOnly}
                            onClick={() => set(key)}
                            className={cn(
                                'press perforated shrink-0 disabled:opacity-50',
                                on
                                    ? '-rotate-3'
                                    : 'opacity-85 hover:opacity-100',
                            )}
                            style={{
                                ['--stamp-face' as string]: face,
                                ['--hole' as string]: '1.5px',
                                ['--gap' as string]: '5px',
                                padding: '3px',
                            }}
                        >
                            {/* solid face inside the perforated edge / หน้าแสตมป์ */}
                            <span
                                className="flex w-16 flex-col items-center gap-0.5 px-1 pt-1.5 pb-1"
                                style={{ background: face }}
                            >
                                <Asset
                                    name={`moods.${key}`}
                                    className={cn(
                                        'size-7',
                                        on
                                            ? 'animate-thunk text-stamp'
                                            : 'text-ink',
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-[11px]',
                                        on
                                            ? 'font-medium text-stamp'
                                            : 'text-ink-soft',
                                    )}
                                >
                                    {t(`mood.${key}`)}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
