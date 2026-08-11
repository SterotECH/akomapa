import type { InputHTMLAttributes } from 'react';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/utils';

export function Input({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                'w-full rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none placeholder:text-spanish-gray focus:ring-2 focus:ring-amber',
                className,
            )}
            {...props}
        />
    );
}

export function SearchField({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className={cn('relative', className)}>
            <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-spanish-gray"
            />
            <Input type="search" className="pl-10" {...props} />
        </div>
    );
}
