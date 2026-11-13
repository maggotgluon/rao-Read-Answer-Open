import { Head, Link } from '@inertiajs/react';
import { LanguageSwitch } from '@/components/language-switch';
import { StampLogo } from '@/components/rao/logo';
import { useT } from '@/lib/i18n';
import { home } from '@/routes';

/**
 * Public card page: only the card picture someone chose to share, then a quiet line about
 * Rao. No names, no space, no comments. / หน้าการ์ดสาธารณะ: แสดงแค่รูปการ์ด
 */
export default function ShareShow({
    image,
    width,
    height,
}: {
    image: string;
    width: number;
    height: number;
    kind: string;
}) {
    const { t } = useT();

    return (
        <>
            <Head title={t('share.page_title')} />
            <div className="relative flex min-h-dvh flex-col items-center gap-6 px-4 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                <LanguageSwitch className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4" />
                <img
                    src={image}
                    width={width}
                    height={height}
                    alt={t('share.card_alt')}
                    className="h-auto w-full max-w-md rounded-md shadow-paper"
                    style={{ aspectRatio: `${width} / ${height}` }}
                />
                <Link
                    href={home()}
                    className="press flex items-center gap-3 rounded-full bg-paper px-5 py-3 text-sm text-ink shadow-paper"
                >
                    <StampLogo className="h-9 w-auto -rotate-6" />
                    <span>{t('share.about_rao')}</span>
                </Link>
            </div>
        </>
    );
}
