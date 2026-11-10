import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AirmailIcon } from '@/components/rao/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { maybeUpdateLocation, timeIn } from '@/lib/location';
import { cn } from '@/lib/utils';
import { toggle } from '@/routes/location';
import { longDistance } from '@/routes/spaces';
import type { LocationInfo, SpaceDetail } from '@/types/space';

type Props = {
    space: SpaceDetail;
    location: LocationInfo;
    readOnly: boolean;
    compact?: boolean;
};

const DISMISS = (id: string) => `rao.ld.dismissed.${id}`;

/**
 * How far apart we are + partner's city and local time, location sharing, long-distance mode.
 * ระยะห่าง + เมืองและเวลาของอีกฝ่าย, การแชร์ตำแหน่ง, โหมดไกลกัน
 */
export function DistanceCard({ space, location, readOnly, compact }: Props) {
    const { t, locale } = useT();
    const partner = space.partner?.name ?? '';
    const [now, setNow] = useState(() => Date.now());
    const [dismissed, setDismissed] = useState(
        () =>
            typeof window !== 'undefined' &&
            localStorage.getItem(DISMISS(space.id)) === '1',
    );

    // Keep the partner's clock ticking. / ให้นาฬิกาของอีกฝ่ายเดิน
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(id);
    }, []);

    const share = (on: boolean) =>
        router.put(
            toggle.url(),
            { on },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (on)
                        void maybeUpdateLocation(true).then(() =>
                            router.reload({ only: ['location'] }),
                        );
                },
            },
        );

    const setLd = (on: boolean) =>
        router.put(
            longDistance.url(space.id),
            { on },
            { preserveScroll: true },
        );

    if (!space.partner) return null;

    const hasDistance = location.km !== null;
    const near = hasDistance && (location.km ?? 0) < 10;
    void now;

    return (
        <section className={cn('flex flex-col gap-3', !compact && 'paper p-4')}>
            <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-airmail/60 text-airmail">
                    <AirmailIcon className="size-5" />
                </span>
                <div className="flex flex-1 flex-col">
                    {hasDistance ? (
                        <>
                            <p className="hand text-xl leading-tight text-ink">
                                {near
                                    ? t('location.near', { name: partner })
                                    : t('location.apart', {
                                          km: (
                                              location.km ?? 0
                                          ).toLocaleString(),
                                      })}
                            </p>
                            {space.long_distance && (
                                <span className="my-1 self-start rounded-full bg-airmail-soft px-2.5 py-0.5 text-xs font-medium text-airmail">
                                    {t('ld.badge')}
                                </span>
                            )}
                            <p className="text-sm text-ink-soft">
                                {[
                                    location.partner_city &&
                                        t('location.partner_in', {
                                            name: partner,
                                            city: location.partner_city,
                                        }),
                                    location.partner_tz &&
                                        t('location.partner_time', {
                                            time: timeIn(
                                                location.partner_tz,
                                                locale,
                                            ),
                                        }),
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-ink-soft">
                            {!location.me_sharing
                                ? t('location.ask')
                                : !location.partner_sharing
                                  ? t('location.waiting_partner', {
                                        name: partner,
                                    })
                                  : t('location.waiting_fix')}
                        </p>
                    )}
                </div>
            </div>

            {location.suggest_long_distance && !dismissed && !readOnly && (
                <div className="animate-arrive flex flex-col gap-2 rounded-[calc(var(--radius)-2px)] bg-airmail-soft p-3 text-sm text-ink">
                    <p>
                        {t('ld.suggest', {
                            km: (location.km ?? 0).toLocaleString(),
                        })}
                    </p>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setLd(true)}>
                            {t('ld.turn_on')}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                localStorage.setItem(DISMISS(space.id), '1');
                                setDismissed(true);
                            }}
                        >
                            {t('ld.not_now')}
                        </Button>
                    </div>
                </div>
            )}

            {!compact && !readOnly && (
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant={location.me_sharing ? 'ghost' : 'default'}
                        onClick={() => share(!location.me_sharing)}
                    >
                        {location.me_sharing
                            ? t('location.stop')
                            : t('location.start')}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLd(!space.long_distance)}
                    >
                        {space.long_distance
                            ? t('ld.turn_off')
                            : t('ld.turn_on')}
                    </Button>
                </div>
            )}
            {!compact && (
                <p className="text-xs text-ink-soft">{t('location.privacy')}</p>
            )}
        </section>
    );
}
