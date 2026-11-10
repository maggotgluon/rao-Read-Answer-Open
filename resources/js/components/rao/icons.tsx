import type { SVGAttributes } from 'react';

/**
 * Rao's own icons, drawn in one stroke (1.75, round) from the letter world.
 * ไอคอนของ เรา วาดเองด้วยเส้นเดียวกันทั้งหมด
 */
type P = SVGAttributes<SVGSVGElement>;

function Base({
    children,
    className,
    ...p
}: P & { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={className ?? 'size-5'}
            {...p}
        >
            {children}
        </svg>
    );
}

/** Today's letter / จดหมายวันนี้ */
export const EnvelopeIcon = (p: P) => (
    <Base {...p}>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="m3.8 7 8.2 6 8.2-6" />
    </Base>
);

/** A sheet of stamps = calendar / แผ่นแสตมป์ = ปฏิทิน */
export const StampsIcon = (p: P) => (
    <Base {...p}>
        <rect
            x="4"
            y="3.5"
            width="16"
            height="17"
            rx="0.5"
            strokeDasharray="0.01 3"
        />
        <rect x="7" y="6.5" width="10" height="11" rx="1" />
        <path d="M9.5 14c1-1.6 1.8-2.4 2.5-2.4s1.4.8 2.5 2.4" />
        <circle cx="14.3" cy="9.3" r="0.9" fill="currentColor" stroke="none" />
    </Base>
);

/** Postcard = moments / โปสการ์ด = ช่วงเวลา */
export const PostcardIcon = (p: P) => (
    <Base {...p}>
        <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
        <path d="M5.5 16l3.5-4 2.5 2.5 2-2 3 3.5" />
        <rect
            x="15.5"
            y="7.5"
            width="3.5"
            height="4"
            rx="0.4"
            strokeDasharray="0.01 1.6"
        />
    </Base>
);

/** Wax seal / ตราครั่ง */
export const SealIcon = (p: P) => (
    <Base {...p}>
        <path d="M12 3.2c1.2 0 1.6 1 2.6 1.3s2-.3 2.8.5.3 1.8.6 2.8 1.3 1.4 1.3 2.6-1 1.6-1.3 2.6.3 2-.5 2.8-1.8.3-2.8.6-1.4 1.3-2.6 1.3-1.6-1-2.6-1.3-2 .3-2.8-.5-.3-1.8-.6-2.8-1.3-1.4-1.3-2.6 1-1.6 1.3-2.6-.3-2 .5-2.8 1.8-.3 2.8-.6S10.8 3.2 12 3.2Z" />
        <path d="M12 14.6s-3-1.8-3-3.7a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.9-3 3.7-3 3.7Z" />
        <path d="M9.5 18.6 8 21.5M14.5 18.6l1.5 2.9" />
    </Base>
);

/** Airmail plane = distance / long-distance / เครื่องบินกระดาษ = ระยะทาง */
export const AirmailIcon = (p: P) => (
    <Base {...p}>
        <path d="M21 3.5 3.5 10.6l6.4 2.6L21 3.5Z" />
        <path d="m21 3.5-11.1 9.7.6 7.3 3.3-4.6 4.9 2.1L21 3.5Z" />
    </Base>
);

/** Postmark ring = dates / ตราประทับ = วันสำคัญ */
export const PostmarkIcon = (p: P) => (
    <Base {...p}>
        <circle cx="10" cy="12" r="7" />
        <path d="M6.5 12h7" />
        <path d="M15.5 8.5c1.3-.9 2.5.9 3.8 0s2.5.9 3.8 0M15.5 15.5c1.3-.9 2.5.9 3.8 0s2.5.9 3.8 0" />
    </Base>
);

/** Pen = write / ปากกา */
export const PenIcon = (p: P) => (
    <Base {...p}>
        <path d="M14.5 5.5 18.5 9.5 8.5 19.5 4 20l.5-4.5 10-10Z" />
        <path d="m13 7 4 4" />
    </Base>
);

/** Mailbox = spaces / ตู้ไปรษณีย์ = space ทั้งหมด */
export const MailboxIcon = (p: P) => (
    <Base {...p}>
        <path d="M5 20.5V11a4 4 0 0 1 8 0v9.5" />
        <path d="M9 7h7a4 4 0 0 1 4 4v9.5H5" />
        <path d="M15 11V7.5M15 7.5h3v2.5h-3" />
        <path d="M12 20.5v-4" />
    </Base>
);

/** Stacked letters = memories / จดหมายเก่า = ความทรงจำ */
export const LettersIcon = (p: P) => (
    <Base {...p}>
        <path d="M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v1" />
        <rect x="3" y="8" width="16.5" height="11.5" rx="1.5" />
        <path d="m3.8 9.5 7.45 5.2 7.45-5.2" />
    </Base>
);
