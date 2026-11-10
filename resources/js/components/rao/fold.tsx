import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A quiet fold-away section: a ruled line on the desk, not another card.
 * ส่วนที่พับเก็บได้ (เส้นคั่น ไม่ใช่การ์ดซ้อนการ์ด)
 */
export function Fold({
    title,
    count,
    icon,
    children,
    defaultOpen,
    className,
}: {
    title: React.ReactNode;
    count?: number;
    icon?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}) {
    return (
        <details
            open={defaultOpen}
            className={cn('group border-t border-rule', className)}
        >
            <summary className="press flex min-h-14 cursor-pointer list-none items-center gap-3 py-3 text-ink [&::-webkit-details-marker]:hidden">
                {icon && <span className="text-ink-soft">{icon}</span>}
                <span className="flex-1 font-medium">
                    {title}
                    {count !== undefined && (
                        <span className="ml-1.5 text-sm font-normal text-ink-soft">
                            {count}
                        </span>
                    )}
                </span>
                <ChevronDown
                    strokeWidth={1.75}
                    className="size-5 text-ink-soft transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-180"
                />
            </summary>
            <div className="flex flex-col gap-3 pb-5">{children}</div>
        </details>
    );
}
