import { router, useForm } from '@inertiajs/react';
import { Trash2, X } from '@/components/rao/ui-icons';
import { PostmarkIcon } from '@/components/rao/icons';
import { Button } from '@/components/ui/button';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    destroy as destroyComment,
    store as storeComment,
} from '@/routes/spaces/comments';
import { destroy, publish } from '@/routes/spaces/moments';
import { update as react } from '@/routes/spaces/reactions';
import type { MomentItem, Place, SpaceEvent } from '@/types/space';
import { MarkDateDialog } from './mark-date-dialog';
import { ShareCardDialog } from './share-card-dialog';
import { MarkPlaceDialog } from './mark-place-dialog';

type Props = {
    moment: MomentItem;
    spaceId: string;
    emojis: string[];
    readOnly: boolean;
    dateOptions?: SpaceEvent[];
    placeOptions?: Place[];
    /** sharing feature on (own posted postcards only) / เปิดฟีเจอร์แชร์ */
    canShare?: boolean;
};

/**
 * A moment as a postcard: photo mounted like a print, caption in handwriting, a small
 * stamp in the corner says who sent it (red = you, blue = partner).
 * ช่วงเวลา = โปสการ์ด แสตมป์มุมบอกว่าใครส่ง (แดง = คุณ, น้ำเงิน = คู่ของคุณ)
 */
