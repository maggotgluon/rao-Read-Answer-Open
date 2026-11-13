import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Asset } from '@/components/rao/asset';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { destroy } from '@/routes/shared-links';

type Link = {
    id: number;
    url: string;
    image: string | null;
    kind: 'moment' | 'letter' | 'achievement';
    mine: boolean;
    by: string | null;
    space: string | null;
    created_at: string | null;
    expires_at: string | null;
    live: boolean;
    views: number;
};

/**
 * Every public link you made, and links your partner made of your postcards or your
 * letters. Turn any of them off: the page and picture are gone at once.
 * ลิงก์สาธารณะทั้งหมด ปิดได้ทุกลิงก์ ปิดแล้วหน้าและรูปหายทันที
 */
export default function SharedLinks({ links }: { links: Link[] }) {
    const { t, locale } = useT();
    const day = (iso: string) =>
        new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    const off = (l: Link) =>
        window.confirm(t('share.off_confirm')) &&
        router.delete(destroy.url(l.id), { preserveScroll: true });
    const copy = async (url: string) => {
        await navigator.clipboard?.writeText(url).catch(() => {});
        toast.success(t('share.copied'));
    };

    return (
        <>
            <Head title={t('settings.shared_links')} />
            <section className="flex flex-col gap-4">
                <Heading
                    variant="small"
                    title={t('settings.shared_links')}
                    description={t('share.links_help')}
                />
                {links.length === 0 && (
                    <p className="text-sm text-ink-soft">
                        {t('share.links_empty')}
                    </p>
                )}
                <ul className="flex flex-col gap-3">
                    {links.map((l) => (
                        <li
                            key={l.id}
                            className={cn(
                                'flex gap-3 rounded-[var(--radius)] bg-paper-2 p-3 text-sm',
                                !l.live && 'opacity-60',
                            )}
                        >
                            <div className="h-24 w-[4.8rem] shrink-0 overflow-hidden rounded-md bg-paper">
                                {l.image ? (
                                    <img
                                        src={l.image}
                                        alt={t('share.card_alt')}
                                        className="size-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="grid size-full place-items-center text-ink-soft">
                                        <Asset
                                            name="icons.eye-off"
                                            className="size-5"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <p className="font-medium text-ink">
                                    {t(`share.kind_${l.kind}`)}
                                    {l.space ? ` · ${l.space}` : ''}
                                </p>
                                <p className="text-xs text-ink-soft">
                                    {l.mine
                                        ? t('share.made_by_you')
                                        : t('share.made_by', {
                                              name: l.by ?? '',
                                          })}
                                    {l.created_at
                                        ? ` · ${day(l.created_at)}`
                                        : ''}
                                </p>
                                <p className="text-xs text-ink-soft">
                                    {!l.live
                                        ? t('share.is_off')
                                        : l.expires_at
                                          ? t('share.until', {
                                                date: day(l.expires_at),
                                            })
                                          : t('share.no_end')}
                                    {' · '}
                                    {t('share.views', { count: l.views })}
                                </p>
                                {l.live && (
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copy(l.url)}
                                        >
                                            <Asset
                                                name="icons.copy"
                                                className="size-4"
                                            />{' '}
                                            {t('share.copy')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => off(l)}
                                        >
                                            {t('share.turn_off')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
