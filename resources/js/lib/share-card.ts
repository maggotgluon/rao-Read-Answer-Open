/**
 * Share cards drawn on the phone (canvas): nothing is sent to the server. Colours, paper
 * texture, logo and pictures come from the person's CURRENT theme (CSS variables on <html>
 * and theme assets), so a Doodle user gets a Doodle card.
 * การ์ดสำหรับแชร์ วาดบนเครื่อง ไม่ส่งอะไรไปเซิร์ฟเวอร์ ใช้สีและภาพจากธีมที่ผู้ใช้เลือกอยู่
 */
import type { ThemeAsset } from '@/components/rao/asset';

export type CardFormat = 'feed' | 'story';

export const CARD_SIZE: Record<CardFormat, { w: number; h: number }> = {
    feed: { w: 1080, h: 1350 },
    story: { w: 1080, h: 1920 },
};

export type PostcardSpec = {
    kind: 'postcard';
    text: string | null;
    photo: string | null;
    /** e.g. "14 ก.พ. 2567 · คาเฟ่เล็ก ๆ" */
    meta: string | null;
    names: string | null;
};

export type StampSpec = {
    kind: 'stamp';
    label: string;
    number: number | null;
    icon: ThemeAsset | undefined;
    meta: string | null;
    names: string | null;
};

export type CardSpec = PostcardSpec | StampSpec;

type Theme = {
    ground: string;
    paper: string;
    paper2: string;
    ink: string;
    inkSoft: string;
    rule: string;
    stamp: string;
    stampInk: string;
    airmail: string;
    groundImage: string | null;
    paperImage: string | null;
    hand: string;
    sans: string;
};

const sameOrigin = (url: string) => {
    // Photos and theme files are served from this site; a path keeps the canvas exportable
    // even when the page is opened on another host name (www, IP).
    // ใช้ path เดียวกับเว็บนี้ เพื่อให้ส่งออกภาพได้
    try {
        const u = new URL(url, location.href);
        return u.pathname + u.search;
    } catch {
        return url;
    }
};

function readTheme(): Theme {
    const css = getComputedStyle(document.documentElement);
    const v = (k: string, fallback: string) =>
        css.getPropertyValue(`--${k}`).trim() || fallback;
    const img = (k: string) => {
        const m = v(`${k}-image`, 'none').match(/url\(["']?([^"')]+)["']?\)/);
        return m ? sameOrigin(m[1]) : null;
    };
    return {
        ground: v('ground', '#f3e3e7'),
        paper: v('paper', '#fffaf8'),
        paper2: v('paper-2', '#fbeef1'),
        ink: v('ink', '#26305e'),
        inkSoft: v('ink-soft', '#5f5a7e'),
        rule: v('rule', '#ebd0d7'),
        stamp: v('stamp', '#c92f3c'),
        stampInk: v('stamp-ink', '#ffffff'),
        airmail: v('airmail', '#2a5aae'),
        groundImage: img('ground'),
        paperImage: img('paper'),
        hand: v('font-hand', "'Itim', sans-serif"),
        sans: v('font-sans', "'Anuphan', sans-serif"),
    };
}

function load(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const i = new Image();
        i.decoding = 'async';
        i.onload = () => resolve(i);
        i.onerror = () => resolve(null);
        i.src = sameOrigin(src);
    });
}

/** A mono SVG tinted with a colour (like the CSS mask in the app). / ระบายสีไอคอน */
async function tinted(asset: ThemeAsset, color: string, size: number) {
    const img = await load(asset.url);
    if (!img) return null;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    g.drawImage(img, 0, 0, size, size);
    if (asset.mono) {
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = color;
        g.fillRect(0, 0, size, size);
    }
    return c;
}

async function fill(
    g: CanvasRenderingContext2D,
    color: string,
    image: string | null,
    x: number,
    y: number,
    w: number,
    h: number,
) {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
    const tex = image ? await load(image) : null;
    if (tex) {
        const p = g.createPattern(tex, 'repeat');
        if (p) {
            g.save();
            g.globalAlpha = 0.9;
            g.fillStyle = p;
            g.fillRect(x, y, w, h);
            g.restore();
        }
    }
}

/** Break text into lines that fit, Thai-aware (no spaces between Thai words). */
function wrap(
    g: CanvasRenderingContext2D,
    text: string,
    maxW: number,
    maxLines: number,
) {
    const seg =
        typeof Intl !== 'undefined' && 'Segmenter' in Intl
            ? [
                  ...new Intl.Segmenter('th', { granularity: 'word' }).segment(
                      text,
                  ),
              ].map((s) => s.segment)
            : text.split(/(\s+)/);
    const lines: string[] = [];
    for (const para of splitParas(seg)) {
        let line = '';
        for (const word of para) {
            const next = line + word;
            if (g.measureText(next).width > maxW && line.trim()) {
                lines.push(line.trimEnd());
                line = word.trimStart();
            } else {
                line = next;
            }
        }
        lines.push(line.trimEnd());
    }
    if (lines.length > maxLines) {
        const cut = lines.slice(0, maxLines);
        let last = cut[maxLines - 1];
        while (last && g.measureText(last + '…').width > maxW)
            last = last.slice(0, -1);
        cut[maxLines - 1] = last + '…';
        return cut;
    }
    return lines;
}

