import { router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from '@/components/rao/ui-icons';
import { AdminShell, fmtDate } from '@/components/admin/admin-shell';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    destroy as destroyDay,
    store as storeDay,
    update as updateDay,
} from '@/routes/admin/days';
import { destroy, store } from '@/routes/admin/schedule';

type Scheduled = {
    id: number;
    date: string;
    audience: string;
    past: boolean;
    prompt: { id: number; key: string | null; kind: string; text: string };
    uses: number;
};
type Day = {
    id: number;
    date: string;
    title_th: string | null;
    title_en: string | null;
    emoji: string | null;
    icon: string | null;
    repeats_yearly: boolean;
    active: boolean;
};

type Props = {
    scheduled: Scheduled[];
    specialDays: Day[];
    audiences: string[];
    dateIcons: string[];
};

const field = 'h-9 rounded-md border border-input bg-background px-3 text-sm';

/** Admin calendar: prompts for dates + special days for everyone. / ปฏิทินแอดมิน */
export default function AdminSchedule({
    scheduled,
    specialDays,
    audiences,
}: Props) {
    const { t, locale } = useT();

    return (
        <AdminShell tab="schedule" title={t('admin.tab.schedule')}>
            <section className="flex flex-col gap-3">
                <h2 className="font-medium">{t('admin.schedule.prompts')}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('admin.schedule.prompts_help')}
                </p>
                <ScheduleForm audiences={audiences} />
                <ul className="paper flex flex-col divide-y divide-rule">
                    {scheduled.length === 0 && (
                        <li className="p-4 text-sm text-muted-foreground">
                            {t('admin.schedule.none')}
                        </li>
                    )}
                    {scheduled.map((s) => (
                        <li
                            key={s.id}
                            className={cn(
                                'flex items-start gap-3 p-3 text-sm',
                                s.past && 'opacity-50',
                            )}
                        >
                            <div className="flex w-32 shrink-0 flex-col gap-1">
                                <span className="font-medium">
                                    {fmtDate(s.date + 'T00:00:00', locale)}
                                </span>
                                <Badge variant="secondary">
                                    {t(`admin.audience.${s.audience}`)}
                                </Badge>
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground">
                                    {t(`today.custom.kind_${s.prompt.kind}`)} ·{' '}
                                    {s.prompt.key ?? 'admin'} ·{' '}
                                    {t('admin.uses', { count: s.uses })}
                                </span>
                                <p>{s.prompt.text}</p>
                            </div>
                            {!s.past && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label={t('event.delete')}
                                    onClick={() =>
                                        router.delete(destroy.url(s.id), {
                                            preserveScroll: true,
                                        })
                                    }
                                >
                                    <Trash2 />
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="font-medium">{t('admin.schedule.days')}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('admin.schedule.days_help')}
                </p>
                <DayForm />
                <ul className="paper flex flex-col divide-y divide-rule">
                    {specialDays.length === 0 && (
                        <li className="p-4 text-sm text-muted-foreground">
                            {t('admin.schedule.none')}
                        </li>
                    )}
                    {specialDays.map((d) => (
                        <li
                            key={d.id}
                            className={cn(
                                'flex items-center gap-3 p-3 text-sm',
                                !d.active && 'opacity-50',
                            )}
                        >
                            <span className="w-32 shrink-0">
                                {d.repeats_yearly
                                    ? new Date(
                                          d.date + 'T00:00:00',
                                      ).toLocaleDateString(
                                          locale === 'th' ? 'th-TH' : 'en-GB',
                                          { day: 'numeric', month: 'long' },
                                      ) + ' ↻'
                                    : fmtDate(d.date + 'T00:00:00', locale)}
                            </span>
                            <span className="flex-1">
                                {d.icon ? (
                                    <Asset
                                        name={`dates.${d.icon}`}
                                        className="mr-1 size-5 align-[-5px] text-airmail"
                                    />
                                ) : (
                                    d.emoji
                                )}{' '}
                                {d.title_th}{' '}
                                <span className="text-muted-foreground">
                                    · {d.title_en}
                                </span>
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    router.patch(
                                        updateDay.url(d.id),
                                        { ...d, active: !d.active },
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                {d.active
                                    ? t('admin.deactivate')
                                    : t('admin.activate')}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                aria-label={t('event.delete')}
                                onClick={() =>
                                    window.confirm(t('admin.delete_confirm')) &&
                                    router.delete(destroyDay.url(d.id), {
                                        preserveScroll: true,
                                    })
                                }
                            >
                                <Trash2 />
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>
        </AdminShell>
    );
}

function ScheduleForm({ audiences }: { audiences: string[] }) {
    const { t } = useT();
    const form = useForm({
        date: '',
        audience: 'all',
        kind: 'question',
        text_th: '',
        text_en: '',
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.post(store.url(), {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
            className="grid gap-2 rounded-[var(--radius)] border-[1.5px] border-dashed border-rule-strong bg-paper p-4"
        >
            <div className="flex flex-wrap gap-2">
                <Input
                    type="date"
                    value={form.data.date}
                    onChange={(e) => form.setData('date', e.target.value)}
                    required
                    className="w-auto"
                />
                <select
                    value={form.data.kind}
                    onChange={(e) => form.setData('kind', e.target.value)}
                    className={field}
                >
                    <option value="question">
                        {t('today.custom.kind_question')}
                    </option>
                    <option value="quest">
                        {t('today.custom.kind_quest')}
                    </option>
                </select>
                <select
                    value={form.data.audience}
                    onChange={(e) => form.setData('audience', e.target.value)}
                    className={field}
                >
                    {audiences.map((a) => (
                        <option key={a} value={a}>
                            {t(`admin.audience.${a}`)}
                        </option>
                    ))}
                </select>
            </div>
            <textarea
                value={form.data.text_th}
                onChange={(e) => form.setData('text_th', e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="ภาษาไทย"
                className="rounded-[calc(var(--radius)-2px)] border border-input bg-paper px-3 py-2 text-ink"
            />
            <textarea
                value={form.data.text_en}
                onChange={(e) => form.setData('text_en', e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="English"
                className="rounded-[calc(var(--radius)-2px)] border border-input bg-paper px-3 py-2 text-ink"
            />
            <InputError
                message={
                    form.errors.date ||
                    form.errors.text_th ||
                    form.errors.audience
                }
            />
            <Button
                type="submit"
                size="sm"
                className="self-start"
                disabled={form.processing}
            >
                {t('admin.schedule.add_prompt')}
            </Button>
        </form>
    );
}

function DayForm() {
    const { t } = useT();
    const { dateIcons } = usePage<Props>().props;
    const form = useForm({
        date: '',
        icon: 'valentine',
        title_th: '',
        title_en: '',
        repeats_yearly: true,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.post(storeDay.url(), {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
            className="flex flex-wrap items-center gap-2 rounded-[var(--radius)] border-[1.5px] border-dashed border-rule-strong bg-paper p-4"
        >
            <Input
                type="date"
                value={form.data.date}
                onChange={(e) => form.setData('date', e.target.value)}
                required
                className="w-auto"
            />
            {/* picture from the theme's dates/ folder / เลือกภาพจากโฟลเดอร์ dates */}
            <div
                role="radiogroup"
                aria-label={t('admin.schedule.icon')}
                className="flex w-full flex-wrap gap-1"
            >
                {dateIcons.map((k) => (
                    <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={form.data.icon === k}
                        title={k}
                        onClick={() => form.setData('icon', k)}
                        className={cn(
                            'press grid size-10 place-items-center rounded-full',
                            form.data.icon === k
                                ? 'bg-stamp-soft text-stamp'
                                : 'text-ink-soft hover:text-ink',
                        )}
                    >
                        <Asset name={`dates.${k}`} className="size-6" />
                    </button>
                ))}
            </div>
            <Input
                value={form.data.title_th}
                onChange={(e) => form.setData('title_th', e.target.value)}
                placeholder="ชื่อวัน (ไทย)"
                className="w-44"
            />
            <Input
                value={form.data.title_en}
                onChange={(e) => form.setData('title_en', e.target.value)}
                placeholder="Name (English)"
                className="w-44"
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
            <Button type="submit" size="sm" disabled={form.processing}>
                {t('admin.schedule.add_day')}
            </Button>
            <InputError
                message={
                    form.errors.date ||
                    form.errors.title_th ||
                    form.errors.title_en
                }
                className="w-full"
            />
        </form>
    );
}
