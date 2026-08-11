import type {
    HTMLAttributes,
    PropsWithChildren,
    ThHTMLAttributes,
    TdHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

type Align = 'left' | 'right' | 'center';

export function Table({
    className,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableElement>>) {
    return (
        <table
            className={cn('w-full border-collapse text-body', className)}
            {...props}
        />
    );
}

export function TableHead({
    className,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) {
    return (
        <thead className={cn('border-b border-line', className)} {...props} />
    );
}

export function TableBody({
    className,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) {
    return <tbody className={className} {...props} />;
}

export function TableRow({
    className,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableRowElement>>) {
    return (
        <tr
            className={cn('border-b border-line last:border-0', className)}
            {...props}
        />
    );
}

interface HeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
    align?: Align;
}

export function HeaderCell({
    align = 'left',
    className,
    ...props
}: HeaderCellProps) {
    return (
        <th
            scope="col"
            className={cn(
                'px-3 py-2.5 text-label font-semibold tracking-wide text-spanish-gray uppercase',
                align === 'right' && 'text-right',
                align === 'center' && 'text-center',
                className,
            )}
            {...props}
        />
    );
}

interface CellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    align?: Align;
}

export function Cell({ align = 'left', className, ...props }: CellProps) {
    return (
        <td
            className={cn(
                'px-3 py-3 text-raisin',
                align === 'right' && 'text-right tabular-nums',
                align === 'center' && 'text-center',
                className,
            )}
            {...props}
        />
    );
}
