import { Form, Head, router } from '@inertiajs/react';
import {
    Copy,
    Heart,
    MessageCircleHeart,
    RefreshCw,
    Share2,
    Snowflake,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';
import {
    freeze,
    invite as inviteRoute,
    restore,
    update,
} from '@/routes/spaces';
import type { Invite, SpaceDetail } from '@/types/space';

const TIMEZONES = [
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'UTC',
];

type Props = { space: SpaceDetail; invite: Invite | null };

export default function SpaceShow({ space, invite }: Props) {
    const { t, locale } = useT();
    const frozen = space.status === 'frozen';
    const title =
        space.name ??
        (space.partner
            ? t('spaces.with', { name: space.partner.name })
            : t('spaces.waiting'));

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    return (
        <>
            <Head title={title} />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
                <header className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Heart className="size-6" />
                    </span>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                </header>

                {frozen && (
                    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted p-4">
                        <h2 className="flex items-center gap-2 font-medium">
                            <Snowflake className="size-4" />{' '}
                            {t('space.frozen.title')}
                        </h2>
                        {space.delete_after && (
                            <p className="text-sm text-muted-foreground">
                                {t('space.frozen.body', {
                                    date: formatDate(space.delete_after),
                                })}
                            </p>
                        )}
                        {space.can_restore && (
                            <Button
                                className="self-start"
                                onClick={() =>
                                    router.post(restore.url(space.id))
                                }
                            >
                                {t('space.frozen.restore')}
                            </Button>
                        )}
                    </section>
                )}

                {invite && <InviteCard invite={invite} spaceId={space.id} />}

                <ComingSoon
                    icon={<MessageCircleHeart className="size-5" />}
                    title={t('space.prompt.title')}
                    body={t('space.prompt.soon')}
                />
                <ComingSoon
                    icon={<Heart className="size-5" />}
                    title={t('space.moments.title')}
                    body={t('space.moments.soon')}
                />

                {!frozen && (
                    <section className="flex flex-col gap-4 rounded-2xl border border-border p-4">
                        <h2 className="font-medium">
                            {t('space.settings.title')}
                        </h2>
                        <Form
                            {...update.form(space.id)}
                            options={{ preserveScroll: true }}
                            className="grid gap-4"
                        >
                            {({ processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            {t('space.settings.name')}
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            maxLength={60}
                                            defaultValue={space.name ?? ''}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="timezone">
                                            {t('space.settings.timezone')}
                                        </Label>
                                        <select
                                            id="timezone"
                                            name="timezone"
                                            defaultValue={space.timezone}
                                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                        >
                                            {[
                                                ...new Set([
                                                    space.timezone,
                                                    ...TIMEZONES,
                                                ]),
                                            ].map((tz) => (
                                                <option key={tz} value={tz}>
                                                    {tz}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            {t('space.settings.timezone_help')}
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={processing}
                                        className="justify-self-start"
                                    >
                                        {t('space.settings.save')}
                                    </Button>
                                </>
                            )}
                        </Form>

                        <UnpairDialog spaceId={space.id} />
                    </section>
                )}
            </div>
        </>
    );
}

function InviteCard({ invite, spaceId }: { invite: Invite; spaceId: string }) {
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

function ComingSoon({
    icon,
    title,
    body,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
}) {
    return (
        <section className="flex gap-3 rounded-2xl border border-dashed border-border p-4 text-muted-foreground">
            <span className="mt-0.5">{icon}</span>
            <div>
                <h2 className="font-medium text-foreground">{title}</h2>
                <p className="text-sm">{body}</p>
            </div>
        </section>
    );
}

function UnpairDialog({ spaceId }: { spaceId: string }) {
    const { t } = useT();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="justify-self-start text-destructive"
                >
                    {t('space.unpair.button')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('space.unpair.title')}</DialogTitle>
                    <DialogDescription>
                        {t('space.unpair.body')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('space.unpair.cancel')}
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            variant="destructive"
                            onClick={() => router.post(freeze.url(spaceId))}
                        >
                            {t('space.unpair.confirm')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
