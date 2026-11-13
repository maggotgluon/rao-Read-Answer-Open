import { Link, usePage } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { changelog } from '@/routes';
import { show as legal } from '@/routes/legal';

const DOCS = ['privacy', 'terms', 'cookies', 'data-rights'] as const;

/**
 * Small footer on every page: app version (opens the changelog) and every legal page.
 * ท้ายทุกหน้า: เวอร์ชันของแอป (เปิดบันทึกการเปลี่ยนแปลง) และลิงก์เอกสารกฎหมายทุกฉบับ
 */
export function SiteFooter({ className }: { className?: string }) {
    const { t } = useT();
    const app = usePage().props.app as
        | { version: string; build: string }
        | undefined;
    const link =
        'press rounded-sm px-1 py-1 underline-offset-4 hover:text-ink hover:underline';

    return (
        <footer
            className={cn(
                'mx-auto flex w-full max-w-2xl flex-col items-center gap-1 px-4 pt-6 text-center text-xs text-ink-soft',
                className,
            )}
        >
            <nav
                aria-label={t('footer.legal')}
                className="flex flex-wrap justify-center gap-x-2"
            >
                {DOCS.map((d) => (
                    <Link key={d} href={legal.url(d)} className={link}>
                        {t(`legal.${d}`)}
                    </Link>
                ))}
            </nav>
            {app && (
                <Link
                    href={changelog.url()}
                    className={cn(link, 'tabular text-postmark')}
                    title={t('footer.build', { build: app.build })}
                >
                    {t('footer.version', { v: app.version })} ·{' '}
                    {t('footer.changelog')}
                </Link>
            )}
        </footer>
    );
}
