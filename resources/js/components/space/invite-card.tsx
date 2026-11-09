import { router } from '@inertiajs/react';
import { Copy, RefreshCw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { invite as inviteRoute } from '@/routes/spaces';
import type { Invite } from '@/types/space';

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

    return (
        <section className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div>
                <h2 className="font-medium">{t('space.invite.title')}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('space.invite.body')}
                </p>
            </div>
            <p
                className="font-mono text-3xl tracking-[0.2em]"
                aria-label="code"
            >
                {pretty}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button onClick={share}>
                    <Share2 /> {t('space.invite.share')}
                </Button>
                <Button variant="secondary" onClick={copy}>
                    <Copy /> {t('space.invite.copy')}
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
                    <RefreshCw /> {t('space.invite.new')}
                </Button>
            </div>
        </section>
    );
}
