import { router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    destroy as destroyComment,
    store as storeComment,
} from '@/routes/spaces/comments';
import { destroy, publish } from '@/routes/spaces/moments';
import { update as react } from '@/routes/spaces/reactions';
import type { MomentItem } from '@/types/space';

type Props = {
    moment: MomentItem;
    spaceId: string;
    emojis: string[];
    readOnly: boolean;
};

export function MomentCard({ moment, spaceId, emojis, readOnly }: Props) {
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

    return (
        <article
            className={cn(
                'flex flex-col gap-3 rounded-2xl border p-4',
                isDraft ? 'border-dashed border-amber-500/50' : 'border-border',
            )}
        >
            <header className="flex items-center gap-2 text-sm">
                <span className="font-medium">{moment.author}</span>
                {when && <span className="text-muted-foreground">{when}</span>}
                {moment.mine && !readOnly && (
                    <button
                        type="button"
                        onClick={remove}
                        aria-label={t('moment.delete')}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </button>
                )}
            </header>

            {moment.photos.length > 0 && (
                <div
                    className={cn(
                        'grid gap-1 overflow-hidden rounded-xl',
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
                                'w-full object-cover',
                                moment.photos.length > 1
                                    ? 'aspect-square'
                                    : 'max-h-[70vh]',
                            )}
                        />
                    ))}
                </div>
            )}

            {moment.body && (
                <p className="whitespace-pre-line">{moment.body}</p>
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
                    <div className="flex flex-wrap gap-1">
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
                                    onClick={() =>
                                        router.put(
                                            react.url(args),
                                            { emoji: e },
                                            { preserveScroll: true },
                                        )
                                    }
                                    className={cn(
                                        'rounded-full border px-2 py-0.5 text-sm transition-colors',
                                        mine
                                            ? 'border-primary bg-primary/10'
                                            : count
                                              ? 'border-border'
                                              : 'border-transparent opacity-60 hover:opacity-100',
                                    )}
                                >
                                    {e}
                                    {count > 0 && (
                                        <span className="ml-1 text-xs">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {moment.comments.length > 0 && (
                        <ul className="grid gap-1.5 text-sm">
                            {moment.comments.map((c) => (
                                <li key={c.id} className="group flex gap-2">
                                    <span className="font-medium">
                                        {c.author}
                                    </span>
                                    <span className="flex-1 whitespace-pre-line">
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
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className="text-muted-foreground opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {!readOnly && (
                        <form
                            className="flex gap-2"
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
                                placeholder={t('moment.comment_placeholder')}
                                className="h-9 flex-1 rounded-full border border-input bg-background px-3 text-sm"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                variant="secondary"
                                disabled={comment.processing}
                            >
                                {t('moment.comment_send')}
                            </Button>
                        </form>
                    )}
                </>
            )}
        </article>
    );
}
