import { TopBar } from '@/components/rao/top-bar';
import { useAutoLocation } from '@/hooks/use-auto-location';
import type { AppLayoutProps } from '@/types';

/**
 * Signed-in frame for every page: top bar + content. Phone-first (no sidebar).
 * กรอบของทุกหน้าหลังล็อกอิน: แถบบน + เนื้อหา (ออกแบบสำหรับมือถือก่อน)
 */
export default function AppSidebarLayout({ children }: AppLayoutProps) {
    useAutoLocation();

    return (
        <div className="min-h-dvh">
            <TopBar />
            <main className="min-w-0">{children}</main>
        </div>
    );
}
