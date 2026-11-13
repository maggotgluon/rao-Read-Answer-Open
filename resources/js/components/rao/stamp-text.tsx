import type { ReactNode } from 'react';
import { organic } from '@/lib/organic';
import { cn } from '@/lib/utils';

/**
 * A rubber-stamped word: bordered, tilted, worn ink (texture-on-text Method 4, see .inked).
 * `seed` keeps the tilt the same every time for the same thing.
 * คำที่ประทับด้วยตรายาง: มีกรอบ เอียง หมึกซีด ค่า seed ทำให้เอียงเท่าเดิมทุกครั้ง
 */
export function StampText({
    children,
    seed = 'stamp',
    className,
}: {
    children: ReactNode;
    seed?: string;
    className?: string;
}) {
    const look = organic(seed, { tilt: 7, shift: 0 });

    return (
        <span
            className={cn('stamp-text inked', className)}
            style={{ ...look, transform: undefined }}
        >
            {children}
        </span>
    );
}