function splitParas(words: string[]): string[][] {
    const out: string[][] = [[]];
    for (const w of words) {
        const parts = w.split('\n');
        parts.forEach((p, i) => {
            if (i > 0) out.push([]);
            if (p) out[out.length - 1].push(p);
        });
    }
    return out;
}

function roundRect(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
}

/** Draw the card and return a PNG. / วาดการ์ดแล้วคืนเป็น PNG */
export async function drawCard(
    spec: CardSpec,
    format: CardFormat,
    logo: ThemeAsset | undefined,
): Promise<Blob> {
    const t = readTheme();
    const { w, h } = CARD_SIZE[format];
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    // Load the font files for exactly these letters (Thai and Latin come in separate files).
    // โหลดฟอนต์ให้ครบทุกตัวอักษรที่จะวาด
    const words = [
        'เรา · Rao',
        spec.kind === 'postcard' ? (spec.text ?? '') : spec.label,
        spec.meta ?? '',
        spec.names ?? '',
        spec.kind === 'stamp' ? String(spec.number ?? '') : '',
    ].join(' ');
    await Promise.all([
        document.fonts.load(`60px ${t.hand}`, words),
        document.fonts.load(`600 36px ${t.sans}`, words),
        document.fonts.load(`36px ${t.sans}`, words),
    ]).catch(() => {});
    await document.fonts.ready;

    // Desk, then a slightly tilted letter sheet. / พื้นโต๊ะ แล้วกระดาษเอียงเล็กน้อย
    await fill(g, t.ground, t.groundImage, 0, 0, w, h);
    const m = 90;
    const sheet = {
        x: m,
        y: format === 'story' ? 220 : 110,
        w: w - m * 2,
        h: 0,
    };
    sheet.h = h - sheet.y - (format === 'story' ? 300 : 170);

    g.save();
    g.translate(w / 2, sheet.y + sheet.h / 2);
    g.rotate((-1.2 * Math.PI) / 180);
    g.translate(-w / 2, -(sheet.y + sheet.h / 2));
    g.shadowColor = 'rgba(0,0,0,0.18)';
    g.shadowBlur = 50;
    g.shadowOffsetY = 24;
    roundRect(g, sheet.x, sheet.y, sheet.w, sheet.h, 24);
    g.fillStyle = t.paper;
    g.fill();
    g.shadowColor = 'transparent';
    g.save();
    roundRect(g, sheet.x, sheet.y, sheet.w, sheet.h, 24);
    g.clip();
    await fill(g, t.paper, t.paperImage, sheet.x, sheet.y, sheet.w, sheet.h);
    g.restore();

    const inner = {
        x: sheet.x + 64,
        y: sheet.y + 64,
        w: sheet.w - 128,
        h: sheet.h - 128,
    };
    if (spec.kind === 'postcard') {
        await drawPostcard(g, t, spec, inner);
    } else {
        await drawStamp(g, t, spec, inner);
    }
    g.restore();

    // Footer: theme logo + "เรา" / ท้ายการ์ด
    const fy = h - (format === 'story' ? 190 : 85);
    const mark = logo ? await tinted(logo, t.stamp, 96) : null;
    g.font = `44px ${t.hand}`;
    const label = 'เรา · Rao';
    const lw = g.measureText(label).width;
    const total = (mark ? 72 + 18 : 0) + lw;
    let fx = (w - total) / 2;
    if (mark) {
        g.drawImage(mark, fx, fy - 54, 72, 72);
        fx += 90;
    }
    g.fillStyle = t.ink;
    g.textBaseline = 'alphabetic';
    g.fillText(label, fx, fy);

    return new Promise((resolve, reject) =>
        c.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('toBlob'))),
            'image/png',
        ),
    );
}

type Box = { x: number; y: number; w: number; h: number };

