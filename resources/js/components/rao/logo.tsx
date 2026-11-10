import type { SVGAttributes } from 'react';
import { useId } from 'react';

/**
 * The Rao mark: a postage stamp with "เรา" handwritten on it, cancelled by a postmark.
 * โลโก้ เรา: แสตมป์ที่เขียน "เรา" ด้วยลายมือ และมีตราประทับไปรษณีย์
 */
export function StampLogo({
    className,
    title = 'เรา',
    ...props
}: SVGAttributes<SVGSVGElement> & { title?: string }) {
    const id = useId().replace(/:/g, '');
    const holes = [];
    // Perforation: holes every 6 units along a 48×56 stamp. / รูฟันแสตมป์
    for (let x = 3; x <= 45; x += 6) holes.push([x, 0], [x, 56]);
    for (let y = 4; y <= 52; y += 6) holes.push([0, y], [48, y]);

    return (
        <svg
            viewBox="0 0 48 56"
            role="img"
            aria-label={title}
            className={className}
            {...props}
        >
            <defs>
                <mask id={`perf-${id}`}>
                    <rect width="48" height="56" fill="#fff" />
                    {holes.map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="2.3" fill="#000" />
                    ))}
                </mask>
            </defs>
            <rect
                width="48"
                height="56"
                fill="var(--paper, #fffaf8)"
                mask={`url(#perf-${id})`}
            />
            <rect
                x="5"
                y="5"
                width="38"
                height="46"
                rx="1.5"
                fill="var(--stamp, #c92f3c)"
            />
            {/* postmark waves / เส้นตราประทับ */}
            <g
                fill="none"
                stroke="var(--paper, #fffaf8)"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.55"
            >
                <path d="M24 11c3-2 6 2 9 0s6 2 9 0" />
                <path d="M24 15c3-2 6 2 9 0s6 2 9 0" />
                <circle cx="33" cy="13" r="7" strokeDasharray="2 2.2" />
            </g>
            <text
                x="24"
                y="40"
                textAnchor="middle"
                fontFamily="Itim, 'Anuphan', sans-serif"
                fontSize="17"
                fill="var(--stamp-ink, #fff)"
            >
                เรา
            </text>
        </svg>
    );
}

/** Logo + wordmark for headers. / โลโก้พร้อมชื่อ */
export function Wordmark({ className }: { className?: string }) {
    return (
        <span
            className={['flex items-center gap-2', className]
                .filter(Boolean)
                .join(' ')}
        >
            <StampLogo className="h-8 w-auto -rotate-6 drop-shadow-[0_1px_1px_rgb(0_0_0/0.12)]" />
            <span className="hand text-2xl leading-none text-ink">เรา</span>
        </span>
    );
}
