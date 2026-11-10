import { useForm } from '@inertiajs/react';
import { CalendarHeart } from '@/components/rao/ui-icons';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import { date as dateRoute } from '@/routes/spaces/moments';
import type { MomentItem, SpaceEvent } from '@/types/space';

type Props = { moment: MomentItem; spaceId: string; options: SpaceEvent[] };

/** "Mark as our date": attach to an existing date, make a new one, or unlink. / ผูกกับวันสำคัญ */
export function MarkDateDialog({ moment, spaceId, options }: Props) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const momentDay = (moment.posted_at ?? new Date().toISOString()).slice(
        0,
        10,
    );
    const form = useForm({
        mode: (options.length ? 'existing' : 'new') as
            | 'existing'
            | 'new'
            | 'none',
        event_id: moment.date?.id ?? options[0]?.id ?? null,
        title: '',
        date: momentDay,
        kind: 'special' as 'special' | 'other',
        repeats_yearly: true,
    });

    const save = (mode?: 'none') => {
        if (mode) form.setData('mode', mode);
        form.transform((d) => ({ ...d, mode: mode ?? d.mode }));
        form.put(dateRoute.url({ space: spaceId, moment: moment.id }), {
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
                    <CalendarHeart className="size-3.5" />{' '}
                    {moment.date
                        ? t('moment.change_date')
                        : t('moment.mark_date')}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('moment.mark_date')}</DialogTitle>
                    <DialogDescription>
                        {t('moment.mark_date_help')}
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
                            {t(`moment.date_${m}`)}
                        </button>
                    ))}
                </div>

                {form.data.mode === 'existing' ? (
                    <select
                        value={form.data.event_id ?? ''}
                        onChange={(e) =>
                            form.setData('event_id', Number(e.target.value))
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        {options.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.title} · {o.date.slice(5)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="grid gap-3">
                        <Input
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder={t('event.title_placeholder')}
                            maxLength={80}
                            aria-label={t('event.title')}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                            <Input
                                type="date"
                                value={form.data.date}
                                onChange={(e) =>
                                    form.setData('date', e.target.value)
                                }
                                className="w-auto"
                                aria-label={t('event.date')}
                            />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.repeats_yearly}
                                    onChange={(e) =>
                                        form.setData(
                                            'repeats_yearly',
                                            e.target.checked,
                                        )
                                    }
                                />
                                {t('event.repeats')}
                            </label>
                        </div>
                    </div>
                )}
                <InputError
                    message={
                        form.errors.title ||
                        form.errors.date ||
                        form.errors.event_id
                    }
                />

                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => save()} disabled={form.processing}>
                        {t('event.save')}
                    </Button>
                    {moment.date && (
                        <Button
                            variant="ghost"
                            onClick={() => save('none')}
                            disabled={form.processing}
                        >
                            {t('moment.unmark_date')}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
