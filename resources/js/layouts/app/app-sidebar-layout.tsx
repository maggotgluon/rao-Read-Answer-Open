import { SiteFooter } from '@/components/rao/site-footer';
import { TopBar } from '@/components/rao/top-bar';
import { usePage } from '@inertiajs/react';
import { useAppOpen } from '@/hooks/use-app-open';
import { useAutoLocation } from '@/hooks/use-auto-location';
import type { AppLayoutProps } from '@/types';

/**
 * Signed-in frame for every page: top bar + content. Phone-first (no sidebar).
 * กรอบของทุกหน้าหลังล็อกอิน: แถบบน + เนื้อหา (ออกแบบสำหรับมือถือก่อน)
 */
export default function AppSidebarLayout({ children }: AppLayoutProps) {
    useAutoLocation();
    const page = usePage();
    useAppOpen(Boolean(page.props.auth.user));
    // Space tabs sit fixed at the bottom on phones; keep the footer above them.
    // หน้า space มีแถบแท็บด้านล่างบนมือถือ เว้นที่ให้ท้ายหน้า
    const tabbed = ['spaces/show', 'spaces/daily', 'spaces/moments'].includes(
        page.component,
    );

    return (
        <div className="flex min-h-dvh flex-col">
            <TopBar />
            <main className="min-w-0 flex-1">{children}</main>
            <SiteFooter
                className={
                    tabbed
                        ? 'pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-8'
                        : 'pb-[calc(env(safe-area-inset-bottom)+1.5rem)]'
                }
            />
        </div>
    );
}
