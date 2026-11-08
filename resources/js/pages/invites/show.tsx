import { Head, Link, router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { LanguageSwitch } from '@/components/language-switch';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { login, register } from '@/routes';
import { accept } from '@/routes/invites';

type Props = {
    code: string;
    inviter: string | null;
    problem: string | null;
    space_url: string | null;
};

export default function InviteShow({
    code,
    inviter,
    problem,
    space_url,
}: Props) {
    const { t } = useT();
    const { auth } = usePage().props;
    const title = inviter
        ? t('invite.title', { name: inviter })
        : t('invite.title_generic');

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
                <LanguageSwitch className="absolute top-4 right-4" />
                <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Heart className="size-8" />
                </span>

                <div className="max-w-sm space-y-2 text-center">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-muted-foreground">{t('invite.body')}</p>
                </div>

                <div className="flex w-full max-w-xs flex-col gap-3">
                    {problem && problem !== 'already_member' && (
                        <p className="rounded-xl bg-muted p-4 text-center text-sm">
                            {t(`invite.problem.${problem}`)}
                        </p>
                    )}

                    {space_url ? (
                        <Button asChild size="lg">
                            <Link href={space_url}>{t('invite.open')}</Link>
                        </Button>
                    ) : !problem && auth.user ? (
                        <Button
                            size="lg"
                            onClick={() => router.post(accept.url(code))}
                        >
                            {t('invite.accept')}
                        </Button>
                    ) : !problem ? (
                        <>
                            <Button asChild size="lg">
                                <Link href={register()}>
                                    {t('invite.signup')}
                                </Link>
                            </Button>
                            <Button asChild variant="ghost">
                                <Link href={login()}>{t('invite.login')}</Link>
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
