import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
}

export function Card({ interactive = false, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-lg bg-white shadow-card',
                interactive &&
                    'transition-shadow duration-fast hover:shadow-raised',
                className,
            )}
            {...props}
        />
    );
}
