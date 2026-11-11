import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { LanguageSwitch } from '@/components/language-switch';
import { Asset } from '@/components/rao/asset';
import { SiteFooter } from '@/components/rao/site-footer';
import { SealIcon } from '@/components/rao/icons';
import { StampLogo } from '@/components/rao/logo';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { dashboard, login, register } from '@/routes';
import { show as legal } from '@/routes/legal';

/**
 * Welcome: show the idea, not a pitch: two letters, yours sealed, theirs opening.
 * หน้าแรก: จดหมายสองฉบับ ของคุณปิดผนึกแล้ว ของอีกฝ่ายกำลังเปิด
 */
export default function Welcome() {
    const { auth } = usePage().props;
    const { t } = useT();

    return (
        <>
            <Head title={t('app.tagline')}>
                <meta name="description" content={t('home.meta')} />
            </Head>
            <div className="relative flex min-h-dvh flex-col px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
                    <StampLogo className="h-12 w-auto -rotate-6" />
                    <nav className="flex items-center gap-1 text-sm text-ink-soft">
                        <a
                            href="#how"
                            className="press hidden rounded-full px-3 py-2 hover:text-ink sm:inline"
                        >
                            {t('home.nav_how')}
                        </a>
                        <a
                            href="#faq"
                            className="press hidden rounded-full px-3 py-2 hover:text-ink sm:inline"
                        >
                            {t('home.nav_faq')}
                        </a>
                        <LanguageSwitch />
                    </nav>
                </header>

                <main className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col justify-center gap-8 py-8">
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
                        <Asset
                            name="decor.welcome"
                            className="size-12 text-stamp"
                        />
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

                {!auth.user && <Guide />}

                <SiteFooter />
            </div>
        </>
    );
}

/* ── For visitors: what Rao is and how to use it / สำหรับคนที่ยังไม่มีบัญชี ── */

const STEPS = [
    { icon: 'icons.envelope', n: 1 },
    { icon: 'icons.lightbulb', n: 2 },
    { icon: 'icons.seal', n: 3 },
    { icon: 'icons.letters', n: 4 },
    { icon: 'icons.stamps', n: 5 },
];

const FEATURES = [
    { icon: 'icons.postcard', key: 'moments' },
    { icon: 'dates.anniversary', key: 'dates' },
    { icon: 'moods.happy', key: 'mood' },
    { icon: 'icons.airmail', key: 'ld' },
    { icon: 'icons.bell-ring', key: 'nudge' },
    { icon: 'icons.sparkles', key: 'themes' },
];

function Guide() {
    const { t } = useT();

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-20 py-10">
            <Section
                id="how"
                title={t('home.how_title')}
                sub={t('home.how_sub')}
            >
                <ol className="flex flex-col gap-3">
                    {STEPS.map((s, i) => (
                        <li
                            key={s.n}
                            className="paper flex items-start gap-4 p-4 sm:p-5"
                            style={{
                                transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)`,
                            }}
                        >
                            <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-stamp-soft text-stamp">
                                <Asset name={s.icon} className="size-6" />
                                <span className="tabular absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-stamp text-[11px] font-semibold text-stamp-ink">
                                    {s.n}
                                </span>
                            </span>
                            <div className="flex flex-col gap-1">
                                <h3 className="hand text-xl leading-tight text-ink">
                                    {t(`home.step${s.n}_title`)}
                                </h3>
                                <p className="text-ink-soft">
                                    {t(`home.step${s.n}_body`)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section title={t('home.more_title')} sub={t('home.more_sub')}>
                <ul className="grid gap-3 sm:grid-cols-2">
                    {FEATURES.map((f) => (
                        <li key={f.key} className="paper flex gap-3 p-4">
                            <Asset
                                name={f.icon}
                                className="mt-0.5 size-7 shrink-0 text-airmail"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-medium text-ink">
                                    {t(`home.f_${f.key}_title`)}
                                </h3>
                                <p className="text-sm text-ink-soft">
                                    {t(`home.f_${f.key}_body`)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Section>

            <section className="paper overflow-hidden">
                <div className="airmail-edge h-1.5" />
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-8">
                    <Asset
                        name="icons.lock-keyhole"
                        className="size-10 shrink-0 text-stamp"
                    />
                    <div className="flex flex-col gap-3">
                        <h2 className="text-3xl leading-tight text-ink">
                            {t('home.private_title')}
                        </h2>
                        <p className="text-ink-soft">
                            {t('home.private_body')}
                        </p>
                        <ul className="flex flex-col gap-1.5 text-sm text-ink">
                            {[1, 2, 3].map((n) => (
                                <li key={n} className="flex items-center gap-2">
                                    <Asset
                                        name="icons.check"
                                        className="size-4 shrink-0 text-stamp"
                                    />
                                    {t(`home.private_${n}`)}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href={legal.url('privacy')}
                            className="self-start text-sm text-airmail underline underline-offset-4"
                        >
                            {t('home.private_link')}
                        </Link>
                    </div>
                </div>
            </section>

            <Section
                title={t('home.install_title')}
                sub={t('home.install_body')}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    {['ios', 'android'].map((p) => (
                        <p
                            key={p}
                            className="paper flex items-center gap-3 p-4 text-sm text-ink"
                        >
                            <Asset
                                name="icons.square-plus"
                                className="size-6 shrink-0 text-airmail"
                            />
                            {t(`home.install_${p}`)}
                        </p>
                    ))}
                </div>
            </Section>

            <Section id="faq" title={t('home.faq_title')}>
                <div className="paper divide-y divide-rule">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <details key={n} className="group px-5 py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                                {t(`home.faq${n}_q`)}
                                <Asset
                                    name="icons.chevron-down"
                                    className="size-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
                                />
                            </summary>
                            <p className="pt-2 text-ink-soft">
                                {t(`home.faq${n}_a`)}
                            </p>
                        </details>
                    ))}
                </div>
            </Section>

            <section className="flex flex-col items-center gap-4 text-center">
                <Asset name="decor.welcome" className="size-14 text-stamp" />
                <h2 className="text-3xl leading-tight text-ink">
                    {t('home.cta_title')}
                </h2>
                <p className="text-ink-soft">{t('home.cta_body')}</p>
                <div className="flex w-full max-w-xs flex-col gap-2">
                    <Button asChild size="lg">
                        <Link href={register()}>{t('welcome.start')}</Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href={login()}>{t('welcome.login')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}

function Section({
    id,
    title,
    sub,
    children,
}: {
    id?: string;
    title: string;
    sub?: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="flex scroll-mt-6 flex-col gap-5">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl leading-tight text-ink">{title}</h2>
                {sub && <p className="text-ink-soft">{sub}</p>}
            </header>
            {children}
        </section>
    );
}
