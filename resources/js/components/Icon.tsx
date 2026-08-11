import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

const size = 24;
const strokeWidth = 1.75;

const paths: Record<IconName, ReactNode> = {
    dashboard: (
        <>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </>
    ),
    pos: (
        <>
            <circle cx="8" cy="21" r="1.2" />
            <circle cx="19" cy="21" r="1.2" />
            <path d="M2.5 2.5h2.1l2.3 11.5a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.2l1.6-7.3H5" />
        </>
    ),
    products: (
        <>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </>
    ),
    stock: (
        <>
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
            <path d="M10 12h4" />
        </>
    ),
    reports: (
        <>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M8 16v-5" />
            <path d="M13 16V6" />
            <path d="M18 16v-3" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
        </>
    ),
};

export type IconName =
    'dashboard' | 'pos' | 'products' | 'stock' | 'reports' | 'logout';

export function Icon({
    name,
    className,
    ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn('size-6', className)}
            {...props}
        >
            {paths[name]}
        </svg>
    );
}
