import type { SVGProps } from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Warehouse,
    BarChart3,
    Tags,
    LogOut,
    Search,
    Plus,
    Minus,
    X,
    Check,
    Printer,
    Download,
    TriangleAlert,
    Clock,
    ScanBarcode,
    Filter,
    ArrowRight,
    Sun,
    Moon,
    Menu,
    Tag,
    Pencil,
    Trash2,
    Eye,
    ArrowLeft,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const icons: Record<IconName, LucideIcon> = {
    dashboard: LayoutDashboard,
    pos: ShoppingCart,
    products: Package,
    stock: Warehouse,
    reports: BarChart3,
    categories: Tags,
    logout: LogOut,
    search: Search,
    cart: ShoppingCart,
    plus: Plus,
    minus: Minus,
    close: X,
    check: Check,
    print: Printer,
    download: Download,
    warning: TriangleAlert,
    clock: Clock,
    barcode: ScanBarcode,
    filter: Filter,
    'arrow-right': ArrowRight,
    sun: Sun,
    moon: Moon,
    menu: Menu,
    tag: Tag,
    edit: Pencil,
    trash: Trash2,
    eye: Eye,
    'arrow-left': ArrowLeft,
};

export function Icon({
    name,
    className,
    ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
    const LucideIcon = icons[name];

    return (
        <LucideIcon
            aria-hidden="true"
            className={cn('size-6', className)}
            {...props}
        />
    );
}
