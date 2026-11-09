import { router, useForm } from '@inertiajs/react';
import { Cake, Gift, Heart, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { destroy, store, update } from '@/routes/spaces/events';
import type { EventOccurrence, SpaceEvent } from '@/types/space';

const ICON = {
    birthday: Cake,
    special: Star,
    other: Gift,
    anniversary: Heart,
} as const;

export function EventLabel({
    event,
    showWhen,
}: {
    event: EventOccurrence;
    showWhen?: boolean;
}) {
    const { t, locale } = useT();
    const Icon = ICON[event.kind];
    const when =
        event.in_days === 0
            ? t('event.today')
            : event.in_days === 1
              ? t('event.tomorrow')
              : t('event.in_days', { count: event.in_days ?? 0 });

    return (
        <span className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-amber-500" />
            <span className="flex-1">
                {event.title}
                {event.years > 0 &&
                    (event.kind === 'anniversary' ||
                        event.kind === 'special') && (
                        <span className="ml-1 text-xs text-muted-foreground">
                            · {t('event.years', { count: event.years })}
                        </span>
                    )}
            </span>
            {showWhen && (
                <span
                    className={cn(
                        'text-xs',
                        event.in_days === 0
                            ? 'font-medium text-primary'
                            : 'text-muted-foreground',
                    )}
                >
                    {new Date(event.date + 'T00:00:00').toLocaleDateString(
                        locale === 'th' ? 'th-TH' : 'en-GB',
                        { day: 'numeric', month: 'short' },
                    )}
                    {' · '}
                    {when}
                </span>
            )}
        </span>
    );
}

export function UpcomingEvents({ upcoming }: { upcoming: EventOccurrence[] }) {
    const { t } = useT();

    return (
        <section className="flex flex-col gap-2 rounded-2xl border border-border p-4">
            <h2 className="font-medium">{t('event.upcoming')}</h2>
            {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('event.none')}
                </p>
            ) : (
                <ul className="grid gap-2 text-sm">
                    {upcoming.map((e, i) => (
                        <li key={`${e.event_id}-${e.date}-${i}`}>
                            <EventLabel event={e} showWhen />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

type Draft = {
    title: string;
    date: string;
    kind: SpaceEvent['kind'];
    repeats_yearly: boolean;
};

export function ManageEvents({
    spaceId,
    events,
    readOnly,
}: {
    spaceId: string;
    events: SpaceEvent[];
    readOnly: boolean;
}) {
    const { t, locale } = useT();
    const [editing, setEditing] = useState<number | 'new' | null>(null);

    return (
        <details className="rounded-2xl border border-border p-4 open:[&>*+*]:mt-3">
            <summary className="cursor-pointer list-none font-medium">
                {t('event.manage')}{' '}
                <span className="text-sm text-muted-foreground">
                    ({events.length})
                </span>
            </summary>
            <ul className="grid gap-2 text-sm">
                {events.map((e) =>
                    editing === e.id ? (
                        <li key={e.id}>
                            <EventForm
                                spaceId={spaceId}
                                event={e}
                                onDone={() => setEditing(null)}
                            />
                        </li>
                    ) : (
                        <li key={e.id} className="flex items-center gap-2">
                            <EventLabel
                                event={{ ...e, event_id: e.id, years: 0 }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {new Date(
                                    e.date + 'T00:00:00',
                                ).toLocaleDateString(
                                    locale === 'th' ? 'th-TH' : 'en-GB',
                                    {
                                        day: 'numeric',
                                        month: 'short',
                                        ...(e.repeats_yearly
                                            ? {}
                                            : { year: 'numeric' }),
                                    },
                                )}
                                {e.repeats_yearly && ' ↻'}
                            </span>
                            {!readOnly && (
                                <>
                                    <button
                                        type="button"
                                        aria-label={t('event.edit')}
                                        onClick={() => setEditing(e.id)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Pencil className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={t('event.delete')}
                                        onClick={() =>
                                            router.delete(
                                                destroy.url({
                                                    space: spaceId,
                                                    event: e.id,
                                                }),
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </>
                            )}
                        </li>
                    ),
                )}
            </ul>
            {!readOnly &&
                (editing === 'new' ? (
                    <EventForm
                        spaceId={spaceId}
                        onDone={() => setEditing(null)}
                    />
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing('new')}
                    >
                        <Plus /> {t('event.add')}
                    </Button>
                ))}
        </details>
    );
}

function EventForm({
    spaceId,
    event,
    onDone,
}: {
    spaceId: string;
    event?: SpaceEvent;
    onDone: () => void;
}) {
    const { t } = useT();
    const form = useForm<Draft>({
        title: event?.title ?? '',
        date: event?.date ?? '',
        kind: event?.kind ?? 'birthday',
        repeats_yearly: event?.repeats_yearly ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onDone };
        if (event) {
            form.patch(update.url({ space: spaceId, event: event.id }), opts);
        } else {
            form.post(store.url(spaceId), opts);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-3 rounded-xl bg-muted/50 p-3"
        >
            <div className="flex gap-1">
                {(['birthday', 'special', 'other'] as const).map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => form.setData('kind', k)}
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs',
                            form.data.kind === k
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background',
                        )}
                    >
                        {t(`event.kind.${k}`)}
                    </button>
                ))}
            </div>
            <Input
                value={form.data.title}
                onChange={(e) => form.setData('title', e.target.value)}
                maxLength={80}
                required
                placeholder={t('event.title_placeholder')}
                aria-label={t('event.title')}
            />
            <InputError message={form.errors.title} />
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    type="date"
                    value={form.data.date}
                    onChange={(e) => form.setData('date', e.target.value)}
                    required
                    aria-label={t('event.date')}
                    className="w-auto"
                />
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.data.repeats_yearly}
                        onChange={(e) =>
                            form.setData('repeats_yearly', e.target.checked)
                        }
                    />
                    {t('event.repeats')}
                </label>
            </div>
            <InputError message={form.errors.date} />
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {t('event.save')}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onDone}
                >
                    {t('event.cancel')}
                </Button>
            </div>
        </form>
    );
}
