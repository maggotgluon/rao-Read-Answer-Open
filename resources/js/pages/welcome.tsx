import { Head, Link, usePage } from '@inertiajs/react';
import { LanguageSwitch } from '@/components/language-switch';
import { SealIcon } from '@/components/rao/icons';
import { StampLogo } from '@/components/rao/logo';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { dashboard, login, register } from '@/routes';

/**
 * Welcome: show the idea, not a pitch: two letters, yours sealed, theirs opening.
 * หน้าแรก: จดหมายสองฉบับ ของคุณปิดผนึกแล้ว ของอีกฝ่ายกำลังเปิด
 */
export default function Welcome() {
    const { auth } = usePage().props;
    const { t } = useT();

    return (
        <>
            <Head title={t('app.tagline')} />
            <div className="relative flex min-h-dvh flex-col px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                <header className="flex items-center justify-between">
                    <StampLogo className="h-12 w-auto -rotate-6" />
                    <LanguageSwitch />
                </header>

                <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-8">
                    <div className="relative h-56" aria-hidden>
                        {/* their letter, opening / จดหมายของอีกฝ่าย */}
                        <div className="paper animate-arrive absolute top-0 right-2 w-[70%] rotate-3 overflow-hidden">
                            <div className="h-1.5 bg-airmail" />
                            <div className="p-4">
                                <span className="text-xs text-airmail">
                                    {t('welcome.demo_partner')}
                                </span>
                                <p className="hand mt-1 text-lg leading-snug text-ink">
                                    {t('welcome.demo_their')}
                                </p>
                            </div>
                        </div>
                        {/* your letter, sealed / จดหมายของคุณ */}
                        <div className="paper absolute bottom-0 left-2 w-[70%] -rotate-2 overflow-visible">
                            <div className="airmail-edge h-1.5 rounded-t-[var(--radius)]" />
                            <div className="relative p-4">
                                <span className="text-xs text-stamp">
                                    {t('welcome.demo_you')}
                                </span>
                                <p className="hand mt-1 text-lg leading-snug text-ink">
                                    {t('welcome.demo_mine')}
                                </p>
                                <span className="animate-seal absolute -top-4 -right-4 grid size-12 place-items-center rounded-full bg-stamp text-stamp-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.18)]">
                                    <SealIcon className="size-6" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h1 className="text-4xl leading-tight text-ink">
                            {t('welcome.title')}
                        </h1>
                        <p className="text-lg text-ink-soft">
                            {t('welcome.body')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
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
