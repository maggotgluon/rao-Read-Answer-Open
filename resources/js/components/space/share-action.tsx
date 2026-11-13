import { router } from '@inertiajs/react';
import { Asset } from '@/components/rao/asset';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ask } from '@/routes/spaces/share';
import type { ShareState } from '@/types/space';
import { ShareCardDialog } from './share-card-dialog';

type Props = Omit<
    React.ComponentProps<typeof ShareCardDialog>,
    'trigger' | 'link'
> & {
    state: ShareState | null;
    spaceId: string;
    type: 'moment' | 'letter';
    id: string | number;
    partnerName: string;
    className?: string;
};

/**
 * The share control for things that may need the partner's OK:
 * own/allowed → share dialog; ask → "Ask to share"; pending → waiting note;
 * not_now / off → nothing (hidden, not greyed out).
 * ปุ่มแชร์ที่อาจต้องขออนุญาตคู่ก่อน ถ้ายังแชร์ไม่ได้จะซ่อน ไม่แสดงแบบกดไม่ได้
 */
export function ShareAction({
    state,
    spaceId,
    type,
    id,
    partnerName,
    className,
    ...dialog
}: Props) {
    const { t } = useT();
    if (!state || state === 'not_now') return null;

    if (state === 'pending') {
        return (
            <span className={cn('text-xs text-ink-soft', className)}>
                {t('share.waiting', { name: partnerName })}
            </span>
        );
    }

    if (state === 'ask') {
        return (
            <button
                type="button"
                onClick={() =>
                    router.post(
                        ask.url(spaceId),
                        { type, id: String(id) },
                        { preserveScroll: true },
                    )
                }
                className={cn(
                    'press flex items-center gap-1 text-xs text-ink-soft hover:text-ink',
                    className,
                )}
            >
                <Asset name="icons.share" className="size-3.5" />{' '}
                {t('share.ask')}
            </button>
        );
    }

    return (
        <ShareCardDialog
            {...dialog}
            link={{ spaceId, type, id }}
            trigger={
                <button
                    type="button"
                    aria-label={t('share.title')}
                    className={cn(
                        'press grid size-9 place-items-center rounded-full text-ink-soft hover:text-ink',
                        className,
                    )}
                >
                    <Asset name="icons.share" className="size-4" />
                </button>
            }
        />
    );
}
