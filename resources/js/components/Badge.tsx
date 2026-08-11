import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'amber' | 'green' | 'muted';

const variantClasses: Record<BadgeVariant, string> = {
    amber: 'bg-amber/15 text-amber-deep',
    green: 'bg-green/10 text-green-deep',
    muted: 'bg-line/60 text-spanish-gray',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export function Badge({ variant = 'muted', className, ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-label font-semibold',
                variantClasses[variant],
                className,
            )}
            {...props}
        />
    );
}
