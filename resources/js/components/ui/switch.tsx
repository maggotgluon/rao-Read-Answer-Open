import { cn } from '@/lib/utils';

/** On/off switch (accessible button). / สวิตช์เปิด-ปิด */
export function Switch({
    checked,
    onCheckedChange,
    disabled,
    className,
    ...props
}: {
    checked: boolean;
    onCheckedChange: (on: boolean) => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
    id?: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'press relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
                checked ? 'bg-stamp' : 'bg-ink/20',
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    'absolute top-1 size-5 rounded-full bg-paper shadow-paper transition-[left] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    checked ? 'left-6' : 'left-1',
                )}
            />
        </button>
    );
}
