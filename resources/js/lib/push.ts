/**
 * Web push helpers. iPhone/iPad: push only works after "Add to Home Screen" (iOS 16.4+).
 * ฟังก์ชันแจ้งเตือน — บน iPhone ต้อง "เพิ่มไปยังหน้าจอโฮม" ก่อน
 */
import { router } from '@inertiajs/react';

export type PushState =
    | 'unsupported'
    | 'needs-install'
    | 'denied'
    | 'off'
    | 'on';

export const isIos = (): boolean =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isStandalone = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

const xsrf = (): string =>
    decodeURIComponent(
        document.cookie
            .split('; ')
            .find((c) => c.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? '',
    );

export const api = (url: string, method: string, body: unknown) =>
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': xsrf(),
        },
        body: JSON.stringify(body),
        credentials: 'same-origin',
    });

function keyToBytes(base64: string): Uint8Array<ArrayBuffer> {
    const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const raw = atob(padded);
    const out = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

export async function pushState(): Promise<PushState> {
    if (isIos() && !isStandalone()) return 'needs-install';
    if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
    )
        return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub && Notification.permission === 'granted' ? 'on' : 'off';
}

export async function enablePush(vapidPublicKey: string): Promise<PushState> {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted')
        return permission === 'denied' ? 'denied' : 'off';

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: keyToBytes(vapidPublicKey),
        }));

    const json = sub.toJSON();
    const encodings = (
        PushManager as unknown as { supportedContentEncodings?: string[] }
    ).supportedContentEncodings;
    await api('/settings/push-subscriptions', 'POST', {
        endpoint: json.endpoint,
        keys: json.keys,
        contentEncoding: encodings?.includes('aes128gcm')
            ? 'aes128gcm'
            : (encodings?.[0] ?? 'aes128gcm'),
    });
    router.reload({ only: ['devices'] });

    return 'on';
}

export async function disablePush(): Promise<PushState> {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
        await api('/settings/push-subscriptions', 'DELETE', {
            endpoint: sub.endpoint,
        });
        await sub.unsubscribe();
    }
    router.reload({ only: ['devices'] });

    return 'off';
}

export const sendTestPush = () => api('/settings/push-test', 'POST', {});
