import { Loader2Icon } from '@/components/rao/ui-icons';
import { cn } from '@/lib/utils';

function Spinner({ className }: { className?: string }) {
    return (
        <span role="status" aria-label="Loading" className="inline-flex">
            <Loader2Icon className={cn('size-4 animate-spin', className)} />
        </span>
    );
}

export { Spinner };
