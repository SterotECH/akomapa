import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'plain' | 'danger';
type ButtonSize = 'sm' | 'md';

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-amber text-amber-ink hover:bg-amber-deep',
    plain: 'bg-transparent text-raisin hover:bg-raisin/5',
    danger: 'bg-transparent text-danger hover:bg-danger/5',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-label md:min-h-10',
    md: 'px-4 py-2.5 text-title min-h-11',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-fast active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    );
}
