import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

const size = 24;
const strokeWidth = 1.75;

export type IconName =
    | 'dashboard'
    | 'pos'
    | 'products'
    | 'stock'
    | 'reports'
    | 'categories'
    | 'logout'
    | 'search'
    | 'cart'
    | 'plus'
    | 'minus'
    | 'close'
    | 'check'
    | 'print'
    | 'download'
    | 'warning'
    | 'clock'
    | 'barcode'
    | 'filter'
    | 'arrow-right'
    | 'sun'
    | 'moon'
    | 'menu'
    | 'tag'
    | 'edit'
    | 'trash'
    | 'eye'
    | 'arrow-left';

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
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </>
    ),
    cart: (
        <>
            <circle cx="8" cy="21" r="1.2" />
            <circle cx="19" cy="21" r="1.2" />
            <path d="M2.5 2.5h2.1l2.3 11.5a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.2l1.6-7.3H5" />
        </>
    ),
    plus: (
        <>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </>
    ),
    minus: <path d="M5 12h14" />,
    close: (
        <>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    print: (
        <>
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
        </>
    ),
    download: (
        <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
            <path d="M12 15V3" />
        </>
    ),
    warning: (
        <>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    barcode: (
        <>
            <path d="M3 5v14" />
            <path d="M7 5v14" />
            <path d="M11 5v10" />
            <path d="M15 5v14" />
            <path d="M19 5v10" />
            <path d="M21 5v14" />
        </>
    ),
    filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />,
    'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
    ),
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    categories: (
        <>
            <path d="M4 7V4h3v3" />
            <path d="M4 17v3h3v-3" />
            <path d="M20 7V4h-3v3" />
            <path d="M20 17v3h-3v-3" />
            <path d="M14 4h6v16h-6" />
            <path d="M4 12h16" />
        </>
    ),
    tag: (
        <>
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
        </>
    ),
    edit: (
        <>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </>
    ),
    trash: (
        <>
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    'arrow-left': (
        <>
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
        </>
    ),
};

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
