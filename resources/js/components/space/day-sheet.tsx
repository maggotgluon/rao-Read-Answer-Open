import { Link } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useT } from '@/lib/i18n';
import { daily } from '@/routes/spaces';
import type { DayDetail } from '@/types/space';
import { EventLabel } from './events-panel';
import { Memories } from './memories';

type Props = {
    date: string | null;
    day: DayDetail | null | undefined;
    spaceId: string;
    partnerName: string;
    onClose: () => void;
};

export function DaySheet({ date, day, spaceId, partnerName, onClose }: Props) {
    const { t, locale } = useT();
    const loading = !!date && day?.date !== date;
    const p = day?.prompt;

    return (
        <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {date &&
                            new Date(date + 'T00:00:00').toLocaleDateString(
                                locale === 'th' ? 'th-TH' : 'en-GB',
                                {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                },
                            )}
                    </DialogTitle>
                </DialogHeader>

                {loading || !day ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> {t('day.loading')}
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {day.events.length > 0 && (
                            <ul className="grid gap-1">
                                {day.events.map((e, i) => (
                                    <li key={i}>
                                        <EventLabel event={e} />
                                    </li>
                                ))}
                            </ul>
                        )}

                        {p ? (
                            <section className="flex flex-col gap-2">
                                <p className="font-medium">{p.text}</p>
                                <div className="grid gap-2 text-sm">
                                    <Answer
                                        label={t('today.you')}
                                        body={p.mine?.body}
                                        empty={t('day.you_didnt')}
                                    />
                                    {p.partner ? (
                                        <Answer
                                            label={partnerName}
                                            body={p.partner.body}
                                        />
                                    ) : p.partner_answered ? (
                                        <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-muted-foreground">
                                            <Lock className="mt-0.5 size-3.5 shrink-0" />
                                            {p.open
                                                ? t('today.partner_waiting', {
                                                      name: partnerName,
                                                  })
                                                : t('day.hidden', {
                                                      name: partnerName,
                                                  })}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {t('day.partner_didnt', {
                                                name: partnerName,
                                            })}
                                        </p>
                                    )}
                                </div>
                                {p.open && !p.mine && (
                                    <Button
                                        asChild
                                        size="sm"
                                        className="self-start"
                                    >
                                        <Link href={daily.url(spaceId)}>
                                            {t('day.open_daily')}
                                        </Link>
                                    </Button>
                                )}
                            </section>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('day.no_prompt')}
                            </p>
                        )}

                        {day.bonus && (
                            <section className="flex flex-col gap-1 rounded-xl bg-primary/10 p-3 text-sm">
                                <span className="text-xs font-medium text-primary">
                                    ✨ {t('today.bonus')}
                                </span>
                                <p className="font-medium">{day.bonus.text}</p>
                                {day.bonus.mine && (
                                    <p className="whitespace-pre-line">
                                        {t('today.you')}: {day.bonus.mine.body}
                                    </p>
                                )}
                                {day.bonus.partner && (
                                    <p className="whitespace-pre-line">
                                        {partnerName}: {day.bonus.partner.body}
                                    </p>
                                )}
                            </section>
                        )}

                        <Memories memories={day.memories ?? []} />

                        {day.moments.length > 0 && (
                            <section className="flex flex-col gap-2">
                                <h3 className="text-sm font-medium">
                                    {t('day.moments')}
                                </h3>
                                {day.moments.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex flex-col gap-1 rounded-xl border border-border p-3 text-sm"
                                    >
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {m.author}
                                        </span>
                                        {m.photos.length > 0 && (
                                            <div className="grid grid-cols-4 gap-1">
                                                {m.photos.map((src) => (
                                                    <img
                                                        key={src}
                                                        src={src}
                                                        alt=""
                                                        loading="lazy"
                                                        className="aspect-square rounded-lg object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {m.body && (
                                            <p className="whitespace-pre-line">
                                                {m.body}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Answer({
    label,
    body,
    empty,
}: {
    label: string;
    body?: string;
    empty?: string;
}) {
    return (
        <div className="rounded-xl bg-primary/5 p-3">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <p className="whitespace-pre-line">
                {body ?? <span className="text-muted-foreground">{empty}</span>}
            </p>
        </div>
    );
}