async function drawPostcard(
    g: CanvasRenderingContext2D,
    t: Theme,
    s: PostcardSpec,
    box: Box,
) {
    let y = box.y;
    const photo = s.photo ? await load(s.photo) : null;
    const textSize = photo ? 52 : 68;
    g.font = `${textSize}px ${t.hand}`;
    const footH = (s.meta ? 56 : 0) + (s.names ? 56 : 0);
    const lines = s.text ? wrap(g, s.text, box.w, photo ? 4 : 12) : [];
    const textH = lines.length * textSize * 1.35;

    if (photo) {
        const ph = Math.max(
            300,
            box.h - textH - footH - (lines.length ? 50 : 0),
        );
        // cover-crop inside a white photo border / ครอปรูปให้เต็มกรอบ
        g.fillStyle = '#ffffff';
        g.fillRect(box.x, y, box.w, ph);
        const ix = box.x + 16,
            iy = y + 16,
            iw = box.w - 32,
            ih = ph - 32;
        const r = Math.max(iw / photo.width, ih / photo.height);
        const sw = iw / r,
            sh = ih / r;
        g.drawImage(
            photo,
            (photo.width - sw) / 2,
            (photo.height - sh) / 2,
            sw,
            sh,
            ix,
            iy,
            iw,
            ih,
        );
        y += ph + 50;
    } else {
        y += Math.max(0, (box.h - textH - footH) / 2 - 20);
    }

    g.fillStyle = t.ink;
    g.textBaseline = 'top';
    g.font = `${textSize}px ${t.hand}`;
    for (const line of lines) {
        g.fillText(line, box.x, y);
        y += textSize * 1.35;
    }

    g.font = `34px ${t.sans}`;
    g.fillStyle = t.inkSoft;
    let fy = box.y + box.h - footH + 10;
    for (const line of [s.meta, s.names]) {
        if (!line) continue;
        g.fillText(wrap(g, line, box.w, 1)[0], box.x, fy);
        fy += 56;
    }
}

async function drawStamp(
    g: CanvasRenderingContext2D,
    t: Theme,
    s: StampSpec,
    box: Box,
) {
    const size = Math.min(box.w * 0.62, 560);
    const cx = box.x + box.w / 2;
    const top = box.y + (box.h - size - 330) / 2;

    // Perforated edge: a stamp face with half-circle holes along each side.
    // ขอบแสตมป์แบบรูปรุ
    const x = cx - size / 2,
        y = top,
        hole = 14,
        step = 40;
    g.save();
    g.fillStyle = t.paper2;
    g.fillRect(x - 22, y - 22, size + 44, size + 44);
    g.fillStyle = t.paper; // holes show the sheet / รูรุเห็นกระดาษด้านหลัง
    for (let i = x - 22 + step / 2; i < x + size + 22; i += step) {
        for (const yy of [y - 22, y + size + 22]) {
            g.beginPath();
            g.arc(i, yy, hole, 0, Math.PI * 2);
            g.fill();
        }
    }
    for (let j = y - 22 + step / 2; j < y + size + 22; j += step) {
        for (const xx of [x - 22, x + size + 22]) {
            g.beginPath();
            g.arc(xx, j, hole, 0, Math.PI * 2);
            g.fill();
        }
    }
    g.restore();
    g.fillStyle = t.stamp;
    g.fillRect(x, y, size, size);

    const icon = s.icon ? await tinted(s.icon, t.stampInk, 256) : null;
    const hasNum = s.number !== null;
    const iconSize = size * (hasNum ? 0.42 : 0.55);
    if (icon)
        g.drawImage(
            icon,
            cx - iconSize / 2,
            y + size * (hasNum ? 0.14 : 0.22),
            iconSize,
            iconSize,
        );
    if (hasNum) {
        g.fillStyle = t.stampInk;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.font = `600 ${Math.round(size * 0.26)}px ${t.sans}`;
        g.fillText(String(s.number), cx, y + size * 0.88);
    }

    g.textAlign = 'center';
    g.textBaseline = 'top';
    g.fillStyle = t.ink;
    g.font = `78px ${t.hand}`;
    let ty = y + size + 90;
    for (const line of wrap(g, s.label, box.w, 2)) {
        g.fillText(line, cx, ty);
        ty += 100;
    }
    g.font = `34px ${t.sans}`;
    g.fillStyle = t.inkSoft;
    for (const line of [s.meta, s.names]) {
        if (!line) continue;
        g.fillText(wrap(g, line, box.w, 1)[0], cx, ty + 10);
        ty += 56;
    }
    g.textAlign = 'start';
}

/**
 * Share through the phone's share sheet when it can take files; otherwise download.
 * แชร์ผ่านเมนูแชร์ของมือถือ ถ้าไม่ได้ให้บันทึกรูป
 */
export async function shareOrSave(
    blob: Blob,
    name: string,
): Promise<'shared' | 'saved' | 'cancelled'> {
    const file = new File([blob], `${name}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file] });
            return 'shared';
        } catch {
            return 'cancelled';
        }
    }
    saveImage(blob, name);
    return 'saved';
}

export function saveImage(blob: Blob, name: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
