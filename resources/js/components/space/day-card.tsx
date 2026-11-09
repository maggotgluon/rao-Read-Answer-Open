import { useForm } from '@inertiajs/react';
import { Lock, MessageCircleHeart, Sparkles } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store } from '@/routes/spaces/answers';
import type { DayItem } from '@/types/space';

type Props = {
    day: DayItem;
    spaceId: string;
    partnerName: string;
    readOnly: boolean;
    compact?: boolean;
};

export function DayCard({
    day,
    spaceId,
    partnerName,
    readOnly,
    compact,
}: Props) {
    const { t, locale } = useT();
    const [editing, setEditing] = useState(false);
    const form = useForm({ body: day.mine?.body ?? '' });
    const canWrite =
        !readOnly && day.open && (!day.mine || (editing && day.can_edit));
    const isQuest = day.kind === 'quest';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store.url({ space: spaceId, dailyPrompt: day.id }), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(
        locale === 'th' ? 'th-TH' : 'en-GB',
        { weekday: 'long', day: 'numeric', month: 'short' },
    );

    return (
        <section
            className={cn(
                'flex flex-col gap-4 rounded-2xl border p-5',
                day.is_today
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border',
                compact && 'gap-3 p-4',
            )}
        >
            <header className="flex flex-wrap items-center gap-2 text-sm">
                {isQuest ? (
                    <Sparkles className="size-4 text-primary" />
                ) : (
                    <MessageCircleHeart className="size-4 text-primary" />
                )}
                <span className="font-medium">
                    {day.is_today
                        ? t(isQuest ? 'today.quest' : 'today.question')
                        : dateLabel}
                </span>
                {day.tag && (
                    <Badge variant="secondary">
                        {t(`today.tag.${day.tag}`)}
                    </Badge>
                )}
                {day.written_by && (
                    <span className="text-xs text-muted-foreground">
                        {t('today.written_by', { name: day.written_by })}
                    </span>
                )}
            </header>

            <p className={cn('font-medium', compact ? 'text-base' : 'text-xl')}>
                {day.text}
            </p>

            {canWrite ? (
                <form onSubmit={submit} className="grid gap-2">
                    <textarea
                        value={form.data.body}
                        onChange={(e) => form.setData('body', e.target.value)}
                        rows={3}
                        maxLength={2000}
                        required
                        placeholder={t(
                            isQuest
                                ? 'today.placeholder_quest'
                                : 'today.placeholder_question',
                        )}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-base"
                    />
                    <InputError message={form.errors.body} />
                    {!day.is_today && !day.mine && (
                        <p className="text-xs text-muted-foreground">
                            {t('today.late_hint')}
                        </p>
                    )}
                    {day.partner_answered && !day.mine && (
                        <p className="text-sm text-primary">
                            {t('today.partner_waiting', { name: partnerName })}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={form.processing}>
                            {day.mine ? t('today.save') : t('today.send')}
                        </Button>
                        {editing && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditing(false)}
                            >
                                {t('today.cancel')}
                            </Button>
                        )}
                    </div>
                </form>
            ) : day.mine ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    <Bubble label={t('today.you')} body={day.mine.body} mine>
                        {day.can_edit && !readOnly && (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="text-xs text-muted-foreground underline"
                            >
                                {t('today.edit')}
                            </button>
                        )}
                        {!day.can_edit && day.partner && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Lock className="size-3" />
                                {t('today.locked_hint', { name: partnerName })}
                            </span>
                        )}
                    </Bubble>
                    {day.partner ? (
                        <Bubble label={partnerName} body={day.partner.body} />
                    ) : (
                        <p className="self-center text-sm text-muted-foreground">
                            {t('today.waiting', { name: partnerName })}
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {t('today.missed')}
                </p>
            )}

            {day.mine && day.partner && day.is_today && (
                <p className="text-sm font-medium text-primary">
                    {t('today.both_done')}
                </p>
            )}
        </section>
    );
}

function Bubble({
    label,
    body,
    mine,
    children,
}: {
    label: string;
    body: string;
    mine?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1 rounded-xl p-3',
                mine ? 'bg-background' : 'bg-primary/10',
            )}
        >
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <p className="whitespace-pre-line">{body}</p>
            {children}
        </div>
    );
}
