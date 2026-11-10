import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Asset } from '@/components/rao/asset';
import { StampText } from '@/components/rao/stamp-text';
import { AirmailIcon, EnvelopeIcon, SealIcon } from '@/components/rao/icons';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store } from '@/routes/spaces/answers';
import { nudge } from '@/routes/spaces';
import { update as rate } from '@/routes/spaces/ratings';
import {
    destroy as destroyReply,
    store as storeReply,
} from '@/routes/spaces/replies';
import type { DayItem } from '@/types/space';

type Props = {
    day: DayItem;
    spaceId: string;
    partnerName: string;
    readOnly: boolean;
    compact?: boolean;
};

/**
 * One day's letter. You write on lined paper and press the wax seal; only then does
 * your partner's letter open. The seal + reveal is the app's one big animation.
 * จดหมายของวัน: เขียนแล้วกดปิดผนึก จดหมายของอีกฝ่ายจึงจะเปิด
 */
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

    // Animate only the moment it happens (not on every page load).
    // แสดงแอนิเมชันเฉพาะตอนที่เพิ่งปิดผนึก / เพิ่งเปิดอ่าน
    const hadMine = useRef(Boolean(day.mine));
    const [justSealed, setJustSealed] = useState(false);
    useEffect(() => {
        if (!hadMine.current && day.mine) setJustSealed(true);
        hadMine.current = Boolean(day.mine);
    }, [day.mine]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store.url({ space: spaceId, dailyPrompt: day.id }), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(
        locale === 'th' ? 'th-TH' : 'en-GB',
        { weekday: 'long', day: 'numeric', month: 'long' },
    );
    const heading = day.bonus
        ? t('letter.bonus')
        : day.is_today
          ? t(isQuest ? 'letter.today_quest' : 'letter.today_question')
          : dateLabel;

    return (
        <article
            className={cn(
                'paper relative overflow-hidden',
                day.is_today && !compact && 'animate-arrive',
                day.bonus && 'ring-1 ring-kraft/70',
            )}
        >
            {/* envelope edge: airmail for the day's letter, kraft for a bonus */}
            <div
                className={cn(
                    'h-1.5',
                    day.bonus ? 'bg-kraft/70' : 'airmail-edge',
                )}
            />

            <div
                className={cn(
                    'flex flex-col gap-4 p-5',
                    compact && 'gap-3 p-4',
                )}
            >
                <header className="flex items-start gap-3">
                    <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm text-ink-soft">{heading}</span>
                        {day.written_by && (
                            <span className="text-xs text-ink-soft">
                                {t('today.written_by', {
                                    name: day.written_by,
                                })}
                            </span>
                        )}
                    </div>
                    {day.tag && (
                        <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-xs text-ink-soft">
                            {t(`today.tag.${day.tag}`)}
                        </span>
                    )}
                </header>

                <p
                    className={cn(
                        'hand text-ink',
                        compact
                            ? 'text-xl leading-snug'
                            : 'text-[1.7rem] leading-[1.3]',
                    )}
                >
                    {day.text}
                </p>

                {canWrite ? (
                    <form onSubmit={submit} className="flex flex-col gap-3">
                        <label className="sr-only" htmlFor={`answer-${day.id}`}>
                            {t(
                                isQuest
                                    ? 'today.placeholder_quest'
                                    : 'today.placeholder_question',
                            )}
                        </label>
                        <textarea
                            id={`answer-${day.id}`}
                            value={form.data.body}
                            onChange={(e) =>
                                form.setData('body', e.target.value)
                            }
                            rows={compact ? 3 : 4}
                            maxLength={2000}
                            required
                            placeholder={t(
                                isQuest
                                    ? 'today.placeholder_quest'
                                    : 'today.placeholder_question',
                            )}
                            className="lined hand w-full resize-none bg-transparent px-1 text-xl text-ink outline-none placeholder:text-ink-soft/60"
                        />
                        <InputError message={form.errors.body} />

                        <div className="flex items-end gap-3">
                            <PartnerLine day={day} partnerName={partnerName} />
                            <div className="ml-auto flex items-center gap-2">
                                {editing && (
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="press rounded-full px-3 py-2 text-sm text-ink-soft"
                                    >
                                        {t('today.cancel')}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !form.data.body.trim()
                                    }
                                    className="press group flex flex-col items-center gap-1 disabled:opacity-40"
                                >
                                    <span className="grid size-16 place-items-center rounded-full bg-stamp [background-image:var(--seal-image)] bg-cover text-stamp-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.18),0_6px_14px_-6px_var(--stamp)] transition-transform group-enabled:group-hover:-rotate-6">
                                        <SealIcon className="size-7" />
                                    </span>
                                    <span className="text-xs font-medium text-stamp">
                                        {day.mine
                                            ? t('letter.reseal')
                                            : t('letter.seal')}
                                    </span>
                                </button>
                            </div>
                        </div>
                        {!day.is_today && !day.mine && (
                            <p className="text-xs text-ink-soft">
                                {t('today.late_hint')}
                            </p>
                        )}
                    </form>
                ) : day.mine ? (
                    <div className="flex flex-col gap-3">
                        <Sheet
                            who={t('today.you')}
                            body={day.mine.body}
                            tone="you"
                            sealed={justSealed}
                        >
                            {day.can_edit && !readOnly && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="press text-xs text-ink-soft underline"
                                >
                                    {t('today.edit')}
                                </button>
                            )}
                        </Sheet>
                        {day.partner ? (
                            <PartnerLetter
                                name={partnerName}
                                body={day.partner.body}
                                reveal={justSealed}
                            />
                        ) : (
                            <OnItsWay
                                name={partnerName}
                                day={day}
                                spaceId={spaceId}
                                canNudge={!readOnly && day.is_today}
                            />
                        )}
                        {day.partner && (
                            <Replies
                                day={day}
                                spaceId={spaceId}
                                partnerName={partnerName}
                                readOnly={readOnly}
                            />
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-ink-soft">
                        {t('letter.unsent')}
                    </p>
                )}

                {day.mine && day.partner && day.is_today && (
                    <p className="hand text-lg text-stamp">
                        {day.bonus ? t('today.bonus_done') : t('letter.both')}
                    </p>
                )}
                {day.bonus && !day.mine && day.is_today && (
                    <p className="text-xs text-ink-soft">
                        {t('today.bonus_hint')}
                    </p>
                )}

                {!readOnly && <Rating day={day} spaceId={spaceId} />}
            </div>
        </article>
    );
}

/** Where the partner's letter is, while you write. / สถานะจดหมายของอีกฝ่าย */
function PartnerLine({
    day,
    partnerName,
}: {
    day: DayItem;
    partnerName: string;
}) {
    const { t } = useT();

    return day.partner_answered ? (
        <p className="flex items-center gap-2 text-sm text-airmail">
            <EnvelopeIcon className="size-4 shrink-0" />
            {t('letter.waiting_for_you', { name: partnerName })}
        </p>
    ) : (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
            <AirmailIcon className="size-4 shrink-0" />
            {t('letter.not_yet', { name: partnerName })}
        </p>
    );
}

function Sheet({
    who,
    body,
    tone,
    sealed,
    children,
}: {
    who: string;
    body: string;
    tone: 'you' | 'partner';
    sealed?: boolean;
    children?: React.ReactNode;
}) {
    const { t } = useT();

    return (
        <div
            className={cn(
                'relative rounded-[calc(var(--radius)-2px)] bg-paper-2 px-4 pt-3 pb-4',
                tone === 'partner' && 'bg-airmail-soft',
            )}
        >
            <span
                className={cn(
                    'text-xs font-medium',
                    tone === 'you' ? 'text-stamp' : 'text-airmail',
                )}
            >
                {who}
            </span>
            <p className="hand mt-1 text-xl leading-relaxed whitespace-pre-line text-ink">
                {body}
            </p>
            {children && <div className="mt-2">{children}</div>}
            {tone === 'you' && (
                <StampText
                    seed={`sealed-${who}`}
                    className="absolute right-3 bottom-2 text-[10px] text-stamp/80"
                >
                    {t('letter.sealed_stamp')}
                </StampText>
            )}
            {tone === 'you' && (
                <span
                    aria-hidden
                    className={cn(
                        'absolute -top-2 right-3 grid size-10 -rotate-8 place-items-center rounded-full bg-stamp [background-image:var(--seal-image)] bg-cover text-stamp-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)]',
                        sealed && 'animate-seal',
                    )}
                >
                    <SealIcon className="size-5" />
                </span>
            )}
        </div>
    );
}

/** Partner's letter, rising out of its envelope the moment you seal yours. / จดหมายของอีกฝ่าย */
function PartnerLetter({
    name,
    body,
    reveal,
}: {
    name: string;
    body: string;
    reveal: boolean;
}) {
    if (!reveal) return <Sheet who={name} body={body} tone="partner" />;

    return (
        <div className="relative [perspective:700px]">
            <div
                aria-hidden
                className="animate-flap absolute inset-x-0 top-0 z-10 h-10 origin-top"
            >
                <svg
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    className="size-full"
                >
                    <path
                        d="M0 0h100L50 20Z"
                        fill="var(--airmail)"
                        opacity="0.85"
                    />
                </svg>
            </div>
            <div className="animate-rise">
                <Sheet who={name} body={body} tone="partner" />
            </div>
        </div>
    );
}

function OnItsWay({
    name,
    day,
    spaceId,
    canNudge,
}: {
    name: string;
    day: DayItem;
    spaceId: string;
    canNudge: boolean;
}) {
    const { t } = useT();
    const [sending, setSending] = useState(false);
    const send = () =>
        router.post(
            nudge.url({ space: spaceId, dailyPrompt: day.id }),
            {},
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
            },
        );

    return (
        <div className="flex flex-col gap-3 rounded-[calc(var(--radius)-2px)] border border-dashed border-airmail/40 px-4 py-3 text-sm text-ink-soft">
            <div className="flex items-center gap-3">
                <AirmailIcon className="size-5 shrink-0 text-airmail" />
                {t('letter.on_its_way', { name })}
            </div>
            {canNudge &&
                (day.nudged ? (
                    <span className="hand text-base text-airmail">
                        {t('nudge.done', { name })}
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={send}
                        disabled={sending}
                        className="press self-start rounded-full bg-airmail-soft px-4 py-2 text-sm font-medium text-airmail disabled:opacity-50"
                    >
                        <Asset
                            name="icons.bell-ring"
                            className="mr-1.5 size-4 align-[-3px]"
                        />
                        {t('nudge.button', { name })}
                    </button>
                ))}
        </div>
    );
}

/** A short thread under the two open letters. / ตอบกลับสั้น ๆ ใต้จดหมายสองฉบับ */
function Replies({
    day,
    spaceId,
    partnerName,
    readOnly,
}: {
    day: DayItem;
    spaceId: string;
    partnerName: string;
    readOnly: boolean;
}) {
    const { t } = useT();
    const form = useForm({ body: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(storeReply.url({ space: spaceId, dailyPrompt: day.id }), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    if (readOnly && day.replies.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 border-l-2 border-dashed border-rule pl-3">
            {day.replies.map((r) => (
                <div key={r.id} className="animate-arrive group flex flex-col">
                    <span
                        className={cn(
                            'text-xs font-medium',
                            r.mine ? 'text-stamp' : 'text-airmail',
                        )}
                    >
                        {r.mine ? t('today.you') : partnerName}
                    </span>
                    <p className="hand text-lg leading-snug whitespace-pre-line text-ink">
                        {r.body}
                    </p>
                    {r.mine && !readOnly && (
                        <button
                            type="button"
                            onClick={() =>
                                router.delete(
                                    destroyReply.url({
                                        space: spaceId,
                                        dailyPrompt: day.id,
                                        reply: r.id,
                                    }),
                                    { preserveScroll: true },
                                )
                            }
                            className="self-start text-xs text-ink-soft underline opacity-70 hover:opacity-100"
                        >
                            {t('reply.delete')}
                        </button>
                    )}
                </div>
            ))}
            {!readOnly && (
                <form onSubmit={submit} className="flex items-end gap-2">
                    <label className="sr-only" htmlFor={`reply-${day.id}`}>
                        {t('reply.placeholder', { name: partnerName })}
                    </label>
                    <textarea
                        id={`reply-${day.id}`}
                        rows={1}
                        maxLength={500}
                        value={form.data.body}
                        onChange={(e) => form.setData('body', e.target.value)}
                        placeholder={t('reply.placeholder', {
                            name: partnerName,
                        })}
                        className="lined hand [field-sizing:content] min-h-10 flex-1 resize-none bg-transparent px-1 text-lg text-ink outline-none placeholder:text-ink-soft/60"
                    />
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.body.trim()}
                        className="press rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-40"
                    >
                        {t('reply.send')}
                    </button>
                </form>
            )}
        </div>
    );
}

/** Private 👍/👎 — only used for library feedback, the partner never sees it. */
function Rating({ day, spaceId }: { day: DayItem; spaceId: string }) {
    const { t } = useT();
    const set = (value: -1 | 0 | 1) =>
        router.put(
            rate.url({ space: spaceId, dailyPrompt: day.id }),
            { value: day.my_rating === value ? 0 : value },
            { preserveScroll: true, only: ['days', 'day'] },
        );

    return (
        <div className="flex items-center gap-1 border-t border-dashed border-rule pt-3 text-xs text-ink-soft">
            <span className="mr-1">
                {t(
                    day.kind === 'quest'
                        ? 'rating.ask_quest'
                        : 'rating.ask_question',
                )}
            </span>
            {([1, -1] as const).map((v) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => set(v)}
                    aria-pressed={day.my_rating === v}
                    aria-label={t(v === 1 ? 'rating.up' : 'rating.down')}
                    className={cn(
                        'press grid size-9 place-items-center rounded-full',
                        day.my_rating === v
                            ? 'bg-stamp-soft text-stamp'
                            : 'text-ink-soft opacity-70 hover:opacity-100',
                    )}
                >
                    <Asset
                        name={v === 1 ? 'icons.thumbs-up' : 'icons.thumbs-down'}
                        className="size-[18px]"
                    />
                </button>
            ))}
            {day.my_rating !== 0 && (
                <span className="animate-thunk">{t('rating.thanks')}</span>
            )}
        </div>
    );
}
