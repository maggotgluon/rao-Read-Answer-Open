import { useEffect } from 'react';
import { open } from '@/routes/analytics';

/**
 * Tells the server "the app was opened" once per visit (where from: push / home-screen
 * app / browser). The server drops it unless the person opted in to analytics.
 * แจ้งว่าเปิดแอป 1 ครั้งต่อการเข้าใช้ (เซิร์ฟเวอร์จะทิ้งถ้าไม่ได้ยินยอม)
 */
export function useAppOpen(enabled: boolean) {
    useEffect(() => {
        if (!enabled || sessionStorage.getItem('rao-open')) return;
        sessionStorage.setItem('rao-open', '1');

        const url = new URL(window.location.href);
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (navigator as Navigator & { standalone?: boolean }).standalone ===
                true;
        const source =
            url.searchParams.get('src') === 'push'
                ? 'push'
                : standalone
                  ? 'pwa'
                  : 'browser';
        const token = decodeURIComponent(
            document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
        );

        fetch(open.url(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': token,
                Accept: 'application/json',
            },
            body: JSON.stringify({ source, standalone }),
            keepalive: true,
        }).catch(() => {});

        // Clean the marker from the address bar. / ลบ ?src=push ออกจากแถบที่อยู่
        if (url.searchParams.has('src')) {
            url.searchParams.delete('src');
            window.history.replaceState(
                window.history.state,
                '',
                url.toString(),
            );
        }
    }, [enabled]);
}
