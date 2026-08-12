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
    sm: 'px-3 py-1.5 text-label',
    md: 'px-4 py-2.5 text-title',
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
                'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-fast disabled:pointer-events-none disabled:opacity-40',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    );
}
