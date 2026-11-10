import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from '@/components/rao/ui-icons';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { Fold } from '@/components/rao/fold';
import { Asset } from '@/components/rao/asset';
import { LettersIcon, PostmarkIcon } from '@/components/rao/icons';
import { cn } from '@/lib/utils';
import { destroy, store, update } from '@/routes/spaces/events';
import type { EventOccurrence, SpaceEvent } from '@/types/space';

export function EventLabel({
    event,
    showWhen,
}: {
    event: EventOccurrence;
    showWhen?: boolean;
}) {
    const { t, locale } = useT();
    const when =
        event.in_days === 0
            ? t('event.today')
            : event.in_days === 1
              ? t('event.tomorrow')
              : t('event.in_days', { count: event.in_days ?? 0 });

    return (
        <span className="flex items-center gap-2">
            <Asset name={event.icon} className="size-5 shrink-0 text-airmail" />
            <span className="flex-1">
                {event.title}
                {(event.memories ?? 0) > 0 && (
                    <LettersIcon className="ml-1 inline size-3.5 text-kraft" />
                )}
                {event.years > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                        ·{' '}
                        {t(
                            event.kind === 'birthday'
                                ? 'event.turns'
                                : 'event.years',
                            {
                                count: event.years,
                            },
                        )}
                    </span>
                )}
            </span>
            {showWhen && (
                <span
                    className={cn(
                        'text-xs',
                        event.in_days === 0
                            ? 'font-medium text-stamp'
                            : 'text-ink-soft',
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
    const { t, locale } = useT();
    const loc = locale === 'th' ? 'th-TH' : 'en-GB';

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-2xl text-ink">{t('event.upcoming')}</h2>
            {upcoming.length === 0 ? (
                <p className="text-sm text-ink-soft">{t('event.none')}</p>
            ) : (
                <ul className="flex flex-col">
                    {upcoming.map((e, i) => {
                        const d = new Date(e.date + 'T00:00:00');
                        const soon = e.in_days === 0;

                        return (
                            <li
                                key={`${e.event_id}-${e.date}-${i}`}
                                className="flex items-center gap-4 border-b border-dashed border-rule py-3 last:border-0"
                            >
                                {/* postmark with the date / ตราประทับวันที่ */}
                                <span
                                    className={cn(
                                        'grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed text-center leading-none',
                                        soon
                                            ? 'border-stamp text-stamp'
                                            : 'border-postmark/70 text-ink',
                                    )}
                                >
                                    <span>
                                        <span className="hand block text-xl">
                                            {d.getDate()}
                                        </span>
                                        <span className="block text-[10px] text-ink-soft">
                                            {d.toLocaleDateString(loc, {
                                                month: 'short',
                                            })}
                                        </span>
                                    </span>
                                </span>
                                <span className="flex flex-1 flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-ink">
                                        <Asset
                                            name={e.icon}
                                            className="size-5 shrink-0 text-airmail"
                                        />
                                        {e.title}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-sm',
                                            soon
                                                ? 'font-medium text-stamp'
                                                : 'text-ink-soft',
                                        )}
                                    >
                                        {e.in_days === 0
                                            ? t('event.today')
                                            : e.in_days === 1
                                              ? t('event.tomorrow')
                                              : t('event.in_days', {
                                                    count: e.in_days ?? 0,
                                                })}
                                        {e.years > 0 && (
                                            <>
                                                {' '}
                                                ·{' '}
                                                {t(
                                                    e.kind === 'birthday'
                                                        ? 'event.turns'
                                                        : 'event.years',
                                                    { count: e.years },
                                                )}
                                            </>
                                        )}
                                    </span>
                                </span>
                                {(e.memories ?? 0) > 0 && (
                                    <LettersIcon
                                        className="size-5 text-kraft"
                                        aria-label={t('memories.title')}
                                    />
                                )}
                            </li>
                        );
                    })}
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
        <Fold
            title={t('event.manage')}
            count={events.length}
            icon={<PostmarkIcon className="size-5" />}
        >
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
                                event={{
                                    ...e,
                                    event_id: e.id,
                                    years: 0,
                                    icon: `dates.${e.kind}`,
                                }}
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
                            {e.moments > 0 && (
                                <span className="text-xs text-stamp">
                                    {t('event.moments_count', {
                                        count: e.moments,
                                    })}
                                </span>
                            )}
                            {!readOnly && e.kind !== 'anniversary' && (
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
        </Fold>
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
        kind: event?.kind === 'other' ? 'other' : 'special',
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
            className="grid gap-3 rounded-[var(--radius)] bg-paper p-4 shadow-paper"
        >
            <div className="flex gap-1">
                {(['special', 'other'] as const).map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => form.setData('kind', k)}
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs',
                            form.data.kind === k
                                ? 'border-ink bg-ink text-paper'
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
