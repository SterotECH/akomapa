import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { Money } from '@/components/Money';
import { StockDot } from '@/components/StockDot';
import {
    Cell,
    HeaderCell,
    Table,
    TableBody,
    TableHead,
    TableRow,
} from '@/components/Table';
import { formatSignedQuantity, formatWhen } from '@/lib/format';
import {
    lowStockProducts,
    recentMovements as mockRecentMovements,
    stockValue,
    todaySummary as mockToday,
} from '@/lib/mock-data';
import { useSprings } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { index as pos } from '@/routes/pos';
import { index as stock } from '@/routes/stock';
import type { MovementType, StockMovement } from '@/types';

export type TodaySummary = {
    sales: number;
    items: number;
    lowStock: number;
};

type DashboardPageProps = {
    today?: TodaySummary;
    recentMovements?: StockMovement[];
};

const primaryLinkClasses =
    'inline-flex items-center justify-center gap-2 rounded-md bg-amber px-4 py-2.5 text-title font-semibold text-raisin transition-colors duration-fast hover:bg-amber-deep';

function StatCard({
    label,
    accent = false,
    children,
}: {
    label: string;
    accent?: boolean;
    children: ReactNode;
}) {
    return (
        <Card className={cn('p-5', accent && 'border border-amber/60')}>
            <p className="text-label font-semibold tracking-wide text-spanish-gray uppercase">
                {label}
            </p>
            <div
                className={cn(
                    'mt-2 text-figure',
                    accent ? 'text-amber-deep' : 'text-raisin',
                )}
            >
                {children}
            </div>
        </Card>
    );
}

const movementBadge: Record<
    MovementType,
    { variant: 'amber' | 'green' | 'muted'; label: string }
> = {
    restock: { variant: 'green', label: 'Restock' },
    sale: { variant: 'muted', label: 'Sale' },
    adjustment: { variant: 'amber', label: 'Adjustment' },
};

const quantityClass: Record<MovementType, string> = {
    restock: 'text-green-deep',
    sale: 'text-raisin',
    adjustment: 'text-amber-deep',
};

export default function Dashboard({
    today = mockToday,
    recentMovements = mockRecentMovements,
}: DashboardPageProps) {
    const { gentle, wobbly } = useSprings();
    const hasSales = today.sales > 0 && today.items > 0;

    const stats = [
        {
            label: "Today's sales",
            content: <Money pesewas={today.sales} />,
            accent: false,
        },
        {
            label: 'Items sold',
            content: today.items.toLocaleString('en-GH'),
            accent: false,
        },
        {
            label: 'Low stock',
            content: today.lowStock.toLocaleString('en-GH'),
            accent: today.lowStock > 0,
        },
        {
            label: 'Stock value',
            content: <Money pesewas={stockValue} />,
            accent: false,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-body text-spanish-gray">
                    A quick look at how the shop is doing today.
                </p>
                {hasSales && (
                    <Link href={pos.url()} className={primaryLinkClasses}>
                        <Icon name="pos" className="size-4" />
                        New sale
                    </Link>
                )}
            </div>

            <motion.div
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.06 } },
                }}
            >
                {stats.map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={wobbly}
                    >
                        <StatCard label={stat.label} accent={stat.accent}>
                            {stat.content}
                        </StatCard>
                    </motion.div>
                ))}
            </motion.div>

            {hasSales ? (
                <motion.div
                    className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={gentle}
                >
                    <Card className="overflow-hidden lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-line px-5 py-4">
                            <h2 className="text-headline text-raisin">
                                Recent movements
                            </h2>
                            <Link
                                href={stock.url()}
                                className="inline-flex items-center gap-1 text-label font-semibold text-raisin transition-colors duration-fast hover:text-amber-deep"
                            >
                                View all
                                <Icon name="arrow-right" className="size-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <HeaderCell>Product</HeaderCell>
                                        <HeaderCell>Type</HeaderCell>
                                        <HeaderCell align="right">Qty</HeaderCell>
                                        <HeaderCell>When</HeaderCell>
                                        <HeaderCell>Note</HeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentMovements.map((movement) => (
                                        <TableRow key={movement.id}>
                                            <Cell className="min-w-0 max-w-48">
                                                <p className="truncate text-title text-raisin">
                                                    {movement.product?.name}
                                                </p>
                                                <p className="text-label text-spanish-gray">
                                                    {movement.product?.sku}
                                                </p>
                                            </Cell>
                                            <Cell>
                                                <Badge
                                                    variant={
                                                        movementBadge[
                                                            movement.type
                                                        ].variant
                                                    }
                                                >
                                                    {
                                                        movementBadge[
                                                            movement.type
                                                        ].label
                                                    }
                                                </Badge>
                                            </Cell>
                                            <Cell
                                                align="right"
                                                className={cn(
                                                    'font-semibold',
                                                    quantityClass[
                                                        movement.type
                                                    ],
                                                )}
                                            >
                                                {formatSignedQuantity(
                                                    movement.quantity,
                                                )}
                                            </Cell>
                                            <Cell className="text-spanish-gray">
                                                {formatWhen(
                                                    movement.occurred_at,
                                                )}
                                            </Cell>
                                            <Cell className="max-w-40 truncate text-spanish-gray">
                                                {movement.note ?? '—'}
                                            </Cell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    <Card className="flex flex-col">
                        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                            <h2 className="text-headline text-raisin">
                                Low stock
                            </h2>
                            <Badge variant="amber">
                                {today.lowStock.toLocaleString('en-GH')}
                            </Badge>
                        </div>

                        {lowStockProducts.length > 0 ? (
                            <ul className="flex-1 divide-y divide-line">
                                {lowStockProducts.map((product) => (
                                    <li key={product.id}>
                                        <Link
                                            href={stock.url()}
                                            className="flex items-center gap-3 px-5 py-3 transition-colors duration-fast hover:bg-raisin/5"
                                        >
                                            <StockDot low />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-title text-raisin">
                                                    {product.name}
                                                </p>
                                                <p className="text-label text-spanish-gray">
                                                    {product.sku}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-figure text-amber-deep">
                                                    {product.stock_on_hand.toLocaleString(
                                                        'en-GH',
                                                    )}
                                                </p>
                                                <p className="text-label text-spanish-gray">
                                                    left
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-6 text-center">
                                <p className="text-body text-spanish-gray">
                                    Nothing running low. Every item is well
                                    stocked.
                                </p>
                            </div>
                        )}

                        <div className="border-t border-line p-4">
                            <Link
                                href={stock.url()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-transparent px-4 py-2.5 text-title font-semibold text-raisin transition-colors duration-fast hover:bg-raisin/5"
                            >
                                Go to stock
                                <Icon name="arrow-right" className="size-4" />
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={gentle}
                >
                    <EmptyState
                        icon="pos"
                        title="No sales yet"
                        description="Ring up your first sale at the till to see today's numbers here."
                    />
                    <div className="mt-4 flex justify-center">
                        <Link href={pos.url()} className={primaryLinkClasses}>
                            <Icon name="pos" className="size-4" />
                            Open POS
                        </Link>
                    </div>
                </motion.div>
            )}
        </>
    );
}