export function MomentCard({
    moment,
    spaceId,
    emojis,
    readOnly,
    dateOptions = [],
    placeOptions,
    canShare = false,
}: Props) {
    const { t, locale } = useT();
    const args = { space: spaceId, moment: moment.id };
    const isDraft = moment.status === 'draft';
    const comment = useForm({ body: '' });
    const when = moment.posted_at
        ? new Date(moment.posted_at).toLocaleString(
              locale === 'th' ? 'th-TH' : 'en-GB',
              {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
              },
          )
        : null;
    const remove = () => {
        if (window.confirm(t('moment.delete_confirm'))) {
            router.delete(destroy.url(args), { preserveScroll: true });
        }
    };
    const icon = { strokeWidth: 1.75 };

    return (
        <article
            className={cn(
                'paper flex flex-col gap-3 p-2.5',
                isDraft &&
                    'shadow-none outline-[1.5px] outline-kraft outline-dashed',
            )}
        >
            {moment.photos.length > 0 && (
                <div className="relative">
                    <div
                        className={cn(
                            'grid gap-1 overflow-hidden rounded-[4px]',
                            moment.photos.length > 1 && 'grid-cols-2',
                        )}
                    >
                        {moment.photos.map((p) => (
                            <img
                                key={p.url}
                                src={p.url}
                                width={p.width}
                                height={p.height}
                                loading="lazy"
                                alt=""
                                className={cn(
                                    'w-full bg-paper-2 object-cover',
                                    moment.photos.length > 1
                                        ? 'aspect-square'
                                        : 'max-h-[70dvh]',
                                )}
                            />
                        ))}
                    </div>
                    <SenderStamp
                        mine={moment.mine}
                        name={moment.author}
                        className="absolute top-2 right-2"
                    />
                </div>
            )}

            <div className="flex flex-col gap-3 px-2 pb-1.5">
                <header className="flex items-center gap-2 text-sm">
                    {moment.photos.length === 0 && (
                        <SenderStamp mine={moment.mine} name={moment.author} />
                    )}
                    <span
                        className={cn(
                            'font-medium',
                            moment.mine ? 'text-stamp' : 'text-airmail',
                        )}
                    >
                        {moment.author}
                    </span>
                    {when && <time className="text-ink-soft">{when}</time>}
                    {isDraft && (
                        <span className="rounded-full bg-kraft/25 px-2 py-0.5 text-xs text-ink">
                            {t('moment.draft')}
                        </span>
                    )}
                    {/* Only my own posted postcards; the partner's needs their OK (later).
                        เฉพาะโปสการ์ดของฉันที่โพสต์แล้ว */}
                    {canShare && moment.mine && !isDraft && (
                        <ShareCardDialog
                            fileName={`rao-postcard-${moment.id}`}
                            photos={moment.photos.map((p) => p.url)}
                            build={(o) => ({
                                kind: 'postcard',
                                text: moment.body,
                                photo:
                                    o.photo === null
                                        ? null
                                        : (moment.photos[o.photo]?.url ?? null),
                                meta:
                                    [
                                        moment.posted_at &&
                                            new Date(
                                                moment.posted_at,
                                            ).toLocaleDateString(
                                                locale === 'th'
                                                    ? 'th-TH'
                                                    : 'en-GB',
                                                {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                },
                                            ),
                                        moment.place?.name,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ') || null,
                                names: o.names
                                    ? t('share.from', {
                                          name: moment.author.split(' ')[0],
                                      })
                                    : null,
                            })}
                            trigger={
                                <button
                                    type="button"
                                    aria-label={t('share.title')}
                                    className="press ml-auto grid size-9 place-items-center rounded-full text-ink-soft hover:text-ink"
                                >
                                    <Asset
                                        name="icons.share"
                                        className="size-4"
                                    />
                                </button>
                            }
                        />
                    )}
                    {moment.mine && !readOnly && (
                        <button
                            type="button"
                            onClick={remove}
                            aria-label={t('moment.delete')}
                            className={cn(
                                'press grid size-9 place-items-center rounded-full text-ink-soft hover:text-wax',
                                !(canShare && !isDraft) && 'ml-auto',
                            )}
                        >
                            <Trash2 className="size-4" {...icon} />
                        </button>
                    )}
                </header>

                {moment.body && (
                    <p
                        className={cn(
                            'hand text-xl leading-relaxed whitespace-pre-line text-ink',
                            moment.photos.length === 0 && 'lined',
                        )}
                    >
                        {moment.body}
                    </p>
                )}

                {!isDraft && (moment.date || moment.place || !readOnly) && (
                    <div className="flex flex-wrap items-center gap-2">
                        {moment.date && (
                            <span className="flex items-center gap-1.5 rounded-full border border-dashed border-stamp/50 px-2.5 py-1 text-xs text-stamp">
                                <PostmarkIcon className="inked size-3.5" />
                                {moment.date.title}
                            </span>
                        )}
                        {moment.place && (
                            <span className="flex items-center gap-1.5 rounded-full border border-dashed border-airmail/50 px-2.5 py-1 text-xs text-airmail">
                                <Asset
                                    name={`places.${moment.place.kind}`}
                                    className="size-3.5"
                                />
                                {moment.place.name}
                            </span>
                        )}
                        {!readOnly && (
                            <MarkDateDialog
                                moment={moment}
                                spaceId={spaceId}
                                options={dateOptions}
                            />
                        )}
                        {/* hidden when places are switched off / ซ่อนเมื่อปิดฟีเจอร์ */}
                        {!readOnly && placeOptions && (
                            <MarkPlaceDialog
                                moment={moment}
                                spaceId={spaceId}
                                options={placeOptions}
                            />
                        )}
                    </div>
                )}

                {isDraft ? (
                    !readOnly && (
                        <Button
                            className="self-start"
                            onClick={() =>
                                router.post(
                                    publish.url(args),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            {t('moment.publish')}
                        </Button>
                    )
                ) : (
                    <>
                        <div className="-mx-1 flex flex-wrap gap-1">
                            {emojis.map((e) => {
                                const count = moment.reactions.filter(
                                    (r) => r.emoji === e,
                                ).length;
                                const mine = moment.reactions.some(
                                    (r) => r.emoji === e && r.mine,
                                );

                                return (
                                    <button
                                        key={e}
                                        type="button"
                                        disabled={readOnly}
                                        aria-pressed={mine}
                                        onClick={() =>
                                            router.put(
                                                react.url(args),
                                                { emoji: e },
                                                { preserveScroll: true },
                                            )
                                        }
                                        className={cn(
                                            'press flex h-9 min-w-9 items-center justify-center gap-1 rounded-full px-2',
                                            mine
                                                ? 'bg-stamp-soft'
                                                : count
                                                  ? 'bg-ink/[0.05]'
                                                  : 'opacity-60 hover:opacity-100',
                                        )}
                                    >
                                        <Asset
                                            name={`reactions.${e}`}
                                            alt={t(`reaction.${e}`)}
                                            className={cn(
                                                'size-5',
                                                mine
                                                    ? 'animate-thunk text-stamp'
                                                    : 'text-ink',
                                            )}
                                        />
                                        {count > 0 && (
                                            <span className="text-xs text-ink">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {moment.comments.length > 0 && (
                            <ul className="flex flex-col gap-2 border-t border-dashed border-rule pt-3 text-sm">
                                {moment.comments.map((c) => (
                                    <li
                                        key={c.id}
                                        className="flex items-start gap-2"
                                    >
                                        <span
                                            className={cn(
                                                'font-medium',
                                                c.mine
                                                    ? 'text-stamp'
                                                    : 'text-airmail',
                                            )}
                                        >
                                            {c.author}
                                        </span>
                                        <span className="flex-1 whitespace-pre-line text-ink">
                                            {c.body}
                                        </span>
                                        {c.mine && !readOnly && (
                                            <button
                                                type="button"
                                                aria-label={t('moment.delete')}
                                                onClick={() =>
                                                    router.delete(
                                                        destroyComment.url({
                                                            ...args,
                                                            comment: c.id,
                                                        }),
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="press -my-1 grid size-7 place-items-center rounded-full text-ink-soft/70 hover:text-wax"
                                            >
                                                <X
                                                    className="size-3.5"
                                                    {...icon}
                                                />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!readOnly && (
                            <form
                                className="flex items-center gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    comment.post(storeComment.url(args), {
                                        preserveScroll: true,
                                        onSuccess: () => comment.reset(),
                                    });
                                }}
                            >
                                <input
                                    value={comment.data.body}
                                    onChange={(e) =>
                                        comment.setData('body', e.target.value)
                                    }
                                    maxLength={1000}
                                    required
                                    aria-label={t('moment.comment_placeholder')}
                                    placeholder={t(
                                        'moment.comment_placeholder',
                                    )}
                                    className="h-10 flex-1 border-b border-rule bg-transparent px-1 text-ink outline-none placeholder:text-ink-soft/60 focus:border-airmail"
                                />
                                {comment.data.body.trim() && (
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="ghost"
                                        className="text-stamp"
                                        disabled={comment.processing}
                                    >
                                        {t('moment.comment_send')}
                                    </Button>
                                )}
                            </form>
                        )}
                    </>
                )}
            </div>
        </article>
    );
}

/** Tiny perforated stamp with the sender's initial. / แสตมป์จิ๋วบอกผู้ส่ง */
function SenderStamp({
    mine,
    name,
    className,
}: {
    mine: boolean;
    name: string;
    className?: string;
}) {
    return (
        <span
            aria-hidden
            className={cn(
                'perforated inked block rotate-3 rounded-[2px]',
                className,
            )}
            style={{
                ['--stamp-face' as string]: 'var(--paper)',
                ['--hole' as string]: '1.5px',
                ['--gap' as string]: '5px',
                padding: '3px',
            }}
        >
            <span
                className={cn(
                    'hand grid h-8 w-7 place-items-center rounded-[1px] text-sm',
                    mine
                        ? 'bg-stamp text-stamp-ink'
                        : 'bg-airmail text-airmail-ink',
                )}
            >
                {name.trim().charAt(0).toUpperCase()}
            </span>
        </span>
    );
}
