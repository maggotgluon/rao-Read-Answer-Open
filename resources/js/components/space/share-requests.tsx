import { router } from '@inertiajs/react';
import { Asset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { decide } from '@/routes/spaces/share';
import type { ShareRequestItem } from '@/types/space';

/**
 * "Ann would like to share your postcard": Allow (this one, for 7 days) or Not now.
 * Shown at the top of the Calendar tab only while something is waiting.
 * คำขอแชร์จากคู่: อนุญาต (ชิ้นนี้ 7 วัน) หรือ ยังไม่ตอนนี้
 */
export function ShareRequests({
    items,
    spaceId,
}: {
    items: ShareRequestItem[];
    spaceId: string;
}) {
    const { t } = useT();
    if (items.length === 0) return null;
    const answer = (id: number, allow: boolean) =>
        router.put(
            decide.url({ space: spaceId, shareRequest: id }),
            { allow },
            { preserveScroll: true },
        );

    return (
        <section className="paper flex flex-col gap-3 p-4">
            <h3 className="flex items-center gap-2 font-medium text-ink">
                <Asset name="icons.share" className="size-5 text-airmail" />
                {t('share.requests_title')}
            </h3>
            <ul className="flex flex-col gap-3">
                {items.map((r) => (
                    <li
                        key={r.id}
                        className="flex flex-col gap-2 rounded-[calc(var(--radius)-2px)] bg-paper-2 p-3 text-sm"
                    >
                        <p className="text-ink">
                            {t(`share.request_${r.kind}`, { name: r.by ?? '' })}
                        </p>
                        {r.preview && (
                            <p className="hand line-clamp-3 text-lg leading-snug text-ink-soft">
                                {r.preview}
                            </p>
                        )}
                        <p className="text-xs text-ink-soft">
                            {t('share.request_help')}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => answer(r.id, true)}
                            >
                                {t('share.allow')}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => answer(r.id, false)}
                            >
                                {t('share.not_now')}
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
