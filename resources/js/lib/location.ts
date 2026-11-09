/**
 * Automatic location update when the app opens (only if the person turned sharing on).
 * Low accuracy is enough — the server rounds to ~5 km anyway. At most every 30 minutes.
 * อัปเดตตำแหน่งอัตโนมัติเมื่อเปิดแอป (เฉพาะคนที่เปิดแชร์) ความละเอียดต่ำพอ เพราะเซิร์ฟเวอร์ปัดเป็น ~5 กม.
 */
import { api } from '@/lib/push';

const KEY = 'rao.loc.at';
const EVERY_MS = 30 * 60 * 1000;

export function maybeUpdateLocation(force = false): Promise<boolean> {
    return new Promise((resolve) => {
        if (!('geolocation' in navigator)) return resolve(false);
        const last = Number(localStorage.getItem(KEY) ?? 0);
        if (!force && Date.now() - last < EVERY_MS) return resolve(false);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const res = await api('/location', 'POST', {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                });
                if (res.ok) localStorage.setItem(KEY, String(Date.now()));
                resolve(res.ok);
            },
            () => resolve(false),
            { enableHighAccuracy: false, maximumAge: EVERY_MS, timeout: 15000 },
        );
    });
}

/** "21:40" in the partner's timezone. / เวลาท้องถิ่นของอีกฝ่าย */
export function timeIn(tz: string, locale: string): string {
    return new Date().toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
    });
}
