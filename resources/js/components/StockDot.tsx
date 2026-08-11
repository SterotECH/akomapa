import { cn } from '@/lib/utils';

interface StockDotProps {
    low: boolean;
    className?: string;
}

export function StockDot({ low, className }: StockDotProps) {
    if (low) {
        return (
            <span className={cn('relative flex size-2.5', className)}>
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2.5 rounded-full bg-amber" />
            </span>
        );
    }

    return <span className={cn('size-2.5 rounded-full bg-green', className)} />;
}
