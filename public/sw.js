/*
 * Rao service worker — kept deliberately small.
 * - Pages: network first; when offline show /offline.
 * - Built assets (/build/*, hashed filenames): cache first.
 * - Never cache API/media/private responses (space data stays off the device cache).
 * Push: shows the notification; tapping it opens (or focuses) the right page.
 *
 * Service worker แบบเล็ก: หน้าเว็บโหลดจากเน็ตก่อน ออฟไลน์แสดง /offline
 * ไฟล์ build แคชไว้ ข้อมูลส่วนตัวไม่แคช
 */
const VERSION = 'rao-v2';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(VERSION)
            .then((cache) =>
                cache.add(new Request(OFFLINE_URL, { cache: 'reload' })),
            ),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== VERSION)
                        .map((k) => caches.delete(k)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(OFFLINE_URL)),
        );
        return;
    }

    if (
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/icons/')
    ) {
        event.respondWith(
            caches.match(request).then(
                (hit) =>
                    hit ||
                    fetch(request).then((res) => {
                        if (res.ok) {
                            const copy = res.clone();
                            caches
                                .open(VERSION)
                                .then((c) => c.put(request, copy));
                        }
                        return res;
                    }),
            ),
        );
    }
});

// Push notifications / การแจ้งเตือน
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { title: 'เรา', body: event.data ? event.data.text() : '' };
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'เรา', {
            body: data.body || '',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: data.tag,
            renotify: Boolean(data.tag),
            data: { url: data.url || '/dashboard' },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const target = new URL(
        event.notification.data?.url || '/dashboard',
        self.location.origin,
    ).href;

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((wins) => {
                for (const w of wins) {
                    if (
                        w.url.startsWith(self.location.origin) &&
                        'focus' in w
                    ) {
                        w.navigate(target);
                        return w.focus();
                    }
                }
                return self.clients.openWindow(target);
            }),
    );
});
