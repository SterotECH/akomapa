import type {
    HTMLAttributes,
    PropsWithChildren,
    ThHTMLAttributes,
    TdHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

type Align = 'left' | 'right' | 'center';

export function DataTable({
    className,
    stickyHeader = false,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableElement>> & {
    stickyHeader?: boolean;
}) {
    return (
        <div className="w-full overflow-x-auto">
            <table
                className={cn(
                    'w-full border-collapse text-body',
                    stickyHeader && '[&>thead]:sticky [&>thead]:top-0 [&>thead]:z-10',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

export function Table({
    className,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableElement>>) {
    return <DataTable className={className} {...props} />;
}

export function TableHead({
    className,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) {
    return (
        <thead
            className={cn(
                'border-b border-line bg-linen/95 backdrop-blur-sm',
                className,
            )}
            {...props}
        />
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
            className={cn(
                'border-b border-line transition-colors duration-fast hover:bg-raisin/[0.02] last:border-0',
                className,
            )}
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
                'px-3 py-2.5 text-label font-semibold tracking-wide text-spanish-gray uppercase whitespace-nowrap',
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
                'px-3 py-3 text-raisin whitespace-nowrap',
                align === 'right' && 'text-right tabular-nums',
                align === 'center' && 'text-center',
                className,
            )}
            {...props}
        />
    );
}
