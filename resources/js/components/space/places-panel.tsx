import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Asset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/push';
import { cn } from '@/lib/utils';
import { history as historyRoute } from '@/routes/location';
import { destroy, here, store, update } from '@/routes/spaces/places';
import type { LocationInfo, Place, PlaceKind, PlacesData } from '@/types/space';

export const PLACE_KINDS: PlaceKind[] = [
    'met',
    'first_date',
    'home',
    'trip',
    'food',
    'other',
];

type Props = {
    data: PlacesData;
    spaceId: string;
    location: LocationInfo | null;
    readOnly: boolean;
};

/**
 * Our places: where we met, our first date, home, trips… grouped by kind, each with how many
 * postcards and dates are linked to it. Below: "Cities we've been", only for members who
 * chose to keep a city history. No map, nothing loads from outside.
 * สถานที่ของเรา จัดกลุ่มตามประเภท และ "เมืองที่เราเคยไป" เฉพาะคนที่เลือกเปิดเก็บประวัติเมือง
 */
export function PlacesPanel({ data, spaceId, location, readOnly }: Props) {
    const { t, locale } = useT();
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const [open, setOpen] = useState<number | null>(null);
    const loc = locale === 'th' ? 'th-TH' : 'en-GB';
    const day = (d: string) =>
        new Date(d + 'T00:00:00').toLocaleDateString(loc, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    const groups = PLACE_KINDS.map((k) => ({
        kind: k,
        items: data.items.filter((p) => p.kind === k),
    })).filter((g) => g.items.length > 0);

    return (
        <section className="paper flex flex-col gap-4 p-4">
            <header className="flex items-center gap-2">
                <Asset name="icons.map-pin" className="size-5 text-stamp" />
                <h3 className="flex-1 font-medium text-ink">
                    {t('places.title')}
                </h3>
                <span className="text-sm text-ink-soft">
                    {data.items.length}
                </span>
            </header>

            {data.items.length === 0 && editing !== 'new' && (
                <p className="text-sm text-ink-soft">{t('places.empty')}</p>
            )}

            {groups.map((g) => (
                <div key={g.kind} className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                        {t(`places.kind.${g.kind}`)}
                    </h4>
                    <ul className="flex flex-col gap-1.5">
                        {g.items.map((p) =>
                            editing === p.id ? (
                                <li key={p.id}>
                                    <PlaceForm
                                        spaceId={spaceId}
                                        place={p}
                                        onDone={() => setEditing(null)}
                                    />
                                </li>
                            ) : (
                                <li
                                    key={p.id}
                                    className="rounded-[calc(var(--radius)-2px)] bg-paper-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpen(open === p.id ? null : p.id)
                                        }
                                        aria-expanded={open === p.id}
                                        className="press flex w-full items-center gap-3 p-2.5 text-left"
                                    >
                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-stamp-soft text-stamp">
                                            <Asset
                                                name={`places.${p.kind}`}
                                                className="size-5"
                                            />
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col">
                                            <span className="truncate text-ink">
                                                {p.name}
                                            </span>
                                            <span className="truncate text-xs text-ink-soft">
                                                {[
                                                    p.city,
                                                    p.date && day(p.date),
                                                    p.moments > 0 &&
                                                        t('places.postcards', {
                                                            count: p.moments,
                                                        }),
                                                    p.events > 0 &&
                                                        t('places.dates', {
                                                            count: p.events,
                                                        }),
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        </span>
                                    </button>
                                    {open === p.id && (
                                        <div className="flex flex-col gap-2 px-3 pb-3 text-sm">
                                            {p.note && (
                                                <p className="hand text-lg leading-snug whitespace-pre-line text-ink">
                                                    {p.note}
                                                </p>
                                            )}
                                            {p.author && (
                                                <p className="text-xs text-ink-soft">
                                                    {t('places.added_by', {
                                                        name: p.author,
                                                    })}
                                                </p>
                                            )}
                                            {!readOnly && (
                                                <div className="flex gap-3 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditing(p.id)
                                                        }
                                                        className="press text-airmail underline underline-offset-4"
                                                    >
                                                        {t('places.edit')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            window.confirm(
                                                                t(
                                                                    'places.delete_confirm',
                                                                ),
                                                            ) &&
                                                            router.delete(
                                                                destroy.url({
                                                                    space: spaceId,
                                                                    place: p.id,
                                                                }),
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        className="press text-ink-soft underline underline-offset-4 hover:text-wax"
                                                    >
                                                        {t('places.delete')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ),
                        )}
                    </ul>
                </div>
            ))}

            {!readOnly &&
                (editing === 'new' ? (
                    <PlaceForm
                        spaceId={spaceId}
                        onDone={() => setEditing(null)}
                    />
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="self-start"
                        onClick={() => setEditing('new')}
                    >
                        <Asset name="icons.plus" className="size-4" />{' '}
                        {t('places.add')}
                    </Button>
                ))}

            {location && (
                <CityHistory
                    visits={data.visits}
                    location={location}
                    readOnly={readOnly}
                    day={day}
                />
            )}
        </section>
    );
}

function CityHistory({
    visits,
    location,
    readOnly,
    day,
}: {
    visits: PlacesData['visits'];
    location: LocationInfo;
    readOnly: boolean;
    day: (d: string) => string;
}) {
    const { t } = useT();
    const toggle = (on: boolean) =>
        router.put(historyRoute.url(), { on }, { preserveScroll: true });

    return (
        <div className="flex flex-col gap-2 border-t border-dashed border-rule-strong pt-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-ink">
                <Asset name="icons.globe" className="size-4 text-airmail" />
                {t('places.cities_title')}
            </h4>

            {visits.length > 0 && (
                <ol className="flex flex-col gap-1 text-sm">
                    {visits.map((v) => (
                        <li key={v.id} className="flex items-baseline gap-2">
                            <span
                                className={cn(
                                    'size-2 shrink-0 rounded-full',
                                    v.mine ? 'bg-stamp' : 'bg-airmail',
                                )}
                            />
                            <span className="text-ink">{v.city}</span>
                            <span className="text-xs text-ink-soft">
                                {v.who} · {day(v.from)}
                                {v.to
                                    ? ` – ${day(v.to)}`
                                    : ` · ${t('places.still_there')}`}
                            </span>
                        </li>
                    ))}
                </ol>
            )}

            {!readOnly &&
                (location.me_keeps_history ? (
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                        {t('places.history_on')}
                        <button
                            type="button"
                            onClick={() =>
                                window.confirm(
                                    t('places.history_off_confirm'),
                                ) && toggle(false)
                            }
                            className="press underline underline-offset-4 hover:text-wax"
                        >
                            {t('places.history_stop')}
                        </button>
                    </p>
                ) : location.me_sharing ? (
                    <div className="flex flex-col gap-2 text-xs text-ink-soft">
                        <p>{t('places.history_ask')}</p>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="self-start"
                            onClick={() => toggle(true)}
                        >
                            {t('places.history_start')}
                        </Button>
                    </div>
                ) : (
                    <p className="text-xs text-ink-soft">
                        {t('places.history_needs_location')}
                    </p>
                ))}
        </div>
    );
}

function PlaceForm({
    spaceId,
    place,
    onDone,
}: {
    spaceId: string;
    place?: Place;
    onDone: () => void;
}) {
    const { t } = useT();
    const [finding, setFinding] = useState(false);
    const [findError, setFindError] = useState(false);
    const form = useForm({
        name: place?.name ?? '',
        kind: (place?.kind ?? 'met') as PlaceKind,
        city: place?.city ?? '',
        note: place?.note ?? '',
        date: place?.date ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onDone };
        form.transform((d) => ({
            ...d,
            city: d.city || null,
            note: d.note || null,
            date: d.date || null,
        }));
        if (place) {
            form.patch(update.url({ space: spaceId, place: place.id }), opts);
        } else {
            form.post(store.url(spaceId), opts);
        }
    };

    // One-time "where am I": the server returns a city name and keeps nothing.
    // ใช้ตำแหน่งตอนนี้ครั้งเดียว เซิร์ฟเวอร์ส่งชื่อเมืองกลับ ไม่บันทึกอะไร
    const findCity = () => {
        if (!('geolocation' in navigator)) return setFindError(true);
        setFinding(true);
        setFindError(false);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const res = await api(here.url(spaceId), 'POST', {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                const city = res.ok ? (await res.json()).city : null;
                if (city) form.setData('city', city);
                else setFindError(true);
                setFinding(false);
            },
            () => {
                setFinding(false);
                setFindError(true);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
        );
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-3 rounded-[var(--radius)] bg-paper p-4 shadow-paper"
        >
            <div className="flex flex-wrap gap-1">
                {PLACE_KINDS.map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => form.setData('kind', k)}
                        aria-pressed={form.data.kind === k}
                        className={cn(
                            'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs',
                            form.data.kind === k
                                ? 'border-ink bg-ink text-paper'
                                : 'border-border bg-background',
                        )}
                    >
                        <Asset name={`places.${k}`} className="size-3.5" />
                        {t(`places.kind.${k}`)}
                    </button>
                ))}
            </div>
            <Input
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                maxLength={80}
                required
                placeholder={t('places.name_placeholder')}
                aria-label={t('places.name')}
            />
            <InputError message={form.errors.name} />
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    value={form.data.city}
                    onChange={(e) => form.setData('city', e.target.value)}
                    maxLength={100}
                    placeholder={t('places.city')}
                    aria-label={t('places.city')}
                    className="min-w-0 flex-1"
                />
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={findCity}
                    disabled={finding}
                >
                    <Asset name="icons.map-pin" className="size-4" />
                    {finding ? t('places.finding') : t('places.here')}
                </Button>
            </div>
            {findError && (
                <p className="text-xs text-ink-soft">
                    {t('places.here_failed')}
                </p>
            )}
            <Input
                type="date"
                value={form.data.date}
                onChange={(e) => form.setData('date', e.target.value)}
                aria-label={t('places.date')}
                className="w-auto"
            />
            <textarea
                value={form.data.note}
                onChange={(e) => form.setData('note', e.target.value)}
                maxLength={300}
                rows={2}
                placeholder={t('places.note')}
                aria-label={t('places.note')}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
            <InputError
                message={
                    form.errors.city || form.errors.note || form.errors.date
                }
            />
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
