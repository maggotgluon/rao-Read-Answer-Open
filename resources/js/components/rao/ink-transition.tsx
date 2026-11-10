import { Link, router } from '@inertiajs/react';
import type { ComponentProps, CSSProperties, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAsset } from '@/components/rao/asset';

/**
 * Ink-bleed page transition (CodyHouse "Ink Transition Effect"): a one-row PNG sprite
 * (theme file textures/ink.png, `ink-frames` frames of any shape) stepped with steps(). The sprite is a
 * CSS mask, so the ink takes the theme's colour. Used for a few doorways only (entering a
 * space, opening today's letter) so quick check-ins stay quick; skipped for reduced motion.
 * เปลี่ยนหน้าด้วยหมึกซึม ใช้เฉพาะจุดสำคัญ ข้ามถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว
 */
type State = 'idle' | 'cover' | 'covered' | 'reveal';
type Controller = {
    cover: (colour?: string) => Promise<void>;
    reveal: () => Promise<void>;
};

let ctl: Controller | null = null;

const reduced = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ink = {
    available: () => ctl !== null && !reduced(),

    /** Cover with ink, go, then let the ink drain away. / หมึกท่วม ไปหน้าใหม่ แล้วหมึกจาง */
    async visit(href: string, colour?: string) {
        if (!ctl || reduced()) {
            router.visit(href);

            return;
        }

        const c = ctl;
        await c.cover(colour);
        router.visit(href, { onFinish: () => void c.reveal() });
    },
};

export function InkTransition() {
    const sprite = useAsset('textures.ink');
    const [state, setState] = useState<State>('idle');
    const [colour, setColour] = useState<string | undefined>();
    const [ready, setReady] = useState(false);
    // frame width / height of one sprite frame (any shape) / สัดส่วนของ 1 เฟรม
    const [aspect, setAspect] = useState(1);
    const [box, setBox] = useState({ w: 0, h: 0 });
    const done = useRef<(() => void) | null>(null);

    // Load the sprite when the browser is idle, never blocking first paint.
    // โหลดภาพตอนเบราว์เซอร์ว่าง ไม่ถ่วงการเปิดหน้า
    useEffect(() => {
        if (!sprite) return;
        const load = () => {
            const img = new Image();
            img.onload = () => {
                const frames =
                    Number(
                        getComputedStyle(
                            document.documentElement,
                        ).getPropertyValue('--ink-frames'),
                    ) || 25;
                setAspect(img.naturalWidth / frames / img.naturalHeight);
                setReady(true);
            };
            img.src = sprite.url;
        };
        const idle = typeof window.requestIdleCallback === 'function';
        const id = idle
            ? window.requestIdleCallback(load)
            : setTimeout(load, 800);

        return () => {
            if (idle) window.cancelIdleCallback(id as number);
            else clearTimeout(id);
        };
    }, [sprite]);

    // Scale one frame to cover the screen, keeping its shape (CodyHouse setLayerDimensions).
    // ขยายเฟรมให้คลุมจอโดยไม่บิดสัดส่วน
    useEffect(() => {
        const fit = () => {
            const vw = window.innerWidth * 1.05;
            const vh = window.innerHeight * 1.05;
            setBox(
                vw / vh > aspect
                    ? { w: vw, h: vw / aspect }
                    : { w: vh * aspect, h: vh },
            );
        };
        fit();
        window.addEventListener('resize', fit);

        return () => window.removeEventListener('resize', fit);
    }, [aspect]);

    useEffect(() => {
        if (!ready) return;
        const play = (next: State, after: State) =>
            new Promise<void>((resolve) => {
                done.current = () => {
                    done.current = null;
                    setState(after);
                    resolve();
                };
                setState(next);
                // safety net if animationend never fires / กันกรณี animationend ไม่มา
                window.setTimeout(() => done.current?.(), 1200);
            });
        ctl = {
            cover: (c) => {
                setColour(c);

                return play('cover', 'covered');
            },
            reveal: () => play('reveal', 'idle'),
        };

        return () => {
            ctl = null;
        };
    }, [ready]);

    if (!sprite) return null;
    const frames =
        typeof window === 'undefined'
            ? 25
            : Number(
                  getComputedStyle(document.documentElement).getPropertyValue(
                      '--ink-frames',
                  ),
              ) || 25;

    return (
        <div aria-hidden className="ink-layer" data-state={state}>
            <div
                className="ink-frames"
                onAnimationEnd={() => done.current?.()}
                style={
                    {
                        '--sprite': `url("${sprite.url}")`,
                        '--frames': frames,
                        '--ink-steps': `steps(${frames - 1})`,
                        '--fw': `${Math.ceil(box.w)}px`,
                        '--fh': `${Math.ceil(box.h)}px`,
                        '--ink-colour': colour,
                    } as CSSProperties
                }
            />
        </div>
    );
}

/** A Link that walks through ink. Modifier-clicks behave like a normal link. / ลิงก์ที่เปลี่ยนหน้าด้วยหมึก */
export function InkLink({
    href,
    colour,
    onClick,
    ...props
}: ComponentProps<typeof Link> & { href: string; colour?: string }) {
    return (
        <Link
            href={href}
            {...props}
            onClick={(e: MouseEvent<Element>) => {
                onClick?.(e);
                if (
                    e.defaultPrevented ||
                    e.metaKey ||
                    e.ctrlKey ||
                    e.shiftKey ||
                    (e as MouseEvent).button !== 0
                )
                    return;
                if (!ink.available()) return;
                e.preventDefault();
                void ink.visit(href, colour);
            }}
        />
    );
}
