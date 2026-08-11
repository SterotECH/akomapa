import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'rounded-sm bg-line/70 motion-safe:animate-pulse',
                className,
            )}
        />
    );
}
