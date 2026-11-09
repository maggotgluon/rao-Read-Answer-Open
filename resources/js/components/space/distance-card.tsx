import { router } from '@inertiajs/react';
import { MapPin, Plane } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { maybeUpdateLocation, timeIn } from '@/lib/location';
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
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {space.long_distance ? (
                        <Plane className="size-4" />
                    ) : (
                        <MapPin className="size-4" />
                    )}
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                    {hasDistance ? (
                        <>
                            <p className="font-medium">
                                {near
                                    ? t('location.near', { name: partner })
                                    : t('location.apart', {
                                          km: (
                                              location.km ?? 0
                                          ).toLocaleString(),
                                      })}
                            </p>
                            <p className="text-sm text-muted-foreground">
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
                        <p className="text-sm text-muted-foreground">
                            {!location.me_sharing
                                ? t('location.ask')
                                : !location.partner_sharing
                                  ? t('location.waiting_partner', {
                                        name: partner,
                                    })
                                  : t('location.waiting_fix')}
                        </p>
                    )}
                    {space.long_distance && (
                        <span className="mt-1 self-start rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            ✈️ {t('ld.badge')}
                        </span>
                    )}
                </div>
            </div>

            {location.suggest_long_distance && !dismissed && !readOnly && (
                <div className="flex flex-col gap-2 rounded-xl bg-primary/10 p-3 text-sm">
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
                <div className="flex flex-wrap gap-2 text-sm">
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
                <p className="text-xs text-muted-foreground">
                    {t('location.privacy')}
                </p>
            )}
        </section>
    );
}
