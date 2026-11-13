import { Asset } from '@/components/rao/asset';
import { cn } from '@/lib/utils';

/**
 * The Rao mark: a postage stamp with "เรา" handwritten on it. The picture is
 * logo/stamp.png (or .svg) in the theme folder. / โลโก้มาจากไฟล์ในโฟลเดอร์ธีม
 */
export function StampLogo({
    className,
    title = 'เรา',
}: {
    className?: string;
    title?: string;
}) {
    return (
        <Asset
            name="logo.stamp"
            alt={title}
            className={cn('aspect-[48/56] h-12 w-auto', className)}
        />
    );
}

/** Logo + wordmark for headers. / โลโก้พร้อมชื่อ */
export function Wordmark({ className }: { className?: string }) {
    return (
        <span className={cn('flex items-center gap-2', className)}>
            <StampLogo
                className="h-8 -rotate-6 drop-shadow-[0_1px_1px_rgb(0_0_0/0.12)]"
                title=""
            />
            <span className="hand inked text-2xl leading-none text-ink [--gx:37px] [--gy:91px]">
                เรา
            </span>
        </span>
    );
}
