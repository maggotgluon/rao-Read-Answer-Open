import { Head, Link, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { LanguageSwitch } from '@/components/language-switch';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const { t } = useT();

    return (
        <>
            <Head title={t('app.tagline')} />
            <div className="flex min-h-svh flex-col p-6">
                <header className="flex justify-end">
                    <LanguageSwitch />
                </header>
                <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 text-center">
                    <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Heart className="size-10" />
                    </span>
                    <h1 className="text-3xl font-semibold">
                        {t('welcome.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('welcome.body')}
                    </p>
                    <div className="flex w-full max-w-xs flex-col gap-3">
                        {auth.user ? (
                            <Button asChild size="lg">
                                <Link href={dashboard()}>
                                    {t('welcome.open')}
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild size="lg">
                                    <Link href={register()}>
                                        {t('welcome.start')}
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost">
                                    <Link href={login()}>
                                        {t('welcome.login')}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
