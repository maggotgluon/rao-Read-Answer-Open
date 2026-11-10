import type { CSSProperties } from 'react';

/**
 * Hand-made wobble that is random-looking but stable: the same key (e.g. a date) always
 * gets the same tilt and offset, on the server and in the browser (no hydration jumps).
 * ความเอียง/เลื่อนแบบสุ่มแต่คงที่: key เดิมได้ค่าเดิมเสมอ ทั้งฝั่งเซิร์ฟเวอร์และเบราว์เซอร์
 */
export function seeded(key: string): () => number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }

    return () => {
        h += 0x6d2b79f5;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Tilt + nudge + where the worn-ink texture sits. / เอียง เลื่อน และตำแหน่งรอยหมึก */
export function organic(
    key: string,
    { tilt = 5, shift = 1.5 }: { tilt?: number; shift?: number } = {},
): CSSProperties {
    const r = seeded(key);
    const deg = r2((r() * 2 - 1) * tilt);
    const x = r2((r() * 2 - 1) * shift);
    const y = r2((r() * 2 - 1) * shift);

    return {
        transform: `translate(${x}px, ${y}px) rotate(${deg}deg)`,
        ['--tilt' as string]: `${deg}deg`,
        ['--gx' as string]: `${Math.round(r() * 240)}px`,
        ['--gy' as string]: `${Math.round(r() * 240)}px`,
    };
}

/** Only the texture offset (for things that must not move). / เลื่อนเฉพาะรอยหมึก */
export function grungeAt(key: string): CSSProperties {
    const r = seeded(key);

    return {
        ['--gx' as string]: `${Math.round(r() * 240)}px`,
        ['--gy' as string]: `${Math.round(r() * 240)}px`,
    };
}
