import { router } from '@inertiajs/react';
import { Copy, RefreshCw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { invite as inviteRoute } from '@/routes/spaces';
import type { Invite } from '@/types/space';

/**
 * Invite your partner: an invitation letter with the code written large.
 * Phones get the native share sheet (LINE, Messenger…). / จดหมายเชิญ แชร์ผ่านแอปในมือถือได้
 */
export function InviteCard({
    invite,
    spaceId,
}: {
    invite: Invite;
    spaceId: string;
}) {
    const { t } = useT();
    const pretty = `${invite.code.slice(0, 4)}-${invite.code.slice(4)}`;
    const copy = async () => {
        await navigator.clipboard.writeText(invite.url);
        toast.success(t('space.invite.copied'));
    };
    const share = async () => {
        if (navigator.share) {
            await navigator
                .share({ text: t('space.invite.share_text'), url: invite.url })
                .catch(() => {});
        } else {
            await copy();
        }
    };
    const icon = { strokeWidth: 1.75 };

    return (
        <section className="paper overflow-hidden">
            <div className="airmail-edge h-1.5" />
            <div className="flex flex-col gap-4 p-5">
                <div>
                    <h2 className="text-2xl text-ink">
                        {t('space.invite.title')}
                    </h2>
                    <p className="text-sm text-ink-soft">
                        {t('space.invite.body')}
                    </p>
                </div>
                <p
                    className="hand text-center text-4xl tracking-[0.12em] text-stamp select-all"
                    aria-label="code"
                >
                    {pretty}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={share} className="flex-1">
                        <Share2 {...icon} /> {t('space.invite.share')}
                    </Button>
                    <Button variant="outline" onClick={copy}>
                        <Copy {...icon} /> {t('space.invite.copy')}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            router.post(
                                inviteRoute.url(spaceId),
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        <RefreshCw {...icon} /> {t('space.invite.new')}
                    </Button>
                </div>
            </div>
        </section>
    );
}
