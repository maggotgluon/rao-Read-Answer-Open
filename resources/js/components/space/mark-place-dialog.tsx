import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Asset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { place as placeRoute } from '@/routes/spaces/moments';
import type { MomentItem, Place, PlaceKind } from '@/types/space';
import { PLACE_KINDS } from './places-panel';

type Props = { moment: MomentItem; spaceId: string; options: Place[] };

/** "Where was this?": link a postcard to one of our places, a new one, or none. / ผูกกับสถานที่ */
export function MarkPlaceDialog({ moment, spaceId, options }: Props) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const form = useForm({
        mode: (options.length ? 'existing' : 'new') as
            | 'existing'
            | 'new'
            | 'none',
        place_id: moment.place?.id ?? options[0]?.id ?? null,
        name: '',
        kind: 'other' as PlaceKind,
    });

    const save = (mode?: 'none') => {
        form.transform((d) => ({ ...d, mode: mode ?? d.mode }));
        form.put(placeRoute.url({ space: spaceId, moment: moment.id }), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                    <Asset name="icons.map-pin" className="size-3.5" />{' '}
                    {moment.place ? t('places.change') : t('places.mark')}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('places.mark')}</DialogTitle>
                    <DialogDescription>
                        {t('places.mark_help')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-1">
                    {(['existing', 'new'] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            disabled={m === 'existing' && !options.length}
                            onClick={() => form.setData('mode', m)}
                            className={cn(
                                'rounded-full border px-3 py-1 text-sm disabled:opacity-40',
                                form.data.mode === m
                                    ? 'border-ink bg-ink text-paper'
                                    : 'border-border',
                            )}
                        >
                            {t(`places.mode_${m}`)}
                        </button>
                    ))}
                </div>

                {form.data.mode === 'existing' ? (
                    <select
                        value={form.data.place_id ?? ''}
                        onChange={(e) =>
                            form.setData('place_id', Number(e.target.value))
                        }
                        aria-label={t('places.title')}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        {options.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                                {o.city ? ` · ${o.city}` : ''}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="grid gap-3">
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
                                            : 'border-border',
                                    )}
                                >
                                    <Asset
                                        name={`places.${k}`}
                                        className="size-3.5"
                                    />
                                    {t(`places.kind.${k}`)}
                                </button>
                            ))}
                        </div>
                        <Input
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder={t('places.name_placeholder')}
                            maxLength={80}
                            aria-label={t('places.name')}
                        />
                    </div>
                )}
                <InputError
                    message={form.errors.name || form.errors.place_id}
                />

                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => save()} disabled={form.processing}>
                        {t('event.save')}
                    </Button>
                    {moment.place && (
                        <Button
                            variant="ghost"
                            onClick={() => save('none')}
                            disabled={form.processing}
                        >
                            {t('places.unmark')}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
