import { Link, router, usePage } from '@inertiajs/react';
import { LetterPage } from '@/components/rao/letter-page';
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

/** An invitation letter. / จดหมายเชิญ */
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
        <LetterPage head={title} title={title} description={t('invite.body')}>
            {problem && problem !== 'already_member' && (
                <p className="rounded-[calc(var(--radius)-2px)] border border-dashed border-postmark/60 p-4 text-sm text-ink">
                    {t(`invite.problem.${problem}`)}
                </p>
            )}

            <div className="flex flex-col gap-2">
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
                            <Link href={register()}>{t('invite.signup')}</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href={login()}>{t('invite.login')}</Link>
                        </Button>
                    </>
                ) : null}
            </div>
        </LetterPage>
    );
}
