import { Head, Link } from '@inertiajs/react';
import { LanguageSwitch } from '@/components/language-switch';
import { StampLogo } from '@/components/rao/logo';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

/**
 * Standalone pages (sign in, invite, offline…): the logo stamp, then one letter sheet.
 * หน้าที่ไม่มีแถบบน: แสตมป์โลโก้ + กระดาษจดหมาย 1 แผ่น
 */
export function LetterPage({
    title,
    description,
    head,
    children,
    className,
}: {
    title: React.ReactNode;
    description?: React.ReactNode;
    head?: string;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <>
            {head && <Head title={head} />}
            <div className="relative flex min-h-dvh flex-col items-center px-5 pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                <LanguageSwitch className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4" />
                <Link href={home()} className="press mb-6" aria-label="เรา">
                    <StampLogo className="h-20 w-auto -rotate-6 drop-shadow-[0_6px_10px_rgb(0_0_0/0.12)]" />
                </Link>
                <section
                    className={cn(
                        'paper w-full max-w-sm overflow-hidden',
                        className,
                    )}
                >
                    <div className="airmail-edge h-1.5" />
                    <div className="flex flex-col gap-6 p-6">
                        <header className="flex flex-col gap-1.5">
                            <h1 className="text-3xl leading-tight text-ink">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-ink-soft">
                                    {description}
                                </p>
                            )}
                        </header>
                        {children}
                    </div>
                </section>
            </div>
        </>
    );
}
