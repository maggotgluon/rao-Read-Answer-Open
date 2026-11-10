import { Head, Link } from '@inertiajs/react';
import { LanguageSwitch } from '@/components/language-switch';
import { StampLogo } from '@/components/rao/logo';
import { SiteFooter } from '@/components/rao/site-footer';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { changelog, home } from '@/routes';
import { show } from '@/routes/legal';

type Props = {
    doc: string;
    title: string;
    version: string | null;
    effective: string | null;
    html: string;
    docs: string[];
};

/** Legal documents, rendered from Markdown on the server. / เอกสารกฎหมาย */
export default function LegalShow({
    doc,
    title,
    version,
    effective,
    html,
    docs,
}: Props) {
    const { t } = useT();

    return (
        <>
            <Head title={title} />
            <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)]">
                <header className="flex items-center justify-between">
                    <Link href={home()} aria-label="เรา" className="press">
                        <StampLogo className="h-11 w-auto -rotate-6" />
                    </Link>
                    <LanguageSwitch />
                </header>
                <nav className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4">
                    {docs.map((d) => (
                        <Link
                            key={d}
                            href={show.url(d)}
                            className={cn(
                                'press shrink-0 rounded-full px-4 py-2 text-sm',
                                d === doc
                                    ? 'bg-paper font-medium text-ink shadow-paper'
                                    : 'text-ink-soft hover:text-ink',
                            )}
                        >
                            {t(`legal.${d}`)}
                        </Link>
                    ))}
                    <Link
                        href={changelog.url()}
                        className={cn(
                            'press shrink-0 rounded-full px-4 py-2 text-sm',
                            doc === 'changelog'
                                ? 'bg-paper font-medium text-ink shadow-paper'
                                : 'text-ink-soft hover:text-ink',
                        )}
                    >
                        {t('footer.changelog')}
                    </Link>
                </nav>
                <article className="paper overflow-hidden">
                    <div className="airmail-edge h-1.5" />
                    <div className="flex flex-col gap-2 p-5 sm:p-8">
                        <h1 className="text-3xl leading-tight text-ink">
                            {title}
                        </h1>
                        {(version || effective) && doc !== 'changelog' && (
                            <p className="text-xs text-ink-soft">
                                {[
                                    version &&
                                        t('legal.version', { v: version }),
                                    effective &&
                                        t('legal.effective', { d: effective }),
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        )}
                        <div
                            className="legal mt-4"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </div>
                </article>
                <SiteFooter className="pt-2" />
            </div>
        </>
    );
}
